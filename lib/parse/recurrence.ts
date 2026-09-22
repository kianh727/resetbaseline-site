/*
 * Recurrence-rule selection — PRD v7.3 §6.3c.
 *
 * **Deterministic, from the parse. The model never sees the rule set and never
 * chooses from it** (§6.5). Selection is the choosing; SITE-023's generator
 * expands a chosen rule into dates, and neither half touches the other's job.
 *
 * ---
 *
 * **The function is total, and totality here means something specific.** Every
 * input maps to **exactly one rule** or to **no recurrence at all**. There is no
 * default and **nothing falls through to `daily`** — a fallthrough default is how
 * a parser starts asserting a schedule the visitor never described, and it does
 * it in the one place the site claims to be reading what they wrote.
 *
 * **`null` is a real answer, not a failure.** A commitment with no recurrence is
 * a valid object — §6.1a's Problem line for a commitment is *"an intention with
 * no occasion"*, which describes exactly that. Inventing an occasion to avoid
 * returning nothing would be the site answering a question the visitor did not.
 *
 * **Weekdays are named, never numbered** (§6.3c). The app's `byweekday`
 * convention is disputed between its own layers and unresolved; an integer here
 * would silently take a position on it, invisibly in the type, wrong half the
 * time, producing a plan off by one day with nothing to show why. A named
 * representation **cannot be wrong about a convention the site never adopted.**
 * If SITE-004's manifest later carries a weekday vocabulary, adapt at the
 * boundary — one conversion, one place — and leave this named.
 */

/** §6.3c's closed set. Nothing outside it is selectable. */
export type RecurrenceKind =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'weekly_on_days'
  | 'every_n_days'

/**
 * Named, deliberately. See the header — this is a refusal to inherit a disputed
 * numeric convention, not a stylistic choice, and it should not be "tidied" into
 * an enum or an index.
 */
export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

/** Calendar order, for deriving anything ordinal without numbering the type. */
export const WEEKDAYS: readonly Weekday[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export type Recurrence =
  | { readonly kind: 'daily' }
  | { readonly kind: 'weekdays' }
  | { readonly kind: 'weekends' }
  | { readonly kind: 'weekly_on_days'; readonly days: readonly Weekday[] }
  | { readonly kind: 'every_n_days'; readonly n: number }

/** `every_n_days` is 2–14 (§6.3c). Outside that, the frequency is not selectable. */
const MIN_N = 2
const MAX_N = 14

const DAY_WORDS: readonly (readonly [Weekday, RegExp])[] = [
  ['Monday', /\bmon(day)?s?\b/i],
  ['Tuesday', /\btue(s|sday)?s?\b/i],
  ['Wednesday', /\bwed(nesday)?s?\b/i],
  ['Thursday', /\bthu(r|rs|rsday)?s?\b/i],
  ['Friday', /\bfri(day)?s?\b/i],
  ['Saturday', /\bsat(urday)?s?\b/i],
  ['Sunday', /\bsun(day)?s?\b/i],
]

/** The named days present in the text, in calendar order and without duplicates. */
function namedDays(text: string): Weekday[] {
  const found = new Set<Weekday>()
  for (const [day, pattern] of DAY_WORDS) if (pattern.test(text)) found.add(day)
  return WEEKDAYS.filter((d) => found.has(d))
}

function sameDays(a: readonly Weekday[], b: readonly Weekday[]): boolean {
  return a.length === b.length && a.every((d, i) => d === b[i])
}

const WEEKDAY_SET: readonly Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const WEEKEND_SET: readonly Weekday[] = ['Saturday', 'Sunday']

/** Written-out small numbers, so "every other day" and "every three days" parse. */
const NUMBER_WORDS: Readonly<Record<string, number>> = {
  other: 2,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
}

/**
 * Select the recurrence a text describes.
 *
 * @returns exactly one rule, or `null` when the frequency is unparseable.
 *
 * **Order is load-bearing.** Explicit named days are tested before the
 * shorthands, and the shorthands are only claimed when the named set matches
 * them *exactly* — so *"Monday, Wednesday, Friday"* is `weekly_on_days` with
 * three days and never rounded up to `weekdays`. **Rounding a three-day set to a
 * five-day one adds two commitments the visitor did not make**, while appearing
 * to understand them, which is §0.3c's failure applied to frequency instead of
 * to dates.
 */
export function selectRecurrence(text: string): Recurrence | null {
  if (typeof text !== 'string' || text.trim() === '') return null

  // 1. Explicitly named days. Exact-matches the shorthands, otherwise keeps the set.
  const days = namedDays(text)
  if (days.length > 0) {
    if (sameDays(days, WEEKDAY_SET)) return { kind: 'weekdays' }
    if (sameDays(days, WEEKEND_SET)) return { kind: 'weekends' }
    return { kind: 'weekly_on_days', days }
  }

  // 2. The shorthand words themselves.
  if (/\bweekdays?\b|\bevery weekday\b|\bwork ?days?\b/i.test(text)) return { kind: 'weekdays' }
  if (/\bweekends?\b|\bevery weekend\b/i.test(text)) return { kind: 'weekends' }

  // 3. Interval forms. Digits and written-out numbers both, capped at §6.3c's range.
  const digits = /\bevery\s+(\d{1,2})\s+days?\b/i.exec(text)
  if (digits?.[1]) {
    const n = Number(digits[1])
    return n >= MIN_N && n <= MAX_N ? { kind: 'every_n_days', n } : null
  }
  const worded = /\bevery\s+([a-z]+)\s+days?\b/i.exec(text)
  if (worded?.[1]) {
    const n = NUMBER_WORDS[worded[1].toLowerCase()]
    return n !== undefined && n >= MIN_N && n <= MAX_N ? { kind: 'every_n_days', n } : null
  }
  // "every other day" has no trailing plural to match above.
  if (/\bevery other day\b/i.test(text)) return { kind: 'every_n_days', n: 2 }

  // 4. Daily, and only when said. `every day` is a statement; it is not a default.
  if (/\bevery\s?day\b|\bdaily\b|\beach day\b/i.test(text)) return { kind: 'daily' }

  /*
   * No rule. **Not a failure and not a fallthrough** — the frequency was not
   * described, so none is asserted. Do not add a default here: §6.3c rules it
   * out by name, and `daily` is the most expensive wrong guess available, since
   * it multiplies a plan the visitor never agreed to by seven.
   */
  return null
}

/** The days a rule occupies, for the rules that name a fixed set. */
export function daysOf(rule: Recurrence): readonly Weekday[] | null {
  if (rule.kind === 'weekdays') return WEEKDAY_SET
  if (rule.kind === 'weekends') return WEEKEND_SET
  if (rule.kind === 'weekly_on_days') return rule.days
  return null
}
