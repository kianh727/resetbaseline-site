/*
 * SITE-030 · `/api/plan` — the handler, framework-agnostic.
 *
 * **Why this is not a Next route.** `next.config.ts` sets `output: 'export'`
 * (SITE-001), so there is no Next server at runtime to hold one. §4 of the
 * constitution requires generation to be *"a site-local `/api/plan` route"* with
 * zero dependency on the Baseline backend, and a Cloudflare Pages Function
 * satisfies both readings: the route is this site's, deployed from this
 * repository, alongside the exported `out/`. **Recorded as my resolution of
 * that contradiction** — it is the reading consistent with §0 and §10, since
 * the alternative is either abandoning the static export or standing up a
 * server the PRD's zero-dependency clause exists to avoid.
 *
 * **The handler takes its dependencies and returns a plain object**, so the
 * Pages Function in `functions/api/plan.ts` is a thin adapter and everything
 * interesting is reachable by `node --test` without a runtime. A handler that
 * read `env` or called `fetch` itself could only be tested by standing one up.
 *
 * ---
 *
 * **Nothing the visitor typed is logged, returned in an error, or attached to
 * anything.** The response carries the three fields and a fallback reason. The
 * request body is read, capped, passed to the model and dropped. The capture
 * system is the one sanctioned path for goal text (constitution §6), and this
 * is not it.
 */

import { classifyInput } from '../parse/input-class.ts'
import {
  checkLimits,
  recordRequest,
  type LimitConfig,
  type RequestLog,
  type SpendLedger,
} from '../generation/limits.ts'
import { INPUT_MAX } from '../generation/prompt.ts'
import { resolvePlan } from '../providers/resolve.ts'
import { createStaticProvider } from '../providers/static.ts'
import type { PlanOutcome, PlanProvider } from '../providers/types.ts'

export interface PlanHandlerDeps {
  /** Null when generation is not configured at all — the static path still serves. */
  readonly generated: PlanProvider | null
  readonly staticSource?: PlanProvider
  readonly config: LimitConfig
  readonly log: RequestLog
  readonly ledger: SpendLedger
  readonly now?: () => number
}

export interface PlanResponse {
  readonly status: number
  readonly body: {
    readonly title: string | null
    readonly window: { startMinute: number; endMinute: number } | null
    readonly clarification: { question: string; options: readonly string[] } | null
    /** Null when the model's response was used as-is. */
    readonly fallback: string | null
    /** Which fields came from the static source. Analytics reads this; nobody renders it. */
    readonly substituted: readonly string[]
  }
}

function respond(outcome: PlanOutcome): PlanResponse {
  return {
    status: 200,
    body: {
      title: outcome.fields.title,
      window: outcome.fields.window,
      clarification: outcome.fields.clarification
        ? {
            question: outcome.fields.clarification.question,
            options: outcome.fields.clarification.options,
          }
        : null,
      fallback: outcome.fallback,
      substituted: outcome.substituted,
    },
  }
}

/**
 * Handle one plan request.
 *
 * **It never returns a non-200 for a failure of generation**, because §12's
 * fallback is silent: a 503 is a user-visible error by the time it reaches a
 * `fetch` handler, and DS-10 forbids a dead state. Only a malformed *request*
 * — not a malformed response — gets a status.
 */
export async function handlePlan(
  raw: { goal?: unknown },
  clientKey: string,
  deps: PlanHandlerDeps,
): Promise<PlanResponse> {
  const goal = typeof raw.goal === 'string' ? raw.goal.slice(0, INPUT_MAX) : ''
  const staticSource = deps.staticSource ?? createStaticProvider()

  if (goal.trim().length === 0) {
    return { status: 400, body: { title: null, window: null, clarification: null, fallback: null, substituted: [] } }
  }

  /*
   * **Classification is deterministic and runs here, server-side** (§6.5). It
   * decides whether the clarification beat runs at all; the model never makes
   * that decision and never sees the class. This is the same function the
   * client runs — one implementation, imported by both, which is why SITE-014's
   * parity is asserted structurally rather than by comparing it to itself
   * (§0.3b).
   */
  const inputClass = classifyInput(goal)
  const wantsClarification = inputClass === 'vague'
  const request = { rawGoal: goal, wantsClarification }

  const now = (deps.now ?? Date.now)()

  if (deps.generated === null) {
    return respond({ fields: await staticSource.generate(request), fallback: null, substituted: [] })
  }

  const gate = await checkLimits(clientKey, now, deps.config, deps.log, deps.ledger)
  if (!gate.allowed) {
    /*
     * A limit is one of §12's five failure modes, so it takes the same silent
     * route: the static source serves, `fallback` names the reason, and the
     * visitor sees a complete plan. Returning 429 to the client here would make
     * a rate limit the one failure mode with a user-visible error.
     */
    return respond({
      fields: await staticSource.generate(request),
      fallback: gate.reason,
      substituted: wantsClarification
        ? (['title', 'window', 'clarification'] as const)
        : (['title', 'window'] as const),
    })
  }

  await recordRequest(clientKey, now, deps.log)
  return respond(await resolvePlan(request, deps.generated, staticSource))
}
