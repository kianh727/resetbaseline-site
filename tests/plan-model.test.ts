/*
 * SITE-020 · The plan semantic model.
 *
 * Two kinds of test here, and the second is the one that matters.
 *
 * The first is ordinary: the structures behave, the window math handles a wrap
 * past midnight, the derived reads are stable.
 *
 * The second is a pair of **scans over the source**, because two of this
 * issue's constraints are about what the model does *not* contain, and a
 * constraint of that shape cannot be tested by exercising the code — there is
 * nothing to call. Both are held to the rule in PRD §0.3b: an assertion needs
 * two sources, and if naming the second means restating the first it is not
 * verification. So both scans write their list out from the governing document
 * rather than importing it from the code they are checking.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import {
  planDate,
  windowWraps,
  windowMinutes,
  occurrences,
  span,
  type Plan,
  type PlanNode,
  type Commitment,
  type Occurrence,
} from '../lib/plan/model.ts'

/* ------------------------------------------------------------------ *
 * Structure.
 * ------------------------------------------------------------------ */

test('planDate noon-anchors, so a DST transition cannot move the calendar day', () => {
  const d = planDate(2026, 2, 8)
  assert.equal(d.getFullYear(), 2026)
  assert.equal(d.getMonth(), 2)
  assert.equal(d.getDate(), 8)
  assert.equal(d.getHours(), 12)
  assert.equal(d.getMinutes(), 0)
})

test('a window inside one day does not wrap', () => {
  const w = { startMinute: 360, endMinute: 450 }
  assert.equal(windowWraps(w), false)
  assert.equal(windowMinutes(w), 90)
})

test('a window past midnight wraps, and its length counts through midnight', () => {
  const w = { startMinute: 1320, endMinute: 60 }
  assert.equal(windowWraps(w), true)
  assert.equal(windowMinutes(w), 180)
})

test('a zero-length window is legal and measures zero', () => {
  assert.equal(windowMinutes({ startMinute: 540, endMinute: 540 }), 0)
})

function occ(id: string, y: number, m: number, d: number): Occurrence {
  return { id, date: planDate(y, m, d), window: null }
}

function commitmentNode(id: string, os: readonly Occurrence[]): PlanNode<Commitment> {
  return {
    id,
    capability: 'from-the-contract',
    authority: 'from-the-contract',
    label: 'Thesis block',
    detail: { occurrences: os },
  }
}

test('occurrences across nodes come back in date order', () => {
  const plan: Plan = {
    title: 'Finish the thesis',
    deadline: planDate(2026, 4, 31),
    nodes: [
      commitmentNode('a', [occ('a2', 2026, 3, 10), occ('a1', 2026, 3, 1)]),
      commitmentNode('b', [occ('b1', 2026, 3, 5)]),
    ],
  }
  assert.deepEqual(
    occurrences(plan).map((o) => o.id),
    ['a1', 'b1', 'a2'],
  )
})

test('span reports first and last, and is null when nothing is dated', () => {
  const dated: Plan = {
    title: 'Finish the thesis',
    deadline: null,
    nodes: [commitmentNode('a', [occ('a1', 2026, 3, 1), occ('a2', 2026, 3, 10)])],
  }
  const s = span(dated)
  assert.notEqual(s, null)
  assert.equal(s?.first.getDate(), 1)
  assert.equal(s?.last.getDate(), 10)

  const empty: Plan = { title: 'Finish the thesis', deadline: null, nodes: [] }
  assert.equal(span(empty), null)
})

test('a plan whose only node is not a commitment has no occurrences and no span', () => {
  const plan: Plan = {
    title: 'Focus block',
    deadline: null,
    nodes: [
      {
        id: 't',
        capability: 'from-the-contract',
        authority: 'from-the-contract',
        label: 'Deep work',
        detail: { durationMinutes: 50 },
      },
    ],
  }
  assert.deepEqual(occurrences(plan), [])
  assert.equal(span(plan), null)
})

/* ------------------------------------------------------------------ *
 * Scan 1 — the model has not learned the metaphor.
 * ------------------------------------------------------------------ */

/**
 * Comments are stripped before scanning, and the carve-out is deliberate rather
 * than convenient: the prohibition is on the *model's vocabulary* — its type
 * names, field names and values — not on prose explaining the prohibition. A
 * scan that failed on the sentence stating the rule would be a ban catching its
 * own definition — the shape this repository has hit twice, most recently in
 * `check-divergences.mjs`.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
}

/**
 * Written out from the ruling and from PRD §10's ban list. **Not imported from
 * the model**, which is the point — a list derived from the file under test
 * agrees with it by construction (§0.3b).
 *
 * Two families:
 *
 * - **Spatial.** The visual language is unsettled and the ascending route is
 *   under review. §6's invariant holds only while the model has not learned the
 *   metaphor; once it has, a changed visual is a rewrite rather than an adapter
 *   swap.
 * - **Completion.** §10 bans progress and completeness meters outright, and §4
 *   — the section the PRD calls the most differentiating content on the site,
 *   which "cannot regress and cannot be wrong" — promises no streaks, no
 *   scores, no completeness meters. A model field is where that would leak in.
 */
const FOREIGN_TO_THE_MODEL: readonly string[] = [
  'elevation',
  'altitude',
  'summit',
  'peak',
  'ascent',
  'ascend',
  'climb',
  'route',
  'position',
  'coordinate',
  'anchor',
  'viewport',
  'pixel',
  'progress',
  'percent',
  'completeness',
  'completed',
  'streak',
  'score',
  'remaining',
  'ordinal',
]

test('the plan model contains no spatial or completion vocabulary', () => {
  const source = stripComments(readFileSync('lib/plan/model.ts', 'utf8')).toLowerCase()
  const found = FOREIGN_TO_THE_MODEL.filter((word) => source.includes(word))
  assert.deepEqual(
    found,
    [],
    `lib/plan/model.ts names ${found.join(', ')}. The model must not know a ` +
      'layout exists (SITE-020 non-goal) and must carry no completion concept ' +
      '(PRD §10, §4). Both belong to an adapter or to nothing.',
  )
})

test('the scan would catch a violation — negative control', () => {
  const planted = stripComments('export interface Node { readonly elevation: number }').toLowerCase()
  const found = FOREIGN_TO_THE_MODEL.filter((word) => planted.includes(word))
  assert.deepEqual(found, ['elevation'])
})

test('the scan reads code, not the comments that explain the rule — negative control', () => {
  const prose = stripComments('/* No elevation or progress enters this model. */ export const x = 1')
  assert.equal(/elevation|progress/i.test(prose), false)
})

/* ------------------------------------------------------------------ *
 * Scan 2 — nothing hand-lists the contract vocabulary.
 * ------------------------------------------------------------------ */

/**
 * PRD §6.2: the five `capability_type` values are **"generated from
 * `contracts-manifest.json`… derived, not hand-listed."** §6.3 gives the same
 * closed lists for `authority_tier`, the recorded outcomes and `belief_tier`.
 *
 * SITE-004 is blocked, so the derivation does not exist yet — which is exactly
 * when a hand-list gets written, by someone who needs the set today and means
 * to remove it later. This scan is what stops that, and it is the only thing
 * that can: a hand-list type-checks, passes every other test, and is invisible
 * until the app's vocabulary moves and the site keeps building anyway.
 *
 * The axes are written out here from §6.3's table. **Not imported from the
 * code under test** — a list derived from that code would agree with it by
 * construction (§0.3b).
 *
 * **What counts as a hand-list is two or more values from one axis**, not one.
 * The first version of this scan flagged `lib/builder/rows.ts`, which names
 * `'commitment'` as §3.4's transformation-block row key — a row label that
 * happens to share a word with a capability, not an enumeration of anything.
 * §6.2 forbids restating a *closed set*; one word is not a set, and a scan that
 * called it one would have been argued down the first time it fired, which is
 * how a check stops being trusted.
 *
 * Matching is on string literals only. The `Gate` interface in the model is a
 * shape, not a vocabulary entry, and a comment naming a tier is documentation.
 */
const CONTRACT_AXES: readonly (readonly [string, readonly string[]])[] = [
  ['capability_type', ['commitment', 'reminder', 'timer', 'gate', 'tracker']],
  ['authority_tier', ['auto', 'provisional', 'explicit']],
  ['outcome', ['complete', 'partial', 'missed', 'cancelled_intentionally', 'unknown']],
  ['belief_tier', ['hypothesis', 'pattern', 'observed_fact']],
]

function handListed(source: string): string[] {
  const hits: string[] = []
  for (const [axis, values] of CONTRACT_AXES) {
    const present = values.filter(
      (v) => source.includes(`'${v}'`) || source.includes(`"${v}"`),
    )
    if (present.length >= 2) hits.push(`${axis}: ${present.join(', ')}`)
  }
  return hits
}

/**
 * The one file the scan does not read, named explicitly rather than by
 * pattern.
 *
 * `lib/contracts/generated.ts` is the **output** of the derivation §6.2
 * requires. A scan that flagged it would ban the rule along with its
 * violation — the same shape the lavender check hit, where a check matching
 * its own sanctioned form catches its own definition. It is written by
 * `scripts/generate-contract-types.mjs` and nothing else, it says so in its
 * own header, and `scripts/check-generated-contracts.mjs` regenerates it in
 * memory from the manifest and fails the build on any difference. So its
 * contents are not a hand-list in the sense §6.2 forbids: they cannot be
 * edited and survive.
 *
 * **A pattern would be the wrong shape here.** `lib/contracts/**` or
 * `*generated*` would let any future file claim the exemption by being named
 * correctly, which is exactly how a hand-list gets written by someone who
 * needs the set today — the failure this scan exists to catch.
 *
 * `lib/plan/capabilities.ts` is the second entry and is a **weaker** case than
 * the first, which is why it is written down rather than waved through. It is a
 * real hand-list of two values, added because the builder *creates* objects and
 * so has nothing upstream to carry a capability from — the SITE-026 and
 * SITE-104 answer of "carry it through" has no source here.
 *
 * What justifies it is that both constants are **annotated with the contract
 * axis types**. Today those are opaque aliases and the annotation asserts
 * nothing; when SITE-004 narrows them to the generated union, **the compiler
 * checks these two lines against the manifest** and the file stops compiling if
 * the app's vocabulary no longer contains them. That is §6.6's *"a contract
 * change should break this build"*, arriving with the manifest at no cost.
 *
 * It is unverified until then, and that is stated rather than dressed up.
 *
 * `lib/render/layout-rules.ts` is deliberately **not** listed. Its keys are
 * identifiers, not string literals, so the scan does not match them; if that
 * ever changes it should fail and be looked at, not pre-exempted.
 */
const HAND_LIST_EXEMPT: readonly string[] = [
  /* Generated output. Regenerated and diffed by check-generated-contracts.mjs. */
  'lib/contracts/generated.ts',

  /*
   * **SITE-004.** A bounded exception, accepted 2026-09-22 (Kian) **as an
   * exception and not as a precedent** — the builder creates objects and has
   * nothing upstream to carry a capability from, which is the one position the
   * carry-it-through answer cannot reach.
   *
   * **This entry is deleted in the same commit that narrows the aliases.** It
   * is not a permanent second home for contract values: once
   * `contracts-manifest.json` lands and `CapabilityType` narrows to the
   * generated union, `capabilities.ts` is checked by the compiler against the
   * manifest and needs no exemption at all. The test below fails if the
   * manifest arrives and this line survives it.
   */
  'lib/plan/capabilities.ts',
]

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path))
    else if (/\.tsx?$/.test(path)) out.push(path)
  }
  return out
}

test('no source file hand-lists a contract vocabulary axis', () => {
  const offences: string[] = []
  for (const file of [...sourceFiles('lib'), ...sourceFiles('components'), ...sourceFiles('app')]) {
    if (HAND_LIST_EXEMPT.includes(file)) continue
    for (const hit of handListed(stripComments(readFileSync(file, 'utf8')))) {
      offences.push(`${file} — ${hit}`)
    }
  }
  assert.deepEqual(
    offences,
    [],
    `Contract vocabulary is hand-listed in ${offences.join(' · ')}. PRD §6.2 ` +
      'requires it generated from contracts-manifest.json, derived and not ' +
      'hand-listed. SITE-004 owns the generation.',
  )
})

test('the hand-list scan catches an enumerated axis — negative control', () => {
  assert.deepEqual(handListed("export type Cap = 'commitment' | 'reminder' | 'timer'"), [
    'capability_type: commitment, reminder, timer',
  ])
})

test('one shared word is not a hand-list — negative control', () => {
  assert.deepEqual(handListed("{ key: 'commitment', label: 'commitment' }"), [])
})

test('the hand-list exemption is two files, and each is named', () => {
  /*
   * An allowlist is a hole in the scan, and a hole that can grow silently is
   * the scan being switched off one entry at a time. Adding a path has to be a
   * deliberate edit to this assertion with a reason written next to it, not a
   * line in an array nobody reviews — which is what happened for the second
   * entry: the scan fired on `capabilities.ts`, correctly, and the exemption is
   * a recorded decision rather than a check being quieted.
   */
  assert.deepEqual(HAND_LIST_EXEMPT, [
    'lib/contracts/generated.ts',
    'lib/plan/capabilities.ts',
  ])
})

test('the capabilities exemption is deleted the moment SITE-004 lands', () => {
  /*
   * **The mechanism that stops a bounded exception becoming a permanent one.**
   *
   * A temporary allowlist entry has no expiry of its own: the reason it exists
   * stops being true silently, and afterwards a permanent hole is
   * indistinguishable from one somebody means to remove. Nothing in the tree
   * would have said otherwise — the exemption would simply keep working.
   *
   * So the expiry is asserted against the thing that ends it — and the thing
   * that ends it is the **narrowing**, not the manifest. Keyed on the manifest,
   * this guard demanded the exemption's removal the moment *any* file appeared
   * at that path, including a publish the site would refuse: the September
   * delivery carried none of the four vocabularies, `CapabilityType` did not
   * narrow, and the exemption was still load-bearing while this assertion said
   * to delete it. `lib/contracts/generated.ts` cannot exist unless the
   * vocabulary arrived, because `generate-contract-types.mjs` emits nothing at
   * all on a partial manifest. So its presence is the narrowing having
   * happened, which is the condition the exception was bounded by.
   *
   * While that file is absent, SITE-004 is open and the entry must be present;
   * once it exists, `CapabilityType` narrows, the compiler checks those two
   * values against the manifest, and the exemption is not merely unnecessary
   * but wrong — it would hide a real hand-list added later to the same file.
   *
   * Its two sources are the exemption list and the filesystem. Neither is
   * derived from the other (§0.3b), and the assertion inverts rather than
   * relaxing — there is no state in which it passes by having nothing to check.
   */
  const site004Open = !existsSync('lib/contracts/generated.ts')
  const exempt = HAND_LIST_EXEMPT.includes('lib/plan/capabilities.ts')

  if (site004Open) {
    assert.equal(
      exempt,
      true,
      'lib/plan/capabilities.ts must stay exempt while SITE-004 is open — the ' +
        'builder has nothing upstream to carry a capability from, and removing ' +
        'the exemption before the types are generated would only move the ' +
        'hand-list.',
    )
  } else {
    assert.equal(
      exempt,
      false,
      'lib/contracts/generated.ts exists, so CapabilityType narrows to the ' +
        'generated union and the compiler now checks lib/plan/capabilities.ts ' +
        'against the manifest. Delete its exemption in this commit: the ' +
        'exception was bounded by SITE-004 and SITE-004 is closed. Leaving it ' +
        'would hide the next hand-list added to that file.',
    )
  }
})

test('the capability seam names two values, not the closed set', () => {
  /*
   * §6.2 forbids restating the *closed set*. Two of five is a seam; five of
   * five is the set, and a file that grew to five would be the hand-list the
   * exemption was granted on the promise of not being. Counted from the file
   * rather than from the exports, so adding a sixth constant fails here even
   * if nothing imports it.
   */
  const source = readFileSync('lib/plan/capabilities.ts', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
  const values = new Set([...source.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]))
  assert.ok(
    values.size <= 4,
    `lib/plan/capabilities.ts names ${values.size} contract values: ` +
      `${[...values].join(', ')}. Two capabilities and two tiers is the seam; ` +
      'more is the closed set, which is what §6.2 forbids.',
  )
})

test('the exemption is inert until the generated file exists', () => {
  /*
   * SITE-004 has not landed. The entry is prep, not cover for anything
   * currently in the tree: if the file appeared by some other route, the
   * regeneration guard is what would catch it, and that guard is what this
   * exemption is justified by.
   *
   * The implication runs one way only, and the direction is the correction.
   * Generated types with no manifest are types nobody can regenerate — a
   * hand-list one build removed — so that state fails. A manifest with no
   * generated types is the *expected* state of a bad publish: the generator
   * refuses a partial vocabulary, so the file it would have written is absent
   * on purpose. Asserting the two land together made a refused delivery fail
   * this test, which is the check punishing the site for declining a manifest
   * it was right to decline.
   */
  if (existsSync('lib/contracts/generated.ts')) {
    assert.equal(
      existsSync('contracts-manifest.json'),
      true,
      'lib/contracts/generated.ts exists without contracts-manifest.json. The ' +
        'types are generated from the manifest, so without it they are a ' +
        'hand-list nobody can regenerate and the drift guard has no source.',
    )
  }
})

test('planDate takes a 0-indexed month, and that is pinned rather than assumed', () => {
  /*
   * The convention is `Date`'s: January is 0. Every production caller
   * round-trips `getMonth()`, so the indexing cancels and no behaviour depends
   * on it — which is exactly why it could be changed by someone who hit the
   * surprise once and "fixed" it, breaking every hand-written literal in the
   * dev review routes and in the download fixtures at the same time.
   *
   * Asserted against month names rather than against `getMonth()`, which would
   * compare the function to its own input (§0.3b).
   */
  assert.equal(planDate(2026, 0, 1).getMonth(), 0)
  assert.equal(planDate(2026, 4, 31).getDate(), 31)
  assert.equal(
    planDate(2026, 4, 31).toDateString().slice(4, 7),
    'May',
    'planDate month 4 must be May. If this fails the indexing was changed; ' +
      'every literal in app/**/page.dev.tsx and the download fixtures changes with it.',
  )
  /* The rollover that made the trap visible: June has thirty days. */
  assert.equal(planDate(2026, 5, 31).toDateString().slice(4, 7), 'Jul')
})
