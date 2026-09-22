/*
 * SITE-004 · The layout-rule coverage check, and its positive control.
 *
 * PRD §6.2 · decomposition SITE-004's accept, rewritten 2026-09-19 (Kian).
 * SITE-EVAL-031 consumes the same manifest and is scoped alongside.
 *
 * *Stub check* — a stub `evaluate()` returning `{status:'ok'}` fails the five
 * failure cases below by name; one returning `{status:'fail'}` unconditionally
 * fails the positive-control-of-the-control at the bottom, which asserts a
 * matched pair passes. Neither direction alone is the assertion: a coverage
 * check that always fails is as useless as one that always passes, and only
 * the always-passing one looks like success.
 *
 * **The subprocess run at the end is accept part 3.** It drives the shipped
 * CLI rather than `evaluate()` directly, and it lives here rather than in a
 * new CI step because `npm test` is already in the sweep — a second mechanism
 * would be a second thing to keep wired. If the fixture manifest carrying a
 * sixth unknown type ever stops failing the build, this test is what says so.
 *
 * The fixture vocabulary is synthetic on purpose. PRD §6.2 forbids the five
 * real values being hand-listed in the site, and a fixture carrying them is
 * that one copy removed — it would sit in the tree looking like a source.
 * Nothing under test depends on what the strings say.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { evaluate, CAPABILITY_KEYS } from '../scripts/layout-rule-coverage.mjs'
import { readAxis } from '../scripts/contract-axes.mjs'

const RULES = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
const envelope = (capabilityList, key = 'capability_type') => ({
  captured_at: '2026-09-19T00:00:00Z',
  app_commit_sha: '0'.repeat(40),
  manifest: { [key]: capabilityList },
})

/* ---------------------------------------------------------------- *
 * Accept part 1 — the input, and every failure names the manifest.
 * ---------------------------------------------------------------- */

test('an absent manifest fails, and absence is never a pass', () => {
  const r = evaluate(null, RULES)
  assert.equal(r.status, 'fail')
  assert.match(r.message, /contracts-manifest\.json is missing/)
})

test('a manifest declaring no capability_type list fails, naming the manifest', () => {
  const r = evaluate({ captured_at: 'x', app_commit_sha: 'y', manifest: {} }, RULES)
  assert.equal(r.status, 'fail')
  assert.match(r.message, /no capability_type list/)
  /*
   * The fault is in the input. An error pointing at the layout rules would
   * send the reader to the wrong file, which is why the accept says so
   * explicitly rather than leaving the wording to whoever wrote the check.
   */
  assert.match(r.message, /fault is in the manifest, not in the layout rules/)
  assert.doesNotMatch(r.message, /coverage is not bidirectional/)
})

test('an empty capability_type list fails — the shape the old criterion passed on', () => {
  const r = evaluate(envelope([]), RULES)
  assert.equal(r.status, 'fail')
  assert.match(r.message, /is empty/)
  assert.match(r.message, /fault is in the manifest/)
})

test('a non-array capability_type fails', () => {
  const r = evaluate(envelope('alpha'), RULES)
  assert.equal(r.status, 'fail')
  assert.match(r.message, /is not an array/)
})

test('non-string entries fail rather than being coerced', () => {
  const r = evaluate(envelope(['alpha', 7, null]), RULES)
  assert.equal(r.status, 'fail')
  assert.match(r.message, /2 non-string entries/)
})

test('a repeated entry fails for its own reason, not as a count mismatch', () => {
  const r = evaluate(envelope([...RULES, 'alpha']), RULES)
  assert.equal(r.status, 'fail')
  assert.match(r.message, /repeats alpha/)
  /*
   * Six declared against five rules is a count disagreement, and reporting it
   * as drift would send someone looking for a missing rule that is already
   * there. The duplicate is diagnosed before the counts are compared.
   */
  assert.doesNotMatch(r.message, /coverage is not bidirectional/)
})

test('every candidate key spelling is found, and the bound key is reported', () => {
  for (const key of CAPABILITY_KEYS) {
    const r = evaluate(envelope(RULES, key), RULES)
    assert.equal(r.status, 'ok', `${key} was not recognised`)
    assert.match(r.message, new RegExp(`manifest\\.${key}`))
  }
})

test('the list is not hunted for anywhere in the object — negative control', () => {
  /*
   * A recursive search for "a list of five strings" would bind to whichever
   * one it found first and report coverage against the wrong vocabulary.
   */
  const nested = { manifest: { objects: { capability_type: RULES } } }
  assert.equal(readAxis(nested, 'capability_type').ok, false)
})

/* ---------------------------------------------------------------- *
 * Accept part 2 — coverage, in both directions.
 * ---------------------------------------------------------------- */

test('a declared type with no layout rule fails', () => {
  const r = evaluate(envelope([...RULES, 'zeta']), RULES)
  assert.equal(r.status, 'fail')
  assert.match(r.message, /with no layout rule: zeta/)
  assert.match(r.message, /6 declared, 5 rules/)
})

test('a layout rule for a type the manifest does not declare fails', () => {
  /*
   * The direction one-way coverage misses. Every declared type has a rule
   * here, so a check that only iterated the manifest would pass a rule set
   * that has drifted past the contract.
   */
  const r = evaluate(envelope(RULES), [...RULES, 'omega'])
  assert.equal(r.status, 'fail')
  assert.match(r.message, /does not declare: omega/)
})

test('both directions are reported together, not one at a time', () => {
  const r = evaluate(envelope([...RULES.slice(1), 'zeta']), [...RULES])
  assert.equal(r.status, 'fail')
  assert.match(r.message, /no layout rule: zeta/)
  assert.match(r.message, /does not declare: alpha/)
})

test('order is not coverage', () => {
  const r = evaluate(envelope([...RULES].reverse()), RULES)
  assert.equal(r.status, 'ok')
})

test('a matched pair passes, and says what it matched', () => {
  const r = evaluate(envelope(RULES), RULES)
  assert.equal(r.status, 'ok')
  assert.deepEqual(r.declared, RULES)
  assert.match(r.message, /matched in both directions/)
})

/* ---------------------------------------------------------------- *
 * Accept part 3 — the positive control, through the shipped CLI.
 * ---------------------------------------------------------------- */

function runCheck(manifest) {
  try {
    const stdout = execFileSync(
      process.execPath,
      [
        'scripts/check-layout-rules.mjs',
        '--manifest', `tests/fixtures/${manifest}`,
        '--rules', 'tests/fixtures/layout-rules-fixture.json',
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
    return { code: 0, output: stdout }
  } catch (err) {
    return { code: err.status, output: `${err.stdout ?? ''}${err.stderr ?? ''}` }
  }
}

test('a fixture manifest carrying a sixth unknown type fails the build', () => {
  const { code, output } = runCheck('manifest-fixture-sixth-type.json')
  assert.equal(code, 1)
  assert.match(output, /no layout rule: zeta/)
})

test('an empty fixture vocabulary fails the build, naming the manifest', () => {
  const { code, output } = runCheck('manifest-fixture-empty.json')
  assert.equal(code, 1)
  assert.match(output, /fault is in the manifest/)
})

test('the matched fixture pair exits 0 — the control on the control', () => {
  /*
   * Without this, both assertions above are satisfied by a check that fails
   * on everything, which is the failure mode that looks like rigour.
   */
  const { code } = runCheck('manifest-fixture-valid.json')
  assert.equal(code, 0)
})

test('the valid and sixth-type fixtures differ by exactly one type', () => {
  /*
   * §0.3b. The positive control proves the check fires — but only if the two
   * fixtures really are the same input with one thing changed. Two unrelated
   * files would make it fire for a reason nobody recorded, and the assertion
   * above would keep passing after somebody edited the wrong one.
   */
  const read = (f) =>
    JSON.parse(readFileSync(`tests/fixtures/${f}`, 'utf8')).manifest.capability_type
  const base = read('manifest-fixture-valid.json')
  const probe = read('manifest-fixture-sixth-type.json')
  assert.deepEqual(probe.slice(0, base.length), base)
  assert.equal(probe.length, base.length + 1)
})
