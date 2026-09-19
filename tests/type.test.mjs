/*
 * SITE-003 · Type scale assertions.
 *
 * "Unit: clamp values match §14." The expected table below is an independent
 * transcription of PRD §14's Role/Size/Treatment table (v5, carried forward
 * unchanged by v7.3 §11). If globals.css drifts from §14, this fails.
 *
 * Two of §14's five rows are given as ranges rather than clamps — lead
 * 18–22px, body 16–17px. Those are asserted by their *endpoints*: whatever
 * interpolation the stylesheet chooses, evaluating it at 375px must give the
 * range minimum and at 1440px the maximum. That checks what §14 actually says
 * rather than re-stating the implementation's own formula back at itself.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const CSS = readFileSync('app/globals.css', 'utf8')

function themeValue(name) {
  const m = CSS.match(new RegExp(`(^|\\n)\\s*--${name}:\\s*([^;]+);`))
  return m ? m[2].replace(/\s+/g, ' ').trim() : undefined
}

/** §14's table, verbatim where it is exact. */
const EXACT = {
  'text-display': 'clamp(40px, 8vw, 140px)',
  'text-section': 'clamp(32px, 5vw, 88px)',
  'text-meta': '11px',
}

const TREATMENT = {
  'text-display--font-weight': '500',
  'text-display--letter-spacing': '-0.04em',
  'text-section--font-weight': '500',
  'text-section--letter-spacing': '-0.035em',
  'text-lead--font-weight': '400',
  'text-body--font-weight': '400',
  'text-meta--letter-spacing': '0.06em',
}

test('display and section-head clamps are §14 verbatim', () => {
  for (const [name, value] of Object.entries(EXACT)) {
    assert.equal(themeValue(name), value, `--${name} must be exactly ${value}`)
  }
})

test('weights and tracking match §14 Treatment', () => {
  for (const [name, value] of Object.entries(TREATMENT)) {
    assert.equal(themeValue(name), value, `--${name} must be exactly ${value}`)
  }
})

/*
 * Evaluate `clamp(min, a + b vw, max)` at a viewport width. Deliberately a
 * tiny parser rather than a CSS engine: it accepts only the two shapes the
 * stylesheet uses, so a third shape fails loudly instead of being guessed at.
 */
function evaluateClamp(expr, viewportPx) {
  const m = expr.match(/^clamp\(\s*([\d.]+)px\s*,\s*(.+?)\s*,\s*([\d.]+)px\s*\)$/)
  assert.ok(m, `not a clamp this test understands: ${expr}`)
  const [, min, middle, max] = m
  let value
  const linear = middle.match(/^([\d.]+)px\s*\+\s*([\d.]+)vw$/)
  const bare = middle.match(/^([\d.]+)vw$/)
  if (linear) value = Number(linear[1]) + (Number(linear[2]) / 100) * viewportPx
  else if (bare) value = (Number(bare[1]) / 100) * viewportPx
  else assert.fail(`not a middle term this test understands: ${middle}`)
  return Math.min(Math.max(value, Number(min)), Number(max))
}

/** §14: lead 18–22px, body 16–17px. Endpoints at the two verification widths. */
const RANGES = {
  'text-lead': { at375: 18, at1440: 22 },
  'text-body': { at375: 16, at1440: 17 },
}

test('lead and body hit §14 range endpoints at 375px and 1440px', () => {
  for (const [name, { at375, at1440 }] of Object.entries(RANGES)) {
    const expr = themeValue(name)
    assert.ok(expr, `--${name} must be declared`)
    assert.ok(
      Math.abs(evaluateClamp(expr, 375) - at375) < 0.05,
      `--${name} must be ${at375}px at 375px, got ${evaluateClamp(expr, 375)}`,
    )
    assert.ok(
      Math.abs(evaluateClamp(expr, 1440) - at1440) < 0.05,
      `--${name} must be ${at1440}px at 1440px, got ${evaluateClamp(expr, 1440)}`,
    )
  }
})

test('display type reaches §14 bounds and is clamped at both ends', () => {
  const expr = themeValue('text-display')
  assert.equal(evaluateClamp(expr, 320), 40, 'display floors at 40px on the narrowest target')
  assert.equal(evaluateClamp(expr, 3000), 140, 'display ceilings at 140px')
})

test('the body measure is §14’s 62ch', () => {
  assert.equal(themeValue('container-measure'), '62ch')
})

/*
 * §14's metadata row is three properties that travel together. The primitive
 * must carry all three, or callers will reassemble it by hand and drift.
 */
test('the metadata primitive carries size, tracking and colour', () => {
  const block = CSS.match(/@utility metadata \{([^}]*)\}/)
  assert.ok(block, 'a `metadata` utility must exist')
  const body = block[1]
  assert.match(body, /font-size:\s*var\(--text-meta\)/)
  assert.match(body, /letter-spacing:\s*var\(--text-meta--letter-spacing\)/)
  assert.match(body, /color:\s*var\(--color-bone-38\)/)
})

/*
 * The typeface is undecided (§14, §23 item 3). Nothing outside the comparison
 * harness may name a candidate family — a stray `font-family: Satoshi` in a
 * component is the decision being made by accident, which is exactly what
 * this issue exists to prevent.
 */
/**
 * Comments are stripped first, deliberately. Prose that *names* the open
 * decision is how the codebase documents it — globals.css says which two
 * faces the seam is waiting on, and that sentence is the opposite of the
 * defect. What this test is looking for is a candidate applied: a
 * `font-family`, an `@font-face`, a `src` pointing at one of the files.
 */
function declarations(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

test('no candidate typeface is applied outside the comparison harness', () => {
  const offenders = []
  for (const file of [
    'app/globals.css',
    'app/layout.tsx',
    'app/page.tsx',
    'app/tokens/page.dev.tsx',
    'app/type/font-presence.tsx',
  ]) {
    if (/Neue Montreal|Satoshi/.test(declarations(readFileSync(file, 'utf8')))) offenders.push(file)
  }
  assert.deepEqual(offenders, [], 'the candidate faces belong to /type until the decision lands')
})
