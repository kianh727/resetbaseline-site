/*
 * SITE-045 / SITE-046 · the terminal action and the capture seam.
 *
 * **All three branches are built and the choice is injected**, which is
 * SITE-045's accept: *"switching config changes the branch with no code change
 * and no redeploy of components."* A hardcoded form is named as the non-goal.
 *
 * **The choice is unruled** (§15.3 item 3, and v5 §11.4 makes it depend on
 * StoreKit work tracked outside this repository), so `waitlist` is the default
 * — stated as a default rather than a decision. It is the only branch that is
 * true today: there is no TestFlight build to join and no App Store listing to
 * open, and a branch that sends someone to a store page that does not exist is
 * DS-8's failure one step removed from the site.
 *
 * ---
 *
 * **The submit path is a seam, for the same reason SP-05's generation is.**
 * `CaptureProvider` is injected rather than imported, so:
 *
 * - the wall makes **no network request of its own**, and cannot acquire one by
 *   someone adding a `fetch` to a component;
 * - a test drives a real submit without a server;
 * - SITE-046's write lands by passing a different provider, touching nothing
 *   in the UI.
 *
 * **§6 and §11.5: the capture system writes to the Supabase *staging* project,
 * never production.** No URL, key or project name appears in this file — the
 * seam takes a provider and the provider is configured where secrets are, by
 * environment variable name. Nothing here is hardcodeable into the wrong
 * project because nothing here knows what a project is.
 */

export type TerminalAction = 'waitlist' | 'testflight' | 'appstore'

/**
 * The branch that ships. Ruled nowhere, so this is the default and is labelled
 * as one — see the header for why `waitlist` is the only honest option today.
 */
export const TERMINAL_ACTION: TerminalAction = 'waitlist'

/**
 * What a submit carries. **Deliberately not the whole capture schema** — v5
 * §11.5's ten fields are SITE-046's, assembled where the plan lives. This is
 * the seam's payload, and it is the minimum the wall itself knows.
 */
export interface CaptureInput {
  readonly email: string
  readonly terminalAction: TerminalAction
}

export type CaptureResult = { readonly ok: true } | { readonly ok: false; readonly reason: string }

export interface CaptureProvider {
  submit(input: CaptureInput, signal: AbortSignal): Promise<CaptureResult>
}

/**
 * The provider in the tree today: it accepts and writes nothing.
 *
 * **It is not a stub pretending to work, and the distinction is the point.**
 * SITE-046 owns the write; until it lands there is no endpoint, and a provider
 * that posted to one would be inventing a destination. What this does is let
 * the submitted state be reached, reviewed and tested — and it is named so that
 * nobody reads a green submit as a stored record.
 *
 * It resolves rather than rejects because **the visitor is not the right person
 * to tell about an unbuilt backend.** §6.4's shape applies here too: no
 * user-visible error, no dead state. What the site must not do is claim more
 * than "we have it", and the submitted state says exactly that.
 */
export const NULL_CAPTURE: CaptureProvider = {
  async submit(): Promise<CaptureResult> {
    return { ok: true }
  },
}

/** A syntactic check only. Whether an address receives is not knowable here. */
export function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim()
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed) && trimmed.length <= 254
}
