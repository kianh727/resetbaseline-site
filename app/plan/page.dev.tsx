/*
 * SITE-022 · The flat plan review route. **Development only.**
 *
 * `page.dev.tsx`, so `dev.tsx` is in `pageExtensions` outside production and the
 * route is never built into the export — the same mechanism as `/tokens` and
 * `/type`, and `scripts/check-dev-routes.mjs` derives its list from the source
 * tree rather than naming paths, so this one is covered the moment it exists.
 *
 * **Why a route at all.** SP-04's exit is *"a hand-fed `Plan` renders … coherent
 * and compelling with zero 3D and zero LLM, reviewable as a standalone demo"*,
 * and SITE-022's accept is that it is reviewable as a standalone product demo.
 * Neither can be met by a component with no consumer. SITE-023 owns occurrence
 * generation and is blocked on SITE-113, so the plan below is **hand-fed
 * fixture data**, which is exactly what the exit criterion describes.
 *
 * **The fixture is fixture data, not authored copy.** It is a label on a review
 * route that is never built. No sentence here is a candidate for anything the
 * site renders; SITE-109, SITE-110 and SITE-111 own the site's prose and no
 * session drafts it.
 *
 * **Both frames render on one page, and that is the enforcement.** §12.4a's band
 * questions require a review set with at least one frame where most marks are
 * dark, and a route that only ever showed a full week **cannot fail questions 14
 * and 15** — the condition they measure never occurs. The first version put the
 * sparse frame behind `?sparse`, which made the required frame **optional**: a
 * reviewer who opened the route and screenshotted it got the dense case and a
 * gate that reported a pass it never tested. Stacking both makes the sparse case
 * impossible to not see.
 *
 * *(That first version also did not run at all — `searchParams` is forbidden
 * under `output: 'export'`. The interesting half is that the six-width overflow
 * measurement reported 0px against the error page, which is §0.3 again: a
 * measurement taken on a page that never rendered.)*
 */

import { FlatPlan } from '@/components/plan/flat-plan'
import { planDate, type Plan, type Occurrence } from '@/lib/plan/model'

const WINDOW = { startMinute: 8 * 60, endMinute: 9 * 60 + 30 }

function occurrencesOn(days: readonly number[]): Occurrence[] {
  return days.map((d) => ({
    id: `o-${d}`,
    date: planDate(2026, 4, d),
    window: WINDOW,
  }))
}

/** Weekdays across a fortnight — the dense case. */
const DENSE = [4, 5, 6, 7, 8, 11, 12, 13, 14, 15]

/** Twice a week — most marks dark, which is what §12.4a question 14 needs to be answerable. */
const SPARSE = [4, 7, 11, 14]

function fixture(days: readonly number[]): Plan {
  return {
    title: 'Thesis chapter two',
    deadline: planDate(2026, 4, 31),
    nodes: [
      {
        id: 'commitment-1',
        capability: 'from-the-contract',
        authority: 'from-the-contract',
        label: 'Writing block',
        detail: { occurrences: occurrencesOn(days) },
      },
      {
        id: 'gate-1',
        capability: 'from-the-contract',
        authority: 'from-the-contract',
        label: 'Protection',
        detail: { appCount: 3, window: { startMinute: 6 * 60, endMinute: 7 * 60 + 30 } },
      },
      {
        // No band, and that is §6.3b working: a timer is a duration with no
        // recurrence. It is in the fixture precisely so the review can confirm
        // nothing draws a band for it.
        id: 'timer-1',
        capability: 'from-the-contract',
        authority: 'from-the-contract',
        label: 'Focus session',
        detail: { durationMinutes: 50 },
      },
    ],
  }
}

const FRAMES = [
  { label: 'dense — weekdays across a fortnight', days: DENSE },
  { label: 'sparse — most marks dark', days: SPARSE },
] as const

export default function PlanReviewPage() {
  return (
    <main style={{ padding: '48px 0 96px' }}>
      {FRAMES.map((frame) => (
        <section key={frame.label} style={{ paddingBottom: 64 }}>
          <p className="metadata" style={{ padding: '0 24px 20px' }}>{frame.label}</p>
          <FlatPlan plan={fixture(frame.days)} />
        </section>
      ))}
    </main>
  )
}
