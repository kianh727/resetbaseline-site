/*
 * §5 Day 1 → Day 30 — SITE-073, P1, and gated beyond that.
 *
 * **Gated by §15.1, not only held.** *"§5 Day 1 → Day 30 needs its own DS-18
 * verdict at P1. It describes a plan adapting over thirty days, which needs the
 * same accumulated history §4 needs."* So a verdict for §4 does not carry it,
 * and the gate is recorded in `gates.ts` with that condition rather than as a
 * date.
 *
 * **What the section depicts is specified and is built; what it says is not.**
 * SITE-073's scope names four beats: the window shifts, a day drops, a gate
 * appears, and two occurrences resolve `unknown` without penalty. Those are
 * structure — they come out of the plan model — so they are here as data. The
 * labels are copy.
 *
 * **`unknown` without penalty is the load-bearing beat**, and it is why this
 * section is gated rather than merely unwritten: it depicts the product's
 * position on a resolution the visitor did not give, which is a claim about
 * behaviour and therefore DS-18's.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-073',
  source: 'Decomposition SITE-073 names the four beats; §15.1 gates the section',
  note:
    'The beats, the scrub and the reduced-motion toggle are built; the labels ' +
    'are held, and the section is additionally gated on a DS-18 verdict.',
}

/** The span the scrub covers. Structure, not copy. */
export const FIRST_DAY = 1
export const LAST_DAY = 30

export type BeatKind = 'window_shift' | 'day_dropped' | 'gate_appears' | 'unresolved'

export interface Beat {
  readonly kind: BeatKind
  /** Where in the span it lands. */
  readonly day: number
  /** What the section says about it. Held. */
  readonly label: string | null
}

/**
 * SITE-073's four beats, in the order the scrub reaches them.
 *
 * **Four kinds, no two alike** — a test asserts that, because two beats sharing
 * a kind would mean one of them demonstrates nothing the other does not, which
 * is the SITE-EVAL-027 shape applied to a section instead of to scenarios.
 */
export const BEATS: readonly Beat[] = [
  { kind: 'window_shift', day: 6, label: null },
  { kind: 'day_dropped', day: 13, label: null },
  { kind: 'gate_appears', day: 19, label: null },
  { kind: 'unresolved', day: 26, label: null },
]

export const SECTION_HEADING: string | null = null
