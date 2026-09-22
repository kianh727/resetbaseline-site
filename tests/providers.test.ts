/*
 * SP-05 · The provider seam, validation, and the five failure modes.
 *
 * Two properties carry this suite, and both are §6.5 requirements rather than
 * design preferences:
 *
 * 1. **Each of the three fields validates and falls back independently.** A
 *    suite that only checked "a bad response falls back" would pass on an
 *    all-or-nothing implementation, which §6.5 forbids by name.
 * 2. **All five failure modes reach the static source, silently.** Asserted as
 *    five, because a test that checked one reason and assumed the rest would
 *    pass on a `catch` that swallows everything into one path — which is the
 *    same implementation, and is wrong for a different reason.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  validateFields,
  validClarification,
  validTitle,
  validWindow,
  TITLE_MAX,
  QUESTION_MAX,
  OPTION_MAX,
} from '../lib/providers/validate.ts'
import { resolvePlan, ProviderFailure } from '../lib/providers/resolve.ts'
import { AUTHORED_CLARIFICATIONS, hasAuthoredClarification } from '../lib/providers/authored.ts'
import type { FallbackReason, PlanFields, PlanProvider } from '../lib/providers/types.ts'

const WINDOW = { startMinute: 480, endMinute: 570 }
const GOOD_Q = {
  question: 'Which part matters most right now?',
  options: ['Getting started', 'Staying consistent', 'Finishing'] as [string, string, string],
}

function provider(name: string, fields: Partial<PlanFields>): PlanProvider {
  return {
    name,
    generate: async () => ({ title: null, window: null, clarification: null, ...fields }),
  }
}

function failing(reason: FallbackReason): PlanProvider {
  return {
    name: 'failing',
    generate: async () => {
      throw new ProviderFailure(reason)
    },
  }
}

const AUTHORED = provider('static', { title: 'Authored title', window: WINDOW, clarification: GOOD_Q })
const REQUEST = { rawGoal: 'finish my thesis', wantsClarification: false }

/* ------------------------------------------------------------------ *
 * Validation — the three fields, and §6.4's five constraints.
 * ------------------------------------------------------------------ */

test('a title is bounded at exactly §6.5’s limit', () => {
  assert.equal(validTitle('a'.repeat(TITLE_MAX)), true)
  assert.equal(validTitle('a'.repeat(TITLE_MAX + 1)), false)
  assert.equal(validTitle('   '), false, 'whitespace is not a title')
  assert.equal(validTitle(42), false)
})

test('a window must name two minute-of-day values inside a day', () => {
  assert.equal(validWindow(WINDOW), true)
  assert.equal(validWindow({ startMinute: 0, endMinute: 1439 }), true)
  assert.equal(validWindow({ startMinute: -1, endMinute: 60 }), false)
  assert.equal(validWindow({ startMinute: 0, endMinute: 1440 }), false)
  assert.equal(validWindow({ startMinute: 1.5, endMinute: 60 }), false)
  assert.equal(validWindow(null), false)
})

test('§6.4’s five constraints are each enforced, and each alone', () => {
  // Written as five rejections from one valid base, so a constraint that stopped
  // being checked fails here rather than being masked by another that still is.
  assert.equal(validClarification(GOOD_Q), true, 'the base case must be valid')

  assert.equal(
    validClarification({ ...GOOD_Q, question: `${'a'.repeat(QUESTION_MAX)}?` }),
    false,
    'over 90 characters',
  )
  assert.equal(
    validClarification({ ...GOOD_Q, options: ['a', 'b'] }),
    false,
    'not exactly three options',
  )
  assert.equal(
    validClarification({ ...GOOD_Q, options: ['a'.repeat(OPTION_MAX), 'b', 'c'] }),
    false,
    'an option at or over 24 characters',
  )
  assert.equal(
    validClarification({ ...GOOD_Q, question: 'Great question! Which part matters?' }),
    false,
    'a preamble',
  )
  assert.equal(
    validClarification({ ...GOOD_Q, question: 'Which part matters most right now' }),
    false,
    'no question mark',
  )
})

test('options must be distinct — "mutually exclusive" at the level a validator can check', () => {
  assert.equal(validClarification({ ...GOOD_Q, options: ['Same', 'Same', 'Other'] }), false)
})

test('two questions in one field is not one question', () => {
  assert.equal(
    validClarification({ ...GOOD_Q, question: 'Which part? Or is it something else?' }),
    false,
  )
})

test('validation is per-field: one bad field leaves the others intact', () => {
  // §6.5, the requirement this whole seam exists to satisfy.
  const fields = validateFields({
    title: 'A good title',
    window: { startMinute: -5, endMinute: 99 },
    clarification: GOOD_Q,
  })
  assert.equal(fields.title, 'A good title')
  assert.equal(fields.window, null)
  assert.deepEqual(fields.clarification, GOOD_Q)
})

test('validation never throws on a malformed response', () => {
  for (const raw of [null, undefined, 42, 'text', [], { title: {} }]) {
    assert.doesNotThrow(() => validateFields(raw))
  }
  assert.deepEqual(validateFields(null), { title: null, window: null, clarification: null })
})

test('no repair, no coercion — a near-miss is rejected, not fixed', () => {
  // A validator that trimmed a 49-character title to 48 would be choosing a
  // value nothing specified. The model's authority widens by exactly that much.
  const fields = validateFields({ title: 'a'.repeat(TITLE_MAX + 1) })
  assert.equal(fields.title, null)
})

/* ------------------------------------------------------------------ *
 * The five failure modes.
 * ------------------------------------------------------------------ */

const REASONS: readonly FallbackReason[] = [
  'timeout',
  'invalid_schema',
  'rate_limit',
  'spend_cap',
  'network_error',
]

test('all five failure modes reach the static source, each naming its own reason', async () => {
  // Asserted as five. A test that checked one and assumed the rest would pass on
  // a catch that swallows everything into a single path.
  const seen: FallbackReason[] = []
  for (const reason of REASONS) {
    const outcome = await resolvePlan(REQUEST, failing(reason), AUTHORED)
    assert.equal(outcome.fallback, reason, reason)
    assert.equal(outcome.fields.title, 'Authored title', reason)
    seen.push(outcome.fallback)
  }
  assert.deepEqual(seen, REASONS, 'every reason must be distinguishable at the seam')
})

test('the fallback is silent — no error surfaces and no field is empty', async () => {
  for (const reason of REASONS) {
    const outcome = await resolvePlan(REQUEST, failing(reason), AUTHORED)
    assert.notEqual(outcome.fields.title, null, reason)
    assert.notEqual(outcome.fields.window, null, reason)
  }
})

test('an unrecognised throw is a network error, not an unhandled rejection', async () => {
  const exploding: PlanProvider = {
    name: 'exploding',
    generate: async () => {
      throw new TypeError('fetch failed')
    },
  }
  const outcome = await resolvePlan(REQUEST, exploding, AUTHORED)
  assert.equal(outcome.fallback, 'network_error')
  assert.equal(outcome.fields.title, 'Authored title')
})

/* ------------------------------------------------------------------ *
 * The timeout, and post-abort immutability.
 * ------------------------------------------------------------------ */

test('a provider slower than the budget aborts and falls back', async () => {
  const slow: PlanProvider = {
    name: 'slow',
    generate: ({ signal }) =>
      new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve({ title: 'late', window: WINDOW, clarification: null }), 200)
        signal?.addEventListener('abort', () => {
          clearTimeout(t)
          reject(new ProviderFailure('timeout'))
        })
      }),
  }
  const outcome = await resolvePlan(REQUEST, slow, AUTHORED, 20)
  assert.equal(outcome.fallback, 'timeout')
  assert.equal(outcome.fields.title, 'Authored title', 'the late value must not be used')
})

test('a response that resolves after the abort does not reach the outcome', async () => {
  /*
   * SITE-032's accept: "no orphaned request mutates state after abort." An
   * AbortSignal stops the fetch, not the promise chain already scheduled behind
   * it — so a provider that ignores the signal and resolves late is the case
   * that matters, and it is the one a naive implementation gets wrong.
   */
  const ignoresSignal: PlanProvider = {
    name: 'ignores-signal',
    generate: () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ title: 'orphan', window: WINDOW, clarification: null }), 40),
      ),
  }
  const outcome = await resolvePlan(REQUEST, ignoresSignal, AUTHORED, 10)
  assert.equal(outcome.fallback, 'timeout')
  assert.notEqual(outcome.fields.title, 'orphan')
})

test('a provider inside the budget is used as-is, with no fallback recorded', async () => {
  // The positive control. Without it every assertion above is satisfied by a
  // seam that always falls back, which is §0.3 at the orchestrator.
  const fast = provider('fast', { title: 'Generated title', window: WINDOW })
  const outcome = await resolvePlan(REQUEST, fast, AUTHORED)
  assert.equal(outcome.fallback, null)
  assert.equal(outcome.fields.title, 'Generated title')
  assert.deepEqual(outcome.substituted, [])
})

/* ------------------------------------------------------------------ *
 * Independent fallback — §6.5's requirement, stated as a test.
 * ------------------------------------------------------------------ */

test('one invalid field does not discard the other two', async () => {
  const partial = provider('partial', { title: 'Generated title', window: null })
  const outcome = await resolvePlan(REQUEST, partial, AUTHORED)
  assert.equal(outcome.fields.title, 'Generated title', 'the valid field survives')
  assert.deepEqual(outcome.fields.window, WINDOW, 'the invalid one is substituted')
  assert.deepEqual(outcome.substituted, ['window'])
  assert.equal(outcome.fallback, null, 'a partial response is not one of the five failures')
})

test('the clarification is consulted only when classification asked for it', async () => {
  // §6.4: classification decides WHETHER the beat runs. The model never does,
  // and neither does the absence of a field in its response.
  const noQuestion = provider('no-question', { title: 'T', window: WINDOW })

  const notAsked = await resolvePlan(REQUEST, noQuestion, AUTHORED)
  assert.equal(notAsked.fields.clarification, null)
  assert.deepEqual(notAsked.substituted, [])

  const asked = await resolvePlan({ ...REQUEST, wantsClarification: true }, noQuestion, AUTHORED)
  assert.deepEqual(asked.fields.clarification, GOOD_Q)
  assert.deepEqual(asked.substituted, ['clarification'])
})

/* ------------------------------------------------------------------ *
 * The authored set that does not exist yet.
 * ------------------------------------------------------------------ */

test('the authored clarification set is empty, and that is a defined state', () => {
  /*
   * SITE-112: §6.4 specifies a silent fallback to an authored set that exists in
   * no artifact, and no session drafts it. The empty case takes the path §6.4
   * already defines for a question that never arrives — the build proceeds on
   * the original input, with no question and no error.
   *
   * This asserts the current state deliberately. When SITE-112 lands it fails,
   * which is the point: the copy arriving is a change somebody should notice.
   */
  assert.equal(AUTHORED_CLARIFICATIONS.length, 0)
  assert.equal(hasAuthoredClarification(), false)
})

test('with no authored question the beat does not run, and nothing is a dead state', async () => {
  const nothing = provider('nothing', { title: 'T', window: WINDOW })
  const empty = provider('empty-authored', { title: 'T', window: WINDOW, clarification: null })
  const outcome = await resolvePlan({ ...REQUEST, wantsClarification: true }, nothing, empty)
  assert.equal(outcome.fields.clarification, null, 'no question')
  assert.notEqual(outcome.fields.title, null, 'and the plan still builds')
  assert.notEqual(outcome.fields.window, null)
})
