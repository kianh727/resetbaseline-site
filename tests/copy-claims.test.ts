/*
 * The claim evals — what the site says it can do, what it records, and what it
 * promises about the future.
 *
 * @implements SITE-EVAL-014
 * @implements SITE-EVAL-070
 * @implements SITE-EVAL-072
 * @implements SITE-EVAL-073
 *
 * These are scans rather than renders because each is a constraint about what
 * the tree does **not** contain, and a constraint of that shape cannot be
 * tested by calling anything.
 *
 * *Stub check* — every test asserts a non-trivial corpus before asserting
 * anything about it. "No banned implication anywhere" and "no post-V1 tier
 * mentioned" are both satisfied perfectly by a copy directory with nothing in
 * it, which is §0.3 with the copy as the missing thing.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const COPY_DIR = 'lib/copy'

function copyModules(): { file: string; source: string }[] {
  return readdirSync(COPY_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'provenance.ts')
    .map((file) => ({ file: join(COPY_DIR, file), source: readFileSync(join(COPY_DIR, file), 'utf8') }))
}

/** Only the strings, so a comment explaining a ban does not trip its own check. */
function renderedStrings(source: string): string[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  return [...withoutComments.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)]
    .map((m) => m[1] ?? m[2] ?? m[3] ?? '')
    .filter((s) => s.length > 3)
}

test('there is copy to check — counts before properties', () => {
  const modules = copyModules()
  assert.ok(modules.length >= 8, `only ${modules.length} copy modules — the scan is looking wrong`)

  const strings = modules.flatMap((m) => renderedStrings(m.source))
  assert.ok(strings.length >= 60, `only ${strings.length} strings extracted — nothing to check`)
})

/* ── SITE-EVAL-014 · Protect implies no browser capability ───────────────── */

test('no copy implies the browser is enforcing anything', () => {
  /*
   * DS-8: the site never implies a capability a browser cannot activate, and
   * never fake-activates. The eval names the list — "blocked", "now active",
   * "protection on", "enabled" — as **implications of active enforcement**, so
   * the patterns are about tense and state rather than about the words alone.
   * "Baseline blocks apps" describes the product; "3 apps blocked" next to a
   * control the visitor just used claims it happened.
   */
  const BANNED = [
    /\bnow (?:active|blocked|on|protected)\b/i,
    /\bprotection (?:is )?(?:on|active|enabled)\b/i,
    /\b(?:apps? )?(?:are|is) (?:now )?blocked\b/i,
    /\benforcement (?:is )?(?:on|active)\b/i,
    /\bsuccessfully (?:blocked|activated|enabled)\b/i,
    /\byou(?:'re| are) protected\b/i,
  ]

  const strings = copyModules().flatMap((m) =>
    renderedStrings(m.source).map((s) => ({ file: m.file, text: s })),
  )
  assert.ok(strings.length > 0)

  for (const { file, text } of strings) {
    for (const pattern of BANNED) {
      assert.doesNotMatch(
        text,
        pattern,
        `${file}: "${text}" implies active enforcement. A browser cannot hold a ` +
          'gate, and the wall exists because it cannot (DS-8).',
      )
    }
  }

  // Positive control: the scan can find the thing it looks for.
  assert.ok(BANNED.some((p) => p.test('3 apps are now blocked')), 'the patterns match nothing')
})

/* ── SITE-EVAL-070 · `rescheduled` displayed, never recorded ─────────────── */

test('`pending` never appears, and `rescheduled` is never a recorded outcome', () => {
  /*
   * §6.3 bans rendering `pending` outright. `rescheduled` is subtler and the
   * eval is explicit that **a blanket ban is the wrong reading**: it may appear
   * as a derived display state, never in the recorded set, which is exactly
   * `complete · partial · missed · cancelled_intentionally · unknown`.
   *
   * So this asserts the **recorded** set has no room for either — which is a
   * property of the model, not of the copy. `Occurrence` carries no outcome at
   * all (SITE-020), so the set cannot contain anything, and that is the
   * strongest form the assertion can take today.
   */
  const model = readFileSync('lib/plan/model.ts', 'utf8')
  assert.ok(model.length > 1000, 'the model file is missing or empty')

  const modelStrings = renderedStrings(model)
  for (const value of ['pending', 'rescheduled']) {
    assert.ok(
      !modelStrings.includes(value),
      `lib/plan/model.ts carries "${value}" as a value. The recorded set is ` +
        'exactly the five resolvable outcomes.',
    )
  }

  // And nothing rendered says `pending` at all (§6.3, outright).
  for (const { file, source } of copyModules()) {
    for (const text of renderedStrings(source)) {
      assert.doesNotMatch(text, /\bpending\b/i, `${file}: "${text}" renders "pending" (§6.3)`)
    }
  }
})

/* ── SITE-EVAL-072 · Roadmap entries owned and undated (DS-18a) ──────────── */

test('no roadmap entry carries a date, a quarter, or "soon"', async () => {
  const status = await import('../lib/copy/status.ts')
  const blocks = status as Record<string, unknown>

  const entries: string[] = []
  for (const value of Object.values(blocks)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') entries.push(item)
        else if (item && typeof item === 'object') {
          entries.push(...Object.values(item).filter((v): v is string => typeof v === 'string'))
        }
      }
    }
  }

  assert.ok(entries.length >= 5, `only ${entries.length} status entries — nothing to check`)

  for (const entry of entries) {
    assert.doesNotMatch(entry, /\bsoon\b/i, `"${entry}" says soon`)
    assert.doesNotMatch(entry, /\bQ[1-4]\b/, `"${entry}" names a quarter`)
    assert.doesNotMatch(entry, /\b20\d{2}\b/, `"${entry}" names a year`)
    assert.doesNotMatch(
      entry,
      /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
      `"${entry}" names a month`,
    )
    // Post-V1 tiers are banned outright, including from Block 2 (§10).
    assert.doesNotMatch(entry, /\bV1\.1\b|\bV2\b|\bpost-V1\b/i, `"${entry}" names a post-V1 tier`)
  }
})

/* ── SITE-EVAL-073 · The status section is dated from a constant ─────────── */

test('the status date is a committed constant, never a runtime clock', async () => {
  /*
   * A `new Date()` here would make §2 permanently "current" while saying
   * nothing — **a dated lie is more convincing than an undated one**, which is
   * the eval's own risk line. The date must move because somebody changed what
   * is true, in the same commit.
   */
  const raw = readFileSync('lib/copy/status.ts', 'utf8')
  assert.ok(raw.length > 500, 'status.ts is missing or empty')

  /*
   * **Comments stripped first.** `status.ts` documents why it is a constant —
   * *"`new Date()` would make the section claim…"* — and the first version of
   * this test fired on that sentence. A check that cannot tell the rule from
   * its explanation is the shape `check-lavender` and the duplicate-schema scan
   * both had to be narrowed out of; it is the third time in this branch.
   */
  const source = raw.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

  assert.doesNotMatch(source, /new Date\(\)/, 'the status date is computed from a runtime clock')
  assert.doesNotMatch(source, /Date\.now\(\)/, 'the status date is computed from a runtime clock')

  const status = (await import('../lib/copy/status.ts')) as Record<string, unknown>
  const dateLike = Object.entries(status).find(
    ([key, value]) => /date/i.test(key) && typeof value === 'string',
  )
  assert.ok(dateLike, 'status.ts exports no date constant, so §2 cannot render a dated line')
  assert.match(
    dateLike[1] as string,
    /\d/,
    `the status date "${String(dateLike[1])}" carries no digits`,
  )
})
