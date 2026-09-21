/*
 * SITE-043 / SITE-105 · The wall.
 *
 * **FINAL.** The boundary copy is PRD v5 §11.2 verbatim, carried forward
 * unchanged by v7.3 §11's list — *"**The wall** (v5 §11)"*. Like the motion
 * config SITE-024 needed and the type table SITE-002 and SITE-003 needed, it is
 * a requirement **by explicit carry-forward** and is readable only from git
 * history (`9568a9a:docs/site-prd-v5.md`), because §1 keeps superseded PRDs out
 * of the working tree. That is the fourth time this has bitten; it is reported
 * in `CLAUDE.md` §12 and inlining it is a §10 amendment and Kian's.
 *
 * **One correction worth recording, because it could have produced invented
 * copy.** The instruction to build this said §11's copy included *"free and
 * small"* and a *named-parts line*. Neither is in v5 §11. *"The beta is free
 * and small"* is v7.3 §3.2 Block 3 — the §2 status section — and *"the apps you
 * named go quiet"* is §3.2 Block 1. Both belong to §2, which ships **held**
 * under `SITE-109`. Writing either into the wall would have been a session
 * authoring the site's conversion copy from a half-remembered citation, which
 * §5 puts outside anything a session does. The wall carries what v5 §11.2 says
 * and nothing else.
 *
 * **DS-8 binds every line here.** The site never implies a capability a browser
 * can activate, and never fake-activates. *"Gates run on your phone — a browser
 * can't hold one"* is the whole point of the screen: it is a boundary, not an
 * event.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'final',
  source: 'PRD v5 §11.2, carried forward by v7.3 §11 · SITE-105 for the handoff line',
  note:
    'Boundary copy verbatim from v5 §11.2, recovered from git history because ' +
    '§11 carries it forward by reference to a document §1 removes from the tree.',
}

/** v5 §11.2, verbatim. */
export const WALL_HEADING = 'This is where the website ends.'

/** v5 §11.2, verbatim. */
export const WALL_BODY =
  "Gates run on your phone — a browser can't hold one. Everything you just " +
  "built is saved. Add your email and it's waiting when your invite lands."

/**
 * SITE-105's handoff line, verbatim from the issue, shown **after submit only**.
 *
 * It closes the divergence R-2 found between the builder's four beats and
 * onboarding's three. Its accept is explicit that it is *"never before, and
 * never in place of the boundary copy"* — it is an instruction, not an apology,
 * and not a second boundary.
 *
 * **Conditional on the §15.2 read** (§6.1b): if a new account cannot create a
 * gate at all on day one, the builder's fourth beat is cut, protection leaves
 * the builder, and the wall moves to a timer or reminder. That read has not
 * reported. SITE-105's non-goal says not to build against the alternative until
 * it does, so this is built against the ruling as it stands.
 */
export const WALL_HANDOFF =
  "Your plan is saved. When you get in, you'll set the blocking up yourself — " +
  "Baseline won't do it for you on day one."
