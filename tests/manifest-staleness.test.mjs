/*
 * SITE-004 · §6.6 staleness thresholds.
 *
 * The thresholds are tested at their exact boundaries against a fixed `now`,
 * not against the real clock — a test whose verdict depends on the date it is
 * run is a test that will one day change its answer without the code changing.
 *
 * §12.4's stub check is the first test here: with no manifest at all, this must
 * fail. A staleness check that returns "ok" on an absent manifest goes green on
 * exactly the state it exists to catch.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluate, WARN_DAYS, FAIL_DAYS } from '../scripts/manifest-staleness.mjs'

const NOW = new Date('2026-09-19T00:00:00Z')
const DAY_MS = 24 * 60 * 60 * 1000
const SHA = 'a'.repeat(40)

/** A valid envelope captured `days` before NOW. */
function manifestAged(days, overrides = {}) {
  return {
    captured_at: new Date(NOW.getTime() - days * DAY_MS).toISOString(),
    app_commit_sha: SHA,
    manifest: { capability_types: ['commitment'] },
    ...overrides,
  }
}

test('an absent manifest fails — the check never passes on nothing', () => {
  assert.equal(evaluate(null, NOW).status, 'fail')
  assert.equal(evaluate(undefined, NOW).status, 'fail')
})

test('an empty manifest object fails', () => {
  assert.equal(evaluate(manifestAged(0, { manifest: {} }), NOW).status, 'fail')
})

test('§6.6 thresholds hold at their exact boundaries', () => {
  assert.equal(evaluate(manifestAged(0), NOW).status, 'ok')
  assert.equal(evaluate(manifestAged(WARN_DAYS - 0.01), NOW).status, 'ok')
  assert.equal(evaluate(manifestAged(WARN_DAYS), NOW).status, 'warn')
  assert.equal(evaluate(manifestAged(FAIL_DAYS - 0.01), NOW).status, 'warn')
  assert.equal(evaluate(manifestAged(FAIL_DAYS), NOW).status, 'fail')
  assert.equal(evaluate(manifestAged(365), NOW).status, 'fail')
})

test('§6.6 thresholds are 30 and 60 days', () => {
  assert.equal(WARN_DAYS, 30)
  assert.equal(FAIL_DAYS, 60)
})

test('the envelope is validated, not assumed', () => {
  assert.equal(evaluate(manifestAged(0, { app_commit_sha: 'nope' }), NOW).status, 'fail')
  assert.equal(evaluate(manifestAged(0, { app_commit_sha: undefined }), NOW).status, 'fail')
  assert.equal(evaluate(manifestAged(0, { captured_at: 'not a date' }), NOW).status, 'fail')
  assert.equal(evaluate(manifestAged(0, { captured_at: undefined }), NOW).status, 'fail')
  assert.equal(evaluate(manifestAged(0, { manifest: undefined }), NOW).status, 'fail')
  assert.equal(evaluate([], NOW).status, 'fail')
  assert.equal(evaluate('a string', NOW).status, 'fail')
})

test('a captured_at in the future fails rather than reading as fresh', () => {
  assert.equal(evaluate(manifestAged(-1), NOW).status, 'fail')
})

test('a failure message says what to do about it', () => {
  const result = evaluate(manifestAged(FAIL_DAYS), NOW)
  assert.match(result.message, /re-capture/i)
  assert.match(result.message, /contracts-manifest-delivery\.md/)
})
