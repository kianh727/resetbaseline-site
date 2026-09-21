/*
 * SITE-043 / SITE-105 · The wall, and its submitted state.
 *
 * **FINAL.** PRD v7.3 §11.5, amended 2026-09-21 (Kian). That subsection
 * supersedes v5 §11.2's boundary copy and carries the submitted state with it,
 * which is why both live in this one module: they are one spec.
 *
 * ---
 *
 * **Two rules from §11.5 that bind every future revision of these lines.**
 *
 * **1. Name the parts.** *"Your plan is saved"* asks someone to fear losing **a
 * concept**, and nobody fears losing a concept. *"The goal, the schedule, the
 * apps you named"* is an object with contents — three things they produced in
 * the last thirty seconds. **Any rewrite that collapses the contents back into
 * an abstraction has removed the mechanism, however much better it reads.**
 * This is the one line on the site where concision is the wrong instinct.
 *
 * **2. "Free and small", never "letting people in slowly."** There is no
 * admissions gate, so *slowly* is invented scarcity — and **§0.1 does not stop
 * at capability claims.** A launch-state principle that polices what the
 * product can do while permitting a fabricated constraint on who can have it is
 * policing the easy half. If a real cohort limit is ever set, the line may
 * state the number; a number that is true is a fact rather than scarcity
 * language, and it is the only other form this line may take.
 *
 * **§6.3a stands and is not strained by any of this.** *"The apps you named"*
 * is correct for the same reason it is correct in §3.2 Block 1: the person
 * named them and Baseline did not read them. No app is named here.
 *
 * **DS-8 binds the second line.** *"Gates run on your phone. A browser can't
 * hold one."* is the whole screen — a boundary stated, not implied, and never
 * fake-activated.
 *
 * ---
 *
 * **How this spec came to be an amendment rather than invented copy**, recorded
 * because the failure mode is worth keeping. The first version of it was inside
 * a v7.3 paste refused under §1 — the paste came from a divergent base and
 * applying it would have reverted a day of rulings — and it was never re-sent.
 * This session then declined to write the wall from a half-remembered citation
 * of it and built v5 §11.2 verbatim instead. **A spec that lives only in a
 * message is lost the moment the message is refused**, which is why it is now
 * in the PRD.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'final',
  source: 'PRD v7.3 §11.5, amended 2026-09-21',
  note:
    'Both the boundary copy and the submitted state are one spec at §11.5, ' +
    'which supersedes v5 §11.2. Two rules bind every revision: name the parts, ' +
    'and no invented scarcity.',
}

/* ------------------------------------------------------------------ *
 * The wall.
 * ------------------------------------------------------------------ */

export const WALL_HEADING = 'This is where the website ends.'

/**
 * Three lines, kept as three. They are separate paragraphs in §11.5 and each
 * does a different job — the boundary, the inventory, the offer — so joining
 * them into one block would lose the beat the second line depends on.
 */
export const WALL_LINES: readonly string[] = [
  "Gates run on your phone. A browser can't hold one.",

  /*
   * The named-parts line. See rule 1 in the header before touching it: the
   * contents are the mechanism, and shortening this is the specific way it
   * breaks.
   */
  'What you just built is saved — the goal, the schedule, the apps you named. ' +
    "Leave an email and it's waiting when your invite lands.",

  /* Rule 2. "Free and small", never "letting people in slowly". */
  'The beta is free and small.',
]

/* ------------------------------------------------------------------ *
 * The submitted state.
 * ------------------------------------------------------------------ */

export const SUBMITTED_HEADING = "You're on the list."

/**
 * SITE-105's handoff line, and §11.5 settles where it goes: **the submitted
 * state, because an instruction is for someone who has already said yes.**
 * Before submit it is a condition attached to an offer nobody has accepted.
 *
 * **Conditional on the §15.2 read** (§6.1b): if a new account cannot create a
 * gate at all on day one, the builder's fourth beat is cut and the wall moves
 * to a timer or reminder. That read has not reported, and SITE-105's non-goal
 * says not to build against the alternative until it does.
 */
export const SUBMITTED_LINES: readonly string[] = [
  'Your plan is saved.',
  "When you get in, you'll set the blocking up yourself — Baseline won't do it " +
    'for you on day one.',
]

/**
 * §11.5's submitted state carries this control.
 *
 * **Note the asymmetry with the wall's named-parts line, which §11.5 calls
 * deliberate.** The wall names the parts because the visitor is being asked to
 * give something up; the submitted state says *"your plan is saved"* because
 * they already have, and repeating the inventory after the decision is
 * reassurance rather than mechanism. Do not "fix" the inconsistency.
 */
export const DOWNLOAD_LABEL = 'Download your plan'

export const SUBMIT_LABEL = 'Save my plan'

export const EMAIL_LABEL = 'Email'
