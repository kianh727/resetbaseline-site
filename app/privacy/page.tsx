/*
 * SITE-099 · `/privacy`.
 *
 * **Structure and fact, no filler.** SITE-099's non-goal forbids `placeholder`
 * or lorem outright — *"a legal route with filler is worse than an absent
 * one"* — and Rejection 7 says the same at PRD level. So this page renders the
 * two things that are true and specified today: what the site records, field by
 * field from v5 §11.5's capture schema, and why. The policy document itself is
 * legal text, is not written, and is flagged as required rather than faked.
 *
 * See `lib/copy/legal.ts` for the reasoning in full, including the one thing
 * reported and not resolved: whether `blocked_apps` should be collected at all
 * given §6.3a.
 */

import type { Metadata } from 'next'

import SiteFooter from '@/components/site-footer'
import {
  COLLECTED,
  COLLECTED_HEADING,
  PENDING_NOTICE,
  PRIVACY_HEADING,
  PRIVACY_INTRO,
  PRIVACY_WHY,
} from '@/lib/copy/legal'

export const metadata: Metadata = {
  title: 'Privacy — Baseline',
}

export default function Privacy() {
  return (
    <>
      <main className="page-x" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <h1 className="text-section" style={{ margin: 0, color: 'var(--bone)' }}>
          {PRIVACY_HEADING}
        </h1>

        <p
          className="text-lead max-w-measure"
          style={{ margin: 0, paddingTop: 32, color: 'var(--bone-60)' }}
        >
          {PRIVACY_INTRO}
        </p>

        <p className="metadata" style={{ margin: 0, paddingTop: 56, paddingBottom: 16 }}>
          {COLLECTED_HEADING}
        </p>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {COLLECTED.map((entry) => (
            <li
              key={entry.field}
              style={{ borderTop: '1px solid var(--edge)', paddingTop: 10, paddingBottom: 12 }}
            >
              <p className="text-body" style={{ margin: 0, color: 'var(--bone)' }}>
                {entry.what}
              </p>
              <p className="metadata" style={{ margin: 0, paddingTop: 2 }}>
                {entry.field}
              </p>
            </li>
          ))}
        </ul>

        <p
          className="text-body max-w-measure"
          style={{ margin: 0, paddingTop: 32, color: 'var(--bone-60)' }}
        >
          {PRIVACY_WHY}
        </p>

        <p
          className="text-body max-w-measure"
          style={{ margin: 0, paddingTop: 40, color: 'var(--bone-38)' }}
        >
          {PENDING_NOTICE}
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
