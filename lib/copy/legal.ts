/*
 * SITE-099 · `/privacy` and `/terms`.
 *
 * **These routes carry no filler, and that is a hard constraint rather than a
 * preference.** SITE-099's non-goal is explicit — *"no `placeholder` or lorem,
 * ever — a legal route with filler is worse than an absent one. Legal text is
 * Kian's, not a session's; this issue builds the routes and flags the content
 * as required."* Rejection 7 (§22) says the same at PRD level, so the issue is
 * not the only thing forbidding it.
 *
 * **So these pages are split by what kind of thing each part is**, which is the
 * only way to build them honestly before the legal text exists:
 *
 * - **What the site collects is a fact, and it is specified.** v5 §11.5 gives
 *   the capture schema field by field. Those lines are true today, checkable
 *   against `SITE-046`'s implementation, and are not prose anybody has to
 *   approve. They render.
 * - **The formal policy and the terms are legal text.** They are not written,
 *   they are not a session's to write, and no sentence here pretends to be
 *   them. The page says so in one line and gives the address to ask at.
 *
 * That is the difference between *flagging the content as required*, which the
 * issue asks for, and *shipping filler*, which it forbids. A reader learns
 * exactly what is collected and is told plainly that the policy itself is not
 * yet published.
 *
 * **One thing reported and deliberately not resolved here.** §11.5's schema
 * includes `blocked_apps`. §6.3a is a MUST that no depicted Baseline UI may
 * name an app, because Screen Time returns opaque tokens the app cannot read —
 * but the *site's* fourth beat has the visitor type app names, so the site can
 * hold something the app never could. Whether that field ships, and under what
 * name, is `SITE-046`'s and Kian's. It is listed below as the schema specifies
 * it; if the answer is that it should not be collected, the fix is in the
 * schema and this list follows it.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-099 · legal text is Kian’s',
  source: 'PRD v5 §11.5 for the capture schema; no artifact carries the policy text',
  note:
    'The collected-data list is fact from §11.5 and renders. The policy and ' +
    'terms are legal text, are unwritten, and are flagged as required rather ' +
    'than filled with filler (SITE-099 non-goal, Rejection 7).',
}

/**
 * v5 §11.5, verbatim as a schema. Each entry is what the field is, in plain
 * words — a privacy page that lists column names and calls it disclosure has
 * disclosed nothing.
 */
export interface CollectedField {
  readonly field: string
  readonly what: string
}

export const COLLECTED: readonly CollectedField[] = [
  { field: 'raw_goal', what: 'the sentence you typed into the builder' },
  { field: 'email', what: 'the address you gave us, if you gave us one' },
  { field: 'generated_plan', what: 'the plan the page built from your sentence' },
  { field: 'domain_tier', what: 'which bounded domain, if any, your sentence matched' },
  { field: 'tuned_time', what: 'the time window you set' },
  { field: 'tuned_days', what: 'the days you chose' },
  { field: 'blocked_apps', what: 'the apps you named for protection' },
  { field: 'terminal_action', what: 'which sign-up you were shown' },
  { field: 'hit_wall_at', what: 'when you reached the end of what a browser can do' },
  { field: 'created_at', what: 'when the record was written' },
]

export const PRIVACY_HEADING = 'Privacy'

export const PRIVACY_INTRO =
  'This page collects what you type into the builder, and nothing else. There ' +
  'are no analytics cookies, no third-party trackers, and no advertising ' +
  'identifiers on this site.'

export const COLLECTED_HEADING = 'What this page records'

/**
 * Stated because it is the honest answer to the obvious question and because
 * §11.5 says why it is worth anything: the dataset of real goals is the point,
 * not the email addresses.
 */
export const PRIVACY_WHY =
  'We keep it so we can see what people actually ask for, and build against ' +
  'that rather than against what we imagine.'

export const TERMS_HEADING = 'Terms'

export const TERMS_INTRO =
  'Baseline is in private beta. This page does not create an account, does not ' +
  'charge anything, and does not give you access to the app — it puts you on a ' +
  'list.'

/**
 * The one line that flags the content as required, on both routes.
 *
 * **Not filler.** It is a true statement of where the document is, with the
 * address to ask at. The alternative — a page of generic policy text nobody
 * wrote for this product — is the thing SITE-099 calls worse than an absent
 * page, because it reads as binding and is not.
 */
export const PENDING_NOTICE =
  'The full document is being written and is not published yet. Until it is, ' +
  'what is on this page is the whole of what we do. Questions go to ' +
  'hello@resetbaseline.com.'
