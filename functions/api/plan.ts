/*
 * `/api/plan` as a Cloudflare Pages Function — the adapter, and nothing else.
 *
 * Everything decidable lives in `lib/api/plan.ts` and is tested by
 * `node --test`. This file's whole job is to turn a `Request` and an `env` into
 * that handler's arguments, so the only thing it can get wrong is wiring — and
 * the only thing that needs a deployed runtime to check is wiring.
 *
 * **Secrets are read from `env` per request and never from a literal.** The key
 * is a Cloudflare secret named by `API_KEY_ENV`; nothing in this repository
 * holds a value, and `GENERATION_ENABLED` is read on every request so the kill
 * switch takes effect from the dashboard without a redeploy (SITE-034).
 *
 * **When the key is absent the site serves the static path**, which is not a
 * degraded mode: DS-7 requires the full loop to be complete with generation
 * disabled entirely, and that is the state every preview deploy runs in.
 */

import { API_KEY_ENV, createGeneratedProvider } from '../../lib/generation/anthropic.ts'
import { memoryLedger, memoryLog, type LimitConfig } from '../../lib/generation/limits.ts'
import { handlePlan } from '../../lib/api/plan.ts'

interface Env {
  readonly ANTHROPIC_API_KEY?: string
  readonly GENERATION_ENABLED?: string
  readonly DAILY_CAP_CENTS?: string
}

/*
 * **In-isolate stores, and the limitation is stated rather than discovered.**
 * A Pages Function runs in isolates that do not share memory, so these bound a
 * single isolate rather than the site. That is a real ceiling on how much the
 * limiter can promise, and it is why `RequestLog` and `SpendLedger` are
 * interfaces: the KV-backed implementations drop in at deploy without touching
 * the handler. **Until then the daily cap is the load-bearing control**, since
 * it is checked against the same store the spend is recorded in.
 */
const log = memoryLog()
const ledger = memoryLedger()

const DEFAULT_DAILY_CAP_CENTS = 500

export async function onRequestPost(context: {
  request: Request
  env: Env
}): Promise<Response> {
  let body: { goal?: unknown }
  try {
    body = (await context.request.json()) as { goal?: unknown }
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  const apiKey = context.env[API_KEY_ENV as 'ANTHROPIC_API_KEY']

  const config: LimitConfig = {
    dailyCapCents: Number(context.env.DAILY_CAP_CENTS ?? DEFAULT_DAILY_CAP_CENTS),
    // Default on: a missing variable must not silently disable generation, or a
    // deploy that dropped it looks exactly like a working site.
    generationEnabled: context.env.GENERATION_ENABLED !== 'false',
  }

  const response = await handlePlan(
    body,
    context.request.headers.get('cf-connecting-ip') ?? 'unknown',
    {
      generated: apiKey ? createGeneratedProvider({ apiKey, transport: fetch }) : null,
      config,
      log,
      ledger,
    },
  )

  return Response.json(response.body, {
    status: response.status,
    // The plan depends on what the visitor typed; nothing about it is cacheable,
    // and a shared cache holding one would serve one person's plan to another.
    headers: { 'cache-control': 'no-store' },
  })
}
