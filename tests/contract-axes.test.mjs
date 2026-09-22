/*
 * SITE-004 · The contract-axis reader, the arrival verification, and the
 * type generator.
 *
 * PRD §6.2 (derived, not hand-listed) · §6.3 (the closed vocabularies) ·
 * §6.6 (drift). Feeds SITE-020's narrowing and SITE-EVAL-031.
 *
 * *Stub check* — a stub `readAxis()` returning `{ok:true, values:[]}` fails
 * the empty and count assertions; a stub `verifyArrival()` returning
 * `{ok:true}` fails every FAIL case below by name, and one returning
 * `{ok:false}` fails the well-formed control. Both directions are asserted
 * because an arrival check that rejects everything is as useless as one that
 * accepts everything, and only the accepting one looks like success.
 *
 * The vocabulary in these fixtures is synthetic. §6.2 forbids the real values
 * hand-listed in the site; a fixture carrying them would sit in the tree
 * looking like a source, which is the same defect one copy removed.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { AXES, readAxis, innerManifest, verifyArrival } from '../scripts/contract-axes.mjs'
import { emit } from '../scripts/generate-contract-types.mjs'

const FULL = JSON.parse(readFileSync('tests/fixtures/manifest-fixture-full.json', 'utf8'))
const clone = (o) => JSON.parse(JSON.stringify(o))

/* ---------------------------------------------------------------- *
 * The axis table itself.
 * ---------------------------------------------------------------- */

test('the four axes carry PRD §6.3’s counts — 5/3/5/3', () => {
  /*
   * Written out here from §6.3's table rather than read from AXES's own
   * `expected`, which would be the check agreeing with its own reference
   * (§0.3b). This is the second source for the number the arrival
   * verification stops on.
   */
  assert.deepEqual(
    AXES.map((a) => [a.axis, a.expected]),
    [
      ['capability_type', 5],
      ['authority_tier', 3],
      ['outcome', 5],
      ['belief_tier', 3],
    ],
  )
})

/* ---------------------------------------------------------------- *
 * readAxis.
 * ---------------------------------------------------------------- */

test('an axis that is not a contract axis throws rather than returning a miss', () => {
  /*
   * A typo'd axis name returning "not found" would read as a manifest defect
   * and send someone to the wrong file.
   */
  assert.throws(() => readAxis(FULL, 'capability'), /not a contract axis/)
})

test('the envelope must nest the manifest under `manifest`', () => {
  assert.equal(innerManifest({ capability_type: ['alpha'] }), null)
  assert.equal(innerManifest(null), null)
  assert.equal(innerManifest([1, 2]), null)
  const r = readAxis({ capability_type: ['alpha'] }, 'capability_type')
  assert.equal(r.ok, false)
  assert.match(r.reason, /no `manifest` object/)
})

test('each axis is found under every spelling it declares', () => {
  for (const { axis, keys } of AXES) {
    for (const key of keys) {
      const r = readAxis({ manifest: { [key]: ['one', 'two'] } }, axis)
      assert.equal(r.ok, true, `${axis} was not found under ${key}`)
      assert.equal(r.key, key)
    }
  }
})

test('the list is not hunted for at arbitrary depth — negative control', () => {
  const nested = { manifest: { objects: { capability_type: ['alpha', 'beta'] } } }
  assert.equal(readAxis(nested, 'capability_type').ok, false)
})

test('a non-array, non-string, empty or duplicated axis is rejected', () => {
  const at = (v) => readAxis({ manifest: { capability_type: v } }, 'capability_type')
  assert.match(at('alpha').reason, /is not an array/)
  assert.match(at(['alpha', 3]).reason, /1 non-string entry/)
  assert.match(at([]).reason, /is empty/)
  assert.match(at(['alpha', 'alpha']).reason, /repeats alpha/)
})

/* ---------------------------------------------------------------- *
 * verifyArrival — the 5/3/5/3 stop-or-go.
 * ---------------------------------------------------------------- */

test('a well-formed delivery passes and reports all four axes', () => {
  const r = verifyArrival(FULL)
  assert.equal(r.ok, true)
  assert.equal(r.lines.length, 4)
  assert.equal(r.lines.filter((l) => l.startsWith('ok')).length, 4)
})

test('a count that disagrees with §6.3 stops, naming the axis and both numbers', () => {
  const bad = clone(FULL)
  bad.manifest.authority_tier = ['tier_one', 'tier_two']
  const r = verifyArrival(bad)
  assert.equal(r.ok, false)
  assert.match(r.lines[1], /FAIL {2}authority_tier/)
  assert.match(r.lines[1], /declares 2, PRD §6.3 states 3/)
})

test('a missing axis stops, and the other three are still reported', () => {
  const bad = clone(FULL)
  delete bad.manifest.belief_tier
  const r = verifyArrival(bad)
  assert.equal(r.ok, false)
  assert.equal(r.lines.filter((l) => l.startsWith('ok')).length, 3)
  assert.match(r.lines[3], /FAIL {2}belief_tier/)
})

test('all four failures are reported in one run, not one per run', () => {
  const r = verifyArrival({ manifest: {} })
  assert.equal(r.ok, false)
  assert.equal(r.lines.filter((l) => l.startsWith('FAIL')).length, 4)
})

/* ---------------------------------------------------------------- *
 * The generator.
 * ---------------------------------------------------------------- */

test('a partial vocabulary generates nothing at all', () => {
  /*
   * The case that matters most. A generator emitting the axes that did arrive
   * leaves every downstream check passing against the part of the contract
   * that landed — which is §0.3 with three quarters of the input missing.
   */
  const partial = clone(FULL)
  delete partial.manifest.outcome
  assert.throws(() => emit(partial, 'fixture'), /cannot read outcome/)
})

test('every axis emits both a union and a frozen list', () => {
  const src = emit(FULL, 'fixture')
  for (const name of ['CapabilityType', 'AuthorityTier', 'RecordedOutcome', 'BeliefTier']) {
    assert.match(src, new RegExp(`export type ${name} = `), `${name} union missing`)
  }
  for (const name of ['CAPABILITY_TYPES', 'AUTHORITY_TIERS', 'RECORDED_OUTCOMES', 'BELIEF_TIERS']) {
    assert.match(src, new RegExp(`export const ${name} = Object.freeze`), `${name} list missing`)
  }
  /*
   * Both halves, per the EVAL-033 finding: the union closes the key space at
   * compile time, the list is what a runtime coverage check can iterate, and
   * neither covers the other's case.
   */
})

test('the emitted members are the manifest’s, in the manifest’s order', () => {
  const src = emit(FULL, 'fixture')
  assert.match(src, /export type CapabilityType = 'alpha' \| 'beta' \| 'gamma' \| 'delta' \| 'epsilon'/)
})

test('emit is deterministic — the drift guard rests on it', () => {
  /*
   * check-generated-contracts compares a fresh emit against the committed
   * file. If emit varied at all — a timestamp, a map iteration order — every
   * build would fail and the guard would be turned off within a week.
   */
  assert.equal(emit(FULL, 'fixture'), emit(clone(FULL), 'fixture'))
})

test('the envelope’s provenance is carried into the generated header', () => {
  const src = emit(FULL, 'fixture')
  assert.match(src, /app_commit_sha {2}0{40}/)
  assert.match(src, /captured_at {5}2026-09-19T00:00:00Z/)
})

test('nothing generated reads artifact_divergences (§6.6)', () => {
  /*
   * The manifest carries the key upstream — the delivery spec asked for it to
   * be left in, because the site's generator refusing to read it is the safer
   * place for the rule. This is that refusal, asserted rather than assumed:
   * the key is planted in the input and must not appear in the output.
   */
  const withKey = clone(FULL)
  withKey.manifest.artifact_divergences = { action_types: 33, event_types: 72 }
  const src = emit(withKey, 'fixture')
  assert.doesNotMatch(src, /artifact_divergences/)
  assert.doesNotMatch(src, /\b33\b/)
  assert.doesNotMatch(src, /\b72\b/)
})
