/*
 * §11.5's `[ download your plan ]` — the file it writes.
 *
 * *Stub check* — a stub `planAsText()` returning `''` fails the first test,
 * which asserts the plan's own title and every node label are present before
 * asserting anything about shape. A stub returning a fixed string fails the
 * date and descriptor assertions by name.
 *
 * The two assertions that matter most are negative: **no ordinal and no
 * total**, and **no localised date**. Both are things a later edit adds without
 * anybody reviewing the file, and both are invisible in the session that adds
 * them — the first is a completeness meter (§10, §4) in the one artifact that
 * outlives the session, and the second makes the same plan read differently on
 * two machines.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { planDate, type Plan } from '../lib/plan/model.ts'
import { planAsText } from '../lib/plan/download.ts'

const plan: Plan = {
  title: 'Finish the thesis',
  deadline: planDate(2026, 4, 31),
  nodes: [
    {
      id: 'n-1',
      capability: 'cap-x',
      authority: 'tier-x',
      label: 'Thesis block',
      detail: {
        occurrences: [
          { id: 'o-1', date: planDate(2026, 4, 4), window: { startMinute: 480, endMinute: 570 } },
          { id: 'o-2', date: planDate(2026, 4, 5), window: { startMinute: 480, endMinute: 570 } },
        ],
      },
    },
    {
      id: 'n-2',
      capability: 'cap-y',
      authority: 'tier-y',
      label: 'Protection',
      detail: { appCount: 3, window: { startMinute: 360, endMinute: 450 } },
    },
  ],
}

test('the file carries the plan — title, every label, every occurrence', () => {
  const text = planAsText(plan)
  assert.match(text, /Finish the thesis/)
  assert.match(text, /Thesis block/)
  assert.match(text, /Protection/)
  assert.match(text, /May 4, 2026/)
  assert.match(text, /May 5, 2026/)
  assert.match(text, /Deadline: May 31, 2026/)
})

test('it carries no ordinal and no total', () => {
  /*
   * §10 bans progress and completeness meters; §4 promises none. A downloaded
   * file is exactly where "2 of 12" gets added, because nobody reviews a text
   * template the way they review a component.
   */
  const text = planAsText(plan)
  assert.doesNotMatch(text, /\b\d+\s*(of|\/)\s*\d+\b/)
  assert.doesNotMatch(text, /\b(progress|complete|completion|streak|score)\b/i)
})

test('it names no app — §6.3a', () => {
  const text = planAsText(plan)
  assert.match(text, /3 apps/)
})

test('the file says what it is and is not', () => {
  /*
   * Someone opening this three weeks later should not have to infer where it
   * came from, and a plan file reading as though Baseline produced it would be
   * the site implying a capability it does not have (DS-8).
   */
  assert.match(planAsText(plan), /resetbaseline\.com/)
  assert.match(planAsText(plan), /the plan, not the app/)
})

test('a plan with no deadline omits the line rather than writing a blank one', () => {
  const text = planAsText({ ...plan, deadline: null })
  assert.doesNotMatch(text, /Deadline:/)
})

test('nothing in the download path formats through the locale', () => {
  /*
   * `check-motion.mjs` scans lib/ for this too, so it is asserted twice on
   * purpose — the scan covers the rule site-wide, this covers the one file
   * where a date is most likely to be "tidied" into toLocaleDateString.
   */
  const source = readFileSync('lib/plan/download.ts', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
  assert.equal(/\.toLocale[A-Za-z]*\(|\bIntl\./.test(source), false)
})
