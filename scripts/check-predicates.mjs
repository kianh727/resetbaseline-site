/*
 * A predicate over a closed set enumerates what it accepts — PRD v7.3 §0.3e.
 *
 * `isBounded` read `return tier !== 'open'`. Correct while `DomainTier` had two
 * kinds of member, **wrong the instant a third existed**: `isBounded('unknown')`
 * returned `true`, so input the classifier never read would have rendered a
 * refusal — with **no line changed to cause it**. The defect was written months
 * before the value that triggered it.
 *
 * **A predicate defined by what a value is *not* inherits every value added
 * after it.** The negative form asserts a closed set the author had in mind and
 * the type never recorded, and every later member joins the accepting branch by
 * default.
 *
 * ---
 *
 * **What this scans for, and the honest limit of it.**
 *
 * It finds `!==` and `===` comparisons against a **single member of one of
 * §6.3's closed vocabularies**. That is where the shape is both dangerous and
 * findable: those sets are contract-derived, they grow, and a comparison against
 * one member standing in for "all the others" is the exact construction that
 * broke.
 *
 * It does **not** detect the shape in general — a predicate over an
 * undocumented set, or one written as a switch with a default, is the same
 * defect and is not text-matchable. This is a scan over one known-dangerous
 * spelling, not a soundness claim, and saying so is the point: a check whose
 * limits are unstated gets trusted past them.
 *
 * **Equality against a single member is not always wrong** — `kind === 'window'`
 * asks a genuine question about one value. What is wrong is using it as a
 * *membership test for the rest*, and that intent is not in the syntax. So the
 * scan reports and an allowlist records each reviewed use, which makes the
 * question unskippable rather than answering it.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SOURCE_DIRS = ['app', 'components', 'lib']

/**
 * §6.3's closed vocabularies, written out from the PRD's table rather than
 * imported. Importing would make the scan a pure function of the code it checks
 * (§0.3b) — it would agree with whatever the source happened to declare.
 */
const CLOSED_SET_MEMBERS = [
  // capability_type
  'commitment', 'reminder', 'timer', 'gate', 'tracker',
  // authority_tier
  'auto', 'provisional', 'explicit',
  // domain tiers — the set this rule was learned on
  'open', 'unknown', 'injury', 'medical', 'mental_health', 'finance', 'legal',
  // belief_tier
  'hypothesis', 'pattern', 'observed_fact',
]

/**
 * Reviewed comparisons, each with the reason it asks a real question about one
 * value rather than standing in for membership in the rest.
 */
const ALLOWED = new Map([
  [
    "lib/render/bands.ts:kind === 'window'",
    'asks which of two band kinds this is; not a membership test',
  ],
])

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
}

function sourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (/\.tsx?$/.test(entry)) acc.push(full)
  }
  return acc
}

const members = CLOSED_SET_MEMBERS.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
const NEGATIVE = new RegExp(String.raw`!==\s*['"](${members})['"]`, 'g')

const offences = []
for (const dir of SOURCE_DIRS) {
  for (const file of sourceFiles(dir)) {
    const source = stripComments(readFileSync(file, 'utf8'))
    for (const hit of source.matchAll(NEGATIVE)) {
      const key = `${file}:${hit[0]}`
      if (!ALLOWED.has(key)) offences.push(key)
    }
  }
}

if (offences.length > 0) {
  console.error('predicates: a closed-set member is being compared with !==.\n')
  for (const o of offences) console.error(`  ${o}`)
  console.error(
    '\nPRD v7.3 §0.3e: a predicate defined by what a value is NOT inherits every\n' +
      'value added after it. Enumerate the members you accept —\n' +
      '  BOUNDED_DOMAINS.includes(tier)   not   tier !== \'open\'\n' +
      'If this genuinely asks about one value rather than testing membership in\n' +
      'the rest, add it to ALLOWED in scripts/check-predicates.mjs with the reason.',
  )
  process.exit(1)
}

console.log(`predicates: no closed-set member used as a negative membership test.`)
