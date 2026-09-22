/*
 * SITE-032 / SITE-033 · The timeout and the fallback orchestration.
 *
 * **Hard 4000ms timeout with abort** (§12, §3.1). **All five failure modes route
 * to the static source** — timeout, invalid schema, rate limit, spend cap,
 * network error — **silently**, with no user-visible error message and no dead
 * state (DS-7, DS-10).
 *
 * **No retry. No streaming raw model text to the client.** A retry inside a 4s
 * budget is a second chance the visitor pays for in latency, and §3.1's budget
 * is measured to the plan, not to the first attempt.
 *
 * ---
 *
 * **Post-abort state immutability is the accept clause worth spelling out.** An
 * aborted request that later resolves must not mutate anything: the failure
 * already routed to the static source, and a late arrival overwriting it would
 * show the visitor a plan that changed under them after it settled. The guard is
 * a single `settled` flag captured in the closure — checked after every await,
 * because an `AbortSignal` stops the *fetch*, not the promise chain already
 * scheduled behind it.
 */

import type {
  FallbackReason,
  PlanFields,
  PlanOutcome,
  PlanProvider,
  PlanRequest,
} from './types.ts'

/** §12's ceiling. Hard, and measured from the call rather than from first byte. */
export const GENERATION_TIMEOUT_MS = 4000

/**
 * Thrown by a provider to name a failure mode the orchestrator maps to a reason.
 *
 * **The field is declared and assigned explicitly rather than as a constructor
 * parameter property**, because Node's type stripping does not support those and
 * this file is imported by a `node --test` suite (CLAUDE.md §7, SITE-006). The
 * first version used one and the suite refused to parse it — the constraint is
 * recorded in the constitution and was still worth a reminder here, where it
 * bites.
 */
export class ProviderFailure extends Error {
  readonly reason: FallbackReason

  constructor(reason: FallbackReason) {
    super(reason)
    this.name = 'ProviderFailure'
    this.reason = reason
  }
}

const EMPTY: PlanFields = { title: null, window: null, clarification: null }

/**
 * Run the generated provider under the timeout, falling back field by field.
 *
 * @param generated the model-backed provider
 * @param staticSource the authored fallback (SITE-029)
 *
 * **Fields fall back independently** (§6.5). The static source is consulted for
 * exactly the fields generation did not produce, so one invalid field never
 * discards the other two.
 */
export async function resolvePlan(
  request: PlanRequest,
  generated: PlanProvider,
  staticSource: PlanProvider,
  timeoutMs: number = GENERATION_TIMEOUT_MS,
): Promise<PlanOutcome> {
  const controller = new AbortController()
  let settled = false

  const timer = setTimeout(() => {
    if (!settled) controller.abort()
  }, timeoutMs)

  let fields: PlanFields = EMPTY
  let fallback: FallbackReason | null = null

  try {
    const produced = await generated.generate({ ...request, signal: controller.signal })
    // Checked after the await: an abort stops the fetch, not the chain behind it.
    if (controller.signal.aborted) {
      fallback = 'timeout'
    } else {
      fields = produced
    }
  } catch (error) {
    fallback =
      error instanceof ProviderFailure
        ? error.reason
        : controller.signal.aborted
          ? 'timeout'
          : 'network_error'
  } finally {
    settled = true
    clearTimeout(timer)
  }

  const missing = (
    ['title', 'window', 'clarification'] as const
  ).filter((k) => fields[k] === null)

  // Only the clarification is conditional: classification decides whether the
  // beat runs at all, and the model never makes that decision (§6.4).
  const needed = missing.filter((k) => k !== 'clarification' || request.wantsClarification)

  if (needed.length === 0) {
    return { fields, fallback, substituted: [] }
  }

  /*
   * A field that generation did not produce is not a failure of the *response* —
   * only a reason to consult the static source for that field. `fallback` stays
   * null unless the whole request failed, so `plan_generation_fallback` fires for
   * the five modes and not for an ordinary partial response.
   */
  const authored = await staticSource.generate(request)
  const merged: PlanFields = {
    title: fields.title ?? authored.title,
    window: fields.window ?? authored.window,
    clarification: request.wantsClarification
      ? (fields.clarification ?? authored.clarification)
      : null,
  }

  const substituted = needed.filter((k) => merged[k] !== null && fields[k] === null)
  return { fields: merged, fallback, substituted }
}
