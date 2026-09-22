/*
 * Sections that are built and do not ship yet, and what would let them.
 *
 * **§15.1 gates held content on evidence rather than on a date**, and the
 * distinction this file exists to keep is between *written but not approved*
 * (which `PROVENANCE` already carries) and *approved but not permitted*. A
 * section can have final copy and still be gated — §5 Day 1 → Day 30 is
 * exactly that case: §15.1 says it *"needs its own DS-18 verdict at P1"*
 * because it depicts a plan adapting over thirty days, which needs the same
 * accumulated history §4 needs.
 *
 * **It lives outside `lib/copy/` deliberately.** Every module in there is copy
 * and declares a `PROVENANCE`; this is a mechanism about sections, and adding
 * it to the copy test's exclusion list would have widened a list that exists to
 * have exactly one entry.
 *
 * **The gate is a boolean and a reason, and the reason is the point.** A flag
 * with no stated condition is a flag nobody knows how to clear, and it becomes
 * permanent the way a temporary allowlist entry does. Clearing one is a
 * content-and-flag change and nothing else: the component, its copy module and
 * its review route already exist.
 */

export interface SectionGate {
  /** False while the section is withheld. */
  readonly open: boolean
  /** What would open it. Required, and not a date. */
  readonly condition: string
  /** Where that condition is stated. */
  readonly source: string
}

export const SECTION_GATES: Readonly<Record<string, SectionGate>> = {
  /*
   * §6 is not gated by §15.1 — it is method rather than capability, and §15.1
   * gates claims about what the product does. It is held on **copy**, which is
   * `PROVENANCE`'s business, and it is off here only because shipping a P1
   * section into a P0 page before the P0 gate passes is what §3 forbids.
   */
  method: {
    open: false,
    condition:
      'P1 begins, which is after the P0 validation gate passes (SITE-060, SITE-061). ' +
      'The copy is SITE-072\'s and is not written.',
    source: 'CLAUDE.md §3; decomposition SITE-072',
  },

  dayThirty: {
    open: false,
    condition:
      'A DS-18 verdict of its own at P1. It depicts a plan adapting over thirty ' +
      'days, which needs the same accumulated history §4 needs — so a verdict ' +
      'for §4 does not carry it.',
    source: 'PRD v7.3 §15.1',
  },
}

/** Whether a section may render on the public site. */
export function sectionOpen(key: keyof typeof SECTION_GATES): boolean {
  return SECTION_GATES[key]?.open ?? false
}
