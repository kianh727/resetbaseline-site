/*
 * The two contract values the builder must name, isolated to one file.
 *
 * **This is a hand-list, it is the thing §6.2 forbids, and it is here rather
 * than spread across the builder because one place that is wrong is fixable and
 * six are not.** It is the SITE-004 block showing through for the third time,
 * after SITE-026's tier half and SITE-104's Problem lines — and unlike those
 * two, it could not be solved by carrying a value through, because the builder
 * is where objects are *created* and there is nothing upstream to carry from.
 *
 * ---
 *
 * **What makes it survivable rather than a silent decoupling.**
 *
 * Both constants are annotated `CapabilityType` / `AuthorityTier`. Today those
 * are opaque aliases of `string`, so the annotation asserts nothing. **When
 * SITE-004 narrows them to the generated union, these two lines are checked
 * against the manifest by the compiler** — if the app's vocabulary moves and
 * `commitment` or `gate` is not in it, this file stops compiling, which is
 * exactly the *"a contract change should break this build"* §6.6 asks for.
 *
 * So the hand-list is **unverified today and contract-checked on arrival**, and
 * the arrival costs nothing: no call site changes, no value moves. That is a
 * materially different position from a hand-list scattered through components,
 * which would keep compiling forever because nothing would ever compare it to
 * anything.
 *
 * **It is not the full set, and must not become it.** Two values, the two the
 * builder creates. §6.2's prohibition is on restating the *closed set*; a file
 * that grew to five would be that set, and `tests/plan-model.test.ts` asserts
 * this file's exemption stays narrow.
 *
 * **The tier is the honest half.** `explicit` for the gate is stated outright
 * by §6.3a and SITE-040 — *"gate always renders `explicit`"* — so it is a
 * requirement rather than a guess. `provisional` for the commitment is
 * **carried, not derived**, exactly as the band carries it, and it becomes
 * SITE-026's pure function of capability when that function has a domain.
 */

import type { AuthorityTier, CapabilityType } from './model.ts'

/** The object a goal becomes. §6.1a: *"an intention with no occasion."* */
export const COMMITMENT: CapabilityType = 'commitment'

/** Protection over a window. §6.1a: *"cue-driven distraction survives intention."* */
export const GATE: CapabilityType = 'gate'

/**
 * SITE-040's accept, and the one tier value the PRD states rather than derives:
 * **the gate is always `explicit`.** A gate is a thing the person set up with
 * an OS permission prompt in front of it; there is no tier below that it could
 * honestly carry.
 */
export const GATE_TIER: AuthorityTier = 'explicit'

/**
 * The commitment's tier, **carried rather than derived** — SITE-026's
 * derivation is unbuilt because the manifest carries no `authority_tier` to
 * derive from, and a derivation written now would be a hand-list wearing a
 * function's clothes.
 */
export const COMMITMENT_TIER: AuthorityTier = 'provisional'
