/*
 * SITE-037 · The plan is deterministic, client-side, and invents nothing.
 *
 * *Stub check* — a stub `buildPlan()` returning `null` fails the first test,
 * which asserts a plan exists and carries the visitor's own sentence before
 * anything else. One returning a fixed plan fails the determinism, the
 * no-recurrence and the gate tests by name.
 *
 * The assertions that matter most are the ones about what is **absent**: no
 * recurrence invented when none parses, no window in the gate the visitor did
 * not choose, and no app name anywhere in the object. Each is a place the site
 * would answer a question nobody asked.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { buildPlan } from '../lib/builder/build-plan.ts'
import { planDate } from '../lib/plan/model.ts'

const TODAY = planDate(2026, 4, 4) /* 4 May 2026, a Monday. */
const WINDOW = { startMinute: 9 * 60, endMinute: 10 * 60 + 30 }

const build = (text: string, extra: Record<string, unknown> = {}) =>
  buildPlan({ text, window: WINDOW, today: TODAY, ...extra })

test('the plan carries the visitor’s own sentence, not a paraphrase', () => {
  /*
   * §6.4's documented fallback: "the build proceeds on the original input."
   * The generated title is blocked on SP-05 and on copy, and the honest
   * substitute is what they typed — not a sentence a session wrote for them.
   */
  const plan = build('write every weekday')
  assert.ok(plan !== null)
  assert.equal(plan.title, 'write every weekday')
  assert.equal(plan.nodes[0]?.label, 'write every weekday')
})

test('empty or whitespace input produces no plan at all', () => {
  assert.equal(build(''), null)
  assert.equal(build('   \n  '), null)
})

test('identical input produces identical output — §6.5', () => {
  /*
   * The determinism the whole site rests on. Same text, same controls, same
   * day in, same dates out — no clock read inside the build, which is why
   * `today` is injected.
   */
  const a = build('write every weekday by May 20')
  const b = build('write every weekday by May 20')
  assert.deepEqual(JSON.stringify(a), JSON.stringify(b))
})

test('an unparseable frequency produces no occurrences, and nothing is invented', () => {
  /*
   * §6.3c: "an unparseable frequency produces no recurrence… a commitment with
   * no recurrence is a valid object." Falling through to `daily` would multiply
   * a plan the visitor never agreed to by seven, which is the most expensive
   * wrong guess available.
   */
  const plan = build('finish the thesis')
  assert.ok(plan !== null)
  const detail = plan.nodes[0]?.detail as { occurrences: readonly unknown[] }
  assert.equal(detail.occurrences.length, 0)
})

test('a parsed frequency produces occurrences inside the chosen window', () => {
  const plan = build('write every weekday by May 20')
  assert.ok(plan !== null)
  const detail = plan.nodes[0]?.detail as {
    occurrences: readonly { window: typeof WINDOW | null }[]
  }
  /* Counts before properties: an empty expansion agrees with any property. */
  assert.ok(detail.occurrences.length >= 10, `only ${detail.occurrences.length} occurrences`)
  for (const occurrence of detail.occurrences) {
    assert.deepEqual(occurrence.window, WINDOW)
  }
})

test('the days control overrides the parse without rounding to a shorthand', () => {
  /*
   * §6.3c's edge, applied to a control rather than to text: Monday/Wednesday/
   * Friday is `weekly_on_days` with three days, never `weekdays`. Rounding up
   * would add two commitments the visitor had just deselected.
   */
  const plan = build('write every weekday by May 20', {
    days: ['Monday', 'Wednesday', 'Friday'],
  })
  assert.ok(plan !== null)
  const detail = plan.nodes[0]?.detail as { occurrences: readonly { date: Date }[] }
  for (const occurrence of detail.occurrences) {
    assert.ok(
      [1, 3, 5].includes(occurrence.date.getDay()),
      `${occurrence.date.toDateString()} is not a selected day`,
    )
  }
})

test('deselecting every day produces no occurrences rather than all of them', () => {
  const plan = build('write every weekday by May 20', { days: [] })
  assert.ok(plan !== null)
  const detail = plan.nodes[0]?.detail as { occurrences: readonly unknown[] }
  assert.equal(detail.occurrences.length, 0)
})

test('no gate object exists until the visitor selects an app', () => {
  const none = build('write every weekday')
  assert.equal(none?.nodes.length, 1)
  const some = build('write every weekday', { appCount: 3 })
  assert.equal(some?.nodes.length, 2)
})

test('the gate carries a count and cannot carry a name — §6.3a', () => {
  const plan = build('write every weekday', { appCount: 3 })
  const gate = plan?.nodes[1]
  assert.ok(gate !== undefined)
  const detail = gate.detail as { appCount: number; window: typeof WINDOW }
  assert.equal(detail.appCount, 3)
  assert.deepEqual(detail.window, WINDOW)
  /*
   * The type is what makes this hold — `Gate.appCount` is a number, so naming
   * an app is not expressible. Asserted anyway, because the EVAL-033 lesson is
   * that the part the type carries is the part nobody re-checks.
   */
  assert.equal(JSON.stringify(gate).includes('Instagram'), false)
})

test('the gate is always explicit — SITE-040', () => {
  const plan = build('write every weekday', { appCount: 1 })
  assert.equal(plan?.nodes[1]?.authority, 'explicit')
})

test('the build reaches no network and reads no clock of its own', () => {
  /*
   * SITE-037's accept and §6.5's most important boundary in SP-06. Asserted as
   * a scan because the defect is the *presence* of a call: a passing build
   * proves nothing about a fetch on a branch the fixtures did not take.
   *
   * `new Date()` is permitted in exactly one place — the `today` default — and
   * the test injects `today` everywhere, so the fixtures never reach it.
   */
  const source = readFileSync('lib/builder/build-plan.ts', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(source), false)
  assert.equal((source.match(/new Date\(/g) ?? []).length, 1)
})
