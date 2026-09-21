/*
 * SITE-096 / SITE-098 · §9 "Who's building this" and §11 the footer.
 *
 * **HELD — `SITE-109`'s.** v7.3 §9 carries the text verbatim and it stands in
 * here. The names, roles and address are facts rather than prose, but the
 * paragraph around them is copy and §9 sits inside SITE-109's scope.
 *
 * **No social proof until it's real** (§9, and SITE-096's accept): no logos, no
 * counts, no testimonials, no "as seen in". SITE-098's non-goal extends it to
 * the footer — **no social icons**, because there is nothing to link to and a
 * dead icon row is social proof that isn't real.
 *
 * **The footer is SP-17's exit criterion.** SITE-098's accept is that all four
 * routes are linked from it and none is dead, which is why the links are data
 * here and asserted by a check rather than typed into JSX four times.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-109',
  source: 'PRD v7.3 §9',
  note:
    "§9's text is carried verbatim as the stand-in; the section sits inside " +
    "SITE-109's copy pass like every other rendered sentence but §3 and the wall.",
}

export const COMPANY_HEADING = 'Baseline is built by two people.'

export const COMPANY_PEOPLE: readonly string[] = [
  'Kian — product and design.',
  'Shayan — engineering.',
]

export const COMPANY_BODY =
  'We built it because we kept rebuilding the same scaffolding for ourselves ' +
  'every few months and got tired of being the thing holding it together.'

export const COMPANY_EMAIL = 'hello@resetbaseline.com'

export interface FooterLink {
  readonly label: string
  /** An in-site route, or a `mailto:`. Both are checked for reachability. */
  readonly href: string
}

export interface FooterGroup {
  readonly heading: string
  readonly links: readonly FooterLink[]
}

/**
 * §9's footer, exactly as specified: Product · Company · Legal.
 *
 * `/` fragments rather than separate pages for the three on-page sections,
 * because §2, §7 and §8 are sections of the single page the site is — the
 * decomposition gives SITE-094 and SITE-095 optional `/pricing` and `/faq`
 * routes, and those are not built here. **A footer link to a route that does
 * not exist is the dead link SITE-098's accept forbids**, so these point at the
 * anchors that do.
 */
export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Where Baseline is', href: '/#status' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: "Who's building this", href: '/#company' },
      { label: COMPANY_EMAIL, href: `mailto:${COMPANY_EMAIL}` },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

/** §9, verbatim. */
export const FOOTER_STATUS_LINE = 'Private beta, free · iPhone · no connectors.'
