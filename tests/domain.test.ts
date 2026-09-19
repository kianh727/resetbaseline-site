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
  ['', 'open'],
  ['   ', 'open'],
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
