/*
 * SITE-030 / SITE-032 / SITE-034 · the generated provider, the prompt, and the
 * limits. PRD v7.3 §6.4, §6.5, §12.
 *
 * **No live call is reachable from this file.** The transport is a parameter,
 * so a test that hit the network would have to construct one that does — there
 * is no flag to forget and no environment in which these tests behave
 * differently. That is the point of the seam rather than a property of the
 * suite.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { createGeneratedProvider, API_KEY_ENV } from '../lib/generation/anthropic.ts'
import {
  costCents,
  INPUT_MAX,
  MAX_TOKENS,
  requestBody,
  systemPrompt,
  windowForId,
} from '../lib/generation/prompt.ts'
import {
  BURST_PER_MINUTE,
  checkLimits,
  HOUR_MS,
  memoryLedger,
  memoryLog,
  MINUTE_MS,
  PER_HOUR,
  recordRequest,
} from '../lib/generation/limits.ts'
import { resolvePlan, ProviderFailure } from '../lib/providers/resolve.ts'
import type { PlanProvider } from '../lib/providers/types.ts'
import { WINDOW_OPTIONS } from '../lib/copy/builder-controls.ts'

const KEY = 'test-key-not-a-real-credential'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** A Messages response carrying `text` as the model's single text block. */
function modelSays(text: string, usage = { input_tokens: 100, output_tokens: 50 }): Response {
  return jsonResponse({ content: [{ type: 'text', text }], usage })
}

const VALID = JSON.stringify({
  title: 'Finish the thesis draft',
  window: 'morning',
  clarification: {
    question: 'Which part is furthest behind?',
    options: ['Chapter one', 'The lit review', 'Not sure yet'],
  },
})

function providerReturning(response: () => Response, onSpend?: (c: number) => void): PlanProvider {
  const options: Parameters<typeof createGeneratedProvider>[0] = {
    apiKey: KEY,
    transport: async () => response(),
    ...(onSpend ? { onSpend } : {}),
  }
  return createGeneratedProvider(options)
}

/* ── The positive control ────────────────────────────────────────────────── */

test('a well-formed response produces all three fields', async () => {
  /*
   * **The control on every negative below.** Without it, a provider that
   * returned three nulls for everything satisfies each discard assertion
   * perfectly — which is §0.3 at the provider, and the failure mode that looks
   * like rigour.
   */
  const provider = providerReturning(() => modelSays(VALID))
  const fields = await provider.generate({ rawGoal: 'finish my thesis', wantsClarification: true })

  assert.equal(fields.title, 'Finish the thesis draft')
  assert.deepEqual(fields.window, { startMinute: 9 * 60, endMinute: 10 * 60 + 30 })
  assert.equal(fields.clarification?.options.length, 3)
})

/* ── Fields discard independently (§6.5) ─────────────────────────────────── */

test('an over-long title is discarded and does not take the window with it', async () => {
  const provider = providerReturning(() =>
    modelSays(JSON.stringify({ title: 'x'.repeat(49), window: 'early' })),
  )
  const fields = await provider.generate({ rawGoal: 'anything', wantsClarification: false })

  assert.equal(fields.title, null, 'a 49-character title is over the 48 ceiling')
  assert.deepEqual(
    fields.window,
    { startMinute: 360, endMinute: 450 },
    'the window was valid and must survive the title being discarded (§6.5)',
  )
})

test('an invalid clarification does not discard a valid title', async () => {
  const provider = providerReturning(() =>
    modelSays(
      JSON.stringify({
        title: 'Run three times a week',
        window: 'early',
        clarification: { question: 'Great question! What matters most?', options: ['a', 'b', 'c'] },
      }),
    ),
  )
  const fields = await provider.generate({ rawGoal: 'run more', wantsClarification: true })

  assert.equal(fields.title, 'Run three times a week')
  assert.equal(fields.clarification, null, 'the preamble constraint rejects it')
})

test('a window id outside the closed set is discarded, never resolved to a near one', async () => {
  /*
   * §0.3c applied to a closed set. The tempting failure is resolving `mornings`
   * to `morning`, or an unknown id to the default — both present a correction
   * as understanding, and both render perfectly.
   */
  const provider = providerReturning(() =>
    modelSays(JSON.stringify({ title: 'A title', window: 'mornings' })),
  )
  const fields = await provider.generate({ rawGoal: 'x', wantsClarification: false })
  assert.equal(fields.window, null)

  assert.equal(windowForId('midnight'), null)
  assert.equal(windowForId(undefined), null)
  for (const option of WINDOW_OPTIONS) {
    assert.notEqual(windowForId(option.id), null, `${option.id} is in the set and must resolve`)
  }
})

test('the clarification is dropped when classification did not ask for the beat', async () => {
  // The model may not decide whether the beat runs (§6.4). A response carrying
  // a question for a non-vague input is ignored rather than rendered.
  const provider = providerReturning(() => modelSays(VALID))
  const fields = await provider.generate({ rawGoal: 'x', wantsClarification: false })
  assert.equal(fields.clarification, null)
  assert.equal(fields.title, 'Finish the thesis draft', 'the other two are unaffected')
})

/* ── Failure modes, each named ───────────────────────────────────────────── */

test('each transport failure maps to its own reason, and they are distinct', async () => {
  /*
   * Asserted as a table rather than one case, because a `catch` that swallowed
   * everything into a single reason passes any single-case test — and
   * `plan_generation_fallback` carries exactly this value.
   */
  const cases: readonly [string, () => Response, string][] = [
    ['429', () => jsonResponse({}, 429), 'rate_limit'],
    ['500', () => jsonResponse({}, 500), 'network_error'],
    ['not JSON at all', () => new Response('<html>', { status: 200 }), 'invalid_schema'],
    ['no content array', () => jsonResponse({ usage: {} }), 'invalid_schema'],
    ['content is not JSON', () => modelSays('here you go: a plan!'), 'invalid_schema'],
    ['empty text block', () => modelSays('   '), 'invalid_schema'],
  ]

  const seen = new Set<string>()
  for (const [label, response, expected] of cases) {
    const provider = providerReturning(response)
    await assert.rejects(
      () => provider.generate({ rawGoal: 'x', wantsClarification: false }),
      (error: unknown) => {
        assert.ok(error instanceof ProviderFailure, `${label} threw something else`)
        assert.equal(error.reason, expected, label)
        return true
      },
    )
    seen.add(expected)
  }
  assert.equal(seen.size, 3, 'three distinct reasons are exercised, not one repeated')
})

test('a thrown transport is a network error, and an aborted one is a timeout', async () => {
  const throwing = createGeneratedProvider({
    apiKey: KEY,
    transport: async () => {
      throw new TypeError('fetch failed')
    },
  })
  await assert.rejects(
    () => throwing.generate({ rawGoal: 'x', wantsClarification: false }),
    (e: unknown) => (e as ProviderFailure).reason === 'network_error',
  )

  const controller = new AbortController()
  const aborting = createGeneratedProvider({
    apiKey: KEY,
    transport: async () => {
      controller.abort()
      throw new DOMException('aborted', 'AbortError')
    },
  })
  await assert.rejects(
    () => aborting.generate({ rawGoal: 'x', wantsClarification: false, signal: controller.signal }),
    (e: unknown) => (e as ProviderFailure).reason === 'timeout',
  )
})

test('a provider with no key refuses to exist', () => {
  assert.throws(
    () => createGeneratedProvider({ apiKey: '', transport: async () => new Response('{}') }),
    new RegExp(API_KEY_ENV),
    'the error names the variable, so the fix is in the message',
  )
})

/* ── End to end through the orchestrator ─────────────────────────────────── */

test('every generated failure lands on the static source with no dead state', async () => {
  const staticSource: PlanProvider = {
    name: 'static',
    generate: async () => ({
      title: 'Authored title',
      window: { startMinute: 360, endMinute: 450 },
      clarification: null,
    }),
  }

  for (const [status, reason] of [
    [429, 'rate_limit'],
    [500, 'network_error'],
  ] as const) {
    const outcome = await resolvePlan(
      { rawGoal: 'x', wantsClarification: false },
      providerReturning(() => jsonResponse({}, status)),
      staticSource,
    )
    assert.equal(outcome.fallback, reason)
    assert.equal(outcome.fields.title, 'Authored title', 'never a dead state')
  }
})

/* ── The prompt ──────────────────────────────────────────────────────────── */

test('the prompt asks for the clarification only when classification did', () => {
  assert.match(systemPrompt(true), /clarification/)
  assert.doesNotMatch(
    systemPrompt(false).replace(/Do not include a "clarification" field\./, ''),
    /clarification/,
    'the only mention in the non-vague prompt is the instruction to omit it',
  )
})

test('the prompt names every window id and no times', () => {
  const prompt = systemPrompt(false)
  for (const option of WINDOW_OPTIONS) assert.match(prompt, new RegExp(`"${option.id}"`))
  assert.match(prompt, /Do not invent times/)
})

test('the request body caps the input and the tokens', () => {
  const body = requestBody('x'.repeat(5000), false) as {
    max_tokens: number
    messages: { content: string }[]
  }
  assert.equal(body.max_tokens, MAX_TOKENS)
  assert.equal(body.messages[0]?.content.length, INPUT_MAX, 'the edge caps it too, not just SITE-008')
})

test('cost never rounds to zero', () => {
  assert.equal(costCents(0, 0), 1, 'a sub-cent request that recorded 0 would never reach the cap')
  assert.ok(costCents(1_000_000, 0) >= 300)
})

/* ── The limits ──────────────────────────────────────────────────────────── */

const CONFIG = { dailyCapCents: 500, generationEnabled: true }

test('the hourly window admits exactly five and refuses the sixth', async () => {
  const log = memoryLog()
  const ledger = memoryLedger()
  let now = 1_000_000

  for (let i = 0; i < PER_HOUR; i++) {
    // Spaced past the burst window so this test measures the hour, not the minute.
    now += MINUTE_MS + 1
    const gate = await checkLimits('ip', now, CONFIG, log, ledger)
    assert.equal(gate.allowed, true, `request ${i + 1} of ${PER_HOUR} must be admitted`)
    await recordRequest('ip', now, log)
  }

  now += MINUTE_MS + 1
  assert.deepEqual(await checkLimits('ip', now, CONFIG, log, ledger), {
    allowed: false,
    reason: 'rate_limit',
  })

  // And it is a *sliding* window: an hour after the first, one slot frees.
  assert.equal((await checkLimits('ip', now + HOUR_MS, CONFIG, log, ledger)).allowed, true)
})

test('the burst window refuses the third inside a minute', async () => {
  const log = memoryLog()
  const ledger = memoryLedger()
  const now = 2_000_000

  for (let i = 0; i < BURST_PER_MINUTE; i++) {
    assert.equal((await checkLimits('ip', now + i, CONFIG, log, ledger)).allowed, true)
    await recordRequest('ip', now + i, log)
  }
  assert.equal((await checkLimits('ip', now + 2, CONFIG, log, ledger)).reason, 'rate_limit')
  // Still inside the hour, so this proves the minute window and not the hour one.
  assert.equal((await checkLimits('ip', now + MINUTE_MS + 1, CONFIG, log, ledger)).allowed, true)
})

test('a refused request is not counted against the window', async () => {
  /*
   * A gate that recorded as it checked would extend a client's own lockout
   * every time it retried — punitive behaviour nobody specified and invisible
   * without a test that hammers a closed door.
   */
  const log = memoryLog()
  const ledger = memoryLedger()
  const now = 3_000_000

  for (let i = 0; i < BURST_PER_MINUTE; i++) {
    await recordRequest('ip', now, log)
  }
  for (let i = 0; i < 20; i++) {
    assert.equal((await checkLimits('ip', now, CONFIG, log, ledger)).allowed, false)
  }
  assert.equal(
    (await checkLimits('ip', now + MINUTE_MS + 1, CONFIG, log, ledger)).allowed,
    true,
    'twenty refusals must not have extended the lockout',
  )
})

test('limits are per key', async () => {
  const log = memoryLog()
  const ledger = memoryLedger()
  const now = 4_000_000
  for (let i = 0; i < BURST_PER_MINUTE; i++) await recordRequest('a', now, log)

  assert.equal((await checkLimits('a', now, CONFIG, log, ledger)).allowed, false)
  assert.equal((await checkLimits('b', now, CONFIG, log, ledger)).allowed, true)
})

test('the spend cap closes at the ceiling and reopens the next UTC day', async () => {
  const log = memoryLog()
  const ledger = memoryLedger()
  const noon = Date.parse('2026-09-22T12:00:00Z')

  await ledger.record(noon, CONFIG.dailyCapCents - 1)
  assert.equal((await checkLimits('ip', noon, CONFIG, log, ledger)).allowed, true, 'one cent under')

  await ledger.record(noon, 1)
  assert.deepEqual(await checkLimits('ip', noon, CONFIG, log, ledger), {
    allowed: false,
    reason: 'spend_cap',
  })

  const tomorrow = Date.parse('2026-09-23T00:00:00Z')
  assert.equal((await checkLimits('ip', tomorrow, CONFIG, log, ledger)).allowed, true)
})

test('the kill switch closes everything and needs no other state', async () => {
  const gate = await checkLimits(
    'ip',
    5_000_000,
    { ...CONFIG, generationEnabled: false },
    memoryLog(),
    memoryLedger(),
  )
  assert.deepEqual(gate, { allowed: false, reason: 'spend_cap' })
})

test('spend is recorded from the response, not estimated', async () => {
  let recorded = 0
  const provider = providerReturning(
    () => modelSays(VALID, { input_tokens: 2_000_000, output_tokens: 1_000_000 }),
    (cents) => {
      recorded = cents
    },
  )
  await provider.generate({ rawGoal: 'x', wantsClarification: true })
  assert.equal(recorded, costCents(2_000_000, 1_000_000))
  assert.ok(recorded > 1, 'a real usage figure, not the floor')
})

/* ── The server/client boundary ──────────────────────────────────────────── */

test('nothing the browser ships can import the key-handling code', async () => {
  /*
   * **A scan, because the constraint is about what these files do *not*
   * contain**, and that cannot be tested by calling anything.
   *
   * The bundle check would not catch it either, or not reliably: the budget has
   * 9 kB of headroom, and a provider module is small enough to slip inside it
   * while putting the request-construction path — headers, the `x-api-key`
   * field name, the URL — into a file served to every visitor. The key itself
   * would still come from `env` and would still not be in the tree, so nothing
   * would *leak*; the defect is that the site would be shipping the shape of a
   * credentialled call to the client, where the next person to wire it up has
   * everything they need to call the API from the browser.
   *
   * `lib/generation/prompt.ts` is deliberately **not** on this list: the static
   * provider resolves window ids through it and runs in the browser. It holds
   * no key, no URL and no header.
   */
  const { readdirSync, readFileSync, statSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')

  const SERVER_ONLY = ['lib/generation/anthropic.ts', 'lib/generation/limits.ts', 'lib/api/']

  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry)
      return statSync(full).isDirectory() ? walk(full) : [full]
    })

  const clientFiles = ['app', 'components']
    .flatMap(walk)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))

  assert.ok(clientFiles.length > 10, `only ${clientFiles.length} files scanned — the walk is wrong`)

  /*
   * **Import specifiers, not raw text.** The first version matched substrings
   * and fired on `components/builder.tsx` for the sentence *"there is no
   * provider, no `/api/plan`, and no fetch on this path"* — a comment saying
   * the file does the right thing, flagged as doing the wrong one. A scan that
   * cries wolf on its own documentation is argued down the first time it fires,
   * which is how the check stops existing.
   */
  const IMPORTS = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g

  for (const file of clientFiles) {
    const source = readFileSync(file, 'utf8')
    const specifiers = [...source.matchAll(IMPORTS)].map((m) => m[1] ?? '')

    for (const specifier of specifiers) {
      const resolved = specifier.startsWith('.')
        ? join(dirname(file), specifier).replace(/\\/g, '/')
        : specifier

      for (const banned of SERVER_ONLY) {
        assert.ok(
          !resolved.startsWith(banned.replace(/\.ts$/, '')),
          `${file} imports ${specifier}. That path constructs a credentialled ` +
            'request and belongs to the Pages Function, not to anything served ' +
            'to a browser.',
        )
      }
    }
  }
})
