/*
 * SITE-034 · Rate limit, spend cap, kill switch — PRD v7.3 §12.
 *
 * **5/hr/IP, 2/min burst, a daily spend cap, and a kill switch flipping all
 * traffic to the static source.** All four are mechanisms rather than settings:
 * each returns a `FallbackReason` the orchestrator already routes, so a limit
 * firing is indistinguishable downstream from a timeout — silently static, no
 * user-visible error (§12, DS-7, DS-10).
 *
 * ---
 *
 * **Everything here is pure over an injected clock and an injected store.**
 * A limiter that reads `Date.now()` cannot be tested at its own boundary: the
 * interesting cases are the fifth request inside the hour and the sixth, and
 * the second inside the minute and the third, and a test that waits for real
 * time to pass to reach them is a test nobody runs. Both windows are asserted
 * at the exact request that crosses them.
 *
 * **The store is an interface, not a Map**, because the edge has no shared
 * memory between isolates: a `Map` in module scope limits one isolate and
 * reports that as limiting the site. The in-memory implementation here is the
 * test double and the single-process default; the deployment substitutes a
 * KV-backed one. Naming the seam now is what stops the Map becoming the
 * mechanism by being the only thing that exists.
 */

import type { FallbackReason } from '../providers/types.ts'

/** §12's limits. Written here once; nothing else restates them. */
export const PER_HOUR = 5
export const BURST_PER_MINUTE = 2
export const HOUR_MS = 60 * 60 * 1000
export const MINUTE_MS = 60 * 1000

/**
 * What a limiter needs to remember, and nothing more.
 *
 * Deliberately **not** an IP-to-counter map: a counter cannot answer "how many
 * in the last minute" without also knowing when, and a reset-on-the-hour
 * counter lets eleven requests through across a boundary that a sliding window
 * refuses. Timestamps are the smallest thing that answers both windows.
 */
export interface RequestLog {
  read(key: string): Promise<readonly number[]>
  write(key: string, timestamps: readonly number[]): Promise<void>
}

/** The single-process default and the test double. */
export function memoryLog(): RequestLog {
  const store = new Map<string, readonly number[]>()
  return {
    async read(key) {
      return store.get(key) ?? []
    },
    async write(key, timestamps) {
      store.set(key, timestamps)
    },
  }
}

export interface SpendLedger {
  /** Cost already recorded for the UTC day containing `now`, in whole cents. */
  spentToday(now: number): Promise<number>
  record(now: number, cents: number): Promise<void>
}

export function memoryLedger(): SpendLedger {
  const days = new Map<string, number>()
  const day = (now: number) => new Date(now).toISOString().slice(0, 10)
  return {
    async spentToday(now) {
      return days.get(day(now)) ?? 0
    },
    async record(now, cents) {
      days.set(day(now), (days.get(day(now)) ?? 0) + cents)
    },
  }
}

export interface LimitConfig {
  /** Daily ceiling in whole cents. */
  readonly dailyCapCents: number
  /**
   * The kill switch. **Read per request, never captured at module load** —
   * "takes effect without redeploy" is the accept criterion, and a value read
   * once when the isolate booted takes effect when the isolate is recycled,
   * which is not the same thing and is not observable from the dashboard.
   */
  readonly generationEnabled: boolean
}

export interface LimitGate {
  readonly allowed: boolean
  /** Why not. Null when allowed. */
  readonly reason: FallbackReason | null
}

const ALLOWED: LimitGate = { allowed: true, reason: null }

/**
 * Decide whether a request may reach the model.
 *
 * Checked in cost order: the kill switch first (no I/O), then spend (one read),
 * then the two rate windows (one read). A gate that consulted the ledger before
 * the switch would spend I/O on traffic it was about to refuse anyway.
 */
export async function checkLimits(
  key: string,
  now: number,
  config: LimitConfig,
  log: RequestLog,
  ledger: SpendLedger,
): Promise<LimitGate> {
  if (!config.generationEnabled) {
    // The switch borrows `spend_cap`'s route rather than adding a sixth reason:
    // §12 names five failure modes and SITE-033 tests five. A sixth would be a
    // vocabulary change dressed as a config flag.
    return { allowed: false, reason: 'spend_cap' }
  }

  if ((await ledger.spentToday(now)) >= config.dailyCapCents) {
    return { allowed: false, reason: 'spend_cap' }
  }

  const recent = (await log.read(key)).filter((t) => now - t < HOUR_MS)
  if (recent.length >= PER_HOUR) return { allowed: false, reason: 'rate_limit' }
  if (recent.filter((t) => now - t < MINUTE_MS).length >= BURST_PER_MINUTE) {
    return { allowed: false, reason: 'rate_limit' }
  }

  return ALLOWED
}

/**
 * Record that a request was admitted.
 *
 * Separate from `checkLimits` on purpose: a gate that recorded as it checked
 * would count refused requests against the window, so a client hammering a
 * closed door would extend its own lockout — punitive behaviour nobody
 * specified, and invisible until someone measured it. Only admitted requests
 * are logged, and the pruning happens here so the stored list cannot grow
 * without bound.
 */
export async function recordRequest(key: string, now: number, log: RequestLog): Promise<void> {
  const recent = (await log.read(key)).filter((t) => now - t < HOUR_MS)
  await log.write(key, [...recent, now])
}
