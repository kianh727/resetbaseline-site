/*
 * SITE-005 · Site nav.
 *
 * Scope is exactly two things: the wordmark, and a slot for the terminal CTA.
 * The issue's non-goal is explicit — **no nav interactivity beyond the CTA
 * slot** — so the wordmark is text rather than a link. There is nowhere else
 * to go yet, and a link to `/` from `/` is an affordance that does nothing.
 *
 * The slot is empty on purpose. The terminal action is a config value with
 * three branches — waitlist, TestFlight, App Store — decided at launch
 * (§11.4, §15.3 item 3), and building it is SP-08's. SP-01's exit criterion is
 * "a deployed empty shell", and an empty slot is what that means here: the
 * shape is settled, the content is not this issue's.
 *
 * The wordmark is not typeset in either candidate face. That decision is open
 * (SITE-003) and nothing outside `/type` may apply a candidate.
 */

export default function SiteNav({ cta }: { cta?: React.ReactNode }) {
  return (
    <header
      className="page-x flex items-center justify-between gap-4"
      style={{
        // The top inset keeps the wordmark clear of the notch in portrait.
        paddingTop: 'calc(20px + var(--safe-top))',
        paddingBottom: '20px',
      }}
    >
      {/*
        * Marked as a heading for assistive technology without being an <h1> —
        * the page's h1 is the hero headline (SITE-007), and a wordmark that
        * outranks it would misreport the document outline.
        */}
      <p className="text-body font-medium tracking-[-0.01em] text-bone">Baseline</p>

      {/*
        * The terminal CTA lands here. Rendered only when something is passed,
        * so the nav does not reserve a visible gap for an element that does
        * not exist yet.
        */}
      {cta ? <div className="flex items-center">{cta}</div> : null}
    </header>
  )
}
