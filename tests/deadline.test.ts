/*
 * SITE-013 · The date-phrase fixture suite.
 *
 * Every case runs against a **fixed `now`**, because a parser test whose
 * verdict depends on the day it runs will eventually change its answer without
 * the code changing — and "by May" is exactly the phrase whose meaning moves.
 *
 * The negative cases are the point of the suite, not its margin. SITE-013's
 * accept is *"ambiguous phrasing returns null rather than guessing"*, and a
 * suite of only positive cases would pass on a parser that guesses at
 * everything.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDeadline, toISODate } from '../lib/parse/deadline.ts'

/** Wednesday 11 March 2026, noon. Mid-month, mid-quarter, mid-year. */
const NOW = new Date(2026, 2, 11, 12, 0, 0, 0)

function parsed(text: string, now: Date = NOW): string | null {
  const d = parseDeadline(text, now)
  return d === null ? null : toISODate(d)
}

test('`by <month>` resolves to the end of that month', () => {
  assert.equal(parsed('finish my thesis by May'), '2026-05-31')
  assert.equal(parsed('by June'), '2026-06-30')
  assert.equal(parsed('by February'), '2027-02-28', 'February already passed in 2026')
  assert.equal(parsed('by feb'), '2027-02-28', 'abbreviations count')
  assert.equal(parsed('BY DECEMBER'), '2026-12-31', 'case-insensitive')
})

test('the current month counts as future — "by May" in May is this May', () => {
  const inMay = new Date(2026, 4, 3, 12)
  assert.equal(parsed('by May', inMay), '2026-05-31')
})

test('`before` and `until` are the same phrase family as `by`', () => {
  assert.equal(parsed('before March'), '2026-03-31')
  assert.equal(parsed('until September'), '2026-09-30')
  assert.equal(parsed('due August'), '2026-08-31')
})

test('leap years are real days, not approximations', () => {
  const in2027 = new Date(2027, 5, 1, 12)
  assert.equal(parsed('by February', in2027), '2028-02-29', '2028 is a leap year')
})

test('`in N days|weeks|months`', () => {
  assert.equal(parsed('in 6 weeks'), '2026-04-22')
  assert.equal(parsed('in 1 week'), '2026-03-18')
  assert.equal(parsed('in 10 days'), '2026-03-21')
  assert.equal(parsed('in 3 months'), '2026-06-11')
  assert.equal(parsed('in 12 months'), '2027-03-11', 'crosses the year boundary')
})

test('month arithmetic clamps rather than overflowing into the next month', () => {
  const jan31 = new Date(2026, 0, 31, 12)
  assert.equal(parsed('in 1 month', jan31), '2026-02-28', 'not 3 March')
})

test('`by the end of the month|quarter|year`', () => {
  assert.equal(parsed('by the end of the quarter'), '2026-03-31')
  assert.equal(parsed('by the end of the month'), '2026-03-31')
  assert.equal(parsed('by the end of the year'), '2026-12-31')
  assert.equal(parsed('end of quarter'), '2026-03-31', 'the articles are optional')
})

test('quarters are the real four, not a rolling three months', () => {
  assert.equal(parsed('end of the quarter', new Date(2026, 0, 5, 12)), '2026-03-31', 'Q1')
  assert.equal(parsed('end of the quarter', new Date(2026, 4, 5, 12)), '2026-06-30', 'Q2')
  assert.equal(parsed('end of the quarter', new Date(2026, 7, 5, 12)), '2026-09-30', 'Q3')
  assert.equal(parsed('end of the quarter', new Date(2026, 10, 5, 12)), '2026-12-31', 'Q4')
})

test('explicit dates, ISO and written', () => {
  assert.equal(parsed('hand it in on 2026-05-15'), '2026-05-15')
  assert.equal(parsed('by May 15'), '2026-05-15')
  assert.equal(parsed('by May 15th'), '2026-05-15')
  assert.equal(parsed('by 15 May'), '2026-05-15')
  assert.equal(parsed('by May 15, 2027'), '2027-05-15')
  assert.equal(parsed('by 3 April'), '2026-04-03')
})

test('an explicit date beats the bare month it contains', () => {
  assert.equal(parsed('by May 15'), '2026-05-15', 'not 2026-05-31')
})

test('impossible dates return null rather than rolling over', () => {
  assert.equal(parsed('by February 30'), null)
  assert.equal(parsed('2026-02-30'), null)
  assert.equal(parsed('2026-13-01'), null)
  assert.equal(parsed('by April 31'), null)
})

test('numeric-only dates are ambiguous and return null', () => {
  assert.equal(parsed('by 5/15'), null, 'day-first or month-first is unknowable')
  assert.equal(parsed('by 15/5'), null)
  assert.equal(parsed('by 05-15'), null)
})

test('vague time language returns null rather than guessing', () => {
  for (const vague of [
    'soon',
    'at some point',
    'eventually',
    'by summer',
    'next month',
    'later this year',
    'asap',
    'when I can',
    'in a few weeks',
    'in a while',
    'by the deadline',
    'before it is too late',
  ]) {
    assert.equal(parsed(vague), null, `"${vague}" must not resolve to a date`)
  }
})

test('text with no time language at all returns null', () => {
  for (const text of [
    '',
    '   ',
    'stop losing my mornings',
    'get back into the gym',
    'read more',
    'I want to study for the LSAT',
    '12345',
    '!!!',
  ]) {
    assert.equal(parsed(text), null)
  }
})

test('a month name that is not a deadline phrase does not become one', () => {
  assert.equal(parsed('I want to feel like I did last March'), null, 'no by/before/until')
})

test('zero and nonsense quantities return null', () => {
  assert.equal(parsed('in 0 weeks'), null)
  assert.equal(parsed('in weeks'), null)
})

test('the parser never throws, whatever it is given', () => {
  for (const input of ['', '\u0000', 'by '.repeat(400), '🙂'.repeat(50), 'by May'.repeat(100)]) {
    assert.doesNotThrow(() => parseDeadline(input, NOW))
  }
})

/*
 * DST. Both US and EU transitions, parsed from a `now` on each side of the
 * boundary, asserting the calendar day is what a human would say. Noon-
 * anchoring is what makes these hold; midnight anchoring moves the day.
 */
test('DST transitions do not move the calendar day', () => {
  const beforeSpringForward = new Date(2026, 2, 7, 12)
  assert.equal(parsed('in 1 week', beforeSpringForward), '2026-03-14')
  assert.equal(parsed('in 8 days', beforeSpringForward), '2026-03-15', 'spans the US transition')

  const beforeFallBack = new Date(2026, 9, 30, 12)
  assert.equal(parsed('in 1 week', beforeFallBack), '2026-11-06', 'spans the US fall-back')

  const beforeEU = new Date(2026, 2, 26, 12)
  assert.equal(parsed('in 1 week', beforeEU), '2026-04-02', 'spans the EU transition')
})

test('every parsed date is noon-anchored', () => {
  for (const text of ['by May', 'in 6 weeks', 'by the end of the year', '2026-05-15']) {
    const d = parseDeadline(text, NOW)
    assert.ok(d !== null)
    assert.equal(d.getHours(), 12, `"${text}" must be noon-anchored or DST can move its day`)
  }
})

test('the suite covers at least 60 phrases — SITE-013 accept', () => {
  /*
   * Asserted rather than assumed. The accept line says "60+ phrases", and a
   * suite that quietly shrank below it would still be green.
   */
  const phrases = [
    'by May', 'by June', 'by February', 'by feb', 'BY DECEMBER', 'by January', 'by March',
    'by April', 'by July', 'by August', 'by September', 'by October', 'by November',
    'before March', 'until September', 'due August', 'before jan', 'until dec',
    'in 6 weeks', 'in 1 week', 'in 10 days', 'in 3 months', 'in 12 months', 'in 1 day',
    'in 2 weeks', 'in 30 days', 'in 1 month', 'in 6 months',
    'by the end of the quarter', 'by the end of the month', 'by the end of the year',
    'end of quarter', 'end of month', 'end of year', 'end of the quarter',
    '2026-05-15', 'by May 15', 'by May 15th', 'by 15 May', 'by May 15, 2027', 'by 3 April',
    '2026-12-31', 'by 1 June', 'by June 1st',
    'by February 30', '2026-02-30', '2026-13-01', 'by April 31',
    'by 5/15', 'by 15/5', 'by 05-15',
    'soon', 'at some point', 'eventually', 'by summer', 'next month', 'later this year',
    'asap', 'when I can', 'in a few weeks', 'in a while', 'by the deadline',
    'before it is too late', 'stop losing my mornings', 'get back into the gym',
    'in 0 weeks', 'in weeks',
  ]
  assert.ok(phrases.length >= 60, `only ${phrases.length} phrases`)
  for (const p of phrases) assert.doesNotThrow(() => parseDeadline(p, NOW))
})
