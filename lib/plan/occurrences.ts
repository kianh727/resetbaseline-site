/*
 * SITE-023 · Occurrence generator.
 *
 * Expands a recurrence rule (§6.3c) into dated occurrences over a window.
 * **DST-safe, timezone-correct, real weekday math**, and hand-rolled: §11.2's
 * budget rules out a date library, and SITE-023's own spec called for this
 * before the budget did.
 *
 * **The LLM never computes or adjusts a date** (§6.5). It does not choose the
 * rule either — `selectRecurrence` does that from the parse.
 *
 * ---
 *
 * **Everything is noon-anchored local**, the convention `lib/parse/deadline.ts`
 * set and for the same reason: a date at local midnight can shift a day across a
 * DST transition, and the calendar day the visitor sees must be the calendar day
 * stored. **Stepping is done on the calendar, not on milliseconds** — `setDate`
 * advances a day, `+86_400_000` advances 24 hours, and on the two days a year
 * those differ the second one is wrong.
 *
 * **Weekdays are compared by name, never by index** (§6.3c). `getDay()` returns
 * a number whose convention this site deliberately has not adopted, so it is
 * converted to a name once, here, and compared as a name everywhere else.
 */

import { planDate, type Occurrence, type PlanDate, type Window } from './model.ts'
import { daysOf, WEEKDAYS, type Recurrence, type Weekday } from '../parse/recurrence.ts'

/**
 * `Date.getDay()` is 0 = Sunday. **This is the only place that number is
 * touched**, and it is turned into a name immediately — see §6.3c on why the
 * site does not carry a numeric weekday.
 */
function weekdayOf(date: Date): Weekday {
  const jsIndex = date.getDay()
  const mondayFirst = (jsIndex + 6) % 7
  const day = WEEKDAYS[mondayFirst]
  /* c8 ignore next */
  if (day === undefined) throw new Error(`unreachable weekday index ${jsIndex}`)
  return day
}

/** One calendar day later, noon-anchored. Calendar arithmetic, never milliseconds. */
function nextDay(date: PlanDate): PlanDate {
  return planDate(date.getFullYear(), date.getMonth(), date.getDate() + 1)
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export interface GenerateOptions {
  readonly rule: Recurrence
  /** First day the window may contain, inclusive. */
  readonly from: PlanDate
  /** Last day the window may contain, inclusive. */
  readonly until: PlanDate
  /**
   * `every_n_days` counts from here.
   *
   * **Chosen, and recorded as a choice**: §6.3c does not specify an anchor, and
   * the commitment's creation date is the only one present at selection time
   * that the visitor can reason about — *"every three days, starting today"* is
   * what someone means when they do not say otherwise. Anchoring on the window
   * start instead would make the same rule produce different dates depending on
   * when the plan is rendered, which is the determinism §6.5 requires reading as
   * a bug.
   */
  readonly anchor?: PlanDate
  readonly window?: Window | null
}

/**
 * Expand a rule into occurrences, inclusive of both bounds.
 *
 * Walks the calendar one day at a time and asks each day whether the rule
 * includes it. Slower than computing stride offsets and **right on the days
 * stride arithmetic is wrong** — a month boundary, a leap day, a DST shift — and
 * over a rolling window of weeks the cost is a few dozen iterations.
 */
export function generateOccurrences(options: GenerateOptions): readonly Occurrence[] {
  const { rule, from, until } = options
  const window = options.window ?? null
  const anchor = options.anchor ?? from

  if (until.getTime() < from.getTime()) return []

  const out: Occurrence[] = []
  let cursor = planDate(from.getFullYear(), from.getMonth(), from.getDate())
  let index = 0

  // Bounded so a malformed window cannot spin. 400 days is longer than any
  // rolling window the builder shows, and it is a guard rather than a limit.
  for (let guard = 0; guard < 400; guard++) {
    if (cursor.getTime() > until.getTime()) break
    if (includes(rule, cursor, anchor)) {
      out.push({ id: `occ-${index}`, date: cursor, window })
      index++
    }
    if (sameCalendarDay(cursor, until)) break
    cursor = nextDay(cursor)
  }

  return out
}

/** Whether a rule covers a given calendar day. Pure, and the whole of the rule logic. */
function includes(rule: Recurrence, day: PlanDate, anchor: PlanDate): boolean {
  if (rule.kind === 'daily') return true

  if (rule.kind === 'every_n_days') {
    // Whole calendar days between anchor and day, counted on the calendar so a
    // DST transition inside the span cannot shift the count.
    const elapsed = calendarDaysBetween(anchor, day)
    return elapsed >= 0 && elapsed % rule.n === 0
  }

  const days = daysOf(rule)
  return days === null ? false : days.includes(weekdayOf(day))
}

/**
 * Whole calendar days from `a` to `b`, negative when `b` precedes `a`.
 *
 * **Counted by stepping the calendar, not by dividing a millisecond
 * difference.** Both dates are noon-anchored, so a naive division is right in
 * most zones most of the year — and wrong in a zone whose DST shift is not a
 * whole hour, or where an offset change lands between the two noons. Stepping
 * cannot be wrong about it.
 */
function calendarDaysBetween(a: PlanDate, b: PlanDate): number {
  if (sameCalendarDay(a, b)) return 0
  const forward = b.getTime() > a.getTime()
  let cursor = planDate(a.getFullYear(), a.getMonth(), a.getDate())
  let n = 0
  for (let guard = 0; guard < 4000; guard++) {
    if (sameCalendarDay(cursor, b)) return forward ? n : -n
    cursor = forward
      ? nextDay(cursor)
      : planDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1)
    n++
  }
  return forward ? n : -n
}
