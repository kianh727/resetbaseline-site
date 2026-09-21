/*
 * SITE-093 · §3 "What it won't do" — the four refusals.
 *
 * **FINAL.** PRD v7.3 §4 carries all four verbatim, and §4 states why they are
 * shippable today where nothing else is: the section *"needs no runtime"*, every
 * line is true by the **absence** of a mechanism, all four sit on the app's
 * explicit-cut list, and *"it cannot regress and it cannot be wrong."*
 *
 * That is the DS-18 verdict, and it is structural rather than a reading of the
 * build: there is no code path whose breakage could make "no streaks" false,
 * because there is no streak code. §12.1's requirement is met by the same fact
 * that makes the copy good.
 *
 * **"Silence is never failure" carries a nuance §4 states explicitly.** The
 * *absence of punishment* is true today; the *unknown state itself* requires
 * occurrences, which are job work. The line below is written to describe what
 * Baseline **won't do**, not what it records, so it stays true either way. Do
 * not tighten it into a claim about recording.
 *
 * **Non-goal, from SITE-093 and worth restating where it can be violated:** no
 * shame framing in the copy that names shame framing as the thing refused.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'final',
  source: 'PRD v7.3 §4',
  note:
    'Verbatim from §4, which verifies the section itself: every line is true ' +
    'by the absence of a mechanism, so it cannot regress and cannot be wrong.',
}

export interface Refusal {
  readonly heading: string
  readonly body: string
}

export const REFUSALS: readonly Refusal[] = [
  {
    heading: 'No streaks.',
    body: "A streak makes one bad Tuesday cost you three weeks. We don't keep them.",
  },
  {
    heading: 'No completeness meters.',
    body: 'There is no percentage. There is no bar to fill.',
  },
  {
    heading: 'Silence is never failure.',
    body:
      "If Baseline doesn't know whether you did something, it records that it " +
      "doesn't know. It will not guess, and it will not call it a miss.",
  },
  {
    heading: "It refuses what it shouldn't guess at.",
    body:
      'Injury, medical, legal, financial — it builds the path to real help ' +
      'instead of inventing an answer.',
  },
]
