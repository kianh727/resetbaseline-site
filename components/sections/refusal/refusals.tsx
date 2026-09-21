/*
 * SITE-093 · §3 "What it won't do".
 *
 * PRD v7.3 §4: *"Full-bleed, near-black, type at maximum scale, `--veto`
 * accent. The memorable screen; spend the boldness here."*
 *
 * **This file sits under `refusal/` on purpose.** That directory name is what
 * both `--veto` guards read — eslint's glob and the token scan in
 * `tests/tokens.test.mjs` — so the path is the declaration that a veto colour
 * belongs here, rather than an entry added to an allowlist to make a check stop
 * complaining.
 *
 * **Four composition decisions, all mine, all flagged provisional** (the PRD
 * gives the treatment, not the layout):
 *
 * 1. **Full-bleed means the section breaks the page gutter**, with its own
 *    inner gutter. §4 calls it full-bleed and every other section is gutter-
 *    bound, so this is the one place the page's own frame is meant to stop.
 * 2. **Near-black against the page's `--void`** — `--surface` is the blue-black
 *    used for bands, so the section is set *darker* than the page rather than
 *    lighter. A panel lighter than the page would read as a card, and §19 bans
 *    identical rounded cards in a row; four refusals in four cards is the exact
 *    shape of that ban.
 *    Since `--void` is already `#0a0a0a`, near-black below it is a black with a
 *    hairline top and bottom rather than a fill — the rules do the separating.
 * 3. **The veto accent is a rule, not a fill.** A 2px `--veto` edge to the left
 *    of each refusal heading. The same reasoning as `--lavender`: the token
 *    carries meaning, and meaning is carried by light and edge, not by paint.
 *    The lavender rule is a CI check; this one is a judgement about consistency
 *    with it.
 * 4. **The four are stacked, not in a row.** Maximum scale and a row are
 *    incompatible at 375px, and a grid that collapses to a stack on mobile is
 *    two compositions. One composition, reading down.
 *
 * **No entrance animation.** §19 bans fade-and-slide-up on every section, and
 * §12.4a tell 6 asks about it directly. The section is the case, not an event.
 *
 * **Non-goal restated because it is violable in the styling:** no shame framing
 * in the copy that names shame framing as the thing refused. That extends past
 * the words — a refusal set in alarm colours would be shame framing in pixels,
 * which is why the accent is one edge and not a field of red.
 */

import { REFUSALS } from '@/lib/copy/refusals'

export default function Refusals() {
  return (
    <section
      id="what-it-wont-do"
      aria-labelledby="what-it-wont-do-heading"
      style={{
        /*
         * Full-bleed, which on this page costs **nothing** — and the first
         * version of it cost 16px of horizontal overflow at every width.
         *
         * `<main>` carries no gutter; every section applies `page-x` itself.
         * So a section that omits `page-x` is already edge to edge, and the
         * negative margin written to "pull back out" pulled it *past* the
         * viewport instead. `check-overflow` caught it at all six widths with
         * the clip lifted — §0.3a exactly, since `overflow-x: clip` meant
         * nothing looked wrong in a browser.
         *
         * `100vw` would have been the other wrong answer: it ignores the
         * scrollbar and reintroduces the same overflow on any platform that
         * reserves one.
         */
        background: '#050505',
        borderTop: '1px solid var(--edge)',
        borderBottom: '1px solid var(--edge)',
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <div className="page-x">
        <h2
          id="what-it-wont-do-heading"
          className="text-section"
          style={{ margin: 0, color: 'var(--bone)', maxWidth: '14ch' }}
        >
          What it won&rsquo;t do
        </h2>

        <div style={{ paddingTop: 56 }}>
          {REFUSALS.map((refusal) => (
            <div
              key={refusal.heading}
              style={{
                /*
                 * The veto accent: one edge, carrying the meaning. Not a fill —
                 * a block of it behind the type would be the shame framing this
                 * section refuses, rendered in colour.
                 */
                borderLeft: '2px solid var(--veto)',
                paddingLeft: 20,
                paddingBottom: 48,
              }}
            >
              <h3
                className="text-section"
                style={{ margin: 0, color: 'var(--bone)' }}
              >
                {refusal.heading}
              </h3>
              <p
                className="text-lead max-w-measure"
                style={{ margin: 0, paddingTop: 12, color: 'var(--bone-60)' }}
              >
                {refusal.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
