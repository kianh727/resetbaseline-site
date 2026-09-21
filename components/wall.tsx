'use client'

/*
 * SITE-043 / SITE-105 · The wall.
 *
 * v5 §11, carried forward by v7.3 §11 and recovered from git history — see
 * `lib/copy/wall.ts` for why that is the fourth citation problem in this tree
 * and what was corrected about the brief.
 *
 * ---
 *
 * **§11.1 — the trigger, and what this component does not do.**
 *
 * The wall opens *only* by pressing Activate on a gate, timer or reminder, and
 * **never** on elapsed time, scroll depth, section entry, exit intent or
 * interaction count. That rule is not enforced here and must not be: it lives
 * in `lib/builder-machine.ts`, where `activation_attempted` is the single event
 * that reaches `walled`, asserted exhaustively over every state × event pair
 * and pinned by a second test on the transition table's key space.
 *
 * So this component takes `open` as a prop and has **no trigger of its own** —
 * no timer, no `IntersectionObserver`, no scroll listener, no `mouseleave`. A
 * wall that could open itself would put the guarantee in two places, and only
 * one of them is tested. Rejection 3 is the thing being protected.
 *
 * **§11.3 — the rules, each rendered rather than described.**
 *
 * - **No modal on desktop.** This is an overlay panel anchored to the bottom of
 *   the viewport, not a centred dialog, and it carries no `role="dialog"` and
 *   no focus trap. The plan stays visible and legible behind a 40% dim. A
 *   centred modal would hide the thing the visitor just built at the moment
 *   they are being asked whether they want more of it.
 * - **Bottom sheet on mobile**, which falls out of the same anchoring — the
 *   panel is full-width below 768px and inset above it.
 * - **Never fake-activate.** There is no "Activated!" state in this file and no
 *   string that could become one. The boundary copy says a browser cannot hold
 *   a gate, which is DS-8 stated rather than implied.
 * - **Dismissible, returning to a fully tunable plan.** Dismiss emits
 *   `dismiss_wall`; §6.1c notes that this is an *exit* edge and not a second
 *   entrance, which is why dismissal returns to the workspace rather than
 *   resetting anything.
 *
 * **§11's motion table:** *"Dim 240ms, content fades up. No scale, no bounce. A
 * boundary, not an event."* The settling spring is deliberately **not** used —
 * SITE-024's lint rule confines it to structure landing, and a boundary is the
 * system stopping. Refusals use no spring for the same reason.
 *
 * **What is not built here, and whose it is.** SITE-044 owns the mobile sheet's
 * keyboard handling via `visualViewport` — with the keyboard open, the email
 * field and submit must both be visible at 375px and 320px, and that needs a
 * real device to verify. SITE-045 owns the three terminal-action branches;
 * this renders the waitlist shape only, and switching is config. SITE-046 owns
 * the capture write, so `onSubmit` is a prop and there is no fetch in this
 * file — §6 gives the site exactly one capture path and a second one here
 * would be the second write path SITE-097 forbids.
 */

import { useEffect, useRef, useState } from 'react'

import {
  DOWNLOAD_LABEL,
  EMAIL_LABEL,
  SUBMITTED_HEADING,
  SUBMITTED_LINES,
  SUBMIT_LABEL,
  WALL_HEADING,
  WALL_LINES,
} from '@/lib/copy/wall'

export interface WallProps {
  /**
   * Driven by the builder state machine being in `walled`. There is no other
   * way for this to become true, and this component provides none.
   */
  readonly open: boolean
  /** Emits `dismiss_wall`. §11.3: returns to a fully tunable plan. */
  readonly onDismiss: () => void
  /** SITE-046's capture write. No network request is made in this file. */
  readonly onSubmit?: (email: string) => void
  /**
   * §11.5's `[ download your plan ]`, in the submitted state.
   *
   * **Required, not optional, and that is the EVAL-033 lesson applied.** An
   * optional handler means the control silently disappears when a future call
   * site forgets it — the submitted state would render, look complete, and be
   * missing the one affordance on that screen that actually does something.
   * A required prop makes forgetting it a type error at the call site rather
   * than a missing button nobody notices.
   */
  readonly onDownload: () => void
}

export default function Wall({ open, onDismiss, onSubmit, onDownload }: WallProps) {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const panel = useRef<HTMLDivElement | null>(null)

  /*
   * Escape dismisses. A boundary the keyboard cannot leave is a trap, and
   * Rejection 3 names trapping alongside fake-activation.
   *
   * Deliberately not a focus trap: this is not a dialog, the page behind it is
   * meant to stay readable and reachable, and trapping focus would contradict
   * "dismissible, returning to a fully tunable plan".
   */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onDismiss])

  if (!open) return null

  return (
    <>
      {/*
        * The dim. 40% (§11.3), 240ms (§11's motion table). It is a sibling of
        * the panel rather than a parent, so the plan behind stays in the
        * document flow and nothing about the page's layout changes when the
        * wall opens.
        *
        * Clicking it dismisses, which is the same exit edge as the button.
        */}
      <div
        onClick={onDismiss}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 10, 10, 0.4)',
          animation: 'wall-dim 240ms ease-out both',
          zIndex: 40,
        }}
      />

      <div
        ref={panel}
        aria-labelledby="wall-heading"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 41,
          background: 'var(--surface)',
          borderTop: '1px solid var(--edge)',
          paddingTop: 32,
          paddingBottom: 'calc(32px + var(--safe-bottom))',
          /* Content fades up. No scale, no bounce — a boundary, not an event. */
          animation: 'wall-rise 240ms ease-out both',
        }}
      >
        <div className="page-x">
          <h2
            id="wall-heading"
            className="text-section"
            style={{ margin: 0, color: 'var(--bone)', maxWidth: '16ch' }}
          >
            {submitted ? SUBMITTED_HEADING : WALL_HEADING}
          </h2>

          {submitted ? (
            <>
              {/*
                * §11.5: the handoff line lives here because an instruction is
                * for someone who has already said yes. Before submit it is a
                * condition attached to an offer nobody has accepted.
                *
                * Note the asymmetry §11.5 calls deliberate — the wall names the
                * parts, this says "your plan is saved". Repeating the inventory
                * after the decision is reassurance rather than mechanism.
                */}
              {SUBMITTED_LINES.map((line) => (
                <p
                  key={line.slice(0, 24)}
                  className="text-lead max-w-measure"
                  style={{ margin: 0, paddingTop: 20, color: 'var(--bone-60)' }}
                >
                  {line}
                </p>
              ))}

              {/*
                * The one control on this screen that does what it says. A
                * browser cannot hold a gate, which is why the wall exists; it
                * can absolutely write a file, and the plan is already in memory
                * from a deterministic client-side build, so no request is made.
                */}
              <button
                type="button"
                onClick={onDownload}
                className="text-body"
                style={{
                  /*
                   * Block, not the browser's default inline-block. As inline it
                   * shared a line with the dismiss control at 375px and the two
                   * collided — caught by looking at the render, not by any
                   * check, which is the class of defect only a screenshot finds.
                   */
                  display: 'block',
                  minHeight: 44,
                  marginTop: 28,
                  padding: '0 20px',
                  background: 'transparent',
                  border: '1px solid var(--lavender)',
                  color: 'var(--lavender-lit)',
                  boxShadow: '0 0 12px rgba(139, 125, 255, 0.25)',
                  cursor: 'pointer',
                }}
              >
                {DOWNLOAD_LABEL}
              </button>
            </>
          ) : (
            <>
              {WALL_LINES.map((line) => (
                <p
                  key={line.slice(0, 24)}
                  className="text-lead max-w-measure"
                  style={{ margin: 0, paddingTop: 20, color: 'var(--bone-60)' }}
                >
                  {line}
                </p>
              ))}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  onSubmit?.(email)
                  setSubmitted(true)
                }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  paddingTop: 28,
                  maxWidth: 520,
                }}
              >
                {/*
                  * A visible label, not a field hint. A hint disappears the
                  * moment someone types and is the one piece of form copy that
                  * cannot be re-read.
                  */}
                <label className="metadata" htmlFor="wall-email" style={{ width: '100%' }}>
                  {EMAIL_LABEL}
                </label>

                <input
                  id="wall-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-body"
                  style={{
                    flex: '1 1 220px',
                    minWidth: 0,
                    minHeight: 44,
                    padding: '0 12px',
                    background: 'transparent',
                    border: '1px solid var(--edge)',
                    color: 'var(--bone)',
                    outline: 'none',
                  }}
                />

                {/*
                  * A lit edge, never a fill — §6.3b's lavender clause, enforced
                  * by scripts/check-lavender.mjs. The label reads what it does;
                  * no arrow is appended (§19).
                  */}
                <button
                  type="submit"
                  className="text-body"
                  style={{
                    minHeight: 44,
                    padding: '0 20px',
                    background: 'transparent',
                    border: '1px solid var(--lavender)',
                    color: 'var(--lavender-lit)',
                    boxShadow: '0 0 12px rgba(139, 125, 255, 0.25)',
                    cursor: 'pointer',
                  }}
                >
                  {SUBMIT_LABEL}
                </button>
              </form>
            </>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className="metadata"
            style={{
              minHeight: 44,
              marginTop: 20,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Back to the plan
          </button>
        </div>
      </div>
    </>
  )
}
