/*
 * SITE-022 · Band derivation — PRD v7.3 §6.3b's enforcement clause.
 *
 * §6.3b: **"A band must be derivable only from a recurrence. It is not a prop a
 * component may pass. Build it so the failure mode doesn't exist rather than
 * banning it in prose."**
 *
 * So this file is the only place a `Band` can come from. `Band` carries a brand
 * keyed on a **module-private `unique symbol`**, which no object literal
 * anywhere else can satisfy — a component cannot construct one, a test cannot
 * fake one, and a caller with a colour and a rectangle has nothing to hand to
 * the renderer. The band is not data a component receives; it is what falls out
 * of walking the plan's recurrences.
 *
 * **What that closes, and what it does not.** It closes construction: there is
 * no second producer and no literal. It does not close a **type assertion**
 * (`x as Band`) or someone writing a **second band component from scratch**,
 * because types cannot. Those two get `bandsAreDerived` in
 * `tests/flat-layout.test.ts`, which is a text scan against a specific escape
 * hatch — the honest scope of what a scan can do, stated rather than dressed up
 * as soundness.
 *
 * ---
 *
 * **The grammar, and where each clause is enforced:**
 *
 * | §6.3b | Enforced by |
 * |---|---|
 * | A band means a recurring time window | `bandsFor` emits one per distinct `Window` |
 * | Marks inside it are the days it occupies | `days`, computed from occurrences |
 * | A second, denser band below is protection | `kind`, set here, never passed |
 * | Nothing else ever gets a band | no other producer exists |
 * | A timer and a tracker get no band | they have no window, so nothing to emit |
 * | Lit = scheduled, dark = unscheduled | `lit`, computed, with no third value |
 */

import type { Occurrence, Plan, PlanDate, Window } from '../plan/model.ts'

/**
 * Module-private. **Not exported**, which is the point: `Band` is nameable so it
 * can be a parameter type, and uninhabitable so it cannot be a literal.
 */
declare const bandBrand: unique symbol

/**
 * One day inside a band.
 *
 * **`lit` is a boolean and there is no third state**, because §6.3b's rule is
 * that an unscheduled day *means nothing was placed there, not that something
 * was missed*. A `status` field with room for `missed` is the one shape that
 * would let a dark mark become a gap, so the type does not have one.
 */
export interface BandDay {
  readonly date: PlanDate
  /** True when an occurrence falls on this day. */
  readonly lit: boolean
}

/**
 * A band. Obtainable only from `bandsFor`.
 *
 * Carries **no geometry, no colour and no variant.** Level, charcoal,
 * translucent, bleeding off both frame edges, lavender only as a lit line on the
 * upper boundary — all of that lives in the one component that renders a band.
 * A band that tilts or tapers is not a band this type can describe, which is
 * §6.3b's question 12 answered in the type system rather than at review.
 */
export interface Band {
  readonly [bandBrand]: true
  /** What the band means. Set here, never supplied. */
  readonly kind: 'window' | 'protection'
  /** The plan node it was derived from. */
  readonly nodeId: string
  readonly window: Window
  readonly label: string
  /**
   * The days the window occupies, over the plan's span.
   *
   * **Empty for protection.** §6.3b gives marks to the window band — *"marks
   * inside the band always mean the days it occupies"* — and describes
   * protection only as *a second, denser band below*. Density is the band's own
   * rendering, not a mark count. Recorded as a reading rather than left
   * implicit; if it is the wrong one it is a one-line change here and nowhere
   * else, which is the benefit of a single producer.
   */
  readonly days: readonly BandDay[]
}

/**
 * The one place a `Band` comes into existence.
 *
 * The brand is strong enough that **even this file cannot write a `Band`
 * literal** — it takes a double assertion, and that is worth having in exactly
 * one line rather than three. `mint` is private, so `bandsFor` stays the only
 * exported way to obtain one, and the scan in `tests/flat-layout.test.ts` has a
 * single sanctioned assertion to allow and can reject every other.
 */
function mint(fields: Omit<Band, typeof bandBrand>): Band {
  return fields as unknown as Band
}

/** Structural check for the commitment shape — see the note in `model.ts`. */
function occurrencesOf(detail: unknown): readonly Occurrence[] | null {
  const maybe = detail as { occurrences?: unknown }
  return Array.isArray(maybe.occurrences) ? (maybe.occurrences as Occurrence[]) : null
}

/** Structural check for the protection shape: a window and a count, per §6.3a. */
function protectionOf(detail: unknown): { window: Window; appCount: number } | null {
  const maybe = detail as { window?: Window; appCount?: number }
  return maybe.window !== undefined && typeof maybe.appCount === 'number'
    ? { window: maybe.window, appCount: maybe.appCount }
    : null
}

/** Days are compared on their calendar day, never on their timestamp. */
function dayKey(d: PlanDate): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Every calendar day from `first` to `last` inclusive, noon-anchored. */
function daysBetween(first: PlanDate, last: PlanDate): PlanDate[] {
  const out: PlanDate[] = []
  const cursor = new Date(first.getFullYear(), first.getMonth(), first.getDate(), 12, 0, 0, 0)
  const end = dayKey(last)
  for (let guard = 0; guard < 400; guard++) {
    out.push(new Date(cursor))
    if (dayKey(cursor) === end) break
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

/**
 * The bands a plan implies. **The only producer.**
 *
 * Ordering is derived rather than read from `plan.nodes`, which asserts none:
 * window bands first by start minute, then end minute, then node id, and
 * protection after them. Three keys because the first two can tie and a tie
 * broken by array order would make the composition depend on something the model
 * explicitly does not promise — the same plan would render two ways.
 */
export function bandsFor(plan: Plan): readonly Band[] {
  const span = planSpan(plan)

  const windows: Band[] = []
  const protections: Band[] = []

  for (const node of plan.nodes) {
    const occurrences = occurrencesOf(node.detail)
    if (occurrences !== null) {
      const window = occurrences.find((o) => o.window !== null)?.window
      // No window means no recurring time window, and §6.3b gives it no band.
      if (window === undefined || window === null) continue
      const scheduled = new Set(occurrences.map((o) => dayKey(o.date)))
      windows.push(
        mint({
          kind: 'window',
          nodeId: node.id,
          window,
          label: node.label,
          days: span
            ? daysBetween(span.first, span.last).map((date) => ({
                date,
                lit: scheduled.has(dayKey(date)),
              }))
            : [],
        }),
      )
      continue
    }

    const protection = protectionOf(node.detail)
    if (protection !== null) {
      protections.push(
        mint({
          kind: 'protection',
          nodeId: node.id,
          window: protection.window,
          label: `${protection.appCount} apps`,
          days: [],
        }),
      )
    }

    // Everything else — a timer, a tracker, a reminder — has no recurring
    // window, so nothing is emitted. §6.3b, ruled 2026-09-19: that is the
    // grammar working, not a gap. Do not add a branch here.
  }

  const byWindow = (a: Band, b: Band): number =>
    a.window.startMinute - b.window.startMinute ||
    a.window.endMinute - b.window.endMinute ||
    (a.nodeId < b.nodeId ? -1 : a.nodeId > b.nodeId ? 1 : 0)

  return [...windows.sort(byWindow), ...protections.sort(byWindow)]
}

/** The plan's dated span, computed here so `bandsFor` needs nothing from a caller. */
function planSpan(plan: Plan): { first: PlanDate; last: PlanDate } | null {
  const dates: PlanDate[] = []
  for (const node of plan.nodes) {
    const occurrences = occurrencesOf(node.detail)
    if (occurrences !== null) for (const o of occurrences) dates.push(o.date)
  }
  if (dates.length === 0) return null
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  return first && last ? { first, last } : null
}
