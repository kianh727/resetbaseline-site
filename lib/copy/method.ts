/*
 * §6 Method — four principles, collapsed. SITE-072, P1.
 *
 * **Structure built, prose held.** v7.3 §2 keeps §6 at P1 and names it as four
 * principles collapsed by default; it does not write them. SITE-072 says the
 * copy is per §13 and audited against §19's bans, and no artifact in this tree
 * carries the four.
 *
 * **The collapsed state is the default and must be readable on its own** — that
 * is SITE-072's accept, and it is K-5 applied: if the four cannot be understood
 * without expanding, the disclosure is redesigned rather than the copy added
 * to. So each principle is a **title plus a one-line body**, both held, and the
 * expansion carries detail rather than meaning.
 *
 * **Does not describe capabilities.** SITE-072's non-goal is explicit: §6 is
 * method, and any claim about what the app does belongs to §2 and carries a
 * DS-18 verdict. The shape here cannot express one — there is no field for a
 * capability, a date or a status.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-072',
  source: 'v7.3 §2 names §6 as four principles, collapsed; the prose is unwritten',
  note:
    'The four slots, the collapsed-by-default disclosure and the read-on-its-own ' +
    'constraint are built; the sentences are SITE-072\'s and no session writes them.',
}

export interface Principle {
  /** Readable alone, in the collapsed state. Held. */
  readonly title: string | null
  /** One line, still collapsed. Held. */
  readonly summary: string | null
  /** Detail, on expansion. Adds detail, never meaning. Held. */
  readonly detail: string | null
}

/**
 * Four slots. **Exactly four**, because "four principles" is the specification
 * and a fifth would be a section nobody designed — a test asserts the count.
 *
 * Every field is `null`. A plausible sentence here ships: it looks like
 * finished work, every check passes on it, and §19's ban list is a word filter
 * that a well-written wrong sentence sails through.
 */
export const PRINCIPLES: readonly Principle[] = [
  { title: null, summary: null, detail: null },
  { title: null, summary: null, detail: null },
  { title: null, summary: null, detail: null },
  { title: null, summary: null, detail: null },
]

export const SECTION_HEADING: string | null = null
