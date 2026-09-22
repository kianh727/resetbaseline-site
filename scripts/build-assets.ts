/*
 * Build-time assets: the share card, the icon set, robots, the sitemap and the
 * web manifest.
 *
 * **All five are generated rather than committed**, and the reason is the same
 * one `scripts/check-dev-routes.mjs` records: a hand-written `sitemap.xml` is a
 * file somebody has to remember to edit, and forgetting means the sitemap
 * advertises a route that no longer exists or omits one that does. Every file
 * here derives from `ROUTES` in `lib/copy/metadata.ts`, so adding a route edits
 * one list.
 *
 * **Rasterising uses `playwright-core`, already a dev dependency** for the
 * overflow and LCP checks. Nothing new ships, nothing runs at request time, and
 * the PNGs are build output rather than binaries in the tree — a committed PNG
 * is a rendering of a card nobody can diff against the code that made it.
 *
 * Run before `next build`, because Next copies `public/` into the export.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

import { buildPlan } from '../lib/builder/build-plan.ts'
import { planDate } from '../lib/plan/model.ts'
import { shareCardSvg } from '../lib/share/card.ts'
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  ROUTES,
  SITE_NAME,
  SITE_ORIGIN,
  canonicalFor,
} from '../lib/copy/metadata.ts'

const PUBLIC = 'public'

/*
 * **The mark: one lit line.** Provisional and mine — no artifact specifies an
 * icon. It is the smallest thing in the site's own grammar that still means
 * something: a single lit mark is what a scheduled day looks like, and at 16px
 * a wordmark is unreadable while a vertical stroke is not. Lavender as light on
 * void, which is the only way §6.3b permits lavender at all.
 */
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="#0a0a0a"/>
  <rect x="14.5" y="7" width="3" height="18" fill="#c9c0ff"/>
</svg>`

/** The example the default card renders. Held: it is a sentence a stranger reads. */
const EXAMPLE_GOAL = 'finish my thesis by May 20, weekdays'

function defaultCardSvg(): string {
  const plan = buildPlan({
    text: EXAMPLE_GOAL,
    window: { startMinute: 9 * 60, endMinute: 10 * 60 + 30 },
    appCount: 3,
    // Fixed, so the card is byte-identical between builds. A card built from
    // "today" changes on every deploy, which makes the artifact undiffable and
    // every build a content change.
    today: planDate(2026, 4, 1),
  })
  if (!plan) throw new Error('the example goal built no plan — the card would be empty')
  return shareCardSvg(plan, SITE_ORIGIN.replace(/^https:\/\//, ''))
}

function robotsTxt(): string {
  const disallowed = ROUTES.filter((r) => !r.indexable).map((r) => `Disallow: ${r.path}`)
  return [
    'User-agent: *',
    ...(disallowed.length > 0 ? disallowed : ['Allow: /']),
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n')
}

function sitemapXml(): string {
  const urls = ROUTES.filter((r) => r.indexable)
    .map((r) => `  <url>\n    <loc>${canonicalFor(r.path)}</loc>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function webmanifest(): string {
  return `${JSON.stringify(
    {
      name: SITE_NAME,
      short_name: SITE_NAME,
      icons: [
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      // The void token. A browser chrome that stays light around this page is
      // the one surface the stylesheet cannot reach.
      theme_color: '#0a0a0a',
      background_color: '#0a0a0a',
      display: 'browser',
      start_url: '/',
    },
    null,
    2,
  )}\n`
}

async function rasterise(
  svg: string,
  width: number,
  height: number,
  out: string,
): Promise<void> {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    await page.setContent(
      `<!doctype html><html><body style="margin:0">${svg}</body></html>`,
      { waitUntil: 'load' },
    )
    await page.screenshot({ path: out, type: 'png' })
  } finally {
    await browser.close()
  }
}

async function main(): Promise<void> {
  mkdirSync(PUBLIC, { recursive: true })

  writeFileSync(`${PUBLIC}/favicon.svg`, `${FAVICON_SVG}\n`)
  writeFileSync(`${PUBLIC}/robots.txt`, robotsTxt())
  writeFileSync(`${PUBLIC}/sitemap.xml`, sitemapXml())
  writeFileSync(`${PUBLIC}/site.webmanifest`, webmanifest())

  await rasterise(defaultCardSvg(), OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, `${PUBLIC}/og.png`)
  await rasterise(FAVICON_SVG, 32, 32, `${PUBLIC}/favicon-32.png`)
  await rasterise(
    FAVICON_SVG.replace('width="32" height="32"', 'width="180" height="180"'),
    180,
    180,
    `${PUBLIC}/apple-touch-icon.png`,
  )

  process.stdout.write(
    `assets: og.png, favicon.svg, favicon-32.png, apple-touch-icon.png, ` +
      `robots.txt, sitemap.xml, site.webmanifest (${ROUTES.length} routes)\n`,
  )
}

await main()
