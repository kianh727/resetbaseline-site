/*
 * SITE-113 · Recurrence-rule selection (PRD v7.3 §6.3c).
 *
 * The rule set is closed and the function is total, so the suite is built around
 * the two properties that make those claims mean anything: **every rule is
 * reachable**, and **nothing outside the set is ever produced**. A suite of
 * positive cases alone would pass on a selector that returns `daily` for
 * everything.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  selectRecurrence,
  daysOf,
  WEEKDAYS,
  type Recurrence,
  type RecurrenceKind,
} from '../lib/parse/recurrence.ts'

/** §6.3c's table, written out. Not imported — that would agree by construction (§0.3b). */
const CLOSED_SET: readonly RecurrenceKind[] = [
  'daily',
  'weekdays',
  'weekends',
  'weekly_on_days',
  'every_n_days',
]

/* ------------------------------------------------------------------ *
 * The closed set.
 * ------------------------------------------------------------------ */

test('every rule in §6.3c is reachable from some input', () => {
  // Without this, "nothing outside the set" is satisfied by a selector that
  // only ever returns one member — or none.
  const reached = new Set<RecurrenceKind>()
  for (const text of [
    'write every day',
    'train on weekdays',
    'long run on weekends',
    'gym on Monday and Thursday',
    'call home every 3 days',
  ]) {
    const r = selectRecurrence(text)
    if (r) reached.add(r.kind)
  }
  assert.deepEqual([...reached].sort(), [...CLOSED_SET].sort())
})

test('no input produces a rule outside the closed set', () => {
  const inputs = [
    'every day', 'daily', 'each day', 'weekdays', 'work days', 'weekends',
    'Monday Wednesday Friday', 'every other day', 'every 14 days', 'every three days',
    'finish my thesis', '', '   ', 'sometimes', 'every 90 days', 'every 1 day',
  ]
  for (const text of inputs) {
    const r = selectRecurrence(text)
    if (r !== null) assert.ok(CLOSED_SET.includes(r.kind), `${text} → ${r.kind}`)
  }
})

/* ------------------------------------------------------------------ *
 * Totality — exactly one rule, or none. Never a default.
 * ------------------------------------------------------------------ */

test('an unparseable frequency produces no recurrence, and never daily', () => {
  /*
   * §6.3c: no default, and nothing falls through to `daily`. `daily` is the most
   * expensive wrong guess available — it multiplies a plan the visitor never
   * agreed to by seven — so this asserts the specific wrong answer, not just
   * "falsy".
   */
  for (const text of ['finish my thesis', 'get fit', 'sometimes', 'when I can', '', '   ']) {
    assert.equal(selectRecurrence(text), null, text)
  }
})

test('a commitment with no recurrence is a valid outcome, not an error', () => {
  // §6.1a's Problem line for a commitment is "an intention with no occasion",
  // which is exactly this object. Nothing is thrown and nothing is invented.
  assert.doesNotThrow(() => selectRecurrence('finish my thesis'))
  assert.equal(selectRecurrence('finish my thesis'), null)
})

/* ------------------------------------------------------------------ *
 * The edge §6.3c names: named days are not rounded to a shorthand.
 * ------------------------------------------------------------------ */

test('named days that are not a shorthand set stay weekly_on_days', () => {
  /*
   * The rule this suite exists for. Rounding Mon/Wed/Fri up to `weekdays` adds
   * two commitments the visitor did not make, while appearing to understand
   * them — §0.3c's failure applied to frequency instead of dates.
   */
  const r = selectRecurrence('gym on Monday, Wednesday and Friday')
  assert.deepEqual(r, { kind: 'weekly_on_days', days: ['Monday', 'Wednesday', 'Friday'] })
  assert.notEqual(r?.kind, 'weekdays')
})

test('the full weekday set named explicitly is weekdays, not a five-day list', () => {
  const r = selectRecurrence('Monday Tuesday Wednesday Thursday Friday')
  assert.deepEqual(r, { kind: 'weekdays' })
})

test('Saturday and Sunday named explicitly is weekends', () => {
  assert.deepEqual(selectRecurrence('Saturday and Sunday'), { kind: 'weekends' })
})

test('a four-day subset of the weekdays is not weekdays', () => {
  const r = selectRecurrence('Monday Tuesday Wednesday Thursday')
  assert.equal(r?.kind, 'weekly_on_days')
  assert.equal(daysOf(r as Recurrence)?.length, 4)
})

test('named days come back in calendar order, however they were written', () => {
  // Order is derived from the calendar rather than from the sentence, so two
  // phrasings of one schedule cannot produce two different plans.
  const a = selectRecurrence('Friday and Monday')
  const b = selectRecurrence('Monday and Friday')
  assert.deepEqual(a, b)
  assert.deepEqual(daysOf(a as Recurrence), ['Monday', 'Friday'])
})

test('abbreviations and plurals count as named days', () => {
  assert.deepEqual(selectRecurrence('mon and thurs'), {
    kind: 'weekly_on_days',
    days: ['Monday', 'Thursday'],
  })
  assert.deepEqual(selectRecurrence('Tuesdays'), {
    kind: 'weekly_on_days',
    days: ['Tuesday'],
  })
})

/* ------------------------------------------------------------------ *
 * every_n_days, and its range.
 * ------------------------------------------------------------------ */

test('every_n_days accepts digits and written numbers', () => {
  assert.deepEqual(selectRecurrence('every 3 days'), { kind: 'every_n_days', n: 3 })
  assert.deepEqual(selectRecurrence('every three days'), { kind: 'every_n_days', n: 3 })
  assert.deepEqual(selectRecurrence('every other day'), { kind: 'every_n_days', n: 2 })
})

test('n is tested at exactly §6.3c’s boundaries', () => {
  assert.equal(selectRecurrence('every 1 days'), null, 'below the range')
  assert.deepEqual(selectRecurrence('every 2 days'), { kind: 'every_n_days', n: 2 })
  assert.deepEqual(selectRecurrence('every 14 days'), { kind: 'every_n_days', n: 14 })
  assert.equal(selectRecurrence('every 15 days'), null, 'above the range')
  assert.equal(selectRecurrence('every 90 days'), null)
})

test('an out-of-range interval produces no recurrence rather than a clamped one', () => {
  // Clamping 90 to 14 would schedule six times more often than asked. Returning
  // nothing is the honest answer to a frequency outside the set.
  assert.equal(selectRecurrence('every 90 days'), null)
})

/* ------------------------------------------------------------------ *
 * Weekdays are named, never numbered.
 * ------------------------------------------------------------------ */

test('the weekday representation is named, and nothing numbers it', () => {
  /*
   * §6.3c: the app's `byweekday` convention is disputed between its own layers
   * and unresolved, so the site does not carry a number that would silently take
   * a position on it. Asserted as a source scan because a type alias cannot stop
   * someone adding an index map beside it.
   */
  for (const day of WEEKDAYS) assert.equal(typeof day, 'string')
  const source = readFileSync('lib/parse/recurrence.ts', 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    ' ',
  )
  assert.doesNotMatch(
    source,
    /byweekday|WEEKDAY_INDEX|dayNumber|toWeekdayNumber/i,
    'the internal weekday representation is deliberately not numeric (§6.3c)',
  )
})
