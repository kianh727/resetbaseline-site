/*
 * SITE-006 · The §15 degradation ladder, against a capability matrix.
 *
 * The issue's Tests line is "detection logic against mocked capability
 * matrices", and that phrasing is doing work: a test that probed the real
 * browser would assert whatever the CI runner happens to be, which is one
 * row of the table and not the one that matters.
 *
 * Run by `node --test` with native type stripping — no ts-node, no build step,
 * no dependency.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  detectTier,
  parseTierOverride,
  isRenderTier,
  INITIAL_TIER,
  TIERS,
  type Capabilities,
  type RenderTier,
} from '../lib/render-tier.ts'

/** A capable desktop. Each case below changes only what it is testing. */
function caps(overrides: Partial<Capabilities> = {}): Capabilities {
  return { webgl: 2, cores: 8, saveData: false, desktop: true, ...overrides }
}

test('§15 tier A — desktop, WebGL2, ≥4 cores', () => {
  assert.equal(detectTier(caps()), 'A')
  assert.equal(detectTier(caps({ cores: 4 })), 'A', 'four cores is the boundary, inclusive')
  assert.equal(detectTier(caps({ cores: 128 })), 'A')
})

test('§15 tier B — WebGL2 without all of A', () => {
  assert.equal(detectTier(caps({ desktop: false })), 'B', 'modern mobile')
  assert.equal(detectTier(caps({ desktop: false, cores: 8 })), 'B')
})

test('§15 tier C — WebGL1, or ≤2 cores', () => {
  assert.equal(detectTier(caps({ webgl: 1 })), 'C')
  assert.equal(detectTier(caps({ cores: 2 })), 'C', 'two cores is the boundary, inclusive')
  assert.equal(detectTier(caps({ cores: 1 })), 'C')
  assert.equal(detectTier(caps({ webgl: 1, desktop: true, cores: 64 })), 'C', 'WebGL1 caps at C however fast the machine')
})

test('§15 tier D — no WebGL, or save-data', () => {
  assert.equal(detectTier(caps({ webgl: 0 })), 'D')
  assert.equal(detectTier(caps({ saveData: true })), 'D')
})

test('save-data wins over every capability — it is a request, not a measurement', () => {
  assert.equal(detectTier(caps({ saveData: true, webgl: 2, cores: 32, desktop: true })), 'D')
})

/*
 * The one row §15 does not name. Recorded as a test so the choice is visible
 * to whoever next compares this code against the table and cannot find it.
 */
test('desktop + WebGL2 + 3 cores lands on B — the row §15 leaves unnamed', () => {
  assert.equal(detectTier(caps({ cores: 3 })), 'B')
})

test('every capability combination resolves to exactly one real tier', () => {
  for (const webgl of [0, 1, 2] as const) {
    for (const cores of [0, 1, 2, 3, 4, 16]) {
      for (const saveData of [true, false]) {
        for (const desktop of [true, false]) {
          const tier = detectTier({ webgl, cores, saveData, desktop })
          assert.ok(TIERS.includes(tier), `${webgl}/${cores}/${saveData}/${desktop} gave ${tier}`)
        }
      }
    }
  }
})

test('?tier= forces any tier, case-insensitively', () => {
  for (const tier of TIERS) {
    assert.equal(parseTierOverride(`?tier=${tier}`), tier)
    assert.equal(parseTierOverride(`?tier=${tier.toLowerCase()}`), tier)
  }
  assert.equal(parseTierOverride('?foo=1&tier=C&bar=2'), 'C')
})

test('an unrecognised ?tier falls through to detection rather than pinning a tier', () => {
  assert.equal(parseTierOverride('?tier=E'), null)
  assert.equal(parseTierOverride('?tier='), null)
  assert.equal(parseTierOverride('?tier=AA'), null)
  assert.equal(parseTierOverride(''), null)
  assert.equal(parseTierOverride('?other=A'), null)
})

test('isRenderTier rejects anything not on the ladder', () => {
  assert.equal(isRenderTier('A'), true)
  assert.equal(isRenderTier('E'), false)
  assert.equal(isRenderTier('a'), false, 'the guard is exact; parseTierOverride uppercases first')
  assert.equal(isRenderTier(null), false)
  assert.equal(isRenderTier(2), false)
})

test('the pre-detection tier is the floor, not the ceiling', () => {
  const tier: RenderTier = INITIAL_TIER
  assert.equal(tier, 'D', 'upgrading after paint adds atmosphere; downgrading would have shown the expensive thing first on the weakest device')
})
