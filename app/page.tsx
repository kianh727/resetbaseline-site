/*
 * SITE-007 · The fold, and SP-17's sections beneath it.
 *
 * §13's build order runs the sections **in parallel after tokens**, and they
 * land here in the order §2 of the PRD (information architecture) gives:
 * hero → status → what it won't do → pricing → FAQ → who's building this →
 * footer.
 *
 * **The wall is not mounted on this page, and that is deliberate.** Its only
 * legal trigger is Activate on a gate, timer or reminder (§11.1), and the
 * Activate affordance is SITE-041, which needs SITE-040's gate assembly. There
 * is nothing on this page that can legally open it. Mounting it behind any
 * other trigger — a button placed for the purpose, a timer, a scroll position —
 * is Rejection 3 exactly, and it would be a second route to `walled` outside
 * the state machine that is meant to be the only one. It is built, unit-tested,
 * and reviewable at the dev-only `/wall` route until SITE-042 wires it.
 *
 * **No entrance animation on any section.** §19 bans fade-and-slide-up on every
 * section and §12.4a tell 6 asks about it directly. §11.3's handoffs are
 * carried by the properties the sections already have — band thinning, page
 * luminance, type scale — not by motion added per section.
 */

import Hero from '@/components/hero'
import SiteFooter from '@/components/site-footer'
import Company from '@/components/sections/company'
import Faq from '@/components/sections/faq'
import Pricing from '@/components/sections/pricing'
import Refusals from '@/components/sections/refusal/refusals'
import Status from '@/components/sections/status'

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Status />
        <Refusals />
        <Pricing />
        <Faq />
        <Company />
      </main>
      <SiteFooter />
    </>
  )
}
