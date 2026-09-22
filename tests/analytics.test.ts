/*
 * SITE-049 / SITE-050 / SITE-051 · the schema, the sequence, and the guard.
 *
 * `SITE-EVAL-037` · full event sequence · `SITE-EVAL-038` · branch and fallback
 * events · `SITE-EVAL-039` · no sensitive free-form text.
 *
 * *Stub check* — **the expected event count is asserted before the ordering**,
 * everywhere. An empty stream is trivially "complete and ordered", which is the
 * exposure SITE-EVAL-037 was rewritten out of; a sink that collected nothing
 * fails the first assertion in every test below rather than passing them all.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { createAnalytics, memorySink, NULL_SINK } from '../lib/analytics/client.ts'
import {
  CLOSED_SET_MEMBERS,
  EVENT_NAMES,
  isStructural,
  SEQUENCE,
  type EventName,
} from '../lib/analytics/events.ts'

/* ── The schema ──────────────────────────────────────────────────────────── */

test('fifteen events, and the sequence is the first twelve', () => {
  assert.equal(EVENT_NAMES.length, 15, 'SITE-049: "all fifteen events"')
  assert.equal(new Set(EVENT_NAMES).size, 15, 'two events sharing a name measure each other')
  assert.equal(SEQUENCE.length, 12, 'SITE-EVAL-037 names twelve in its sequence')

  // The three outside the sequence are the branch and fallback events.
  const branch = EVENT_NAMES.filter((n) => !SEQUENCE.includes(n))
  assert.deepEqual(
    [...branch].sort(),
    ['plan_generation_fallback', 'suggestion_selected', 'wall_dismissed'],
    'SITE-EVAL-038 names these, and they are conditional rather than sequential',
  )
})

test('every closed-set member is recognised, and nothing else is', () => {
  /*
   * **Two hand-written sources.** `CLOSED_SET_MEMBERS` is a runtime list and
   * the unions are compile-time declarations; deriving either from the other
   * would make this agree by construction (§0.3b). A drift between them is a
   * drift a person introduced, which is exactly what this should catch.
   */
  assert.ok(CLOSED_SET_MEMBERS.length >= 18, 'too few members to be the four sets')

  for (const member of CLOSED_SET_MEMBERS) {
    assert.ok(isStructural(member), `${member} is declared but not recognised at runtime`)
  }

  for (const notStructural of ['finish my thesis', 'Instagram', '', 'Priya', 'A ']) {
    assert.equal(isStructural(notStructural), false, `"${notStructural}" must not pass`)
  }
  assert.equal(isStructural(42), true)
  assert.equal(isStructural(true), true)
  assert.equal(isStructural(Number.NaN), false, 'NaN serialises to null and measures nothing')
  assert.equal(isStructural({ a: 1 }), false)
  assert.equal(isStructural(null), false)
})

/* ── SITE-EVAL-037 · the full sequence ───────────────────────────────────── */

/** One complete loop, fired in the order the product produces them. */
function runFullLoop(withChip: boolean) {
  const sink = memorySink()
  const analytics = createAnalytics(sink, 'B')

  analytics.track('hero_view', { reduced_motion: false })
  analytics.track('builder_engaged', {})
  analytics.track('goal_input_started', {})
  if (withChip) analytics.track('suggestion_selected', { index: 2 })
  analytics.track('goal_submitted', { length: 31, input_class: 'actionable', has_deadline: true })
  analytics.track('plan_generated', { node_count: 2, occurrence_count: 15, ms_to_plan: 42 })
  analytics.track('plan_tuned', { control: 'window' })
  analytics.track('protect_started', {})
  analytics.track('protect_selected', { app_count: 3 })
  analytics.track('activation_attempted', {})
  analytics.track('wall_reached', { ms_since_submit: 8200 })
  analytics.track('email_submitted', {})
  analytics.track('share_card_created', {})

  return sink
}

test('the full loop produces the expected count, then the expected order', () => {
  const sink = runFullLoop(false)

  // **The count first.** An empty stream is trivially complete and ordered.
  assert.equal(
    sink.events.length,
    SEQUENCE.length,
    `expected ${SEQUENCE.length} events, got ${sink.events.length}`,
  )

  assert.deepEqual(
    sink.events.map((e) => e.name),
    [...SEQUENCE],
    'SITE-EVAL-037: missing event, or out-of-order emission',
  )
})

test('a loop that used a chip carries suggestion_selected, and only then', () => {
  const withChip = runFullLoop(true)
  assert.equal(withChip.events.length, SEQUENCE.length + 1)
  assert.ok(withChip.events.some((e) => e.name === 'suggestion_selected'))

  const without = runFullLoop(false)
  assert.ok(
    !without.events.some((e) => e.name === 'suggestion_selected'),
    '"where applicable" means it is absent when no chip was used',
  )
})

test('every event carries the render tier', () => {
  /*
   * §10.2's segmentation, and the thing SITE-EVAL-040's K-1 comparison rests
   * on. Asserted over the whole stream rather than on one event, because a
   * single event carrying it proves nothing about the fourteen that do not.
   */
  const sink = runFullLoop(true)
  assert.ok(sink.events.length > 0)
  for (const event of sink.events) {
    assert.equal(
      (event.properties as { tier?: string }).tier,
      'B',
      `${event.name} has no tier — it cannot be segmented, so it is missing from every funnel`,
    )
  }
})

/* ── SITE-EVAL-038 · branch and fallback events ──────────────────────────── */

test('each of the five fallback reasons fires with its own reason', () => {
  const sink = memorySink()
  const analytics = createAnalytics(sink, 'C')

  const reasons = ['timeout', 'invalid_schema', 'rate_limit', 'spend_cap', 'network_error'] as const
  for (const reason of reasons) analytics.track('plan_generation_fallback', { reason })

  assert.equal(sink.events.length, 5, 'count before properties')
  assert.deepEqual(
    sink.events.map((e) => (e.properties as { reason: string }).reason),
    [...reasons],
    'SITE-EVAL-038: a silent fallback with no event, or the wrong reason on one',
  )
  assert.equal(
    new Set(sink.events.map((e) => (e.properties as { reason: string }).reason)).size,
    5,
    'five distinct reasons, not one repeated — a catch-all would pass a single-case test',
  )
})

test('wall_dismissed carries dwell_ms', () => {
  const sink = memorySink()
  createAnalytics(sink, 'D').track('wall_dismissed', { dwell_ms: 3400 })

  assert.equal(sink.events.length, 1)
  assert.equal((sink.events[0]?.properties as { dwell_ms: number }).dwell_ms, 3400)
})

/* ── SITE-EVAL-039 · the guard's runtime half ────────────────────────────── */

test('a non-structural value drops the event rather than sending it', () => {
  /*
   * The compile-time half is `scripts/check-analytics-pii.mjs`, which compiles
   * a fixture that must fail. This is the half for a payload that arrived
   * through a cast or from a boundary the compiler never saw (§12.4: a property
   * asserted partly by a type is asserted explicitly, or it is not asserted).
   */
  const sink = memorySink()
  const analytics = createAnalytics(sink, 'A')

  const warn = console.warn
  console.warn = () => {}
  try {
    analytics.track('goal_submitted', {
      length: 20,
      input_class: 'actionable',
      has_deadline: false,
      leaked: 'finish my thesis',
    } as never)
  } finally {
    console.warn = warn
  }

  assert.equal(sink.events.length, 0, 'the event carried free-form text and must not have been sent')

  // The positive control: the same event without the leak does send.
  analytics.track('goal_submitted', { length: 20, input_class: 'actionable', has_deadline: false })
  assert.equal(sink.events.length, 1, 'the guard must not drop everything — that passes too')
})

test('analytics never throws into the loop', () => {
  /*
   * A throw inside `track` at the wall would take out the one screen that
   * converts. Dropping is silent to the visitor and visible in the funnel,
   * which is the right place for it to be loud.
   */
  const warn = console.warn
  console.warn = () => {}
  try {
    assert.doesNotThrow(() =>
      createAnalytics(NULL_SINK, 'A').track('wall_reached', { ms_since_submit: {} } as never),
    )
  } finally {
    console.warn = warn
  }
})

test('the default sink measures nothing, and says so in its name', () => {
  assert.equal(NULL_SINK.name, 'null')
  assert.doesNotThrow(() => createAnalytics(NULL_SINK, 'A').track('builder_engaged', {}))
})

/* ── The event names are not written twice ───────────────────────────────── */

test('nothing outside the schema hand-lists an event name', async () => {
  /*
   * A second list of event names is a second schema, and the two drift
   * silently: the funnel queries one and the site emits the other. The scan
   * looks for a file containing several names as string literals, which is what
   * a duplicate list looks like — one name in a `track` call is a call site.
   */
  const { readdirSync, readFileSync, statSync } = await import('node:fs')
  const { join } = await import('node:path')

  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry)
      return statSync(full).isDirectory() ? walk(full) : [full]
    })

  const files = ['lib', 'components', 'app', 'scripts']
    .flatMap(walk)
    .filter((f) => /\.(ts|tsx|mjs)$/.test(f))
    .filter((f) => f !== 'lib/analytics/events.ts' && !f.startsWith('tests'))

  assert.ok(files.length > 20, `only ${files.length} files scanned`)

  for (const file of files) {
    /*
     * **Call sites are removed before counting.** `components/builder.tsx`
     * legitimately names thirteen events, once each, in thirteen `track` calls
     * — that is the instrumentation, not a second schema. The first version of
     * this scan counted bare literals and flagged it, which is a check unable
     * to tell the thing it wants from the thing it forbids: had it shipped,
     * the only way past it would have been to exempt the one file that
     * actually emits events.
     *
     * What a duplicate schema looks like is names appearing *outside* a call —
     * in an array, a map, a switch — so those are what is left to count.
     *
     * `trackOnce(` is listed before `track(` because alternation is ordered
     * and `\btrack\(` does not match `trackOnce(` — the first version omitted
     * it and flagged the five one-shot events as a duplicate schema.
     *
     * `send(` is stripped for a different reason: the builder state machine has
     * its own vocabulary, and `activation_attempted` is a member of **both**
     * namespaces. That collision is meaningful rather than accidental — one
     * event names the attempt and the other records it — and neither is a copy
     * of the analytics schema. Comments go too, since a comment quoting a call
     * is documentation, and a scan that fires on its own documentation is
     * argued down the first time it fires.
     */
    const source = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ')
      .replace(/\b(?:trackOnce|track|send)\(\s*['"`][a-z_]+['"`]/g, 'call(')
    const named = (EVENT_NAMES as readonly EventName[]).filter((n) =>
      new RegExp(`['"\`]${n}['"\`]`).test(source),
    )
    assert.ok(
      named.length < 5,
      `${file} names ${named.length} event names as literals (${named.slice(0, 5).join(', ')}). ` +
        'That is a second copy of the schema, and two schemas drift silently.',
    )
  }
})
