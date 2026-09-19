/*
 * SITE-021 · The `PlanLayout` interface.
 *
 * PRD §6: layout is an adapter behind `PlanLayout`, and **swapping adapters
 * changes zero builder code** (SITE-EVAL-063, which fails on any builder branch
 * on layout type and on any duplicated plan model).
 *
 * The interface is the seam that makes that true, so it is deliberately the
 * smallest thing that can be one. Everything a renderer needs beyond a position
 * — strokes, bands, segments, cameras, frames — belongs to the adapter, and
 * anything hoisted up here becomes a thing every adapter must have an opinion
 * about. `FlatLayout` (SITE-022) and `ProjectedPeakLayout` (SITE-068) share
 * nothing but this.
 *
 * **The direction of the dependency is the whole point.** This file imports the
 * model; the model imports nothing from here and does not know a layout exists
 * (SITE-020's non-goal). A `PlanNode` handed to `anchorFor` carries no position
 * before the call and gains none after it — the anchor is the adapter's answer
 * about that node, not a property of the node.
 *
 * *Non-goal, per the issue:* no concrete adapters. The stub in
 * `tests/plan-layout.test.ts` exists to prove the interface is satisfiable, not
 * to be one.
 */

import type { PlanNode } from './model.ts'

/**
 * A position in **layout space: CSS pixels relative to the layout's own
 * origin**, with `y` increasing downward as the DOM does.
 *
 * The origin is the adapter's to choose and the adapter's to document. Fixing
 * it here would be a layout decision made in the interface, which is the thing
 * this seam exists to prevent: a flat composition and a camera projection do
 * not agree on where nothing is, and neither should have to.
 */
export interface Anchor {
  readonly x: number
  readonly y: number
}

/**
 * Where an adapter places the objects of a plan.
 *
 * An adapter is constructed from the plan it lays out — by closure, by
 * constructor, however it likes. The interface does not say, because how an
 * adapter comes to know its plan is not something a consumer of an anchor has
 * to care about, and a `prepare(plan)` method here would force every adapter to
 * be mutable whether or not it wanted to be.
 */
export interface PlanLayout {
  /**
   * The anchor for a node, or `null` when this layout does not place it.
   *
   * `null` is a real answer, not a failure: an adapter may legitimately have no
   * position for a node — one that falls outside a projected frustum, or a
   * capability a given composition does not draw. Callers handle it. Throwing
   * instead would make a routine case an exception, and returning a default
   * would put an object at a position nobody chose, which is worse than not
   * drawing it.
   */
  anchorFor(node: PlanNode): Anchor | null
}
