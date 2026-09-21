'use client'

/*
 * Dev-only review route for the wall — `page.dev.tsx`, so it exists under
 * `npm run dev` and is never built into the export (`scripts/check-dev-routes.mjs`
 * derives the list from the source tree and asserts it).
 *
 * **Why the wall is reviewed here rather than on `/`.** §11.1 gives it exactly
 * one legal trigger — Activate on a gate, timer or reminder — and that
 * affordance is SITE-041, which needs SITE-040. Putting a button on the real
 * page to open the wall for review would be a second route into `walled`
 * outside the state machine, which is Rejection 3 and is the single guarantee
 * SITE-012's exhaustive test exists to protect.
 *
 * This route drives the component's `open` prop directly and **does not touch
 * the state machine at all**, so nothing here can be mistaken for a trigger.
 * When SITE-042 wires the real one, this route goes away with it.
 *
 * Both states are rendered from one place because §12.4a's lesson about the
 * sparse frame applies here too: a review that only ever sees the pre-submit
 * wall cannot fail anything about the post-submit handoff line, and the
 * reviewer answers honestly about a state that never appeared.
 */

import { useState } from 'react'

import Wall from '@/components/wall'

export default function WallReview() {
  const [open, setOpen] = useState(true)

  return (
    <main className="page-x" style={{ paddingTop: 48, paddingBottom: 400 }}>
      <h1 className="text-section" style={{ margin: 0, color: 'var(--bone)' }}>
        Wall review
      </h1>
      <p className="metadata" style={{ margin: 0, paddingTop: 12 }}>
        Dev only · never exported · not a trigger
      </p>

      <p
        className="text-body max-w-measure"
        style={{ paddingTop: 24, color: 'var(--bone-60)' }}
      >
        The plan stays visible and legible behind the dim. This paragraph is
        here so that is reviewable rather than asserted &mdash; if the panel
        reads as a modal, this text is what shows it.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body"
        style={{
          minHeight: 44,
          marginTop: 24,
          padding: '0 20px',
          background: 'transparent',
          border: '1px solid var(--edge)',
          color: 'var(--bone)',
          cursor: 'pointer',
        }}
      >
        Reopen
      </button>

      <Wall open={open} onDismiss={() => setOpen(false)} />
    </main>
  )
}
