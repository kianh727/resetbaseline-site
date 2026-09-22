/*
 * SITE-089…092 · §2 "Where Baseline is right now".
 *
 * **HELD — every string below is `SITE-109`'s to author.** The text is v7.3
 * §3.2's, used as the stand-in per the ruling of 2026-09-21 (Kian). §15.4 calls
 * §3.2's blocks *"specified structure with example text; not final prose"* and
 * puts them inside SITE-109, so shipping them as final would be a session
 * promoting example text to approved copy by leaving it alone.
 *
 * **What is not held is the structure**, and that is what these issues build:
 * three hairline-ruled blocks, technical-drawing metadata, a dated line at 11px,
 * no screenshots and no device frames anywhere (§3.3 — the default shield is
 * Apple's design and presenting it as Baseline's is the exact error this
 * section exists to prevent).
 *
 * **Block 2 ships with four entries, not five.** *"Export and delete"* is held:
 * DS-18a requires a real owning issue, v7.3 §8's identifier for it resolves in
 * Linear to a picker/app-group token-storage issue, and SITE-091 is explicit
 * that a wrong one fails the gate. The reference stays inert text until Kian
 * confirms it app-side — *"do not resolve it by picking a different number."*
 *
 * **The date is a committed constant, never `now()`** (SITE-089's accept). A
 * section that dates itself is always fresh and therefore never honest.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-109',
  source: 'PRD v7.3 §3.2, §3.3',
  note:
    '§15.4 calls §3.2 specified structure with example text, not final prose. ' +
    'The structure is built; every sentence waits on SITE-109.',
}

/**
 * §3.3: *"Dated, and updated in the same commit as any change to what's true."*
 *
 * A build-time constant on purpose. `new Date()` would make the section claim
 * freshness it has not earned — the date would advance on a deploy that changed
 * nothing, which is the one thing a status line must not do.
 */
export const STATUS_DATE = '2026-09-21'

/** §3.4's connective line from the wall. Held with the rest. */
export const CONNECTIVE_LINE = "You just built one. Here's where Baseline actually is."

export const SECTION_HEADING = 'Where Baseline is right now'

export const BLOCK_1_HEADING = 'What works today'

/**
 * Four claims. §3.2: *"every one true today. The first and fourth are true **by
 * absence** and cannot regress."*
 *
 * Line 3 names no app and must never name one (§6.3a, a MUST) — *"the apps you
 * named"* is correct precisely because the user named them and Baseline cannot
 * read them.
 */
export const BLOCK_1_LINES: readonly string[] = [
  "It doesn't wake you up to tell you about your day. No morning briefing, no " +
    'daily check-in, no notification asking how you’re feeling. That isn’t a ' +
    "feature we haven't gotten to — it's the design.",
  'You tell it what you want, in a sentence, and it builds the commitment and ' +
    'the schedule underneath it.',
  'At the time you set, the apps you named go quiet. Real blocking, through ' +
    'Screen Time, on your phone.',
  'There are no streaks, no scores, and no completeness meters. Nothing to ' +
    'break and nothing to fill.',
]

export const BLOCK_2_HEADING = "What we're building next"

export interface RoadmapEntry {
  readonly name: string
  /** One clause. §3.2: not features, not benefits, not copy. */
  readonly clause: string
}

/**
 * §10: an entry here may carry **no date, no quarter, and never the word
 * "soon"**, and must name a real owning issue. Four entries, not five — see the
 * module header on why *"export and delete"* is held.
 */
export const BLOCK_2_ENTRIES: readonly RoadmapEntry[] = [
  {
    name: 'The interception screen',
    clause:
      'when you reach for a blocked app, showing you the reason you wrote, in ' +
      "your words. The blocking works; this screen doesn't exist yet.",
  },
  {
    name: 'Occurrence generation',
    clause: "so a commitment produces the actual days it's made of.",
  },
  {
    name: 'Conversational resolution',
    clause: 'mentioning that you finished something, and having it count.',
  },
  {
    name: 'Proposals',
    clause: 'when it notices a pattern worth one question.',
  },
  {
    name: 'What Baseline knows',
    clause: 'the model it builds of you, visible and editable.',
  },
]

export const BLOCK_3_HEADING = "What you'd be joining"

export const BLOCK_3_BODY =
  "The beta is free and small. You'd be using something that's honest about " +
  "its own edges, and you'd have a say in what lands next."
