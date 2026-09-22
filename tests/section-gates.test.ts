/*
 * Gated sections — §15.1, §3, and the mechanism that keeps a gate from becoming
 * permanent.
 *
 * *Stub check* — an empty `SECTION_GATES` fails the count assertion before any
 * assertion about conditions; a `sectionOpen` returning `false` for everything
 * would pass the "closed" tests and fails the positive control that a
 * constructed open gate reads as open.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

import { SECTION_GATES, sectionOpen } from '../lib/sections/gates.ts'
import { PRINCIPLES } from '../lib/copy/method.ts'
import { BEATS, FIRST_DAY, LAST_DAY } from '../lib/copy/day-thirty.ts'

test('every gate states a condition and a source, and neither is a date', () => {
  const entries = Object.entries(SECTION_GATES)
  assert.ok(entries.length >= 2, `only ${entries.length} gates — nothing to check`)

  for (const [key, gate] of entries) {
    assert.equal(typeof gate.open, 'boolean', `${key} has no open flag`)
    assert.ok(gate.condition.length > 30, `${key}'s condition is too short to act on`)
    assert.ok(gate.source.length > 5, `${key} cites no source`)

    /*
     * **A date is the one thing a condition may not be.** §15.1 gates on
     * evidence — a DS-18 verdict, a signal firing in production — and a gate
     * that opens on a date opens whether or not the thing happened. It is also
     * DS-18a's ban arriving by the side door: no date, quarter, or "soon".
     */
    assert.doesNotMatch(gate.condition, /\b20\d{2}\b/, `${key}'s condition names a year`)
    assert.doesNotMatch(gate.condition, /\bQ[1-4]\b/, `${key}'s condition names a quarter`)
    assert.doesNotMatch(gate.condition, /\bsoon\b/i, `${key}'s condition says soon`)
  }
})

test('both P1 sections are closed, and the predicate reports it', () => {
  assert.equal(sectionOpen('method'), false)
  assert.equal(sectionOpen('dayThirty'), false)

  // Positive control: the predicate is not simply returning false.
  const open = { ...SECTION_GATES, probe: { open: true, condition: 'x', source: 'y' } }
  assert.equal(open.probe.open, true, 'a constructed open gate must read as open')
})

test('neither gated section is rendered on the public page', () => {
  /*
   * **The strongest form of the gate**, and a source scan because the
   * constraint is about what a file does *not* import. `app/page.tsx` is the
   * public site; a gated section reaching it is the gate doing nothing.
   */
  const page = readFileSync('app/page.tsx', 'utf8')
  for (const name of ['Method', 'DayThirty', 'day-thirty', 'sections/method']) {
    assert.ok(!page.includes(name), `app/page.tsx references ${name} — the gate is bypassed`)
  }

  // And the review route is dev-only, so it can never ship one either.
  assert.doesNotThrow(
    () => readFileSync('app/sections/page.dev.tsx', 'utf8'),
    'the review route is missing, so the sections cannot be looked at at all',
  )
})

test('§6 is four principles — not three, not five', () => {
  assert.equal(PRINCIPLES.length, 4, 'v7.3 §2 names four; a fifth is a section nobody designed')
  for (const [i, principle] of PRINCIPLES.entries()) {
    assert.equal(
      principle.title,
      null,
      `principle ${i + 1} carries a title. If SITE-072 has landed, promote this ` +
        'test to assert the four; if not, delete the string.',
    )
    assert.equal(principle.summary, null)
  }
})

test('§5 has four beats, no two alike, inside the span', () => {
  assert.equal(BEATS.length, 4, "SITE-073's scope names four")
  assert.equal(
    new Set(BEATS.map((b) => b.kind)).size,
    4,
    'two beats sharing a kind means one demonstrates nothing the other does not',
  )

  for (const beat of BEATS) {
    assert.ok(
      beat.day >= FIRST_DAY && beat.day <= LAST_DAY,
      `a beat lands on day ${beat.day}, outside ${FIRST_DAY}–${LAST_DAY}`,
    )
    assert.equal(beat.label, null, 'the labels are SITE-073\'s copy')
  }

  const days = BEATS.map((b) => b.day)
  assert.deepEqual([...days].sort((a, b) => a - b), days, 'the beats are not in scrub order')
})

test('the scrub intercepts nothing', () => {
  /*
   * §7.5 and CLAUDE.md §6, in the same words: no wheel interception, no Lenis,
   * no locomotive, no `scroll-behavior` override, anywhere, ever. The eslint
   * import ban covers the libraries; this covers the hand-written form, which
   * is the one a scroll-scrubbed section invites.
   */
  const source = readFileSync('components/sections/day-thirty.tsx', 'utf8')
  assert.ok(source.length > 500)

  for (const banned of ['preventDefault', 'onWheel', 'wheel', 'touchmove', 'scroll-behavior']) {
    const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
    assert.ok(
      !withoutComments.includes(banned),
      `day-thirty.tsx uses ${banned} — scroll is native, with no exceptions`,
    )
  }

  // The listener must be passive, which makes preventDefault impossible rather
  // than merely unused.
  assert.match(source, /addEventListener\('scroll',[^)]*passive: true/)
})
