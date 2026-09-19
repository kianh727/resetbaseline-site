/*
 * The authored fallback content — PRD v7.3 §6.4, and the gap SITE-112 records.
 *
 * **§6.4 specifies a silent fallback to an authored question set, and that set
 * exists in no artifact.** Not in v7.3, not in the decomposition, not in any
 * superseded PRD. It is `SITE-112`, a PRD defect, and it is Kian's.
 *
 * **No session drafts it** — not as a stand-in and not as something to edit. A
 * draft written to be corrected reads later as a draft that was approved, and
 * these are the sentences the site asks a stranger about a goal they have not
 * explained yet.
 *
 * ---
 *
 * **So the set is empty, and the empty case is a defined state rather than a
 * dead one.** §6.4 already specifies what happens when the beat cannot run:
 * *"never blocks past 8s — on timeout the build proceeds on the original
 * input."* An empty authored set takes the same path. The visitor gets the plan
 * built from what they wrote, with no question and no error — which is the
 * honest outcome of a beat whose copy has not been written, and is exactly the
 * behaviour §6.4 already defines for the case where the question never arrives.
 *
 * **What is not honest, and is therefore not done here:** shipping a generic
 * question so the beat has something to render. §6.4's whole argument for
 * generating the question is that an authored one is keyword-selected and
 * demonstrates a form rather than *it asks once*. A single generic fallback
 * would be that failure with no keyword matching to excuse it.
 *
 * When SITE-112 lands, this constant gains its entries and nothing else changes:
 * the path is already built and tested against both the empty and non-empty
 * cases.
 */

import type { ClarificationQuestion } from './types.ts'

/**
 * The authored clarification set. **Empty pending SITE-112.**
 *
 * Typed rather than `never[]` so adding an entry needs no other edit, and so the
 * non-empty path is type-checked today rather than when the copy arrives.
 */
export const AUTHORED_CLARIFICATIONS: readonly ClarificationQuestion[] = []

/** Whether the beat can run from authored content at all. */
export function hasAuthoredClarification(): boolean {
  return AUTHORED_CLARIFICATIONS.length > 0
}
