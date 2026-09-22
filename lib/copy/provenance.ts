/*
 * Where every rendered sentence on this site came from, as data.
 *
 * **The problem this solves.** PRD §15.4 records the copy pass as the largest
 * unmitigated risk with no gate catching it, and §12.1's DS-18 requires every
 * line describing app behaviour to carry a verdict. Meanwhile most sections are
 * being built before `SITE-109`…`SITE-112` author their copy, so the tree will
 * hold two kinds of sentence at once: lines the PRD already verified and
 * carried verbatim, and lines standing in until their owning issue lands.
 *
 * **Those two are indistinguishable once they are in JSX**, which is exactly
 * how held copy ships by accident — nobody deletes a string that looks like
 * finished work. So copy does not live in JSX. It lives in one named constant
 * per section, and each constant declares which kind it is.
 *
 * Ruled 2026-09-21 (Kian): *"Placeholder copy lives in one named constant per
 * section, marked as the owning copy issue's. Never in JSX."* And: *"DS-18
 * applies to every line you ship as final. §3 and the wall copy pass because
 * the PRD already verified them; anything else you ship stays held."*
 *
 * `tests/copy-provenance.test.ts` enforces the shape: every module under
 * `lib/copy/` exports a `PROVENANCE`, a held one names its owning issue, and a
 * final one names the PRD section that verified it. A section whose copy is
 * silently promoted from held to final fails there rather than in review.
 */

/**
 * `final` — the PRD carries this text verbatim and has verified it. It ships.
 *
 * `held` — the text is standing in for copy an owning issue will author. It
 * renders, because an empty section cannot be reviewed for composition, but it
 * is not approved and the site does not launch on it.
 */
export type CopyStatus = 'final' | 'held'

export interface Provenance {
  readonly status: CopyStatus
  /** The PRD section this text is quoted from. Required either way. */
  readonly source: string
  /**
   * The issue that owns authoring the final text. **Required when `held`, and
   * absent when `final`** — a final block with an owner still open reads as
   * unfinished work marked done, and a held block with no owner is a line
   * nobody is coming back for.
   */
  readonly owner?: string
  /** Why this is held, or what verified it. One sentence. */
  readonly note: string
}

/**
 * Narrowing helper used by the tests and by nothing else.
 *
 * Deliberately enumerates the member it accepts rather than testing for the
 * one it rejects — §0.3e: a predicate defined by what a value is *not*
 * inherits every value added after it, which is the defect `isBounded` shipped
 * with for two answers and would have shipped with for three.
 */
export function isHeld(p: Provenance): boolean {
  return p.status === 'held'
}
