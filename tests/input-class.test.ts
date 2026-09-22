/*
 * SITE-102 · Fixtures across all seven classes, plus the no-network assertion.
 *
 * @implements SITE-EVAL-075
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyInput,
  reachesGeneration,
  INPUT_CLASSES,
  NO_NETWORK_CLASSES,
  type InputClass,
} from '../lib/parse/input-class.ts'

const FIXTURES: readonly (readonly [string, InputClass])[] = [
  ['', 'empty'],
  ['   ', 'empty'],
  ['\n\t ', 'empty'],
  ['a', 'unreadable'],
  ['??', 'unreadable'],
  ['!!!!!!', 'unreadable'],
  ['asdfghjkl', 'unreadable'],
  ['qwertyzxcvb', 'unreadable'],
  ['12345678', 'unreadable'],
  ['....,,,,....', 'unreadable'],
  ['what is Baseline?', 'out_of_scope'],
  ['how does this work', 'out_of_scope'],
  ['who built this', 'out_of_scope'],
  ['explain the pricing', 'out_of_scope'],
  ['can you write me an essay', 'out_of_scope'],
  ['is this free?', 'out_of_scope'],
  ['I want to get healthy', 'vague'],
  ['be better', 'vague'],
  ['get more organised', 'vague'],
  ['I need to be more productive', 'vague'],
  ['become disciplined', 'vague'],
  ['stay consistent', 'vague'],
  ['finish my thesis and get back to the gym', 'multi_goal'],
  ['learn Spanish and run a marathon', 'multi_goal'],
  ['study for the LSAT, and write every morning', 'multi_goal'],
  ['quit smoking as well as save money', 'multi_goal'],
  ['I tweaked my back deadlifting', 'bounded'],
  ['pay off my credit card debt', 'bounded'],
  ['preparing for my custody hearing', 'bounded'],
  ['managing my diabetes', 'bounded'],
  ['my anxiety makes mornings hard', 'bounded'],
  ['finish my thesis by May', 'actionable'],
  ['run three times a week', 'actionable'],
  ['study for the LSAT every evening', 'actionable'],
  ['stop losing my mornings', 'actionable'],
  ['practise guitar for 30 minutes daily', 'actionable'],
  ['wake up at six on weekdays', 'actionable'],
  ['write 500 words each morning', 'actionable'],
]

test('every fixture classifies as expected', () => {
  const wrong: string[] = []
  for (const [text, expected] of FIXTURES) {
    const actual = classifyInput(text)
    if (actual !== expected) wrong.push(`"${text}" → ${actual}, expected ${expected}`)
  }
  assert.deepEqual(wrong, [])
})

test('all seven classes are covered by the fixtures', () => {
  const seen = new Set(FIXTURES.map(([, c]) => c))
  for (const cls of INPUT_CLASSES) assert.ok(seen.has(cls), `no fixture covers ${cls}`)
  assert.equal(INPUT_CLASSES.length, 7)
})

test('bounded beats vague when an input is both', () => {
  /*
   * If vague won, the site would ask a clarifying question about a medical
   * situation it has already decided not to advise on.
   */
  assert.equal(classifyInput('I want to get healthy after my surgery'), 'bounded')
  assert.equal(classifyInput('I need to be more consistent with my therapy'), 'bounded')
})

test('bounded beats out_of_scope and multi_goal too', () => {
  assert.equal(classifyInput('how do I train around my torn ACL?'), 'bounded')
  assert.equal(classifyInput('pay off my debt and learn Spanish'), 'bounded')
})

test('garbage never reaches generation — SITE-102 accept', () => {
  for (const cls of NO_NETWORK_CLASSES) assert.equal(reachesGeneration(cls), false)
  for (const cls of ['vague', 'multi_goal', 'bounded', 'actionable'] as const) {
    assert.equal(reachesGeneration(cls), true)
  }
  for (const [text, cls] of FIXTURES) {
    if (NO_NETWORK_CLASSES.includes(cls)) {
      assert.equal(reachesGeneration(classifyInput(text)), false, `"${text}" must not reach /api/plan`)
    }
  }
})

test('the classifier never throws and always returns a declared class', () => {
  for (const input of ['', '\u0000', '🙂'.repeat(80), 'x'.repeat(5000), 'по-русски']) {
    const cls = classifyInput(input)
    assert.ok(INPUT_CLASSES.includes(cls), `${cls} is not in the closed set`)
  }
})
