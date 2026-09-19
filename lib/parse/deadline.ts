/*
 * SITE-013 · Deterministic date-phrase parser.
 *
 * PRD §4's table: **parsed deadline — deterministic client.** The LLM never
 * touches it. §3.3: the parse runs as the visitor types, client-side, with no
 * network, and the deadline materialises the moment they land on "by May".
 *
 * **Ambiguity returns null rather than guessing** (SITE-013 accept). A wrong
 * date shown confidently mid-typing is worse than no date: the visitor reads
 * it as the system understanding them, and the error is invisible until the
 * plan is built on it.
 *
 * **Everything is noon-anchored local time.** A date at local midnight can
 * shift a day when a DST transition lands on it; noon is six hours from either
 * boundary in every zone that observes DST, so the calendar day the visitor
 * sees is the calendar day stored. The parser returns a `Date`, and only its
 * calendar day is meaningful.
 *
 * Scope is the four phrase families SITE-013 names, plus the obvious members of
 * each — all twelve months rather than only May and March, `days|weeks|months`
 * rather than only weeks, `month|quarter|year` rather than only quarter.
 * Extending a family the issue names is a refinement; adding a fifth family
 * would not be, and none is added.
 */

/** Month names, index 0–11, matched case-insensitively with common abbreviations. */
const MONTHS: readonly (readonly string[])[] = [
  ['january', 'jan'],
  ['february', 'feb'],
  ['march', 'mar'],
  ['april', 'apr'],
  ['may'],
  ['june', 'jun'],
  ['july', 'jul'],
  ['august', 'aug'],
  ['september', 'sep', 'sept'],
  ['october', 'oct'],
  ['november', 'nov'],
  ['december', 'dec'],
]

/** Noon local, so a DST transition cannot move the calendar day. */
function at(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0, 0)
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function monthIndex(word: string): number | null {
  const w = word.toLowerCase()
  for (let i = 0; i < MONTHS.length; i++) {
    const names = MONTHS[i]
    if (names && names.includes(w)) return i
  }
  return null
}

/**
 * The next occurrence of a month, counting the current month as future.
 *
 * "by May" said in May means this May, not next year — a visitor saying it on
 * the 3rd has most of the month left, and pushing them twelve months out would
 * be a visibly absurd plan.
 */
function nextOccurrenceOfMonth(now: Date, month: number): Date {
  const year = month >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1
  return at(year, month, daysInMonth(year, month))
}

/**
 * `null` means the rule did not match and the next rule should try.
 * `INVALID` means it matched a date the visitor clearly intended and that date
 * does not exist — which must abort the whole parse rather than fall through.
 *
 * Without that distinction, "by February 30" fails the explicit-date rule and
 * is then caught by the bare-month rule, returning 28 February: the parser
 * silently corrects an impossible date into a plausible one and shows it as
 * understanding. The fixture suite caught exactly this.
 */
const INVALID = Symbol('invalid-date')
type RuleResult = Date | null | typeof INVALID
type Rule = (text: string, now: Date) => RuleResult

/*
 * `by|before|until <month>` — the deadline is the end of that month. "by May"
 * does not mean May 1st; it means the visitor has May.
 */
const monthPhrase: Rule = (text, now) => {
  const m = /\b(?:by|before|until|due)\s+(?:the\s+end\s+of\s+)?([a-z]+)\b/i.exec(text)
  if (!m?.[1]) return null
  const idx = monthIndex(m[1])
  return idx === null ? null : nextOccurrenceOfMonth(now, idx)
}

/** `in N days|weeks|months`. */
const relativePhrase: Rule = (text, now) => {
  const m = /\bin\s+(\d{1,3})\s+(day|week|month)s?\b/i.exec(text)
  if (!m?.[1] || !m[2]) return null
  const n = Number(m[1])
  if (n === 0) return null
  const unit = m[2].toLowerCase()
  if (unit === 'day') return at(now.getFullYear(), now.getMonth(), now.getDate() + n)
  if (unit === 'week') return at(now.getFullYear(), now.getMonth(), now.getDate() + n * 7)
  /*
   * Month arithmetic clamps rather than overflowing: "in 1 month" from 31 Jan
   * is 28 Feb, not 3 March. Overflowing would put the deadline in a month the
   * visitor did not name.
   */
  const targetMonth = now.getMonth() + n
  const year = now.getFullYear() + Math.floor(targetMonth / 12)
  const month = ((targetMonth % 12) + 12) % 12
  return at(year, month, Math.min(now.getDate(), daysInMonth(year, month)))
}

/** `by the end of the month|quarter|year`. */
const endOfPeriod: Rule = (text, now) => {
  const m = /\b(?:by\s+)?(?:the\s+)?end\s+of\s+(?:the\s+|this\s+)?(month|quarter|year)\b/i.exec(text)
  if (!m?.[1]) return null
  const period = m[1].toLowerCase()
  if (period === 'month') {
    return at(now.getFullYear(), now.getMonth(), daysInMonth(now.getFullYear(), now.getMonth()))
  }
  if (period === 'year') return at(now.getFullYear(), 11, 31)
  const lastMonthOfQuarter = Math.floor(now.getMonth() / 3) * 3 + 2
  return at(now.getFullYear(), lastMonthOfQuarter, daysInMonth(now.getFullYear(), lastMonthOfQuarter))
}

/**
 * Explicit dates: ISO `2026-05-15`, and `May 15` / `15 May` with an optional year.
 *
 * **Numeric-only forms like `5/15` return null**, deliberately. They are
 * ambiguous between day-first and month-first conventions, and the parser has
 * no way to know which the visitor meant — guessing produces a date that is
 * wrong for half the world and confident either way.
 */
const explicitDate: Rule = (text, now) => {
  const iso = /\b(\d{4})-(\d{2})-(\d{2})\b/.exec(text)
  if (iso?.[1] && iso[2] && iso[3]) {
    const year = Number(iso[1])
    const month = Number(iso[2]) - 1
    const day = Number(iso[3])
    if (month < 0 || month > 11) return INVALID
    if (day < 1 || day > daysInMonth(year, month)) return INVALID
    return at(year, month, day)
  }

  const monthFirst = /\b([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i.exec(text)
  const dayFirst = /\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:,?\s+(\d{4}))?\b/i.exec(text)

  for (const [monthWord, dayWord, yearWord] of [
    [monthFirst?.[1], monthFirst?.[2], monthFirst?.[3]],
    [dayFirst?.[2], dayFirst?.[1], dayFirst?.[3]],
  ]) {
    if (!monthWord || !dayWord) continue
    const idx = monthIndex(monthWord)
    if (idx === null) continue
    const day = Number(dayWord)
    const year = yearWord ? Number(yearWord) : nextOccurrenceOfMonth(now, idx).getFullYear()
    if (day < 1 || day > daysInMonth(year, idx)) return INVALID
    return at(year, idx, day)
  }
  return null
}

/*
 * Order matters. An explicit date beats a month name, because "by May 15" is
 * more specific than "by May" and both patterns match it. "end of" beats the
 * month phrase for the same reason.
 */
const RULES: readonly Rule[] = [explicitDate, endOfPeriod, relativePhrase, monthPhrase]

/**
 * @returns the parsed deadline, noon-anchored local, or `null` when the text
 *   contains no unambiguous date phrase. Never throws, never guesses.
 */
export function parseDeadline(text: string, now: Date = new Date()): Date | null {
  if (typeof text !== 'string' || text.trim() === '') return null
  for (const rule of RULES) {
    const result = rule(text, now)
    if (result === INVALID) return null
    if (result !== null) return result
  }
  return null
}

/** Convenience for assertions and rendering: the calendar day, zero-padded. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
