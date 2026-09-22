/*
 * SITE-094 · §7 Pricing.
 *
 * **HELD — `SITE-109`'s.** The `free_beta` text is v7.3 §7's verbatim, but §7 is
 * inside SITE-109's scope and the ruling of 2026-09-21 is that only §3 and the
 * wall ship as final. Everything else renders and waits.
 *
 * **Both branches are built, which is the part that is not copy.** SITE-094's
 * accept is that switching state is a config change rather than a deploy of new
 * copy — so `announced` cannot be left unbuilt and filled in later, because
 * "filled in later" is a deploy.
 *
 * **`announced` has no text in any artifact**, which is expected: the price is
 * not decided and §7 says *"pricing is announced before launch."* Its strings
 * are held the same way the rest of this module is, and the branch renders its
 * shape so the state can be reviewed before there is a number to put in it.
 * **No price is invented here** — SITE-094's non-goal forbids stating one while
 * the state is `free_beta`, and a session inventing one for the other branch
 * would be worse, because it would look decided.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-109',
  source: 'PRD v7.3 §7',
  note:
    "The free_beta text is §7's verbatim but §7 sits inside SITE-109's copy " +
    'pass. The announced branch has no authored text in any artifact.',
}

/** v7.3 §7. Both branches built in P0; `free_beta` launches. */
export type PricingState = 'free_beta' | 'announced'

/**
 * Which branch ships. A single exported constant rather than an environment
 * read, so the switch is a reviewable diff — SITE-094 asks for a config change,
 * and a value that can differ between environments is not a config, it is a
 * state nobody can see from the repository.
 */
export const PRICING_STATE: PricingState = 'free_beta'

export interface PricingCopy {
  readonly heading: string
  readonly lines: readonly string[]
}

export const PRICING: Readonly<Record<PricingState, PricingCopy>> = {
  free_beta: {
    heading: 'Baseline is paid at launch. Beta access is free.',
    lines: [
      'Everyone on the waitlist gets the beta at no cost. When it ships it’s a ' +
        "paid app — trial, no free tier. We'd rather charge for something that " +
        'works than farm attention with something that doesn’t.',
      'Pricing is announced before launch. The waitlist hears first.',
    ],
  },

  /*
   * No number, and no shape that implies one is coming on a date. §7 gives this
   * branch no text; what is built is the branch, so the state is reachable and
   * reviewable. SITE-109 authors it, and the price itself is Kian's.
   */
  announced: {
    heading: 'Baseline is paid.',
    lines: [
      'Beta access was free. The shipping product is a paid app — trial, no ' +
        'free tier.',
    ],
  },
}
