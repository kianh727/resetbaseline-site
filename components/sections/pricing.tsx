/*
 * SITE-094 · §7 Pricing.
 *
 * **Both branches are built and one is selected by config** — that is the
 * accept criterion, and it is why `PRICING` is a record keyed by the state
 * rather than a conditional in JSX. Switching state is a one-line diff in
 * `lib/copy/pricing.ts`, with no component change and no new copy to deploy.
 *
 * **No price while the state is `free_beta`, no countdown, no urgency device**
 * (SITE-094's non-goals). None of the three is expressible here: the component
 * renders a heading and lines from the selected branch and has nowhere to put
 * a timer even if someone wanted one.
 *
 * Copy is held; see `lib/copy/pricing.ts`.
 *
 * **No eyebrow above the heading** (ruled 2026-09-21, Kian, from the §12.4a
 * pre-read). §14's rule is that metadata is always real — dates, occurrence
 * counts, durations, authority tiers — and a small tracked label reading
 * "Pricing" above a heading about pricing is decoration wearing the metadata
 * primitive. The heading is the section.
 */

import { PRICING, PRICING_STATE } from '@/lib/copy/pricing'

export default function Pricing() {
  const copy = PRICING[PRICING_STATE]

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="page-x"
      style={{
        borderTop: '1px solid var(--edge)',
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <h2
        id="pricing-heading"
        className="text-section"
        style={{ margin: 0, color: 'var(--bone)', maxWidth: '18ch' }}
      >
        {copy.heading}
      </h2>

      <div style={{ paddingTop: 32 }}>
        {copy.lines.map((line) => (
          <p
            key={line.slice(0, 32)}
            className="text-lead max-w-measure"
            style={{ margin: 0, paddingBottom: 16, color: 'var(--bone-60)' }}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  )
}
