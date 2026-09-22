/*
 * SITE-096 · §9 "Who's building this".
 *
 * Two people, real names, real roles, the real reason, a real address.
 *
 * **No social proof until it's real** — no logos, no counts, no testimonials,
 * no "as seen in" (§9, SITE-096's accept). The section has nowhere to put any
 * of them, which is the point: an empty logo strip is a thing somebody fills.
 *
 * Copy is held; see `lib/copy/company.ts`.
 *
 * **No eyebrow** (ruled 2026-09-21, Kian). "Who's building this" above a
 * heading saying the same thing is decoration in the metadata primitive, and
 * §14 reserves that primitive for real measurements. The footer still carries
 * the phrase as a navigation label, which is a different job — it names a
 * destination rather than restating the thing it sits on.
 */

import {
  COMPANY_BODY,
  COMPANY_EMAIL,
  COMPANY_HEADING,
  COMPANY_PEOPLE,
} from '@/lib/copy/company'

export default function Company() {
  return (
    <section
      id="company"
      aria-labelledby="company-heading"
      className="page-x"
      style={{
        borderTop: '1px solid var(--edge)',
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <h2
        id="company-heading"
        className="text-section"
        style={{ margin: 0, color: 'var(--bone)', maxWidth: '16ch' }}
      >
        {COMPANY_HEADING}
      </h2>

      <div style={{ paddingTop: 32 }}>
        {COMPANY_PEOPLE.map((person) => (
          <p
            key={person}
            className="text-lead"
            style={{ margin: 0, color: 'var(--bone)' }}
          >
            {person}
          </p>
        ))}

        <p
          className="text-lead max-w-measure"
          style={{ margin: 0, paddingTop: 24, color: 'var(--bone-60)' }}
        >
          {COMPANY_BODY}
        </p>

        <p className="text-body" style={{ margin: 0, paddingTop: 24 }}>
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            style={{ color: 'var(--bone)', textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            {COMPANY_EMAIL}
          </a>
        </p>
      </div>
    </section>
  )
}
