/*
 * The share card — §6.3a and §6.3b applied to the one surface that travels
 * without the site around it.
 *
 * *Stub check* — a renderer returning an empty `<svg/>` fails the element
 * counts, which run before every grammar assertion. That ordering is the whole
 * point here: *"no app name on the card"* and *"no completeness meter on the
 * card"* are both satisfied perfectly by a card with nothing on it, which is
 * §0.3 with the picture as the missing thing.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { buildPlan } from '../lib/builder/build-plan.ts'
import { planDate, type Plan } from '../lib/plan/model.ts'
import {
  bandStackBottom,
  CARD_PALETTE,
  CARD_HEIGHT,
  CARD_WIDTH,
  FOOTER_TOP,
  metadataRows,
  shareCardSvg,
  wrap,
} from '../lib/share/card.ts'

const TODAY = planDate(2026, 4, 1) // 1 May 2026 — month is 0-indexed (pinned).
const URL = 'resetbaseline.com'

function examplePlan(text = 'finish my thesis by May 20, weekdays'): Plan {
  const plan = buildPlan({
    text,
    window: { startMinute: 9 * 60, endMinute: 10 * 60 + 30 },
    appCount: 3,
    today: TODAY,
  })
  assert.ok(plan, 'the fixture must build, or every assertion below runs on nothing')
  return plan
}

/* ── Counts first ────────────────────────────────────────────────────────── */

test('the card draws a frame, a goal, metadata and marks — counted before checked', () => {
  const svg = shareCardSvg(examplePlan(), URL)

  assert.match(svg, new RegExp(`width="${CARD_WIDTH}" height="${CARD_HEIGHT}"`))

  const texts = svg.match(/<text/g) ?? []
  assert.ok(texts.length >= 4, `only ${texts.length} text elements — the card is nearly empty`)

  const rects = svg.match(/<rect/g) ?? []
  assert.ok(rects.length >= 10, `only ${rects.length} rects — no band or no marks were drawn`)

  assert.ok(metadataRows(examplePlan()).length >= 2, 'a card with no metadata rows proves nothing')
})

/* ── §6.3b, the band grammar ─────────────────────────────────────────────── */

test('the band bleeds off both frame edges', () => {
  const svg = shareCardSvg(examplePlan(), URL)
  const bleeding = [...svg.matchAll(/<rect x="(-\d+)" y="\d+" width="(\d+)"/g)]

  assert.ok(bleeding.length > 0, 'no rect starts left of the frame — nothing bleeds')
  for (const [, x, width] of bleeding) {
    assert.ok(Number(x) < 0, 'the band must start left of 0')
    assert.ok(
      Number(x) + Number(width) > CARD_WIDTH,
      'and end right of the frame. A band contained by the card reads as a bar, ' +
        'which is the shape §6.3b exists to keep it out of.',
    )
  }
})

test('a dark mark is the same mark, unlit — never crossed, never rust', () => {
  /*
   * The rule §6.3b calls a MUST because it is §4 rendered in pixels: a dark
   * mark styled as a gap regresses "no completeness meters" while the copy
   * still reads correctly, and on a card the copy is not even present.
   */
  const svg = shareCardSvg(examplePlan(), URL)

  const marks = [...svg.matchAll(/<rect class="mark"[^>]*fill="([^"]+)"[^>]*\/>/g)].map((m) => m[0])
  assert.ok(marks.length >= 8, `only ${marks.length} marks — too few to contain both states`)

  const fillOf = (rect: string) => rect.match(/fill="([^"]+)"/)?.[1]
  const fills = new Set(marks.map(fillOf))
  const lit = marks.filter((m) => fillOf(m) === '#c9c0ff')
  const dark = marks.filter((m) => fillOf(m) !== '#c9c0ff')

  assert.ok(lit.length > 0, 'no lit marks')
  assert.ok(dark.length > 0, 'no dark marks — the sparse case never occurs, so this proves nothing')
  assert.ok(fills.size <= 2, 'a third mark colour is a third state, and there are two')

  // Same geometry: the only difference between the two states is light.
  const widths = new Set(marks.map((m) => m.match(/width="(\d+)"/)?.[1]))
  const heights = new Set(marks.map((m) => m.match(/height="(\d+)"/)?.[1]))
  assert.equal(widths.size, 1, 'a narrower dark mark is a gap with better manners')
  assert.equal(heights.size, 1, 'a shorter dark mark is the same')

  assert.doesNotMatch(svg, /stroke-dasharray|<line/, 'nothing is struck through')
})

test('the card contains no colour outside its declared palette', () => {
  /*
   * **Enumerates what it accepts, never what it rejects** (§0.3e). The first
   * version banned the refusal accent by its hex — which caught that one colour,
   * inherited nothing, and tripped `tests/tokens.test.mjs` by naming the token
   * it was policing, a check failing on the sentence that bans the thing.
   *
   * Asserting membership instead is the stronger claim: an unscheduled day
   * drawn in the refusal accent fails, and so does any other colour arriving in
   * this file later, including one nobody has thought of.
   */
  const svg = shareCardSvg(examplePlan(), URL)
  const used = [...svg.matchAll(/fill="([^"$]+)"/g)].map((m) => m[1] ?? '')

  assert.ok(used.length >= 10, `only ${used.length} fills — nothing to check`)
  for (const colour of new Set(used)) {
    assert.ok(
      CARD_PALETTE.includes(colour),
      `${colour} is not in CARD_PALETTE. The card renders the site's tokens ` +
        'and nothing else; a colour arriving here arrived by accident.',
    )
  }
})

test('lavender is light, never fill', () => {
  const svg = shareCardSvg(examplePlan(), URL)
  const lavenderRects = [...svg.matchAll(/<rect[^>]*fill="#c9c0ff"[^>]*\/>/g)].map((m) => m[0])

  assert.ok(lavenderRects.length > 0, 'positive control: lavender appears at all')
  for (const rect of lavenderRects) {
    const height = Number(rect.match(/height="(\d+)"/)?.[1] ?? 0)
    const width = Number(rect.match(/width="(-?\d+)"/)?.[1] ?? 0)
    assert.ok(
      height <= 1 || width <= 3,
      `lavender fills a ${width}×${height} area. It is a lit line on a boundary ` +
        'or a mark, and nothing else (§6.3b).',
    )
  }
})

/* ── §6.3a, and the completeness ban ─────────────────────────────────────── */

test('the card never names an app', () => {
  const svg = shareCardSvg(examplePlan(), URL)

  assert.match(svg, /3 apps/, 'positive control: a gate rendered, so the next assertion is not vacuous')
  for (const name of ['Instagram', 'TikTok', 'Twitter', 'YouTube', 'Reddit', 'Snapchat']) {
    assert.doesNotMatch(svg, new RegExp(name, 'i'), `${name} appears on the card (§6.3a is a MUST)`)
  }
})

test('the card carries no ordinal, total or percentage', () => {
  const svg = shareCardSvg(examplePlan(), URL)
  const textContent = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1] ?? '').join(' | ')

  assert.ok(textContent.length > 20, `only "${textContent}" — nothing to check`)
  assert.doesNotMatch(textContent, /\b\d+\s*(of|\/)\s*\d+\b/, 'an ordinal out of a total is a completeness meter')
  assert.doesNotMatch(textContent, /%/, 'no percentages')
  assert.doesNotMatch(textContent, /\b(streak|progress|complete|remaining|left)\b/i)
})

/* ── The goal is the visitor's own words ─────────────────────────────────── */

test('the quoted goal is the visitor\'s, escaped, and never cut mid-word', () => {
  const plan = examplePlan()
  const svg = shareCardSvg({ ...plan, title: 'finish my thesis' }, URL)
  assert.match(svg, /finish my thesis/)

  const hostile = shareCardSvg({ ...plan, title: 'me & <script>alert("x")</script>' }, URL)
  assert.doesNotMatch(hostile, /<script>/, 'markup in a goal must not become markup in the card')
  assert.match(hostile, /&amp;/)

  const long = wrap('a '.repeat(200).trim(), 30, 3)
  assert.equal(long.length, 3, 'capped at three lines')
  assert.match(long[2] ?? '', /…$/, 'and truncation is visible')
  assert.ok(long.every((l) => l.length <= 31), 'no line overruns')
  assert.doesNotMatch(long.join(' '), /\ba$\s/, 'never cut mid-word')
})

test('a plan with no protection still renders, and a sparse plan still shows dark marks', () => {
  const sparse = buildPlan({
    text: 'run on Mondays until May 30',
    window: { startMinute: 6 * 60, endMinute: 7 * 60 + 30 },
    today: TODAY,
  })
  assert.ok(sparse)

  const svg = shareCardSvg(sparse, URL)
  const marks = [...svg.matchAll(/<rect class="mark"[^>]*fill="([^"]+)"/g)]
  const dark = marks.filter((m) => m[1] !== '#c9c0ff')
  assert.ok(
    dark.length > marks.length / 2,
    'a weekly plan over a month is mostly dark — the sparse case §12.4a requires',
  )
})

/* ── The layout stops ────────────────────────────────────────────────────── */

test('the band stack clears the footer at every band count', () => {
  /*
   * **The assertion two real defects would have failed.** A metadata row landed
   * inside the window band, and the protection band landed under the URL. Both
   * were legible markup, both passed every grammar rule, and both were found by
   * looking at the rendered picture rather than by any check. Geometry that the
   * card computes is geometry a test can check; this is the part of "does it
   * look right" that is not a `VIS` verdict.
   */
  for (const count of [0, 1, 2]) {
    assert.ok(
      bandStackBottom(count) <= FOOTER_TOP - 16,
      `with ${count} band(s) the stack ends at ${bandStackBottom(count)}, ` +
        `against a footer at ${FOOTER_TOP}. The URL would sit on a band.`,
    )
  }
  assert.ok(bandStackBottom(2) > bandStackBottom(1), 'positive control: bands take space')
})

test('metadata rows never reach the band', () => {
  const rows = metadataRows(examplePlan())
  assert.ok(rows.length >= 2, 'nothing to collide')

  const svg = shareCardSvg(examplePlan(), URL)
  const rowYs = [...svg.matchAll(/<text x="96" y="(\d+)"[^>]*font-size="15"/g)]
    .map((m) => Number(m[1]))
    .filter((y) => y > 200 && y < FOOTER_TOP - 40)

  assert.ok(rowYs.length >= 2, `only ${rowYs.length} metadata rows located`)
  const bandTop = bandStackBottom(0)
  for (const y of rowYs) {
    assert.ok(y < bandTop, `a metadata row sits at ${y}, inside a band starting at ${bandTop}`)
  }
})
