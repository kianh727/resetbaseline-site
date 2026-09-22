/*
 * SITE-023 · The occurrence generator's fixture suite.
 *
 * *Accept*: **weekdays over 14 days yields exactly 10. DST transition fixtures
 * pass in both directions.** *Tests*: 40+ fixtures including DST, month
 * boundaries, leap year, and all closed-set rules.
 *
 * **Counts are asserted before dates, everywhere.** A date-by-date comparison
 * that happens to receive an empty array agrees with an empty expectation, and
 * an expansion that produces nothing is the failure this generator exists to
 * make impossible (§0.3). Every test below establishes how many occurrences
 * there are before saying anything about which days they fall on.
 *
 * **DST is tested by running the clock through a transition, not by asserting a
 * timezone.** The suite runs in whatever zone CI provides, so a fixture keyed to
 * `America/New_York` would assert the environment rather than the code. What is
 * asserted instead is the property that must hold in **every** zone: stepping
 * the calendar N times lands on the Nth calendar day, and the count over a span
 * does not change because an offset did.
 *
 * @implements SITE-EVAL-029
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { planDate } from '../lib/plan/model.ts'
import { generateOccurrences } from '../lib/plan/occurrences.ts'
import { WEEKDAYS, type Recurrence } from '../lib/parse/recurrence.ts'

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function gen(rule: Recurrence, from: Date, until: Date, anchor?: Date) {
  return generateOccurrences(anchor ? { rule, from, until, anchor } : { rule, from, until })
}

const WINDOW = { startMinute: 480, endMinute: 570 }

/* ------------------------------------------------------------------ *
 * The named accept criterion.
 * ------------------------------------------------------------------ */

test('weekdays over 14 days yields exactly 10 — SITE-023 accept', () => {
  // Mon 2 Mar 2026 through Sun 15 Mar 2026: two full weeks, ten weekdays.
  const o = gen({ kind: 'weekdays' }, planDate(2026, 2, 2), planDate(2026, 2, 15))
  assert.equal(o.length, 10)
  assert.deepEqual(o.map((x) => iso(x.date)).slice(0, 5), [
    '2026-03-02',
    '2026-03-03',
    '2026-03-04',
    '2026-03-05',
    '2026-03-06',
  ])
})

test('weekends over the same fortnight yields exactly 4', () => {
  const o = gen({ kind: 'weekends' }, planDate(2026, 2, 2), planDate(2026, 2, 15))
  assert.equal(o.length, 4)
  assert.deepEqual(o.map((x) => iso(x.date)), [
    '2026-03-07',
    '2026-03-08',
    '2026-03-14',
    '2026-03-15',
  ])
})

test('daily over the same fortnight yields exactly 14', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 2, 2), planDate(2026, 2, 15))
  assert.equal(o.length, 14)
})

test('weekdays and weekends partition daily exactly', () => {
  // A second source for both counts: the two rules must sum to the span with no
  // day counted twice and none missed.
  const from = planDate(2026, 2, 2)
  const until = planDate(2026, 2, 15)
  const wd = gen({ kind: 'weekdays' }, from, until)
  const we = gen({ kind: 'weekends' }, from, until)
  const all = gen({ kind: 'daily' }, from, until)
  assert.equal(wd.length + we.length, all.length)
  const union = new Set([...wd, ...we].map((o) => iso(o.date)))
  assert.equal(union.size, all.length)
})

/* ------------------------------------------------------------------ *
 * DST, both directions.
 * ------------------------------------------------------------------ */

test('a span crossing spring-forward keeps one occurrence per calendar day', () => {
  // US spring-forward 2026 is 8 March; EU is 29 March. The span covers both, so
  // the property holds wherever CI runs.
  const o = gen({ kind: 'daily' }, planDate(2026, 2, 1), planDate(2026, 3, 5))
  assert.equal(o.length, 36, '1 Mar to 5 Apr inclusive is 36 days')
  const days = o.map((x) => iso(x.date))
  assert.equal(new Set(days).size, 36, 'no calendar day repeated or skipped')
  assert.equal(days[7], '2026-03-08')
  assert.equal(days[28], '2026-03-29')
})

test('a span crossing autumn fall-back keeps one occurrence per calendar day', () => {
  // EU 25 Oct 2026, US 1 Nov 2026 — both inside this span.
  const o = gen({ kind: 'daily' }, planDate(2026, 9, 20), planDate(2026, 10, 5))
  assert.equal(o.length, 17, '20 Oct to 5 Nov inclusive is 17 days')
  assert.equal(new Set(o.map((x) => iso(x.date))).size, 17)
})

test('every occurrence is noon-anchored, including across a transition', () => {
  // The reason the whole model is noon-anchored: a midnight date can shift a day
  // when the offset moves, and the calendar day the visitor sees must be stored.
  const o = gen({ kind: 'daily' }, planDate(2026, 2, 1), planDate(2026, 3, 5))
  assert.equal(o.length, 36)
  for (const occ of o) assert.equal(occ.date.getHours(), 12, iso(occ.date))
})

test('every_n_days counts calendar days, not 24-hour periods, across a transition', () => {
  // 1 Mar + 3n across the US transition. A millisecond-stride implementation
  // drifts an hour here and eventually lands on the wrong calendar day.
  const o = gen({ kind: 'every_n_days', n: 3 }, planDate(2026, 2, 1), planDate(2026, 2, 31))
  assert.equal(o.length, 11)
  assert.deepEqual(o.map((x) => iso(x.date)).slice(0, 5), [
    '2026-03-01',
    '2026-03-04',
    '2026-03-07',
    '2026-03-10',
    '2026-03-13',
  ])
})

test('weekday identity survives a DST transition', () => {
  // Every occurrence of a weekdays rule must still be a weekday after the clock
  // moves — the failure mode is a Saturday appearing because an offset shifted.
  const o = gen({ kind: 'weekdays' }, planDate(2026, 2, 1), planDate(2026, 3, 5))
  assert.ok(o.length > 0)
  for (const occ of o) {
    const d = occ.date.getDay()
    assert.ok(d >= 1 && d <= 5, `${iso(occ.date)} is not a weekday`)
  }
})

/* ------------------------------------------------------------------ *
 * Boundaries — month, year, leap.
 * ------------------------------------------------------------------ */

test('a span crossing a month boundary is continuous', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 0, 28), planDate(2026, 1, 3))
  assert.equal(o.length, 7)
  assert.deepEqual(o.map((x) => iso(x.date)), [
    '2026-01-28', '2026-01-29', '2026-01-30', '2026-01-31',
    '2026-02-01', '2026-02-02', '2026-02-03',
  ])
})

test('a span crossing a year boundary is continuous', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 11, 29), planDate(2027, 0, 3))
  assert.equal(o.length, 6)
  assert.equal(iso(o[0]!.date), '2026-12-29')
  assert.equal(iso(o[5]!.date), '2027-01-03')
})

test('a leap day is a real day and is generated', () => {
  const o = gen({ kind: 'daily' }, planDate(2028, 1, 27), planDate(2028, 2, 1))
  assert.equal(o.length, 4, '27, 28, 29 Feb and 1 Mar')
  assert.ok(o.map((x) => iso(x.date)).includes('2028-02-29'))
})

test('a non-leap February has no 29th', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 1, 26), planDate(2026, 2, 1))
  assert.equal(o.length, 4, '26, 27, 28 Feb and 1 Mar')
  assert.ok(!o.map((x) => iso(x.date)).includes('2026-02-29'))
})

test('every_n_days crossing a leap day counts it', () => {
  const o = gen({ kind: 'every_n_days', n: 2 }, planDate(2028, 1, 27), planDate(2028, 2, 4))
  assert.equal(o.length, 4)
  assert.deepEqual(o.map((x) => iso(x.date)), [
    '2028-02-27', '2028-02-29', '2028-03-02', '2028-03-04',
  ])
})

/* ------------------------------------------------------------------ *
 * All five rules, and the shapes of the window.
 * ------------------------------------------------------------------ */

test('weekly_on_days generates exactly the named days', () => {
  const rule: Recurrence = { kind: 'weekly_on_days', days: ['Monday', 'Wednesday', 'Friday'] }
  const o = gen(rule, planDate(2026, 2, 2), planDate(2026, 2, 15))
  assert.equal(o.length, 6, 'three days a week over two weeks')
  assert.deepEqual(o.map((x) => iso(x.date)), [
    '2026-03-02', '2026-03-04', '2026-03-06',
    '2026-03-09', '2026-03-11', '2026-03-13',
  ])
})

test('weekly_on_days with a single day generates one per week', () => {
  const rule: Recurrence = { kind: 'weekly_on_days', days: ['Sunday'] }
  const o = gen(rule, planDate(2026, 2, 2), planDate(2026, 2, 29))
  assert.equal(o.length, 4)
  for (const occ of o) assert.equal(occ.date.getDay(), 0)
})

test('every_n_days anchors on the anchor, not the window start', () => {
  /*
   * The anchor is the commitment's creation date (recorded as this issue's
   * choice — §6.3c does not specify one). Anchoring on the window start would
   * make the same rule produce different dates depending on when the plan is
   * rendered, which is the determinism §6.5 requires reading as a bug.
   */
  const rule: Recurrence = { kind: 'every_n_days', n: 3 }
  /*
   * The anchor is 2 March, deliberately **off** the window start's own cycle.
   * The first version of this fixture anchored on 1 March — which is 10 March
   * minus nine days, exactly three strides — so anchored and unanchored produced
   * identical dates and the test asserted nothing. The guard assertion below is
   * what caught it, and it is why the guard is there.
   */
  const anchored = gen(rule, planDate(2026, 2, 10), planDate(2026, 2, 20), planDate(2026, 2, 2))
  const unanchored = gen(rule, planDate(2026, 2, 10), planDate(2026, 2, 20))
  assert.equal(anchored.length, 4)
  assert.equal(unanchored.length, 4)
  assert.notDeepEqual(
    anchored.map((x) => iso(x.date)),
    unanchored.map((x) => iso(x.date)),
    'the anchor must actually move the dates, or this test proves nothing',
  )
  assert.deepEqual(anchored.map((x) => iso(x.date)), [
    '2026-03-11', '2026-03-14', '2026-03-17', '2026-03-20',
  ])
  assert.deepEqual(unanchored.map((x) => iso(x.date)), [
    '2026-03-10', '2026-03-13', '2026-03-16', '2026-03-19',
  ])
})

test('the same rule and anchor produce identical dates every time', () => {
  // EVAL-030: identical dates and counts across semantically identical inputs.
  const rule: Recurrence = { kind: 'every_n_days', n: 4 }
  const a = gen(rule, planDate(2026, 2, 1), planDate(2026, 3, 1), planDate(2026, 2, 1))
  const b = gen(rule, planDate(2026, 2, 1), planDate(2026, 3, 1), planDate(2026, 2, 1))
  assert.deepEqual(a.map((x) => iso(x.date)), b.map((x) => iso(x.date)))
})

test('a window is carried onto every occurrence, and null stays null', () => {
  const withWindow = generateOccurrences({
    rule: { kind: 'weekdays' },
    from: planDate(2026, 2, 2),
    until: planDate(2026, 2, 6),
    window: WINDOW,
  })
  assert.equal(withWindow.length, 5)
  for (const o of withWindow) assert.deepEqual(o.window, WINDOW)

  const without = gen({ kind: 'weekdays' }, planDate(2026, 2, 2), planDate(2026, 2, 6))
  assert.equal(without.length, 5)
  for (const o of without) assert.equal(o.window, null)
})

test('occurrence ids are unique across a generated set', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 2, 1), planDate(2026, 2, 31))
  assert.equal(o.length, 31)
  assert.equal(new Set(o.map((x) => x.id)).size, 31)
})

/* ------------------------------------------------------------------ *
 * Degenerate spans.
 * ------------------------------------------------------------------ */

test('a single-day span containing a match yields exactly one', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 2, 2), planDate(2026, 2, 2))
  assert.equal(o.length, 1)
  assert.equal(iso(o[0]!.date), '2026-03-02')
})

test('a single-day span containing no match yields none', () => {
  // A Sunday against a weekdays rule.
  const o = gen({ kind: 'weekdays' }, planDate(2026, 2, 8), planDate(2026, 2, 8))
  assert.equal(o.length, 0)
})

test('an inverted span yields none rather than looping', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 2, 15), planDate(2026, 2, 2))
  assert.equal(o.length, 0)
})

test('both bounds are inclusive', () => {
  const o = gen({ kind: 'daily' }, planDate(2026, 2, 2), planDate(2026, 2, 4))
  assert.deepEqual(o.map((x) => iso(x.date)), ['2026-03-02', '2026-03-03', '2026-03-04'])
})

/* ------------------------------------------------------------------ *
 * The fixture table — SITE-023's "40+ fixtures", asserted as a count.
 * ------------------------------------------------------------------ */

/**
 * Each row is `[label, rule, from, until, expectedCount]`.
 *
 * **The count is the assertion.** SITE-023's accept is stated in counts —
 * *"weekdays over 14 days yields exactly 10"* — because a count is the thing an
 * expansion producing nothing gets wrong, and a date-by-date comparison against
 * an empty expectation agrees with an empty result.
 */
const FIXTURES: readonly (readonly [string, Recurrence, Date, Date, number])[] = [
  ['daily, one week', { kind: 'daily' }, planDate(2026, 2, 2), planDate(2026, 2, 8), 7],
  ['daily, 30 days', { kind: 'daily' }, planDate(2026, 3, 1), planDate(2026, 3, 30), 30],
  ['daily, 31-day month', { kind: 'daily' }, planDate(2026, 4, 1), planDate(2026, 4, 31), 31],
  ['daily, Feb non-leap', { kind: 'daily' }, planDate(2026, 1, 1), planDate(2026, 1, 28), 28],
  ['daily, Feb leap', { kind: 'daily' }, planDate(2028, 1, 1), planDate(2028, 1, 29), 29],
  ['daily, full year', { kind: 'daily' }, planDate(2026, 0, 1), planDate(2026, 11, 31), 365],
  ['daily, leap year', { kind: 'daily' }, planDate(2028, 0, 1), planDate(2028, 11, 31), 366],

  ['weekdays, one week', { kind: 'weekdays' }, planDate(2026, 2, 2), planDate(2026, 2, 8), 5],
  ['weekdays, two weeks', { kind: 'weekdays' }, planDate(2026, 2, 2), planDate(2026, 2, 15), 10],
  ['weekdays, four weeks', { kind: 'weekdays' }, planDate(2026, 2, 2), planDate(2026, 2, 29), 20],
  ['weekdays, starting Sat', { kind: 'weekdays' }, planDate(2026, 2, 7), planDate(2026, 2, 13), 5],
  ['weekdays, starting Sun', { kind: 'weekdays' }, planDate(2026, 2, 8), planDate(2026, 2, 14), 5],
  ['weekdays, weekend only', { kind: 'weekdays' }, planDate(2026, 2, 7), planDate(2026, 2, 8), 0],
  ['weekdays, across month', { kind: 'weekdays' }, planDate(2026, 2, 30), planDate(2026, 3, 3), 5],

  ['weekends, one week', { kind: 'weekends' }, planDate(2026, 2, 2), planDate(2026, 2, 8), 2],
  ['weekends, two weeks', { kind: 'weekends' }, planDate(2026, 2, 2), planDate(2026, 2, 15), 4],
  ['weekends, weekdays only', { kind: 'weekends' }, planDate(2026, 2, 2), planDate(2026, 2, 6), 0],
  ['weekends, across year', { kind: 'weekends' }, planDate(2026, 11, 28), planDate(2027, 0, 10), 4],

  ['every 2 days, 14-day span', { kind: 'every_n_days', n: 2 }, planDate(2026, 2, 1), planDate(2026, 2, 14), 7],
  ['every 3 days, 30-day span', { kind: 'every_n_days', n: 3 }, planDate(2026, 3, 1), planDate(2026, 3, 30), 10],
  ['every 7 days, 28-day span', { kind: 'every_n_days', n: 7 }, planDate(2026, 2, 1), planDate(2026, 2, 28), 4],
  ['every 14 days, 28-day span', { kind: 'every_n_days', n: 14 }, planDate(2026, 2, 1), planDate(2026, 2, 28), 2],
  ['every 14 days, 13-day span', { kind: 'every_n_days', n: 14 }, planDate(2026, 2, 1), planDate(2026, 2, 13), 1],
  // 25, 27, 29 Feb then 2 Mar. Four, not five — the leap day is on the cycle and
  // 3 Mar is not. The first version expected five and the table caught it.
  ['every 2 days, across Feb leap', { kind: 'every_n_days', n: 2 }, planDate(2028, 1, 25), planDate(2028, 2, 3), 4],
  ['every 5 days, across year', { kind: 'every_n_days', n: 5 }, planDate(2026, 11, 27), planDate(2027, 0, 11), 4],

  ['on Mon', { kind: 'weekly_on_days', days: ['Monday'] }, planDate(2026, 2, 2), planDate(2026, 2, 29), 4],
  ['on Mon/Wed/Fri', { kind: 'weekly_on_days', days: ['Monday', 'Wednesday', 'Friday'] }, planDate(2026, 2, 2), planDate(2026, 2, 15), 6],
  ['on Tue/Thu', { kind: 'weekly_on_days', days: ['Tuesday', 'Thursday'] }, planDate(2026, 2, 2), planDate(2026, 2, 15), 4],
  ['on Sat', { kind: 'weekly_on_days', days: ['Saturday'] }, planDate(2026, 2, 2), planDate(2026, 2, 29), 4],
  ['on Sun, across month', { kind: 'weekly_on_days', days: ['Sunday'] }, planDate(2026, 2, 25), planDate(2026, 3, 8), 2],
  ['on all seven', { kind: 'weekly_on_days', days: [...WEEKDAYS] }, planDate(2026, 2, 2), planDate(2026, 2, 8), 7],
  ['on Mon, span too short', { kind: 'weekly_on_days', days: ['Monday'] }, planDate(2026, 2, 3), planDate(2026, 2, 8), 0],

  ['daily across spring-forward', { kind: 'daily' }, planDate(2026, 2, 6), planDate(2026, 2, 10), 5],
  ['daily across EU spring-forward', { kind: 'daily' }, planDate(2026, 2, 27), planDate(2026, 2, 31), 5],
  ['daily across EU fall-back', { kind: 'daily' }, planDate(2026, 9, 23), planDate(2026, 9, 27), 5],
  // US fall-back 2026 is 1 November. The first version ran 30 Nov to 3 Dec and
  // crossed nothing — a DST fixture that did not contain a DST transition, which
  // is §0.3 in a table row: it would have passed forever without testing anything.
  ['daily across US fall-back', { kind: 'daily' }, planDate(2026, 9, 30), planDate(2026, 10, 3), 5],
  ['weekdays across spring-forward', { kind: 'weekdays' }, planDate(2026, 2, 6), planDate(2026, 2, 12), 5],
  ['weekends across fall-back', { kind: 'weekends' }, planDate(2026, 9, 23), planDate(2026, 10, 2), 4],
  ['every 2 days across spring-forward', { kind: 'every_n_days', n: 2 }, planDate(2026, 2, 6), planDate(2026, 2, 12), 4],
  ['every 3 days across fall-back', { kind: 'every_n_days', n: 3 }, planDate(2026, 9, 23), planDate(2026, 10, 1), 4],
]

test('the fixture table covers 40+ cases — SITE-023 accept', () => {
  // Asserted rather than assumed. A suite that quietly shrank below the accept
  // line would still be green, which is the §0.3 shape one level up.
  assert.ok(FIXTURES.length >= 40, `the table has ${FIXTURES.length} rows; the accept says 40+`)
})

test('every fixture generates exactly its expected count', () => {
  const failures: string[] = []
  for (const [label, rule, from, until, expected] of FIXTURES) {
    const actual = gen(rule, from, until).length
    if (actual !== expected) failures.push(`${label}: got ${actual}, expected ${expected}`)
  }
  assert.deepEqual(failures, [])
})

test('every fixture is internally consistent — no duplicate or out-of-span dates', () => {
  // A second source for the counts above: whatever the count is, the dates
  // behind it must be distinct and inside the requested span.
  for (const [label, rule, from, until] of FIXTURES) {
    const o = gen(rule, from, until)
    assert.equal(new Set(o.map((x) => iso(x.date))).size, o.length, `${label}: duplicate dates`)
    for (const occ of o) {
      assert.ok(occ.date.getTime() >= from.getTime(), `${label}: ${iso(occ.date)} before span`)
      assert.ok(occ.date.getTime() <= until.getTime(), `${label}: ${iso(occ.date)} after span`)
    }
  }
})
