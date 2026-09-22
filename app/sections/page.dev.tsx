/*
 * A development-only review route for the gated P1 sections.
 *
 * **They are not on `/` and must not be** — `lib/sections/gates.ts` holds them
 * closed, §15.1 gates §5 on a DS-18 verdict of its own, and §3 holds all P1
 * work until the P0 validation gate passes. But a section nobody can look at is
 * a section that rots: it cannot be reviewed for composition, its held copy
 * cannot be seen as visibly unwritten, and the first time anybody renders it
 * will be the commit that ships it.
 *
 * So the same arrangement the wall uses: `page.dev.tsx`, which
 * `next.config.ts` excludes from the production export entirely and
 * `scripts/check-dev-routes.mjs` asserts is absent from `out/`. The route
 * renders the components directly and **never consults the gates** — it is a
 * review surface, not a bypass, and a route that checked the gate and then
 * rendered anyway would be a second way for a gated section to reach a page.
 */

import DayThirty from '@/components/sections/day-thirty'
import Method from '@/components/sections/method'
import { SECTION_GATES } from '@/lib/sections/gates'

export default function SectionsReview() {
  return (
    <main>
      <section className="page-x pt-16">
        <h1 className="text-section text-bone">Gated sections</h1>
        <dl className="mt-6">
          {Object.entries(SECTION_GATES).map(([key, gate]) => (
            <div key={key} className="border-t border-edge py-4">
              <dt className="metadata">
                {key} — {gate.open ? 'open' : 'closed'}
              </dt>
              <dd className="mt-1 max-w-measure text-body text-bone-60">{gate.condition}</dd>
              <dd className="metadata mt-1">{gate.source}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Method />
      <DayThirty />
    </main>
  )
}
