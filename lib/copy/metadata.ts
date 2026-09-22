/*
 * SITE-100 · Metadata and the OG card — one source for every route.
 *
 * **Three public routes ship**: `/`, `/privacy`, `/terms`. The `page.dev.tsx`
 * routes are never built into the export (`next.config.ts`), so they have no
 * metadata by construction rather than by omission — there is nothing to
 * describe because there is nothing to find.
 *
 * **The titles and descriptions are held.** v7.3 carries no metadata copy, and
 * a description is the sentence a stranger reads before anything else on this
 * site — exactly the kind §15.4 records as the largest unmitigated risk. What is
 * built is the mechanism: one entry per route, the OG and Twitter cards derived
 * from it rather than restated, and the canonical URL computed. Dropping the
 * real sentences in is editing this file and nothing else.
 *
 * **The canonical origin is a constant and not an environment variable.** A
 * preview deploy reading its own hostname would emit canonicals pointing at
 * itself, which is how a preview gets indexed in place of the site.
 */

import type { Provenance } from './provenance.ts'

export const PROVENANCE: Provenance = {
  status: 'held',
  owner: 'SITE-109',
  source: 'v7.3 carries no metadata copy; SITE-100 owns the mechanism',
  note:
    'The per-route entries, the derived OG/Twitter cards and the canonical ' +
    'origin are built; the titles and descriptions are held sentences.',
}

export const SITE_ORIGIN = 'https://resetbaseline.com'
export const SITE_NAME = 'Baseline'

/** The share card, rasterised at build time from `lib/share/card.ts`. */
export const OG_IMAGE_PATH = '/og.png'
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export interface RouteMetadata {
  /** Path as exported, with the trailing slash `next.config.ts` adds. */
  readonly path: string
  readonly title: string
  readonly description: string
  /** Kept out of search results where the page is not a destination. */
  readonly indexable: boolean
}

/**
 * Every route that ships.
 *
 * Written out rather than discovered from the filesystem: a list derived from
 * `app/` would agree with the export by construction (§0.3b) and could never
 * report a route that shipped without a description, which is the one thing
 * this list exists to make checkable.
 */
export const ROUTES: readonly RouteMetadata[] = [
  {
    path: '/',
    title: 'Baseline',
    description:
      'Turn a goal into a schedule you can change. No account, nothing to install.',
    indexable: true,
  },
  {
    path: '/privacy/',
    title: 'Privacy — Baseline',
    description: 'What this site records, field by field, and what it does not.',
    indexable: true,
  },
  {
    path: '/terms/',
    title: 'Terms — Baseline',
    description: 'Terms of use for resetbaseline.com.',
    indexable: true,
  },
  {
    /*
     * **Not indexed, but not undescribed.** Next exports a 404 document
     * whatever we do, and without an entry it inherited `/`'s description —
     * two routes claiming to be the same page. It is excluded from the
     * sitemap by the `noindex` it declares, and **deliberately not
     * disallowed in `robots.txt`**: a crawler told not to fetch it never
     * reads the `noindex`, which is the one way to get a 404 page indexed.
     */
    path: '/404/',
    title: 'Not found — Baseline',
    description: 'That page does not exist.',
    indexable: false,
  },
]

export function routeFor(path: string): RouteMetadata | undefined {
  return ROUTES.find((r) => r.path === path)
}

export function canonicalFor(path: string): string {
  return `${SITE_ORIGIN}${path}`
}
