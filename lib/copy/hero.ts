/*
 * SITE-007 · The hero headline, as one string in one place.
 *
 * **The H1 is not settled** (Kian, 2026-09-19). `"A HIGHER STANDARD"` is out —
 * it would fit a supplement brand. PRD §6.1a rules that the five primitives'
 * `Problem:` lines are sharper than anything else the site has, so the
 * candidates are in that register.
 *
 * Swapping the headline is changing `HEADLINE` below and nothing else. No
 * component names a candidate, no test asserts the current text, and the
 * string appears exactly once in the codebase — so the decision costs an
 * identifier, not a refactor.
 *
 * `CURRENT` is a rendering choice, **not the decision**. It is Kian's, and it
 * is recorded in CLAUDE.md §12 as open.
 */

import type { Provenance } from './provenance.ts'

/**
 * **HELD.** The three candidates are Kian's; which one ships is his decision
 * and it is open (`CLAUDE.md` §12). `CURRENT` selects one so the page renders
 * and can be reviewed — that is a rendering choice, not the decision, and no
 * component names a candidate and no test asserts the text, so making the
 * decision costs one identifier.
 */
export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-109 \u00b7 the choice between the three is Kian\u2019s',
  source: "Kian's three candidates; no artifact selects one",
  note:
    'The rendered candidate is the only one that answers "how is this ' +
    'different from writing my goal down?" in the headline itself, which is ' +
    'SITE-EVAL-002\u2019s question. Rendering it is not choosing it.',
}

export const HEADLINE_CANDIDATES = {
  /** The commitment primitive's Problem line, verbatim (§6.1a). */
  intention: 'An intention with no occasion.',

  /**
   * Separates Baseline from goal-setting — the visitor has already decided,
   * and what they lack is execution. Speaks to SITE-EVAL-002's differentiation
   * question rather than restating the goal.
   */
  after: 'You already decided. This is the part after.',

  /** The most product-descriptive: state intent once, the system executes. */
  once: 'Say it once. It runs without you.',
} as const

export type HeadlineKey = keyof typeof HEADLINE_CANDIDATES

/**
 * The candidate currently rendered. Change this one identifier to swap.
 *
 * `after` is rendered for now because it is the only one of the three that
 * answers *"how is this different from writing my goal down?"* in the headline
 * itself — SITE-EVAL-002's question, and the one a first-time visitor is most
 * likely to bring. That is a reason, not a verdict.
 */
export const CURRENT: HeadlineKey = 'after'

export const HEADLINE: string = HEADLINE_CANDIDATES[CURRENT]
