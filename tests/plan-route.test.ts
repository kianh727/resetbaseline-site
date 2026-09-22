/*
 * SITE-029 / SITE-030 · the static provider and the `/api/plan` handler.
 *
 * *Stub check* — a handler returning `{ title: null, window: null }` for
 * everything fails the completeness assertion by name, and one that always
 * falls back fails the positive control. Counts and completeness are asserted
 * before properties throughout, because "no dead state" is satisfied perfectly
 * by a route that returns nothing at all.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { handlePlan, type PlanHandlerDeps } from '../lib/api/plan.ts'
import { createStaticProvider, matchScenario } from '../lib/providers/static.ts'
import { AUTHORED_CLARIFICATIONS } from '../lib/providers/authored.ts'
import { SCENARIOS } from '../lib/copy/scenarios.ts'
import { memoryLedger, memoryLog, BURST_PER_MINUTE } from '../lib/generation/limits.ts'
import { ProviderFailure } from '../lib/providers/resolve.ts'
import type { PlanProvider } from '../lib/providers/types.ts'
import { INPUT_MAX } from '../lib/generation/prompt.ts'

const CONFIG = { dailyCapCents: 500, generationEnabled: true }

function deps(generated: PlanProvider | null): PlanHandlerDeps {
  return { generated, config: CONFIG, log: memoryLog(), ledger: memoryLedger(), now: () => 1_000_000 }
}

/* ── The scenarios ───────────────────────────────────────────────────────── */

test('five scenarios, five distinct behaviours, five distinct ids', () => {
  /*
   * Counts before properties. "Each demonstrates its assigned behaviour" is
   * satisfied by an empty list, which is the shape SITE-EVAL-027 was rewritten
   * out of.
   */
  assert.equal(SCENARIOS.length, 5)
  assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, 5)
  assert.equal(
    new Set(SCENARIOS.map((s) => s.behaviour)).size,
    5,
    'two scenarios sharing a behaviour means one of them demonstrates nothing new',
  )
})

test('no scenario carries a stand-in title', () => {
  /*
   * The point of the held structure. A title written to be replaced looks like
   * finished work and ships — so its absence is asserted, and **SITE-028
   * landing fails this test**, which is exactly what should happen when copy
   * arrives.
   */
  for (const scenario of SCENARIOS) {
    assert.equal(
      scenario.title,
      null,
      `${scenario.id} carries a title. If SITE-028 has landed, promote this ` +
        'test to assert the five real titles; if it has not, delete the string.',
    )
  }
})

/* ── The matcher ─────────────────────────────────────────────────────────── */

test('the matcher is deterministic and picks the strongest signal', () => {
  assert.equal(matchScenario('finish my thesis chapter').scenario.id, 'thesis')
  assert.equal(matchScenario('stop scrolling my phone in the morning').scenario.id, 'mornings')
  assert.equal(matchScenario('study for the LSAT'.toLowerCase()).scenario.id, 'lsat')

  // Same input, same answer, every time (§6.5).
  for (let i = 0; i < 5; i++) {
    assert.equal(matchScenario('recover from my back injury').scenario.id, 'back')
  }
})

test('an unmatched goal still gets a scenario, and says it matched nothing', () => {
  const { scenario, matchedKeywords } = matchScenario('learn to make sourdough')
  assert.ok(scenario, 'arbitrary input must produce a complete plan (SITE-029 accept)')
  assert.equal(matchedKeywords, 0, 'and the caller can tell a match from a fallback')

  assert.ok(matchScenario('finish my thesis').matchedKeywords > 0, 'positive control')
})

/* ── The static provider ─────────────────────────────────────────────────── */

test('the static path produces a window for any input, with no network', async () => {
  const provider = createStaticProvider()
  for (const goal of ['learn spanish', 'run a marathon', 'x', 'finish my thesis by May']) {
    const fields = await provider.generate({ rawGoal: goal, wantsClarification: false })
    assert.notEqual(fields.window, null, `no window for "${goal}" — the plan has nowhere to render`)
  }
})

test('the authored clarification set is empty, so SITE-112 landing fails here', () => {
  assert.equal(
    AUTHORED_CLARIFICATIONS.length,
    0,
    'copy arriving is a change somebody should notice, which is why this asserts zero',
  )
})

test('an injected clarification set is served — the non-empty path is built today', async () => {
  const provider = createStaticProvider([
    { question: 'Which part is hardest?', options: ['Starting', 'Finishing', 'Both'] },
  ])
  const fields = await provider.generate({ rawGoal: 'get healthier', wantsClarification: true })
  assert.equal(fields.clarification?.options.length, 3)

  const off = await provider.generate({ rawGoal: 'get healthier', wantsClarification: false })
  assert.equal(off.clarification, null, 'classification decides whether the beat runs, not the set')
})

/* ── The handler ─────────────────────────────────────────────────────────── */

test('with no generation configured the route still serves a complete plan', async () => {
  const response = await handlePlan({ goal: 'finish my thesis' }, 'ip', deps(null))
  assert.equal(response.status, 200)
  assert.notEqual(response.body.window, null, 'DS-7: complete with generation disabled entirely')
  assert.equal(response.body.fallback, null, 'not configured is not a failure mode')
})

test('an empty goal is the one thing that gets a status', async () => {
  for (const goal of ['', '   ', undefined, 42]) {
    const response = await handlePlan({ goal }, 'ip', deps(null))
    assert.equal(response.status, 400, `"${String(goal)}" is not a goal`)
  }
  assert.equal((await handlePlan({ goal: 'a real goal' }, 'ip', deps(null))).status, 200)
})

test('the goal is capped at the edge, not only in the field', async () => {
  let seen = ''
  const generated: PlanProvider = {
    name: 'spy',
    generate: async (r) => {
      seen = r.rawGoal
      return { title: 'A title', window: { startMinute: 360, endMinute: 450 }, clarification: null }
    },
  }
  await handlePlan({ goal: 'x'.repeat(5000) }, 'ip', deps(generated))
  assert.equal(seen.length, INPUT_MAX, 'the edge trusts no client')
})

test('a generation failure is silent — 200, a complete plan, and a named reason', async () => {
  const failing: PlanProvider = {
    name: 'failing',
    generate: async () => {
      throw new ProviderFailure('network_error')
    },
  }
  const response = await handlePlan({ goal: 'finish my thesis' }, 'ip', deps(failing))

  assert.equal(response.status, 200, 'a 503 here is a user-visible error, which DS-10 forbids')
  assert.equal(response.body.fallback, 'network_error')
  assert.notEqual(response.body.window, null, 'no dead state')
})

test('a rate limit takes the same silent route as every other failure mode', async () => {
  const shared = deps({
    name: 'ok',
    generate: async () => ({
      title: 'Generated',
      window: { startMinute: 360, endMinute: 450 },
      clarification: null,
    }),
  })

  for (let i = 0; i < BURST_PER_MINUTE; i++) {
    const ok = await handlePlan({ goal: 'finish my thesis' }, 'ip', shared)
    assert.equal(ok.body.fallback, null, 'positive control: inside the limit, the model is used')
    assert.equal(ok.body.title, 'Generated')
  }

  const limited = await handlePlan({ goal: 'finish my thesis' }, 'ip', shared)
  assert.equal(limited.status, 200, 'never 429 to the client')
  assert.equal(limited.body.fallback, 'rate_limit')
  assert.notEqual(limited.body.window, null)
})

test('classification decides the beat, and the handler never asks the model to', async () => {
  const asked: boolean[] = []
  const generated: PlanProvider = {
    name: 'spy',
    generate: async (r) => {
      asked.push(r.wantsClarification)
      return { title: 'A title', window: { startMinute: 360, endMinute: 450 }, clarification: null }
    },
  }

  await handlePlan({ goal: 'i want to be better' }, 'ip', deps(generated))
  await handlePlan({ goal: 'finish my thesis by May' }, 'ip', deps(generated))

  assert.equal(asked.length, 2)
  assert.ok(
    asked.some((a) => a) && asked.some((a) => !a),
    'both classes must be exercised, or this asserts one branch and reports two',
  )
})
