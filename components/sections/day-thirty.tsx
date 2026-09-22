'use client'

/*
 * §5 Day 1 → Day 30 — SITE-073, P1, and gated by §15.1 beyond that.
 *
 * **Native scroll drives it and nothing intercepts.** §7.5 and the constitution
 * both say it in the same words — *no wheel interception, no Lenis, no
 * locomotive, no `scroll-behavior` override, anywhere, ever* — so this reads
 * `scrollY` against its own bounding box and lerps a day index. There is no
 * listener that can cancel a scroll, and the section is a normal-height block
 * that scrolls past like any other.
 *
 * **Under reduced motion it is a two-position toggle**, which is SITE-073's
 * accept and not a degradation: a scrub is a continuous motion, so the honest
 * reduced form is the two ends of it as a control the reader operates. Day 1
 * and Day 30, both reachable, no intermediate state implied.
 *
 * **The beats are structure and their labels are copy.** What happens on each
 * day comes out of the plan model; what the section *says* about it is
 * SITE-073's and is null here.
 */

import { useEffect, useRef, useState } from 'react'

import { BEATS, FIRST_DAY, LAST_DAY, SECTION_HEADING } from '@/lib/copy/day-thirty'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

export default function DayThirty() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [day, setDay] = useState(FIRST_DAY)

  useEffect(() => {
    if (reducedMotion) return

    const element = root.current
    if (element === null) return

    /*
     * Read on scroll, passively. A passive listener cannot call
     * `preventDefault`, so the ban is enforced by the registration rather than
     * by remembering not to — which is the shape §6.3b's band brand uses.
     */
    const onScroll = () => {
      const rect = element.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      if (span <= 0) return
      const progress = Math.min(1, Math.max(0, -rect.top / span))
      setDay(Math.round(FIRST_DAY + progress * (LAST_DAY - FIRST_DAY)))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reducedMotion])

  const reached = BEATS.filter((beat) => beat.day <= day)

  return (
    <section
      id="day-thirty"
      ref={root}
      className="page-x py-24"
      // Tall enough to scrub through, and an ordinary block otherwise.
      style={reducedMotion ? undefined : { minHeight: '220svh' }}
    >
      <div className="sticky top-24">
        <h2 className="text-section text-bone">
          {SECTION_HEADING ?? <span className="text-bone-38">[ §5 heading — SITE-073 ]</span>}
        </h2>

        {reducedMotion ? (
          /*
           * The two ends, as a control. Not a slider: a slider implies the
           * intermediate positions are meaningful states, and §5's point is the
           * difference between the two ends rather than the path between them.
           */
          <div className="mt-6 flex gap-2" role="group" aria-label="Day 1 or Day 30">
            {[FIRST_DAY, LAST_DAY].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDay(value)}
                aria-pressed={day === value}
                className="min-h-11 border border-edge px-4 text-body text-bone aria-pressed:border-lavender"
              >
                Day {value}
              </button>
            ))}
          </div>
        ) : (
          <p className="metadata mt-6">Day {day}</p>
        )}

        <ul className="mt-8">
          {BEATS.map((beat) => (
            <li
              key={beat.kind}
              className="border-t border-edge py-4 text-body"
              style={{ opacity: reached.includes(beat) ? 1 : 0.28 }}
            >
              <span className="metadata">Day {beat.day}</span>
              <span className="mt-1 block text-bone">
                {beat.label ?? (
                  <span className="text-bone-38">[ {beat.kind.replace(/_/g, ' ')} — SITE-073 ]</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
