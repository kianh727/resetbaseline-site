/*
 * SITE-021 · The `PlanLayout` interface.
 *
 * *Tests* is "a stub adapter satisfies the interface", and on its own that
 * passes against almost anything — an empty interface is satisfied by every
 * object there is. So the stub is only the first assertion. The rest are about
 * the property the interface exists for: **swapping adapters changes zero
 * builder code** (PRD §6, SITE-EVAL-063), which holds only while the seam runs
 * one way and the model stays ignorant of it.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import type { Anchor, PlanLayout } from '../lib/plan/layout.ts'
import { planDate, type Plan, type PlanNode } from '../lib/plan/model.ts'

/**
 * A stub adapter. Deliberately the least interesting one that can exist: it
 * places nodes along a single axis by their order in the plan, which is not a
 * composition anybody would ship and is not meant to be. SITE-021's non-goal is
 * "no concrete adapters"; this proves the interface is satisfiable.
 */
function stubLayout(plan: Plan): PlanLayout {
  const order = new Map(plan.nodes.map((node, i) => [node.id, i]))
  return {
    anchorFor(node: PlanNode): Anchor | null {
      const i = order.get(node.id)
      return i === undefined ? null : { x: i * 10, y: 0 }
    },
  }
}

const node: PlanNode = {
  id: 'n1',
  capability: 'from-the-contract',
  authority: 'from-the-contract',
  label: 'Thesis block',
  detail: { occurrences: [{ id: 'o1', date: planDate(2026, 4, 1), window: null }] },
}

const plan: Plan = { title: 'Finish the thesis', deadline: null, nodes: [node] }

test('a stub adapter satisfies PlanLayout and places a node it holds', () => {
  const layout: PlanLayout = stubLayout(plan)
  assert.deepEqual(layout.anchorFor(node), { x: 0, y: 0 })
})

test('a node the layout does not place returns null rather than a default position', () => {
  const layout = stubLayout(plan)
  const stranger: PlanNode = { ...node, id: 'elsewhere' }
  assert.equal(layout.anchorFor(stranger), null)
})

test('anchoring does not mutate the node, so a node carries no position', () => {
  const layout = stubLayout(plan)
  const before = JSON.stringify(node)
  layout.anchorFor(node)
  assert.equal(JSON.stringify(node), before)
  assert.equal(Object.hasOwn(node, 'x'), false)
  assert.equal(Object.hasOwn(node, 'y'), false)
})

test('two adapters answer differently about the same unchanged node', () => {
  // The seam's whole claim: the plan is one thing, the placement is the
  // adapter's opinion about it. If the node carried its position, this test
  // could not be written.
  const a = stubLayout(plan)
  const b: PlanLayout = { anchorFor: () => ({ x: 999, y: 999 }) }
  assert.notDeepEqual(a.anchorFor(node), b.anchorFor(node))
  assert.deepEqual(a.anchorFor(node), { x: 0, y: 0 })
})

test('the dependency runs one way — the model never imports the layout', () => {
  // The direction is what makes the invariant hold, and it is broken by a
  // single import that type-checks fine. Asserted on the source rather than
  // inferred, because nothing else fails when it goes wrong.
  const model = readFileSync('lib/plan/model.ts', 'utf8')
  assert.equal(
    /from\s+['"][^'"]*layout/.test(model),
    false,
    'lib/plan/model.ts imports the layout. SITE-020: the model must not know a layout exists.',
  )

  const layout = readFileSync('lib/plan/layout.ts', 'utf8')
  assert.equal(
    /from\s+['"]\.\/model\.ts['"]/.test(layout),
    true,
    'lib/plan/layout.ts should import the model it lays out.',
  )
})
