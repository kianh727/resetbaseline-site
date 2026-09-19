'use client'

/*
 * SITE-022 · the flat plan composition · SITE-025 · marks · SITE-026 · the gate
 *
 * **The one component that renders a band**, per PRD v7.3 §6.3b's enforcement
 * clause. Its only band input is a `Band`, obtainable solely from `bandsFor` —
 * so a band cannot be rendered from a colour and a rectangle, because there is
 * no prop to pass one through.
 *
 * Everything §6.3b fixes about a band's appearance is a constant here, not a
 * prop: charcoal and translucent, geometrically level, bleeding off both frame
 * edges; **lavender only as a thin lit line and on active marks, never as
 * fill**; **lit marks are scheduled days and dark marks are unscheduled days**,
 * never crossed out, never rust, never styled as disabled.
 *
 * Laid out in HTML and CSS rather than a scaled SVG: the first version drew a
 * fixed-width SVG and let it scale, which at 375px put 11px metadata at about
 * 3px. Scaling a composition down is not responsiveness.
 *
 * ---
 *
 * **SITE-025 — the marks land; the band does not.**
 *
 * §6.3b, ruled 2026-09-19: **a band has no entrance animation and no draw-on.**
 * It is present at first paint. What animates is the marks, 45ms apart, on the
 * settling spring, ~600ms total.
 *
 * **Interruptible, and the handle is kept.** `settle()` returns the `Animation`;
 * every one is collected and cancelled on unmount or on a new plan, then the
 * final state is applied — so an interrupted fan-out leaves **no orphaned
 * state**, which is SITE-025's second accept clause.
 *
 * **Nothing is gated on the animation.** The marks are in the DOM at their final
 * position from first paint and the animation moves them *from* an offset, so a
 * reader with JavaScript disabled, reduced motion set, or a cancelled animation
 * sees the finished plan rather than an empty band. That is the structural form
 * of *"controls enable when their data exists, not when their animation
 * completes"* — there is no state to enable, because nothing was ever withheld.
 */

import { useEffect, useRef } from 'react'

import { compose } from '@/lib/render/flat-layout'
import { settle } from '@/lib/motion/settle'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import type { Plan } from '@/lib/plan/model'

/*
 * §14 tokens. Three readings of §6.3b recorded rather than left implicit,
 * because §14 has exactly nine tokens and SITE-002's test fails on a tenth:
 *
 * 1. "Charcoal" is `--surface` (#0E0C18) — §14 has no `--charcoal`, and
 *    `--surface` is the deep near-black the Peak's own albedo uses.
 * 2. The upper boundary is `--lavender`; lit marks are `--lavender-lit`. §6.3b
 *    says lavender appears on the boundary and on active marks and never as
 *    fill; it does not say which of §14's two lavenders goes where, and the
 *    marks are the focal element.
 * 3. Dark marks are `--bone-38`, and this is the least settled. §6.3b requires
 *    them dark and neutral, never styled as disabled, and `--bone-38` is the
 *    site's de-emphasis token — uncomfortably close to the register the rule
 *    warns about. Whether it reads as a gap is §12.4a question 14, a human
 *    verdict, and not one a session records.
 */
const BAND_FILL = 'var(--surface)'
const BAND_FILL_OPACITY = 0.55
const PROTECTION_FILL_OPACITY = 0.82
const LIT_LINE = 'var(--lavender)'
const HARD_EDGE = 'var(--edge)'
const MARK_LIT = 'var(--lavender-lit)'
const MARK_DARK = 'var(--bone-38)'
const MARK_RADIUS = 3

/** §8.2: 45ms apart, ~600ms total. Do not shorten it — it carries product meaning (K-4). */
const STAGGER_MS = 45

function formatWindow(startMinute: number, endMinute: number): string {
  // §6.3a's example is `6:00–7:30am`, not `6:00am–7:30am`. The suffix is dropped
  // from the start when both ends share it, because that is what the app's own
  // copy does and the depicted UI must match it.
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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function FlatPlan({ plan }: { plan: Plan }) {
  const { bands } = compose(plan)
  const reducedMotion = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = root.current
    if (node === null) return
    const marks = node.querySelectorAll<HTMLElement>('[data-mark]')
    const animations: Animation[] = []
    marks.forEach((mark, i) => {
      const a = settle(mark, { reducedMotion, delayMs: i * STAGGER_MS })
      if (a !== null) animations.push(a)
    })
    /*
     * **Interruptible, and it leaves no orphaned state.** `cancel()` reverts a
     * WAAPI animation to the element's own styles — and the element's own styles
     * are the *final* state, because the marks are rendered in place and the
     * animation moves them from an offset. An implementation that animated
     * *to* the final state would leave a cancelled mark at its start position,
     * which is exactly the orphaned state this clause forbids.
     */
    return () => {
      for (const a of animations) a.cancel()
    }
  }, [plan, reducedMotion])

  if (bands.length === 0) return null

  return (
    <div ref={root} role="img" aria-label="Execution plan">
      {bands.map((g) => {
        const protection = g.band.kind === 'protection'
        return (
          <div key={g.band.nodeId} style={{ paddingBottom: 20 }}>
            {/*
              The band. `margin-inline: -100vw` with matching padding puts its
              edges far outside any viewport, and the page's `overflow-x: clip`
              (SITE-005) hides them — §6.3b's "no left end, no right end".
            */}
            <div
              style={{
                position: 'relative',
                height: g.height,
                marginInline: '-100vw',
                paddingInline: '100vw',
                background: BAND_FILL,
                opacity: protection ? PROTECTION_FILL_OPACITY : BAND_FILL_OPACITY,
                /*
                 * SITE-026: protection has **hard edges** — a rule on both
                 * boundaries. A window band has the single lit line §6.3b names
                 * on its upper boundary and nothing on its lower, so the two
                 * kinds differ by edge treatment as well as by height.
                 */
                borderTop: `1px solid ${protection ? HARD_EDGE : LIT_LINE}`,
                borderBottom: protection ? `1px solid ${HARD_EDGE}` : 'none',
                boxSizing: 'border-box',
              }}
            />
            {/* Marks, positioned over the band inside the page gutter. */}
            <div style={{ position: 'relative', height: 0 }}>
              {g.marks.map((m, i) => (
                <span
                  key={i}
                  data-mark
                  data-lit={m.lit ? 'true' : 'false'}
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
            {/*
              §8.2: each mark labelled with its real date at 11px.

              **Decided here and recorded (SITE-025): the day number on every
              mark, the month named once.** At 375px a twelve-day span gives
              each mark about 28px — enough for `4`, not for `May 4`. Labelling
              every mark with a full date would either overlap or force the type
              below 11px, and §12.3a forbids anything between the two scales.
              The month is stated once at the band's own metadata line, so the
              dates are still real and readable rather than ordinal.
            */}
            {!protection && g.marks.length > 0 && (
              <div style={{ position: 'relative', height: 14 }}>
                {g.marks.map((m, i) => (
                  <span
                    key={i}
                    className="metadata"
                    style={{
                      position: 'absolute',
                      left: `${m.xFraction * 100}%`,
                      transform: 'translateX(-50%)',
                      opacity: m.lit ? 1 : 0.55,
                    }}
                  >
                    {m.date.getDate()}
                  </span>
                ))}
              </div>
            )}
            {/*
              §6.1a's object metadata: type and authority tier at 11px.

              **Read from the node, not derived.** SITE-026's accept asks for
              contract-derived tiers, and SITE-004 is blocked — the manifest
              carries no `authority_tier`, so there is nothing to derive from.
              Rendering the node's own value is honest about that; a derivation
              written now would be a hand-list wearing a function's clothes.
            */}
            <p className="metadata" style={{ paddingTop: 6 }}>
              {g.band.capability} · {g.band.authority}
            </p>
            <p className="metadata">
              {g.band.label} · {formatWindow(g.band.window.startMinute, g.band.window.endMinute)}
              {!protection && g.marks[0] ? ` · ${MONTHS[g.marks[0].date.getMonth()]}` : ''}
            </p>
          </div>
        )
      })}
    </div>
  )
}
