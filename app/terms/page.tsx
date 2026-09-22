/*
 * SITE-099 · `/terms`.
 *
 * Same constraint as `/privacy`: structure and fact, no filler. What is true
 * today — this page does not create an account, charge anything, or grant
 * access — renders. The terms themselves are legal text, are Kian's, and are
 * flagged as required.
 */

import type { Metadata } from 'next'

import SiteFooter from '@/components/site-footer'
import { PENDING_NOTICE, TERMS_HEADING, TERMS_INTRO } from '@/lib/copy/legal'

export const metadata: Metadata = {
  title: 'Terms — Baseline',
}

export default function Terms() {
  return (
    <>
      <main className="page-x" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <h1 className="text-section" style={{ margin: 0, color: 'var(--bone)' }}>
          {TERMS_HEADING}
        </h1>

        <p
          className="text-lead max-w-measure"
          style={{ margin: 0, paddingTop: 32, color: 'var(--bone-60)' }}
        >
          {TERMS_INTRO}
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
