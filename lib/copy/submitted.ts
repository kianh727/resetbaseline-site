/*
 * The wall's submitted state.
 *
 * **HELD — `SITE-109`'s.** v5 §11 specifies the wall's boundary copy and
 * SITE-105 specifies the handoff line shown after submit, and both are final
 * and live in `lib/copy/wall.ts`. **Neither specifies a confirmation**, so the
 * one line below is a stand-in.
 *
 * It is deliberately the flattest sentence that does the job. The submitted
 * state is the one moment on the site where a celebratory line would be easy
 * and wrong: nothing has happened yet from the visitor's side, and §11.3's
 * *"never fake-activate"* is about exactly this kind of overclaim one step
 * removed. SITE-105's own verify line — *"it must read as an instruction, not
 * an apology"* — sets the register for what sits next to it.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-109',
  source: 'No artifact specifies a confirmation line; v5 §11 and SITE-105 cover the rest',
  note:
    'The boundary copy and the handoff line are final and live in wall.ts. ' +
    'Only the confirmation is unwritten, and it is held rather than authored here.',
}

export const SUBMITTED_HEADING = "You're on the list."

export const SUBMIT_LABEL = 'Save my plan'

export const EMAIL_LABEL = 'Email'

/*
 * The email field carries a visible label, not a field hint. A hint disappears
 * the moment someone starts typing and is the one piece of form copy that
 * cannot be re-read — and Rejection 7 bans the word for the attribute besides.
 */
