/*
 * SITE-012 · The full transition matrix, including illegal transitions.
 *
 * The headline assertion is PRD §11.1 and Rejection 3 — the wall is reachable
 * only by an activation attempt — and it is asserted **exhaustively over every
 * state × event pair** rather than by checking the one transition that is
 * supposed to reach it. Testing only the intended path would confirm that
 * activation reaches the wall while saying nothing about whether anything else
 * does, which is the half that matters.
 *
 * @implements SITE-EVAL-033
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  next,
  can,
  STATES,
  EVENTS,
  WALL_EVENT,
  INITIAL_STATE,
  type BuilderState,
} from '../lib/builder-machine.ts'

test('the wall is reachable only by an activation attempt — every pair checked', () => {
  const reaching: string[] = []
  for (const state of STATES) {
    for (const event of EVENTS) {
      if (next(state, event) === 'walled' && event !== WALL_EVENT) {
        reaching.push(`${state} --${event}--> walled`)
      }
    }
  }
  assert.deepEqual(
    reaching,
    [],
    'PRD §11.1 and Rejection 3: never on elapsed time, scroll depth, section entry, exit intent, or interaction count',
  )
})

test('an activation attempt does reach the wall — the rule is not vacuous', () => {
  /*
   * The exhaustive test above would pass if `walled` were unreachable
   * entirely. This is its other half: an unreachable wall satisfies "only by
   * activation" perfectly and ships a demo that never stops honestly.
   */
  assert.equal(next('protecting', WALL_EVENT), 'walled')
})

test('the wall dismisses to a fully tunable plan, never to a dead end', () => {
  const after = next('walled', 'dismiss_wall')
  assert.equal(after, 'tuning', '§11.3: dismissible, returning to a fully tunable plan')
  assert.ok(can(after as BuilderState, 'tune'), 'and tuning must still work from there')
  assert.ok(can(after as BuilderState, 'protect'), 'and protect must still be reachable')
})

test('the happy path runs end to end', () => {
  const path: [BuilderState, Parameters<typeof next>[1]][] = [
    ['idle', 'engage'],
    ['engaged', 'submit'],
    ['submitted', 'build'],
    ['building', 'plan_ready'],
    ['plan_ready', 'tune'],
    ['tuning', 'protect'],
    ['protecting', 'activation_attempted'],
  ]
  let state: BuilderState = INITIAL_STATE
  for (const [expected, event] of path) {
    assert.equal(state, expected)
    const after = next(state, event)
    assert.ok(after !== null, `${state} --${event}--> should be legal`)
    state = after
  }
  assert.equal(state, 'walled')
})

test('protect is reachable without tuning first', () => {
  assert.equal(next('plan_ready', 'protect'), 'protecting')
})

test('illegal transitions are rejected, not absorbed', () => {
  // Skipping ahead is not possible.
  assert.equal(next('idle', 'submit'), null)
  assert.equal(next('idle', 'activation_attempted'), null)
  assert.equal(next('engaged', 'plan_ready'), null)
  assert.equal(next('building', 'protect'), null)
  // Nor is going backwards.
  assert.equal(next('plan_ready', 'submit'), null)
  assert.equal(next('tuning', 'engage'), null)
  // Nor dismissing a wall that is not open.
  assert.equal(next('protecting', 'dismiss_wall'), null)
  assert.equal(next('plan_ready', 'dismiss_wall'), null)
})

test('every state and event is exercised by the table — nothing is dead', () => {
  const reachable = new Set<BuilderState>([INITIAL_STATE])
  const usedEvents = new Set<string>()
  for (const state of STATES) {
    for (const event of EVENTS) {
      const after = next(state, event)
      if (after !== null) {
        reachable.add(after)
        usedEvents.add(event)
      }
    }
  }
  assert.deepEqual([...reachable].sort(), [...STATES].sort(), 'every declared state is reachable')
  assert.deepEqual([...usedEvents].sort(), [...EVENTS].sort(), 'every declared event is used')
})

test('the machine is pure — the same pair always gives the same answer', () => {
  for (const state of STATES) {
    for (const event of EVENTS) {
      assert.equal(next(state, event), next(state, event))
    }
  }
})


/*
 * The audit's finding, 2026-09-19 — §12.4 run against a stub.
 *
 * Planting a second route to `walled` showed the guarantee is **two-part**, and
 * that neither part covers the other's case:
 *
 * - A **declared** event reaching `walled` from a state it should not — say
 *   `tuning: { tune: 'walled' }` — is caught by the exhaustive test above, by
 *   name. That is the half that was known.
 * - An **undeclared** event added to the table — `tuning: { scrolled_to_end:
 *   'walled' }` — is invisible to that test, because the test iterates the
 *   declared event list. It is caught by **typecheck** (TS2353), because the
 *   table's value type is `Partial<Record<BuilderEvent, BuilderState>>`.
 *
 * So the table's closure is load-bearing and was **incidental** — a property of
 * how the type happened to be written, asserted nowhere. Widen that type to
 * `Record<string, BuilderState>` and the exhaustive test still passes while the
 * wall becomes reachable by anything.
 *
 * This test pins the half the type system was carrying alone.
 */
test('the event union is closed — the half typecheck was carrying by itself', () => {
  const source = readFileSync('lib/builder-machine.ts', 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ')

  assert.match(
    source,
    /Partial<Record<BuilderEvent, BuilderState>>/,
    'the transition table must be typed over BuilderEvent, not over string. An ' +
      'open key type lets an undeclared event reach `walled` with the exhaustive ' +
      'test still green — it iterates declared events only.',
  )

  // And the declared set is the one the exhaustive test iterates, so the two
  // halves cannot drift apart without this failing.
  for (const event of EVENTS) {
    assert.match(
      source,
      new RegExp(`'${event}'`),
      `${event} is iterated by the exhaustive test but does not appear in the machine`,
    )
  }
})
