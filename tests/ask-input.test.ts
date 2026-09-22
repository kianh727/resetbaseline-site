/*
 * SITE-008 · Enable/disable thresholds, at their exact boundaries.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canRun, clamp, remaining, MAX_CHARS, MIN_CHARS_TO_RUN } from '../lib/ask-input.ts'

test('Run is disabled below two characters', () => {
  assert.equal(canRun(''), false)
  assert.equal(canRun('a'), false, 'one character is below the threshold')
  assert.equal(canRun('ab'), true, 'two is the boundary, inclusive')
  assert.equal(canRun('a goal'), true)
  assert.equal(MIN_CHARS_TO_RUN, 2)
})

test('whitespace is not input', () => {
  assert.equal(canRun('  '), false, 'a field of spaces is empty to the person looking at it')
  assert.equal(canRun('\n\t '), false)
  assert.equal(canRun(' ab '), true, 'but real characters still count once trimmed')
})

test('the 300-character cap holds, including on paste', () => {
  assert.equal(MAX_CHARS, 300)
  const under = 'x'.repeat(299)
  const exact = 'x'.repeat(300)
  const over = 'x'.repeat(5000)
  assert.equal(clamp(under).length, 299)
  assert.equal(clamp(exact).length, 300, 'exactly at the cap is allowed')
  assert.equal(clamp(over).length, 300, 'a 5000-character paste is capped, not rejected')
  assert.equal(clamp(over), exact)
})

test('remaining never goes negative', () => {
  assert.equal(remaining(''), 300)
  assert.equal(remaining('x'.repeat(300)), 0)
  assert.equal(remaining('x'.repeat(5000)), 0)
})
