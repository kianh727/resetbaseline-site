/*
 * SITE-014 · Domain fixtures, and the structural parity check.
 *
 * The parity requirement is *"client and server classifiers produce identical
 * output for every fixture."* **That is asserted structurally, not
 * behaviourally.** There is one implementation; comparing it against itself
 * would be PRD §0.3b — a check whose input is derived from its own reference
 * cannot fail, and it would stay green through any divergence because there is
 * nothing to diverge. What can actually go wrong is someone writing a *second*
 * classifier for the server route, so that is what the test looks for.
 *
 * @implements SITE-EVAL-025
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  classifyDomain,
  applyEscalation,
  isBounded,
  BOUNDED_DOMAINS,
  type DomainTier,
} from '../lib/parse/domain.ts'

const FIXTURES: readonly (readonly [string, DomainTier])[] = [
  // injury
  ['I tweaked my back deadlifting, help me train around it', 'injury'],
  ['torn my ACL, want to stay fit', 'injury'],
  ['recovering from a sprained ankle', 'injury'],
  ['my shoulder injury keeps flaring up', 'injury'],
  ['I broke my wrist last month', 'injury'],
  ['pulled a hamstring sprinting', 'injury'],
  ['rotator cuff is bothering me', 'injury'],
  ['shin splints from running too much', 'injury'],
  ['physio said to take it easy', 'injury'],
  ['herniated disc, need a routine', 'injury'],
  ['plantar fasciitis is killing my runs', 'injury'],
  ['slipped disc recovery plan', 'injury'],
  ['strained my calf', 'injury'],
  ['rehab after knee surgery', 'injury'],
  ['fractured my foot', 'injury'],
  ['sciatica flare ups', 'injury'],
  // mental health
  ['I think I am depressed and want structure', 'mental_health'],
  ['my anxiety makes mornings hard', 'mental_health'],
  ['having panic attacks before work', 'mental_health'],
  ['I am burnt out and cannot start anything', 'mental_health'],
  ['want to be consistent with therapy', 'mental_health'],
  ['my therapist suggested a routine', 'mental_health'],
  ['managing my ADHD better', 'mental_health'],
  ['bipolar and need stability', 'mental_health'],
  ['struggling with an eating disorder', 'mental_health'],
  ['PTSD from last year', 'mental_health'],
  ['my OCD rituals eat my mornings', 'mental_health'],
  ['seeing a psychiatrist next week', 'mental_health'],
  ['mental health has been rough', 'mental_health'],
  ['feeling anxious constantly', 'mental_health'],
  // medical
  ['managing my diabetes better', 'medical'],
  ['recently diagnosed, need a routine', 'medical'],
  ['remembering to take my medication', 'medical'],
  ['my doctor wants me to exercise', 'medical'],
  ['recovering from surgery', 'medical'],
  ['chemo has wrecked my energy', 'medical'],
  ['keeping my blood pressure down', 'medical'],
  ['cholesterol is too high', 'medical'],
  ['thyroid issues', 'medical'],
  ['chronic fatigue management', 'medical'],
  ['migraines three times a week', 'medical'],
  ['my prescription schedule', 'medical'],
  ['pregnant and want a routine', 'medical'],
  ['cancer treatment starts Monday', 'medical'],
  ['tracking my seizures', 'medical'],
  ['autoimmune flare management', 'medical'],
  // finance
  ['pay off my credit card debt', 'finance'],
  ['I want to start investing', 'finance'],
  ['get my mortgage under control', 'finance'],
  ['saving for retirement', 'finance'],
  ['my student loans are crushing me', 'finance'],
  ['build a stock portfolio', 'finance'],
  ['crypto trading plan', 'finance'],
  ['filing my taxes on time', 'finance'],
  ['facing bankruptcy', 'finance'],
  ['improve my credit score', 'finance'],
  ['refinance the house', 'finance'],
  ['401k contributions', 'finance'],
  ['a payday loan spiral', 'finance'],
  ['collections agency keeps calling', 'finance'],
  // legal
  ['preparing for my custody hearing', 'legal'],
  ['going through a divorce', 'legal'],
  ['my lawyer needs documents', 'legal'],
  ['visa application deadlines', 'legal'],
  ['I am suing my old employer', 'legal'],
  ['court date next month', 'legal'],
  ['immigration paperwork', 'legal'],
  ['my landlord is trying to evict me', 'legal'],
  ['contract dispute with a client', 'legal'],
  ['I was charged with something', 'legal'],
  ['restraining order process', 'legal'],
  ['asylum application', 'legal'],
  ['on probation and need structure', 'legal'],
  ['settlement negotiation', 'legal'],
  // open — the cases that must NOT be bounded
  ['finish my thesis by May', 'open'],
  ['stop losing my mornings', 'open'],
  ['get back into the gym', 'open'],
  ['study for the LSAT', 'open'],
  ['read more books', 'open'],
  ['learn Spanish this year', 'open'],
  ['run a half marathon', 'open'],
  ['ship my side project', 'open'],
  ['wake up at six', 'open'],
  ['cook at home more', 'open'],
  ['practise guitar daily', 'open'],
  ['write every morning', 'open'],
  ['call my parents weekly', 'open'],
  ['stop doomscrolling', 'open'],
  ['train for a triathlon', 'open'],
  // Ruled 2026-09-19: input the classifier cannot assess is `unknown`, not a
  // clean bill of health. These two rows are what the ruling changed.
  ['', 'unknown'],
  ['   ', 'unknown'],
]

test('every fixture classifies as expected', () => {
  const wrong: string[] = []
  for (const [text, expected] of FIXTURES) {
    const actual = classifyDomain(text)
    if (actual !== expected) wrong.push(`"${text}" → ${actual}, expected ${expected}`)
  }
  assert.deepEqual(wrong, [])
})

test('the suite covers 80+ fixtures — SITE-014 accept', () => {
  assert.ok(FIXTURES.length >= 80, `only ${FIXTURES.length} fixtures`)
})

test('every bounded domain is represented, and so is open', () => {
  const seen = new Set(FIXTURES.map(([, tier]) => tier))
  for (const tier of [...BOUNDED_DOMAINS, 'open' as DomainTier]) {
    assert.ok(seen.has(tier), `no fixture covers ${tier}`)
  }
})

test('the open fixtures are a real control, not a token one', () => {
  /*
   * A classifier that returned `injury` for everything would pass a suite of
   * only bounded fixtures. The open set has to be big enough to catch that.
   */
  const open = FIXTURES.filter(([, t]) => t === 'open')
  assert.ok(open.length >= 15, `only ${open.length} open fixtures`)
})

test('injury wins over mental health when both could fire', () => {
  assert.equal(
    classifyDomain('I hurt my back and it is depressing me'),
    'injury',
    'the plan being asked for is around the injury; order is deliberate',
  )
})

test('word boundaries hold — no substring false positives', () => {
  assert.equal(classifyDomain('an illegally good pizza recipe'), 'open')
  assert.equal(classifyDomain('I want to sue-- no, to sew more'), 'legal', 'sue is present as a word')
  assert.equal(classifyDomain('sewing every weekend'), 'open')
  assert.equal(classifyDomain('taxing myself with hard workouts'), 'open', 'taxing is not tax')
})

test('the model may escalate to bounded, never de-escalate', () => {
  assert.equal(applyEscalation('open', 'injury'), 'injury', 'escalation allowed')
  assert.equal(applyEscalation('injury', 'open'), 'injury', 'de-escalation refused')
  assert.equal(applyEscalation('medical', 'open'), 'medical')
  assert.equal(applyEscalation('open', 'open'), 'open')
})

test('the model may not move one bounded tier to another', () => {
  /*
   * Allowing it would let the model choose which of the five authored refusals
   * a visitor sees, which is refusal-copy authority by another route.
   */
  assert.equal(applyEscalation('injury', 'finance'), 'injury')
  assert.equal(applyEscalation('legal', 'medical'), 'legal')
})

test('isBounded agrees with the declared set', () => {
  for (const tier of BOUNDED_DOMAINS) assert.equal(isBounded(tier), true)
  assert.equal(isBounded('open'), false)
  // The one that would have silently broken. `isBounded` read `tier !== 'open'`,
  // so the moment a third answer existed it was bounded — and `unknown` would
  // have rendered a refusal, with no line changed to cause it.
  assert.equal(isBounded('unknown'), false)
})

/*
 * The parity check. Structural on purpose — see this file's header.
 */
test('exactly one module classifies domains — the mirror cannot drift', () => {
  const ALLOWED = new Set(['lib/parse/domain.ts'])
  const offenders: string[] = []

  function scan(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) scan(full)
      else if (/\.(ts|tsx)$/.test(entry) && !ALLOWED.has(full)) {
        const src = readFileSync(full, 'utf8')
        /*
         * A second implementation is one that names the tiers itself. Importing
         * `classifyDomain` is the correct way to use it and is not a match.
         */
        if (/'mental_health'|"mental_health"/.test(src) && !src.includes("from '@/lib/parse/domain'") && !src.includes("from '../lib/parse/domain.ts'")) {
          offenders.push(full)
        }
      }
    }
  }
  for (const dir of ['app', 'lib', 'components']) {
    try {
      scan(dir)
    } catch {
      // Directory absent is fine; `lib` is asserted present below.
    }
  }
  assert.ok(readdirSync('lib').length > 0, 'lib must exist, or this scan checked nothing')
  assert.deepEqual(
    offenders,
    [],
    'a second classifier can drift from the first; import lib/parse/domain.ts instead',
  )
})


function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
}

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path))
    else if (/\.tsx?$/.test(path)) out.push(path)
  }
  return out
}


/* ------------------------------------------------------------------ *
 * `unknown` — the third answer. Ruled 2026-09-19 (Kian).
 * ------------------------------------------------------------------ */

test('input the classifier cannot assess returns unknown, not open', () => {
  // `open` is a positive verdict — not bounded, safe to plan normally. Issuing
  // it for input nobody read is a clean bill of health nobody signed.
  assert.equal(classifyDomain(''), 'unknown')
  assert.equal(classifyDomain('   '), 'unknown')
  assert.equal(classifyDomain('\t\n'), 'unknown')
  assert.equal(classifyDomain(undefined as unknown as string), 'unknown')
  assert.equal(classifyDomain(null as unknown as string), 'unknown')
  assert.equal(classifyDomain(42 as unknown as string), 'unknown')
})

test('unknown is neither bounded nor open', () => {
  // The distinction is the point. A test asserting only "not bounded" would
  // pass if unknown were an alias for open, which is the thing being removed.
  assert.equal(isBounded('unknown'), false)
  assert.notEqual(classifyDomain(''), 'open')
})

test('the model cannot escalate or de-escalate unknown', () => {
  // Turning input the classifier could not read into a verdict is the model
  // deciding what a refusal applies to — refusal authority by another route.
  for (const suggestion of [...BOUNDED_DOMAINS, 'open' as DomainTier, 'unknown' as DomainTier]) {
    assert.equal(applyEscalation('unknown', suggestion), 'unknown', String(suggestion))
  }
})

test('an assessed goal with no bounded signal is open — a verdict, not a fallback', () => {
  /*
   * Ruled 2026-09-19, then corrected the same day. A classifier that ran and
   * matched no bounded domain **has said something**; one that never ran has
   * said nothing. The first ruling named the fallback after the verdict and
   * collapsed them.
   *
   * Ten of ten ordinary goals landing here is what a working classifier looks
   * like, not a gap in one — so this test asserts the count as well as the
   * value. A version asserting only `!== 'unknown'` would pass on a classifier
   * that returned a bounded tier for everything.
   */
  const goals = [
    'finish my thesis',
    'run a marathon',
    'learn spanish',
    'ship the redesign',
    'read more',
    'wake up at 6',
    'write every morning',
    'study for the LSAT',
    'call my parents weekly',
    'train for a triathlon',
  ]
  const verdicts = goals.map((g) => classifyDomain(g))
  assert.equal(verdicts.filter((v) => v === 'open').length, goals.length)
  assert.equal(verdicts.filter((v) => v === 'unknown').length, 0)
})

test('positive control — the unknown path is exercised, not merely declared', () => {
  /*
   * **`unknown` is unreachable through the only production call site**, because
   * `classifyInput` tests readability before domain. That is correct — the value
   * is for callers that do not readability-gate first, SITE-033's server mirror
   * above all — but it means its handling is **code nobody has run**, which is
   * worse than a value that simply cannot occur.
   *
   * So the path is driven directly here, against a constructed `unknown`, before
   * SITE-033 makes it reachable in production. Every branch that can see a tier
   * is exercised: the predicates, the escalation seam, and the bounded set.
   */
  const constructed: DomainTier = classifyDomain('')
  assert.equal(constructed, 'unknown', 'the fixture must actually be unknown')

  // Predicates
  assert.equal(isBounded(constructed), false)
  assert.equal(BOUNDED_DOMAINS.includes(constructed), false)

  // The escalation seam, over every suggestion the model could make
  for (const suggestion of [...BOUNDED_DOMAINS, 'open' as DomainTier, 'unknown' as DomainTier]) {
    assert.equal(applyEscalation(constructed, suggestion), 'unknown', String(suggestion))
  }

  // And it is not silently equal to the permissive verdict, which is the whole
  // point of the value existing.
  assert.notEqual(constructed, 'open')
})

test('no caller treats unknown as open', () => {
  /*
   * The scan, not the convention. "Handle it explicitly" is exactly the
   * instruction that decays — it is followed by whoever read it and by nobody
   * afterwards, and the failure is silent because collapsing unknown into open
   * type-checks and passes every behavioural test.
   *
   * What it looks for is the two shapes that collapse the distinction:
   * comparing a tier against `'open'` to mean "not bounded", and defaulting a
   * tier to `'open'`. Both are how a third value gets quietly absorbed.
   */
  const offences: string[] = []
  for (const file of [...sourceFiles('lib'), ...sourceFiles('components'), ...sourceFiles('app')]) {
    if (file === 'lib/parse/domain.ts') continue
    const source = stripComments(readFileSync(file, 'utf8'))
    if (/!==\s*'open'|===\s*'open'/.test(source)) {
      offences.push(`${file}: compares a tier against 'open'`)
    }
    if (/\?\?\s*'open'|\|\|\s*'open'|=\s*'open'/.test(source)) {
      offences.push(`${file}: defaults a tier to 'open'`)
    }
  }
  assert.deepEqual(
    offences,
    [],
    `${offences.join(', ')}. \`open\` is a verdict and \`unknown\` is the absence ` +
      `of one; use isBounded() or isUnknown() rather than comparing to 'open'.`,
  )
})

test('the caller scan catches a collapse — negative control', () => {
  const planted = stripComments("const safe = tier !== 'open' ? refuse() : proceed()")
  assert.equal(/!==\s*'open'|===\s*'open'/.test(planted), true)
})
