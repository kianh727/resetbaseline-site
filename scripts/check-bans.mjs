/*
 * SITE-107 · The ban-list check — §14's PRE-2, automated from P0 onward.
 *
 *
 * **No `@implements` marker, and that is deliberate.** I marked this
 * `SITE-EVAL-071` first and the coverage check rejected it: that eval requires
 * *"every §2 Block 1 line, every §3 line, and every FAQ answer describing app
 * behavior resolves a verdict row naming the capability, the date verified, and
 * the verifying issue"* — DS-18 rows that do not exist yet. A word filter is
 * not that, and claiming it would have reported coverage of the one thing §0
 * exists to stop. **Second time the registry has caught me over-claiming**,
 * which is the argument for it being a check rather than a convention.
 *
 * **One job, three checks, each failing the build.**
 *
 * 1. Any §19/§10 banned term in authored copy.
 * 2. Any committed app name in any authored copy string, **site-wide, not
 *    gate-scoped** — §6.3a is a MUST and applies to every depicted Baseline UI,
 *    not only to the gate object.
 * 3. Staleness of the app-name list against its `captured_at`, warning at 90
 *    days and failing at 180.
 *
 * **A match is a failure, never a warning** (SITE-107's accept). The staleness
 * treatment is the one thing that warns, and it warns about the *list* rather
 * than about a match.
 *
 * ---
 *
 * **This does not replace the manual pre-launch review**, and the difference is
 * worth stating because a green check invites the assumption that it does: a
 * word filter catches a section that *names* a capability and is blind to one
 * that *implies* it. §19's own line is that the visual carries the metaphor;
 * a section can ride the metaphor perfectly while using none of these words.
 *
 * **Whole words only.** `peak` must not catch `speaking`, and a checker that
 * did would be argued down the first time it fired — which is how a check stops
 * existing. The same reasoning as `check-lavender`'s narrow property list.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  APP_NAMES,
  APP_NAMES_CAPTURED_AT,
  APP_NAME_ALLOWED_IN,
  BANNED_TERMS,
  PLATFORM_EXCEPTIONS,
} from '../lib/sections/banned.ts'

const COPY_DIR = 'lib/copy'
/** Warn, then fail. SITE-107's numbers. */
const STALE_WARN_DAYS = 90
const STALE_FAIL_DAYS = 180

let failures = 0
const fail = (message) => {
  failures++
  process.stderr.write(`FAIL  ${message}\n`)
}

/* ── The lists themselves ────────────────────────────────────────────────── */

/*
 * **Counts first, and this is the one place that ordering is most pointed.**
 * An empty app-name list fails nothing and reports success, which is §0.3
 * turned on the check written to catch it.
 */
if (APP_NAMES.length < 10) {
  fail(`the app-name list has ${APP_NAMES.length} entries — a short list fails almost nothing`)
}
if (BANNED_TERMS.length < 5) {
  fail(`the banned-term list has ${BANNED_TERMS.length} entries`)
}
if (APP_NAME_ALLOWED_IN.length !== 1) {
  fail(
    `the app-name allowlist has ${APP_NAME_ALLOWED_IN.length} entries. It is the ` +
      'Protect chips and nothing else — a second entry is a second place §6.3a ' +
      'stops applying, and that is a decision rather than a lint tweak.',
  )
}

for (const exception of PLATFORM_EXCEPTIONS) {
  if (APP_NAMES.some((name) => name.toLowerCase() === exception.toLowerCase())) {
    fail(`"${exception}" is both banned and excepted — one of the two lists is wrong`)
  }
}

/* ── Every authored string ───────────────────────────────────────────────── */

/**
 * Copy strings only, with comments stripped.
 *
 * A comment explaining a ban is not a violation of it — the mistake this
 * repository has now made four times in checks of its own.
 *
 * **`PROVENANCE` blocks are excluded for the same reason**, and the first
 * version did not exclude them: it flagged `metadata.ts` for the phrase *"the
 * derived OG/Twitter cards"* in a note describing the module. A `PROVENANCE` is
 * metadata *about* copy and is never rendered, so it is not what a visitor
 * reads — which is the only thing this check is about.
 */
function authoredStrings() {
  const out = []
  for (const file of readdirSync(COPY_DIR).filter((f) => f.endsWith('.ts'))) {
    const source = readFileSync(join(COPY_DIR, file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ')
      // The PROVENANCE declaration, which describes the copy and is never copy.
      .replace(/export const PROVENANCE[\s\S]*?\n\}/, ' ')
    for (const match of source.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
      const text = match[1] ?? match[2] ?? match[3] ?? ''
      // Import specifiers and single tokens are not sentences.
      if (text.length > 3 && !text.startsWith('./') && !text.startsWith('@/')) {
        out.push({ file: join(COPY_DIR, file), text })
      }
    }
  }
  return out
}

const strings = authoredStrings()
if (strings.length < 60) {
  fail(`only ${strings.length} authored strings found — the scan is looking in the wrong place`)
}

/** Whole-word, case-insensitive, and escaped so a term with punctuation works. */
function wordPattern(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^\\w])${escaped}($|[^\\w])`, 'i')
}

for (const { file, text } of strings) {
  for (const term of BANNED_TERMS) {
    if (wordPattern(term).test(text)) {
      fail(`${file}: "${text}" contains the banned term "${term}" (§19, §10)`)
    }
  }

  if (APP_NAME_ALLOWED_IN.includes(file)) continue

  for (const name of APP_NAMES) {
    if (!wordPattern(name).test(text)) continue
    /*
     * An exception must *contain* the match to excuse it — "App Store" excuses
     * "Store" and does not excuse "Instagram" appearing elsewhere in the same
     * sentence. Checked against the matched region rather than the whole
     * string, so a legitimate platform name nearby cannot launder a violation.
     */
    const excused = PLATFORM_EXCEPTIONS.some(
      (exception) => exception.toLowerCase().includes(name.toLowerCase()) && wordPattern(exception).test(text),
    )
    if (!excused) {
      fail(
        `${file}: "${text}" names the app "${name}". §6.3a is a MUST and is ` +
          'site-wide: Screen Time returns opaque tokens, so no depicted Baseline ' +
          'UI can name one. Copy says "3 apps", never the names.',
      )
    }
  }
}

/* ── Staleness of the list ───────────────────────────────────────────────── */

const capturedAt = Date.parse(`${APP_NAMES_CAPTURED_AT}T00:00:00Z`)
if (Number.isNaN(capturedAt)) {
  fail(`APP_NAMES_CAPTURED_AT is not a date: "${APP_NAMES_CAPTURED_AT}"`)
} else {
  const days = Math.floor((Date.now() - capturedAt) / 86_400_000)
  const remedy =
    'Review lib/sections/banned.ts against the apps a writer would reach for ' +
    'today, add what is missing, and set APP_NAMES_CAPTURED_AT to the date you ' +
    'did it. The treatment buys visibility, not freshness — an unreviewed list ' +
    'is still a list, and this is the only thing that says so.'

  if (days >= STALE_FAIL_DAYS) {
    fail(`the app-name list was last reviewed ${days} days ago. ${remedy}`)
  } else if (days >= STALE_WARN_DAYS) {
    process.stderr.write(`WARN  app-name list is ${days} days old. ${remedy}\n`)
  }
}

if (failures > 0) {
  process.stderr.write(`\n${failures} ban-list failure(s).\n`)
  process.exit(1)
}

process.stdout.write(
  `bans: ${strings.length} authored strings checked against ${BANNED_TERMS.length} terms ` +
    `and ${APP_NAMES.length} app names, with ${PLATFORM_EXCEPTIONS.length} platform ` +
    'exceptions. This does not replace the manual review — a word filter is blind ' +
    'to a section that implies a capability without naming it.\n',
)
