/*
 * SITE-051 / SITE-EVAL-039 · The PII guard, proven to reject.
 *
 * SITE-051's accept is *"attaching `raw_goal` or a commitment title to any
 * analytics event fails at compile time"*, and the eval's stub check is
 * explicit about why that needs its own script: **a compile-time rule with no
 * failing case rejects nothing, and its absence is indistinguishable from its
 * working.** A passing `tsc` over the project proves only that nobody has tried.
 *
 * So this compiles a fixture that *must* fail, and fails the build if it
 * **succeeds**. The interesting exit code is the inverted one.
 *
 * It also runs the payload half: a goal containing a person's name, a place and
 * a health term goes through the real client, and every emitted payload is
 * checked for any substring of it. The type covers code the compiler saw; the
 * scan covers a payload that arrived through a cast (§12.4).
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const FIXTURE = 'tests/fixtures/pii-negative.ts.fixture'

let failures = 0
const fail = (message) => {
  failures++
  process.stderr.write(`FAIL  ${message}\n`)
}

/* ── Part one: the fixture must not compile ──────────────────────────────── */

const dir = mkdtempSync(join(tmpdir(), 'pii-'))
try {
  const target = join(dir, 'pii-negative.ts')
  // Rewritten to absolute imports so the file resolves from the temp directory.
  const source = readFileSync(FIXTURE, 'utf8').replace(
    "'../../lib/analytics/client.ts'",
    `'${join(process.cwd(), 'lib/analytics/client.ts')}'`,
  )
  writeFileSync(target, source)

  /*
   * **Derived from the fixture, never a literal.** The first version required
   * five rejections against a fixture that made six attempts, so the one
   * attempt the guard did not catch — assigning through a variable, which
   * sidesteps TypeScript's excess-property check entirely — was invisible. A
   * threshold that does not move when the fixture grows is a threshold that
   * stops measuring the fixture.
   */
  const attempts = (source.match(/analytics\.track\(/g) ?? []).length
  if (attempts < 5) {
    fail(`the fixture makes only ${attempts} attempts — it should try several field names`)
  }

  let compiled = false
  let output = ''
  try {
    execFileSync(
      'npx',
      [
        'tsc', '--noEmit', '--strict', '--target', 'es2022', '--module', 'nodenext',
        '--moduleResolution', 'nodenext', '--allowImportingTsExtensions', target,
      ],
      { stdio: 'pipe', encoding: 'utf8' },
    )
    compiled = true
  } catch (error) {
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`
  }

  if (compiled) {
    fail(
      `${FIXTURE} compiled. The compile-time guard rejects nothing: free-form ` +
        'user text can be attached to an analytics event and typecheck will ' +
        'pass (SITE-051, SITE-EVAL-039).',
    )
  } else {
    /*
     * **Every attempt must be rejected, not just the first.** `tsc` reports all
     * of them, and a guard catching only `raw_goal` would reject attempt 1 and
     * accept the same text under `context` — which is the case the fixture
     * exists for.
     */
    const rejectedLines = new Set(
      [...output.matchAll(/pii-negative\.ts\((\d+),/g)].map((m) => Number(m[1])),
    )
    if (rejectedLines.size < attempts) {
      fail(
        `only ${rejectedLines.size} of the fixture's ${attempts} attempts were ` +
          'rejected. ' +
          'A guard that knows the field names somebody thought of catches ' +
          'those and nothing else.\n' +
          output.split('\n').slice(0, 12).join('\n'),
      )
    } else {
      process.stdout.write(
        `pii: the negative fixture fails to compile — all ${attempts} attempts ` +
          `rejected, on ${rejectedLines.size} lines.\n`,
      )
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true })
}

/* ── Part two: no payload contains any substring of the input ────────────── */

const { createAnalytics, memorySink } = await import('../lib/analytics/client.ts')

const GOAL = 'help Priya in Rotterdam recover from her knee surgery by December'
const sink = memorySink()
const analytics = createAnalytics(sink, 'B')

analytics.track('hero_view', { reduced_motion: false })
analytics.track('goal_submitted', {
  length: GOAL.length,
  input_class: 'bounded',
  has_deadline: true,
})
analytics.track('plan_generated', { node_count: 2, occurrence_count: 12, ms_to_plan: 340 })
analytics.track('protect_selected', { app_count: 3 })
analytics.track('plan_generation_fallback', { reason: 'timeout' })
analytics.track('wall_dismissed', { dwell_ms: 4200 })

if (sink.events.length !== 6) {
  fail(`only ${sink.events.length} events captured — the scan below would run on nothing`)
}

/*
 * Every word of the input, plus every substring of five or more characters.
 * Five because shorter runs collide with ordinary vocabulary — "her" and "in"
 * appear in property names — and a scan that flags those is a scan somebody
 * turns off.
 */
const needles = new Set()
for (const word of GOAL.toLowerCase().split(/\s+/)) {
  if (word.length >= 5) needles.add(word)
}
for (let i = 0; i + 5 <= GOAL.length; i++) needles.add(GOAL.toLowerCase().slice(i, i + 5))

if (needles.size < 20) fail(`only ${needles.size} needles built — the scan is not looking for much`)

const serialised = JSON.stringify(sink.events).toLowerCase()
for (const needle of needles) {
  if (serialised.includes(needle)) {
    fail(`an analytics payload contains "${needle}", which is a substring of the visitor's input`)
    break
  }
}

/* The positive control: the scan can find something when something is there. */
if (!JSON.stringify([{ properties: { x: GOAL } }]).toLowerCase().includes('rotterdam')) {
  fail('the substring scan cannot detect a leak it is shown — it proves nothing')
}

if (failures > 0) {
  process.stderr.write(`\n${failures} PII guard failure(s).\n`)
  process.exit(1)
}

process.stdout.write(`pii: ${sink.events.length} payloads, none containing any of ${needles.size} needles.\n`)
