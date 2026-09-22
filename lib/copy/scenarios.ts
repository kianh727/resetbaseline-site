/*
 * SITE-028 · The five authored scenarios — structure built, copy held.
 *
 * The decomposition names five by archetype and by the behaviour each exists to
 * demonstrate: `thesis` (veto) · `gym` (refusal) · `lsat` (timer) · `mornings`
 * (gate-first) · `back` (long-horizon). **Those five names and those five
 * behaviours are the specification and are built here.** The sentences are not:
 * no artifact in this tree carries them, v7.3 has no §5 archetype section — the
 * decomposition's `*PRD* §5` cites v5's numbering — and §1 declares v5
 * superseded.
 *
 * **So the structure is real and the prose is `null`.** A scenario carries its
 * archetype, its signature behaviour, the window its shape implies, and the
 * keywords that match it. It carries no title until `SITE-028` writes one.
 *
 * **This is the shape that makes dropping copy in a content change.** Every
 * consumer already handles `title: null` — it is §6.4's documented path, where
 * *"the build proceeds on the original input"* and the plan is labelled with
 * the visitor's own sentence. Nothing downstream learns anything new when the
 * strings arrive; a field stops being null.
 *
 * **What is deliberately not here: a stand-in title.** A plausible sentence in
 * this file ships, because it looks like finished work and every check would
 * pass on it. The visitor currently sees their own words, which is honest; a
 * written-to-be-replaced title is the site paraphrasing someone back to
 * themselves in a sentence nobody approved.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-028',
  source: 'Decomposition SITE-028 names the five archetypes and their behaviours',
  note:
    'The five archetypes, their signature behaviours and their matching are ' +
    'built; the titles are null until SITE-028 authors them, and null is ' +
    "§6.4's documented path rather than a gap.",
}

/** What each scenario exists to demonstrate. One each, and no two alike. */
export type SignatureBehaviour = 'veto' | 'refusal' | 'timer' | 'gate_first' | 'long_horizon'

export interface Scenario {
  readonly id: string
  readonly behaviour: SignatureBehaviour
  /** The window id its shape implies — a member of `WINDOW_OPTIONS`. */
  readonly windowId: string
  /** Lowercase stems matched against the visitor's own words. */
  readonly keywords: readonly string[]
  /** **Null until SITE-028.** Never a stand-in. */
  readonly title: string | null
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'thesis',
    behaviour: 'veto',
    windowId: 'morning',
    keywords: ['thesis', 'dissertation', 'chapter', 'draft', 'write', 'paper'],
    title: null,
  },
  {
    id: 'gym',
    behaviour: 'refusal',
    windowId: 'early',
    keywords: ['gym', 'lift', 'workout', 'train', 'run', 'fitness'],
    title: null,
  },
  {
    id: 'lsat',
    behaviour: 'timer',
    windowId: 'afternoon',
    keywords: ['lsat', 'exam', 'study', 'test', 'revise', 'gre', 'mcat'],
    title: null,
  },
  {
    id: 'mornings',
    behaviour: 'gate_first',
    windowId: 'early',
    keywords: ['morning', 'phone', 'scroll', 'wake', 'routine', 'distract'],
    title: null,
  },
  {
    id: 'back',
    behaviour: 'long_horizon',
    windowId: 'evening',
    keywords: ['back', 'knee', 'injury', 'recover', 'physio', 'rehab'],
    title: null,
  },
]

/** The scenario an unmatched goal falls to. Recorded as a choice, not a default. */
export const DEFAULT_SCENARIO_ID = 'thesis'
