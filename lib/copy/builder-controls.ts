/*
 * SP-06 and SP-07 · the tune and protect controls' own labels.
 *
 * **HELD — `SITE-110`'s** (builder copy). None of these strings is in v7.3.
 * §6.5 says the model selects *"one window selection from a closed set"* and
 * **no artifact enumerates that set**, which is the same shape as the
 * recurrence defect SITE-113 recorded — a closed set named precisely and never
 * written down. The difference is that the recurrence set is the model's and
 * had to be ruled before anything could be built; this one is **the visitor's**,
 * because tuning is fully local (§6.5, SITE-037) and the control *is* the
 * selection. So the options below are a provisional interaction call rather
 * than a blocked dependency, and they are held rather than final.
 *
 * **The app-name chips are the one place on this site that may name an app**,
 * and the decomposition says so explicitly: SITE-039's non-goal reads *"the
 * chips are the **site's own input affordance** and legitimately carry
 * recognisable names (v7.3 §6.3a); what they must not do is survive into the
 * assembled object."* v7.3 §6.3a agrees — *"the Protect step's named chips are
 * the site's own input affordance and stay — the user picks recognisable names,
 * and the object that lands shows what the app would show."*
 *
 * **The rule that matters is downstream of here, not here.** `Gate.appCount` is
 * a number, so an app name is not a thing the assembled object can express, and
 * `scripts/check-app-names.mjs` asserts none reaches the rendered plan. Naming
 * them on the chip is honest: the visitor is telling the site something, and
 * Screen Time's opacity is a fact about what *Baseline* can read back, not
 * about what a person can type.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-110',
  source: 'No artifact enumerates the window set or the chip labels',
  note:
    'Tuning is fully local, so the control is the selection rather than a ' +
    'model field — a provisional interaction call, not a blocked dependency.',
}

export interface WindowOption {
  readonly id: string
  readonly label: string
  readonly startMinute: number
  readonly endMinute: number
}

/**
 * Four windows. **Provisional, my call**, because §6.5 names a closed set and
 * no artifact contains one.
 *
 * Four rather than a time picker: §3's *"no completeness meters"* register is
 * one of restraint, and a free time picker turns the beat into data entry. Four
 * is also the most a segmented control holds at 375px without the labels
 * dropping below 11px, which §12.3a forbids.
 *
 * The evening window is deliberately **not** late-night. A site that proposes
 * midnight-to-2am as a working window is making a recommendation about someone's
 * sleep, which is exactly the kind of thing §4 refuses to guess at.
 */
export const WINDOW_OPTIONS: readonly WindowOption[] = [
  { id: 'early', label: 'Early', startMinute: 6 * 60, endMinute: 7 * 60 + 30 },
  { id: 'morning', label: 'Morning', startMinute: 9 * 60, endMinute: 10 * 60 + 30 },
  { id: 'afternoon', label: 'Afternoon', startMinute: 14 * 60, endMinute: 15 * 60 + 30 },
  { id: 'evening', label: 'Evening', startMinute: 19 * 60, endMinute: 20 * 60 + 30 },
]

/**
 * The window the plan starts on before the visitor touches anything.
 *
 * **A default is unavoidable here and is not the same shape as a recurrence
 * default.** §6.3c forbids falling through to `daily` because a frequency the
 * visitor did not state multiplies a plan they never agreed to. A window is
 * different: the plan has to render *somewhere* on the clock to be tunable at
 * all, the control shows which one is selected, and changing it is one tap. The
 * distinction is that a wrong frequency is invisible in the output and a wrong
 * window is the thing the control is pointing at.
 */
export const DEFAULT_WINDOW_ID = 'morning'

export const TIME_CONTROL_LABEL = 'When'
export const DAYS_CONTROL_LABEL = 'Which days'
export const PROTECT_CONTROL_LABEL = 'What goes quiet'

/**
 * Six chips (SITE-039). Recognisable names, because the visitor is naming them
 * — see the module header for why that does not touch §6.3a.
 */
export const APP_CHIPS: readonly string[] = [
  'Instagram',
  'TikTok',
  'X',
  'YouTube',
  'Reddit',
  'Messages',
]

/** One-letter day labels for the pills; the full name is the accessible name. */
export const DAY_INITIALS: Readonly<Record<string, string>> = {
  Monday: 'M',
  Tuesday: 'T',
  Wednesday: 'W',
  Thursday: 'T',
  Friday: 'F',
  Saturday: 'S',
  Sunday: 'S',
}

/**
 * §11.1 names the control **"Activate"**, so the word is the PRD's rather than
 * a session's. It is held with this module because the *absence* of any
 * supporting line around it is the part still open: SITE-041's accept is that
 * **no copy anywhere states or implies the browser can block anything** (DS-8),
 * and the honest place to say what actually happens is the wall, after the
 * press — not a reassuring sentence beside the button before it.
 */
export const ACTIVATE_LABEL = 'Activate'

/** Unused today; kept with its siblings so SITE-110 sees the whole surface. */
export const RUN_AGAIN_LABEL = 'Start over'
