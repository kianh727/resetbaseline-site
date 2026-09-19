/*
 * SITE-022 · The flat plan composition.
 *
 * **The one component that renders a band**, per PRD v7.3 §6.3b's enforcement
 * clause. Its only band input is a `Band`, which is obtainable solely from
 * `bandsFor` — so a band cannot be rendered from a colour and a rectangle,
 * because there is no prop to pass one through.
 *
 * Everything §6.3b fixes about a band's appearance is a constant in this file
 * and not a prop:
 *
 * - **Charcoal and translucent, geometrically level, bleeding off both frame
 *   edges.** No left end, no right end — the rect is drawn past the viewBox on
 *   both sides rather than clipped at it.
 * - **Lavender only as a thin lit line on the upper boundary and on active
 *   marks. Never as fill.** There is one lavender stroke and one lavender mark
 *   fill in this file, and no lavender rectangle anywhere.
 * - **Lit marks are scheduled days; dark marks are unscheduled days** — dark and
 *   neutral, **never crossed out, never rust, never styled as disabled.** The
 *   dark mark is a filled neutral dot at the same radius and the same opacity
 *   band as a lit one. It is not smaller, not outlined, not dashed, and carries
 *   no reduced opacity, because every one of those reads as *something is
 *   missing here*.
 * - **No entrance animation and no draw-on** (§6.3b, ruled 2026-09-19). Nothing
 *   in this file animates. The band is present at first paint. SITE-025 lands
 *   the marks; it does not land the band.
 *
 * **Laid out in HTML and CSS, not in a scaled SVG**, and that is a correction.
 * The first version drew a fixed-width SVG and let it scale to fit, which at
 * 375px — **the primary target** — rendered 11px metadata at about 3px. Scaling
 * a composition down is not responsiveness; it is the same composition,
 * illegible. Percentage positions let the band lay out at the real width with
 * type at its real size.
 *
 * *Non-goal:* this is composition only. No activation, no tuning, no
 * interaction — SITE-025, SITE-026 and SP-06 own those.
 */

import { compose } from '@/lib/render/flat-layout'
import type { Plan } from '@/lib/plan/model'

/*
 * §14 tokens. Named here so the band's appearance has one home.
 *
 * **Three readings of §6.3b recorded rather than left implicit**, because §14
 * has exactly nine tokens and SITE-002's test fails on a tenth — so the grammar
 * had to be expressed in the palette that exists, not in a new colour.
 *
 * 1. **"Charcoal" is `--surface` (#0E0C18).** §14 has no `--charcoal`, and
 *    `--surface` is the deep near-black the Peak's own albedo uses. Adding a
 *    token would have been the easy move and is the one SITE-002 forbids.
 * 2. **The upper boundary is `--lavender`; lit marks are `--lavender-lit`.**
 *    §6.3b says lavender appears on the boundary and on active marks and never
 *    as fill; it does not say which of §14's two lavenders goes where. The marks
 *    are the focal element and "lit" is the grammar's own word for them.
 * 3. **Dark marks are `--bone-38`, and this is the reading least settled.**
 *    §6.3b requires them dark and neutral, never crossed out, never rust, never
 *    styled as disabled — and `--bone-38` is the site's de-emphasis token, which
 *    is uncomfortably close to the register the rule warns about. It is the most
 *    neutral of the nine against a near-black band, and **whether it reads as a
 *    gap is exactly §12.4a question 14, which is a human verdict and not one a
 *    session records.** Flagged for SITE-085 rather than asserted here.
 */
const BAND_FILL = 'var(--surface)'
const BAND_FILL_OPACITY = 0.55
const PROTECTION_FILL_OPACITY = 0.78
const LIT_LINE = 'var(--lavender)'
const MARK_LIT = 'var(--lavender-lit)'
const MARK_DARK = 'var(--bone-38)'
const MARK_RADIUS = 3

function formatWindow(startMinute: number, endMinute: number): string {
  // §6.3a's example is `6:00–7:30am`, not `6:00am–7:30am`. The suffix is
  // dropped from the start when both ends share it, because that is what the
  // app's own copy does and the depicted UI must match it.
  const meridiem = (m: number) => (Math.floor(m / 60) % 24 < 12 ? 'am' : 'pm')
  const hhmm = (m: number, suffix: boolean) => {
    const h = Math.floor(m / 60) % 24
    const mm = (m % 60).toString().padStart(2, '0')
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${mm}${suffix ? meridiem(m) : ''}`
  }
  const same = meridiem(startMinute) === meridiem(endMinute)
  return `${hhmm(startMinute, !same)}–${hhmm(endMinute, true)}`
}

export function FlatPlan({ plan }: { plan: Plan }) {
  const { bands } = compose(plan)

  if (bands.length === 0) return null

  return (
    <div role="img" aria-label="Execution plan">
      {bands.map((g) => (
        <div key={g.band.nodeId} style={{ paddingBottom: 16 }}>
          {/*
            The band. `margin-inline: -100vw` with matching padding puts its
            edges far outside any viewport, and the page's `overflow-x: clip`
            (SITE-005) hides them — §6.3b's "no left end, no right end". A band
            stopping at the gutter would have visible ends at exactly the width
            the grammar says it must not appear to have.
          */}
          <div
            style={{
              position: 'relative',
              height: g.height,
              marginInline: '-100vw',
              paddingInline: '100vw',
              background: BAND_FILL,
              opacity:
                g.band.kind === 'protection' ? PROTECTION_FILL_OPACITY : BAND_FILL_OPACITY,
              borderTop: `1px solid ${LIT_LINE}`,
              boxSizing: 'border-box',
            }}
          />
          {/* Marks, positioned over the band inside the page gutter. */}
          <div style={{ position: 'relative', height: 0 }}>
            {g.marks.map((m, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: `${m.xFraction * 100}%`,
                  top: -g.height / 2 - MARK_RADIUS,
                  width: MARK_RADIUS * 2,
                  height: MARK_RADIUS * 2,
                  marginLeft: -MARK_RADIUS,
                  borderRadius: '50%',
                  background: m.lit ? MARK_LIT : MARK_DARK,
                }}
              />
            ))}
          </div>
          <p className="metadata" style={{ paddingTop: 6 }}>
            {g.band.label} · {formatWindow(g.band.window.startMinute, g.band.window.endMinute)}
          </p>
        </div>
      ))}
    </div>
  )
}
