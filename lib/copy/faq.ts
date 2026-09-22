/*
 * SITE-095 · §8 FAQ.
 *
 * **HELD — `SITE-109`'s.** v7.3 §8 gives answers for eight of the twelve; those
 * are carried verbatim as the stand-in. The four it does not answer are marked
 * `authored: false` below rather than written here, because inventing an answer
 * to *"what is Baseline, in one sentence?"* is authoring the site's single most
 * load-bearing sentence from a session, which §5 puts outside what a session
 * does.
 *
 * **Question 10 does not render at all.** §8: *"Held with §4. Restore when §4
 * promotes."* §4 is P1 and gated on §15.1, so a twelfth row exists in the data
 * and is filtered out of the DOM. Keeping it in the source with its reason is
 * deliberate — a deleted question is one nobody restores.
 *
 * **Question 4 is an unqualified no**, and that is an accept criterion rather
 * than a tone choice: HealthKit and Calendar are V1.1, §10 bans post-V1 tiers
 * site-wide including Block 2, and a hedged answer here would reintroduce them.
 *
 * **Question 12 ships the roadmap answer.** Export and delete are **unbuilt,
 * not unproven** — a verified DS-18 false, which is why §8 rewrote it rather
 * than holding it. A held answer implies a pending read, and there is nothing
 * left to read.
 *
 * **Names no app, anywhere** (§6.3a, a MUST). FAQ 3's strongest line is that
 * Baseline *cannot see* which apps you chose, which is architectural rather
 * than promised.
 *
 * **All answers are in the DOM with the accordion closed** — that is SITE-095's
 * accept and it is a `<details>` behaviour, not a JavaScript one, so it holds
 * with scripting disabled.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-109',
  source: 'PRD v7.3 §8',
  note:
    'Eight of twelve answers are §8 verbatim and stand in; four are unwritten ' +
    'in every artifact and are marked unauthored rather than invented here.',
}

export interface FaqEntry {
  readonly question: string
  /** `null` when no artifact answers it. Never filled in by a session. */
  readonly answer: string | null
  /** False when §8 gives no answer — the row renders, the answer does not. */
  readonly authored: boolean
  /** True only for the row §8 holds with §4. Filtered out of the DOM. */
  readonly heldWithSection4?: true
}

export const FAQ: readonly FaqEntry[] = [
  {
    question: 'What is Baseline, in one sentence?',
    answer: null,
    authored: false,
  },
  {
    question: 'What platforms?',
    answer: 'iPhone at launch. Android is not committed.',
    authored: true,
  },
  {
    question: 'What does it need access to?',
    answer:
      'Two OS permissions. Notifications, asked once during onboarding. Screen ' +
      'Time, asked only when you create your first Gate — not before. Sign in ' +
      'with Apple to make an account. Nothing else: no camera, location, ' +
      'contacts, health data, or microphone.',
    authored: true,
  },
  {
    question: 'Does it read my calendar, email, or health data?',
    answer: 'No. No connectors at launch.',
    authored: true,
  },
  {
    question: 'What does it cost?',
    answer: 'Nothing during beta. Paid when it ships — trial, no free tier.',
    authored: true,
  },
  {
    question: 'Is there a free version?',
    answer: "The beta is free. The shipping product isn't.",
    authored: true,
  },
  {
    question: 'What happens to what I type on this page?',
    answer: null,
    authored: false,
  },
  {
    question: 'Can it actually block apps?',
    answer:
      'On the phone, yes. In a browser, no — which is why this site stops ' +
      'where it does.',
    authored: true,
  },
  {
    question: 'What if I miss days?',
    answer: 'Nothing. No streaks, no score, no catch-up.',
    authored: true,
  },
  {
    question: 'What does it know about me, and can I see it?',
    answer: null,
    authored: false,
    heldWithSection4: true,
  },
  {
    question: 'How is this different from asking ChatGPT to plan my week?',
    answer: null,
    authored: false,
  },
  {
    question: 'Can I get my data out?',
    answer:
      'Not yet. The deletion cascade is specified and every foreign key to ' +
      'your account is ON DELETE CASCADE; the routes are being built.',
    authored: true,
  },
]

/**
 * What actually renders. Question 10 is removed here rather than at the call
 * site, so a second consumer cannot reintroduce it by iterating `FAQ` directly
 * without noticing.
 */
export const VISIBLE_FAQ: readonly FaqEntry[] = FAQ.filter(
  (e) => e.heldWithSection4 !== true,
)
