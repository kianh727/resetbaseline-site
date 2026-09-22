/*
 * SITE-026's other half · timer and tracker have no mountain presence.
 *
 * **Ruled 2026-09-21 (Kian), provisional:** a timer and a tracker get no band
 * and **no mountain presence at all** — they render as objects in the
 * transformation block and the plan list only. *"The mountain carries
 * recurring windows and protection and nothing else — a timer or tracker
 * appearing on it would be the grammar degrading into ambient decoration."*
 *
 * *Stub check* — a stub `bandsFor()` returning `[]` fails the positive control
 * at the bottom, which asserts a commitment with a window **does** produce a
 * band and a gate **does** produce protection. Without that control every
 * assertion here is satisfied by a renderer that draws nothing, which is §0.3
 * with the mountain as the missing thing. A stub `descriptorFor()` returning
 * `null` fails the three descriptor cases by name.
 *
 * The two halves are asserted together on purpose: the rule is not *"timers
 * produce no band"* but *"timers produce no band **and** appear in the object
 * list"*. A build satisfying only the first has lost the object.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { planDate, type Plan, type PlanNode } from '../lib/plan/model.ts'
import { bandsFor } from '../lib/render/bands.ts'
import { compose } from '../lib/render/flat-layout.ts'
import { descriptorFor } from '../lib/render/object-list.ts'

/*
 * Capability and tier are opaque strings until SITE-004 (§6.2). These
 * fixtures use values that are deliberately **not** contract vocabulary, so
 * the suite cannot quietly become a place the five real values are written
 * down — and so that nothing here depends on what a capability is called.
 * What distinguishes a timer from a commitment in this codebase is the shape
 * of its `detail`, which is what `bandsFor` and `descriptorFor` both read.
 */
const OPAQUE = { capability: 'cap-x', authority: 'tier-x' } as const

const timer: PlanNode = {
  id: 'n-timer',
  ...OPAQUE,
  label: 'Deep work session',
  detail: { durationMinutes: 90 },
}

const tracker: PlanNode = {
  id: 'n-tracker',
  ...OPAQUE,
  label: 'Pages written',
  detail: { subject: 'pages written', unit: 'pages' },
}

const windowed: PlanNode = {
  id: 'n-commitment',
  ...OPAQUE,
  label: 'Thesis block',
  detail: {
    occurrences: [
      {
        id: 'o-1',
        date: planDate(2026, 5, 4),
        window: { startMinute: 8 * 60, endMinute: 9 * 60 + 30 },
      },
      {
        id: 'o-2',
        date: planDate(2026, 5, 5),
        window: { startMinute: 8 * 60, endMinute: 9 * 60 + 30 },
      },
    ],
  },
}

const gate: PlanNode = {
  id: 'n-gate',
  ...OPAQUE,
  label: 'Protection',
  detail: { appCount: 3, window: { startMinute: 6 * 60, endMinute: 7 * 60 + 30 } },
}

const planOf = (...nodes: PlanNode[]): Plan => ({
  title: 'Finish the thesis',
  deadline: null,
  nodes,
})

/* ---------------------------------------------------------------- *
 * The rule.
 * ---------------------------------------------------------------- */

test('a timer produces no band', () => {
  assert.deepEqual(bandsFor(planOf(timer)), [])
})

test('a tracker produces no band', () => {
  assert.deepEqual(bandsFor(planOf(tracker)), [])
})

test('a timer and a tracker produce no mark, no geometry, nothing composed', () => {
  /*
   * "No band" is the weaker claim. The ruling is **no mountain presence at
   * all**, so the composition — which is everything the mountain draws — must
   * be empty, not merely band-free. A future change adding a thickened segment
   * or an off-route node would leave `bandsFor` untouched and fail here.
   */
  const composition = compose(planOf(timer, tracker))
  assert.equal(composition.bands.length, 0)
  assert.equal(
    composition.bands.reduce((n, g) => n + g.marks.length, 0),
    0,
  )
})

test('a timer and a tracker do not suppress a windowed object beside them', () => {
  /*
   * The failure mode on the other side: excluding them by filtering the plan
   * rather than by reading each node would take the whole plan out with them.
   */
  const composition = compose(planOf(timer, windowed, tracker, gate))
  assert.equal(composition.bands.length, 2)
  const nodeIds = composition.bands.map((g) => g.band.nodeId).sort()
  assert.deepEqual(nodeIds, ['n-commitment', 'n-gate'])
})

/* ---------------------------------------------------------------- *
 * The other half — they are still objects.
 * ---------------------------------------------------------------- */

test('a timer describes itself by duration, written out and not localised', () => {
  assert.equal(descriptorFor(timer), '1 hr 30 min')
  assert.equal(descriptorFor({ ...timer, detail: { durationMinutes: 45 } }), '45 min')
  assert.equal(descriptorFor({ ...timer, detail: { durationMinutes: 120 } }), '2 hr')
})

test('a tracker describes its subject, and its unit when it has one', () => {
  assert.equal(descriptorFor(tracker), 'pages written · pages')
  assert.equal(
    descriptorFor({ ...tracker, detail: { subject: 'mood', unit: null } }),
    'mood',
  )
})

test('a gate describes itself as a count and never as an app name (§6.3a)', () => {
  assert.equal(descriptorFor(gate), '3 apps')
})

test('an object with nothing worth restating gets no descriptor, not an invented one', () => {
  assert.equal(descriptorFor(windowed), null)
})

test('the object list names no contract value', () => {
  /*
   * §6.2. `descriptorFor` is keyed on the **shape** of a node's detail, never
   * on its capability string — which is what keeps this file out of the
   * hand-list scan's way and, more to the point, is what lets it be written at
   * all before SITE-004 lands. A version that switched on capability would
   * type-check, pass every test above, and be the thing §6.2 forbids.
   */
  const source = readFileSync('lib/render/object-list.ts', 'utf8')
  assert.equal(
    /node\.capability|\.capability\s*===|switch\s*\(\s*\w+\.capability/.test(source),
    false,
    'lib/render/object-list.ts reads a capability value. It must key on the ' +
      'detail shape instead (§6.2, derived not hand-listed).',
  )
})

/* ---------------------------------------------------------------- *
 * The positive control.
 * ---------------------------------------------------------------- */

test('a recurring window still gets a band, and a gate still gets protection', () => {
  /*
   * Without this, every assertion above is satisfied by a renderer that draws
   * nothing at all — the mountain missing entirely passes "the timer is not on
   * the mountain" perfectly.
   */
  const bands = bandsFor(planOf(windowed, gate))
  assert.equal(bands.length, 2)
  assert.deepEqual(
    bands.map((b) => b.kind),
    ['window', 'protection'],
  )
})
