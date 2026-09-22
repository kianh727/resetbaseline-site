/*
 * SITE-024 · The settling spring.
 *
 * *Accept* is "spring config matches §8.1 exactly; lint fails if imported
 * outside the allowlist." Both are asserted here, and the first is asserted
 * against **v5 §8.1's numbers written out** rather than against the constant the
 * implementation exports — comparing the module to itself is a check that
 * derives its input from its own reference and cannot fail (PRD §0.3b).
 *
 * The curve is asserted on `settleProgress()` directly rather than by observing
 * an animation. A test that could only watch a browser play it would be
 * asserting the browser; the overshoot is a property of these numbers.
 *
 * @implements SITE-EVAL-017
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'

import {
  SETTLE_SPRING,
  SETTLE_FROM,
  settleProgress,
  settleKeyframes,
} from '../lib/motion/settle.ts'

/* ------------------------------------------------------------------ *
 * The config.
 * ------------------------------------------------------------------ */

test('the spring is v5 §8.1 exactly', () => {
  // Transcribed from v5 §8.1, which PRD v7.3 §11 carries forward unchanged:
  //   spring: { stiffness: 260, damping: 24, mass: 0.9 }
  assert.deepEqual({ ...SETTLE_SPRING }, { stiffness: 260, damping: 24, mass: 0.9 })
})

test('the from-state is v5 §8.1 exactly', () => {
  //   from: { opacity: 0, scale: 0.94, y: 8 }
  assert.deepEqual({ ...SETTLE_FROM }, { opacity: 0, scale: 0.94, y: 8 })
})

/* ------------------------------------------------------------------ *
 * The curve.
 * ------------------------------------------------------------------ */

test('the settle overshoots — the signature, not a side effect', () => {
  // ζ = damping / (2·√(stiffness·mass)) = 24 / (2·√234) ≈ 0.78. Underdamped, so
  // it passes its target and comes back. A cubic-bezier fitted to the same
  // duration would look close and never do this, which is the one property
  // worth keeping: it is what makes structure read as landing rather than as
  // arriving.
  const p = settleProgress()
  assert.ok(Math.max(...p) > 1, 'the spring must pass 1 before settling')
})

test('it starts at rest and ends at rest', () => {
  const p = settleProgress()
  assert.equal(p[0], 0)
  assert.equal(p[p.length - 1], 1)
})

test('the overshoot is a settle, not a bounce — it crosses the target once', () => {
  // More than one crossing would read as a wobble. This is the difference
  // between "it landed" and "it is springy", and only the first is the product.
  const p = settleProgress()
  let crossings = 0
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i - 1]
    const b = p[i]
    if (a === undefined || b === undefined) continue
    if (a < 1 && b >= 1) crossings++
  }
  assert.equal(crossings, 1)
})

test('the duration is derived from the spring, not chosen', () => {
  const { durationMs } = settleKeyframes()
  // Not asserted against a literal the implementation also uses — asserted as a
  // range that a 260/24/0.9 spring must land in. A duration outside it means
  // the constants moved, which is what this is for.
  assert.ok(durationMs > 300 && durationMs < 1200, `settle ran ${durationMs}ms`)
})

test('keyframes interpolate §8.1’s from-state to rest, with opacity clamped', () => {
  const { frames } = settleKeyframes()
  const first = frames[0]
  const last = frames[frames.length - 1]
  assert.ok(first && last)
  assert.equal(first.opacity, 0)
  assert.equal(first.scale, 0.94)
  assert.equal(first.y, 8)
  assert.equal(last.opacity, 1)
  assert.equal(last.scale, 1)
  assert.equal(last.y, 0)
  assert.ok(
    frames.every((f) => f.opacity <= 1),
    'opacity must never exceed 1 — an overshoot past 1 is not a visible state',
  )
  assert.ok(
    frames.some((f) => f.scale > 1),
    'scale must carry the overshoot — that is where the eye reads it',
  )
})

test('offsets are monotonic and span the whole animation', () => {
  const { frames } = settleKeyframes()
  assert.equal(frames[0]?.t, 0)
  assert.equal(frames[frames.length - 1]?.t, 1)
  for (let i = 1; i < frames.length; i++) {
    assert.ok((frames[i]?.t ?? 0) > (frames[i - 1]?.t ?? 0))
  }
})

/* ------------------------------------------------------------------ *
 * The import ban, proven by running the linter.
 * ------------------------------------------------------------------ */

/**
 * The accept criterion is *"lint fails if imported outside the allowlist"*, and
 * the only assertion that means anything is one that **runs the linter**.
 * Reading the config and checking it mentions the path would assert the config
 * against itself.
 *
 * The probe is written outside the allowlist, linted, and removed.
 */
test('importing the spring outside the allowlist fails lint', () => {
  const probe = 'components/settle-probe.tsx'
  writeFileSync(
    probe,
    "import { settle } from '@/lib/motion/settle'\nexport const x = settle\n",
    'utf8',
  )
  try {
    let failed = false
    let output = ''
    try {
      execFileSync('npx', ['eslint', probe], { encoding: 'utf8', stdio: 'pipe' })
    } catch (e) {
      failed = true
      const err = e as { stdout?: string; stderr?: string }
      output = `${err.stdout ?? ''}${err.stderr ?? ''}`
    }
    assert.ok(failed, 'eslint should have exited non-zero for the probe')
    assert.match(output, /settling spring|SITE-024/i)
  } finally {
    rmSync(probe, { force: true })
  }
})

test('the allowlist is real paths, not a wildcard that allows everything', () => {
  // A second source: the config is read as text, but what is asserted is a
  // property the config cannot satisfy by accident — that the allowed globs do
  // not include a bare `**` for every file type.
  const config = readFileSync('eslint.config.mjs', 'utf8')
  const block = config.slice(config.indexOf('SETTLE_ALLOWLIST'))
  assert.ok(block.length > 0, 'the allowlist should be a named constant')
  assert.doesNotMatch(block.slice(0, 400), /'\*\*\/\*'/)
})
