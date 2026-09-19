/*
 * SITE-012 · The full transition matrix, including illegal transitions.
 *
 * The headline assertion is PRD §11.1 and Rejection 3 — the wall is reachable
 * only by an activation attempt — and it is asserted **exhaustively over every
 * state × event pair** rather than by checking the one transition that is
 * supposed to reach it. Testing only the intended path would confirm that
 * activation reaches the wall while saying nothing about whether anything else
 * does, which is the half that matters.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
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
