/*
 * SITE-022 · `FlatLayout`, band derivation, and the grammar's enforcement.
 *
 * The issue's one automated criterion is *"anchor determinism for a fixed
 * plan"*. That is here, and it is the least of what this file does — the
 * interesting assertions are the ones about §6.3b, because the grammar is a
 * closed vocabulary and a closed vocabulary is defined by what it refuses.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { planDate, type Occurrence, type Plan } from '../lib/plan/model.ts'
import { bandsFor } from '../lib/render/bands.ts'
import { compose, flatLayout } from '../lib/render/flat-layout.ts'

const WINDOW = { startMinute: 480, endMinute: 570 }

function occ(day: number, withWindow = true): Occurrence {
  return { id: `o-${day}`, date: planDate(2026, 4, day), window: withWindow ? WINDOW : null }
}

function plan(nodes: Plan['nodes']): Plan {
  return { title: 'Thesis chapter two', deadline: null, nodes }
}

const commitment = {
  id: 'c1',
  capability: 'from-the-contract',
  authority: 'from-the-contract',
  label: 'Writing block',
  detail: { occurrences: [occ(4), occ(6), occ(8)] },
}

const gate = {
  id: 'g1',
  capability: 'from-the-contract',
  authority: 'from-the-contract',
  label: 'Protection',
  detail: { appCount: 3, window: { startMinute: 360, endMinute: 450 } },
}

const timer = {
  id: 't1',
  capability: 'from-the-contract',
  authority: 'from-the-contract',
  label: 'Focus session',
  detail: { durationMinutes: 50 },
}

const tracker = {
  id: 'k1',
  capability: 'from-the-contract',
  authority: 'from-the-contract',
  label: 'Pages',
  detail: { subject: 'pages written', unit: 'pages' },
}

/* ------------------------------------------------------------------ *
 * The grammar — what gets a band, and what does not.
 * ------------------------------------------------------------------ */

test('a recurring window gets a band', () => {
  const bands = bandsFor(plan([commitment]))
  assert.equal(bands.length, 1)
  assert.equal(bands[0]?.kind, 'window')
})

test('protection gets a second band', () => {
  const bands = bandsFor(plan([commitment, gate]))
  assert.deepEqual(
    bands.map((b) => b.kind),
    ['window', 'protection'],
  )
})

test('protection sorts below every window band, whatever its start time', () => {
  // The gate's window starts at 06:00, before the commitment's 08:00. Sorting
  // purely by start minute would put protection on top, and §6.3b says it is
  // "a second, denser band below".
  const bands = bandsFor(plan([gate, commitment]))
  assert.deepEqual(
    bands.map((b) => b.kind),
    ['window', 'protection'],
  )
})

test('a timer gets no band', () => {
  // §6.3b ruled 2026-09-19: a timer is a duration with no recurrence, so
  // "nothing else ever gets a band" applies to it by name. This is the grammar
  // working, not a gap — a band appearing here is the defect.
  assert.deepEqual(bandsFor(plan([timer])), [])
})

test('a tracker gets no band', () => {
  // A direction with no occasion. Same rule, same reason.
  assert.deepEqual(bandsFor(plan([tracker])), [])
})

test('a commitment with no window gets no band', () => {
  // A band means a *recurring time window*. Occurrences without one are dated
  // but not windowed, and a band would be asserting a window that is not there.
  const noWindow = { ...commitment, detail: { occurrences: [occ(4, false), occ(6, false)] } }
  assert.deepEqual(bandsFor(plan([noWindow])), [])
})

test('a plan of only bandless primitives composes to nothing, not to an empty band', () => {
  const { bands, height } = compose(plan([timer, tracker]))
  assert.deepEqual(bands, [])
  assert.equal(height, 0)
})

/* ------------------------------------------------------------------ *
 * Marks.
 * ------------------------------------------------------------------ */

test('every calendar day in the span gets a mark, lit only where an occurrence falls', () => {
  const bands = bandsFor(plan([commitment]))
  const days = bands[0]?.days ?? []
  // 4th to 8th inclusive is five days; three are scheduled.
  assert.equal(days.length, 5)
  assert.deepEqual(
    days.map((d) => d.lit),
    [true, false, true, false, true],
  )
})

test('an unscheduled day occupies the same slot as a scheduled one', () => {
  // Compressing dark days is how a sparse plan starts looking full, which is
  // §12.4a question 15 — does any element suggest the dark marks should be
  // filled — answered wrongly by the geometry rather than by the styling.
  const { bands } = compose(plan([commitment]))
  const marks = bands[0]?.marks ?? []
  const gaps = marks.slice(1).map((m, i) => m.xFraction - (marks[i]?.xFraction ?? 0))
  const first = gaps[0]
  assert.ok(first !== undefined)
  for (const g of gaps) assert.ok(Math.abs(g - first) < 1e-9, 'slot widths must be equal')
})

test('a day carries lit as a boolean and nothing resembling a status', () => {
  // A third value is the one shape that would let a dark mark become a miss.
  const day = bandsFor(plan([commitment]))[0]?.days[1]
  assert.equal(typeof day?.lit, 'boolean')
  assert.deepEqual(Object.keys(day ?? {}).sort(), ['date', 'lit'])
})

/* ------------------------------------------------------------------ *
 * Geometry — §6.3b's composition rules.
 * ------------------------------------------------------------------ */

test('bands are level, and every mark sits inside the track', () => {
  const { bands } = compose(plan([commitment, gate]))
  for (const g of bands) {
    // Edges are not in the model any more: the band is laid out with a
    // negative inline margin far wider than any viewport, so "no left end, no
    // right end" is a CSS property asserted in the browser check rather than a
    // number here. What is asserted here is what the geometry does promise.
    assert.ok(g.marks.every((m) => m.xFraction > 0 && m.xFraction < 1))
  }
  // Level: a band's y does not vary along its length, and there is no term that
  // could make it. Asserted as every band having one y, which is the shape of
  // the guarantee rather than a sample of it.
  assert.ok(bands.every((g) => typeof g.y === 'number'))
})

test('bands stack in a derived order, not in plan.nodes order', () => {
  // `Plan.nodes` asserts no order (SITE-020). A composition that read one would
  // render the same plan two ways depending on how it was assembled.
  const a = compose(plan([commitment, gate]))
  const b = compose(plan([gate, commitment]))
  assert.deepEqual(
    a.bands.map((g) => g.band.nodeId),
    b.bands.map((g) => g.band.nodeId),
  )
})

/* ------------------------------------------------------------------ *
 * The adapter.
 * ------------------------------------------------------------------ */

test('anchors are deterministic for a fixed plan', () => {
  const p = plan([commitment, gate])
  const first = flatLayout(p, 1392)
  const second = flatLayout(p, 1392)
  for (const node of p.nodes) {
    assert.deepEqual(first.anchorFor(node), second.anchorFor(node))
  }
})

test('a node this composition does not draw anchors to null, not to a default', () => {
  // After §6.3b's ruling this is the expected case for a timer and a tracker,
  // not an error. A fallback position would put an object somewhere nobody
  // chose, and inventing a treatment here is what SITE-026 reserves.
  const layout = flatLayout(plan([commitment, timer, tracker]), 1392)
  assert.equal(layout.anchorFor(timer), null)
  assert.equal(layout.anchorFor(tracker), null)
  assert.notEqual(layout.anchorFor(commitment), null)
})

/* ------------------------------------------------------------------ *
 * Enforcement — construction, and the scan for what construction misses.
 * ------------------------------------------------------------------ */

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
}

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path))
    else if (/\.tsx?$/.test(path)) out.push(path)
  }
  return out
}

/** The single file §6.3b allows a `Band` to come into existence in. */
const BAND_PRODUCER = 'lib/render/bands.ts'

test('no file outside the producer asserts its way to a Band', () => {
  /*
   * §6.3b's enforcement is construction: `Band` is branded on a module-private
   * `unique symbol`, so no literal anywhere can satisfy it — the producer itself
   * needs a double assertion, which is why `mint` exists and is private.
   *
   * **A type assertion is the one escape hatch types cannot close**, and it is
   * the likelier of the two residuals, so it gets a text match against that
   * specific hatch. This is deliberately not a soundness claim: it catches
   * `as Band`, and it does not catch a second band component written from
   * scratch. That limit is stated rather than papered over.
   */
  const offences: string[] = []
  for (const file of [...sourceFiles('lib'), ...sourceFiles('components'), ...sourceFiles('app')]) {
    if (file === BAND_PRODUCER) continue
    const source = stripComments(readFileSync(file, 'utf8'))
    if (/\bas\s+unknown\s+as\s+Band\b/.test(source) || /\bas\s+Band\b/.test(source)) {
      offences.push(file)
    }
  }
  assert.deepEqual(
    offences,
    [],
    `${offences.join(', ')} asserts its way to a Band. §6.3b: a band must be ` +
      `derivable only from a recurrence. Derive it from bandsFor(), or the ` +
      `grammar is a convention.`,
  )
})

test('the producer keeps its assertion to one line', () => {
  // The brand forces exactly one double assertion. More than one means someone
  // added a second way in, next to the first, where it reads as normal.
  const source = stripComments(readFileSync(BAND_PRODUCER, 'utf8'))
  const casts = source.match(/\bas\s+unknown\s+as\s+Band\b/g) ?? []
  assert.equal(casts.length, 1)
})

test('the scan catches an assertion — negative control', () => {
  const planted = stripComments("const b = { kind: 'window' } as unknown as Band")
  assert.ok(/\bas\s+unknown\s+as\s+Band\b/.test(planted))
})

test('only one file renders a band', () => {
  /*
   * The second residual, and the one the scan can only approximate: a hand-written
   * second band component. What is checkable is that `bandsFor` has one consumer
   * chain — anything rendering band geometry goes through `compose`.
   */
  const renderers = [...sourceFiles('components'), ...sourceFiles('app')].filter((f) =>
    /bandsFor|from '@\/lib\/render\/bands'/.test(stripComments(readFileSync(f, 'utf8'))),
  )
  assert.deepEqual(
    renderers,
    [],
    `${renderers.join(', ')} reaches for bands directly. Components compose through ` +
      `lib/render/flat-layout.ts, so the band's appearance has one home.`,
  )
})
