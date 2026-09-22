/*
 * SITE-007 · Fold layout and hero headline.
 *
 * Left-aligned and vertically centered (§3.2). The headline is the **LCP
 * element and has no entrance animation** — §16 puts the Peak out of the LCP
 * path entirely, and an animated headline would make the largest paint depend
 * on a timeline rather than on the document.
 *
 * Server component apart from the input, so the fold's text is in the HTML the
 * browser parses first rather than arriving with hydration.
 *
 * The chips (SITE-010) sit beneath the input and are not built yet, which is
 * why this issue's *"no scroll to see headline, input and chips"* criterion is
 * only half-verifiable today.
 *
 * SITE-015's transformation block now renders below the input, complete and
 * empty, from first paint — so the fold is headline, input, block.
 */

import Builder from '@/components/builder'
import { HEADLINE } from '@/lib/copy/hero'
import PeakScene from '@/components/peak/peak-scene'

export default function Hero() {
  return (
    /*
     * `relative`, so the Peak's absolutely-positioned canvas has a containing
     * block. It sits at `z-index: -1` behind the fold's content and carries no
     * meaning the flat layout does not — if it never appears, nothing the
     * visitor needed is missing (§3, DS-6).
     */
    <section className="page-x relative flex min-h-[70svh] flex-col justify-center gap-8 py-12">
      <PeakScene />
      {/*
        * `text-balance` keeps a short headline from breaking to a single
        * trailing word. No italic or coloured accent on any one word (§19).
        */}
      <h1 className="max-w-[18ch] text-balance text-display text-bone">{HEADLINE}</h1>

      <Builder />
    </section>
  )
}
