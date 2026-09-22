/*
 * SITE-100 · Metadata, icons, robots and the sitemap — checked in the export.
 *
 * **Two sources, neither computed from the other.** It reads the exported
 * documents and the export's own filesystem. Reading `lib/copy/metadata.ts`
 * instead would compare the tags to the list that generated them, which agrees
 * by construction and would go green on exactly the change it exists to catch
 * (§0.3b) — the same defect `check-links.mjs` was written around.
 *
 * **Counts before properties.** *"Every route has a description"* is satisfied
 * perfectly by finding no routes, and *"every referenced icon exists"* by a
 * document referencing none. Both are asserted as numbers first.
 *
 * **§0.3d: the export is asserted newer than its sources**, because CI's
 * build-immediately-before is job ordering rather than a guarantee, and it
 * protects nothing on a hand run — which is when a wrong green costs most.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'out'
/*
 * Only directories whose contents change the export. `scripts/` is deliberately
 * absent: this file lives there, so including it made the check fail on its own
 * mtime the first time it ran. `public/` is in, and it covers
 * `scripts/build-assets.ts` — that generator's output *is* `public/`.
 */
const SOURCE_DIRS = ['app', 'components', 'lib', 'public']

let failures = 0
const fail = (message) => {
  failures++
  process.stderr.write(`FAIL  ${message}\n`)
}

/* ── §0.3d ───────────────────────────────────────────────────────────────── */

function newest(dir) {
  return readdirSync(dir).reduce((max, entry) => {
    const full = join(dir, entry)
    const stat = statSync(full)
    return Math.max(max, stat.isDirectory() ? newest(full) : stat.mtimeMs)
  }, 0)
}

if (!existsSync(OUT)) {
  process.stderr.write(`FAIL  ${OUT}/ does not exist. Run the build first.\n`)
  process.exit(1)
}

const exportedAt = statSync(join(OUT, 'index.html')).mtimeMs
const sourcedAt = Math.max(...SOURCE_DIRS.filter(existsSync).map(newest))
if (sourcedAt > exportedAt) {
  fail(
    `${OUT}/ is older than its sources. This check reads built output, so a ` +
      'stale export means it just measured the previous build (§0.3d).',
  )
}

/* ── The documents ───────────────────────────────────────────────────────── */

/** Every exported document, found on disk rather than from a list of routes. */
function documents(dir = OUT) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return entry === '_next' ? [] : documents(full)
    return entry === 'index.html' ? [full] : []
  })
}

const pages = documents()
if (pages.length < 3) {
  fail(`only ${pages.length} exported documents found — expected at least 3 (/, /privacy, /terms)`)
}

const REQUIRED = [
  ['title', /<title>([^<]+)<\/title>/],
  ['description', /<meta name="description" content="([^"]+)"/],
  ['canonical', /<link rel="canonical" href="(https:\/\/[^"]+)"/],
  ['og:title', /<meta property="og:title" content="([^"]+)"/],
  ['og:description', /<meta property="og:description" content="([^"]+)"/],
  ['og:image', /<meta property="og:image" content="(https:\/\/[^"]+)"/],
  ['twitter:card', /<meta name="twitter:card" content="summary_large_image"/],
]

const descriptions = new Map()

for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  const route = `/${page.slice(OUT.length + 1, -'index.html'.length)}`

  for (const [name, pattern] of REQUIRED) {
    const match = html.match(pattern)
    if (!match) {
      fail(`${route} has no ${name}`)
      continue
    }
    if (name === 'description') {
      const text = match[1]
      if (descriptions.has(text)) {
        fail(
          `${route} and ${descriptions.get(text)} share a description. A ` +
            'description repeated across routes describes neither.',
        )
      }
      descriptions.set(text, route)
    }
  }

  /*
   * The og:image must resolve on this origin's own filesystem. A crawler that
   * cannot fetch it renders a card with no picture — the one failure mode that
   * is invisible from the markup, which looks complete either way.
   */
  const image = html.match(/<meta property="og:image" content="https:\/\/[^/]+(\/[^"]+)"/)
  if (image && !existsSync(join(OUT, image[1]))) {
    fail(`${route}'s og:image points at ${image[1]}, which is not in the export`)
  }

  const icons = [...html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g)]
  if (icons.length === 0) fail(`${route} references no icon`)
  for (const [, href] of icons) {
    if (href.startsWith('/') && !existsSync(join(OUT, href))) {
      fail(`${route} references ${href}, which is not in the export`)
    }
  }
}

/* ── robots and the sitemap ──────────────────────────────────────────────── */

for (const file of ['robots.txt', 'sitemap.xml', 'site.webmanifest']) {
  if (!existsSync(join(OUT, file))) fail(`${file} is not in the export`)
}

if (existsSync(join(OUT, 'sitemap.xml'))) {
  const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8')
  const locs = [...sitemap.matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])

  if (locs.length === 0) fail('the sitemap lists no URLs')

  /*
   * **Both directions.** A sitemap advertising a route that does not exist
   * sends crawlers to a 404; a route missing from the sitemap is a page nobody
   * finds. Checking one direction passes on an empty sitemap and on a sitemap
   * listing everything twice.
   */
  /*
   * **Indexable documents only.** `/404/` is a real exported document and must
   * not be in the sitemap — but it must still carry a description and an OG
   * card, because it is a page people land on. So it is excluded here by the
   * `noindex` it declares rather than by a hardcoded path: a future page that
   * should not be indexed is handled by saying so in its own markup.
   */
  const exported = new Set(
    pages
      .filter((p) => !/<meta name="robots" content="[^"]*noindex/.test(readFileSync(p, 'utf8')))
      .map((p) => `/${p.slice(OUT.length + 1, -'index.html'.length)}`),
  )
  for (const loc of locs) {
    if (!exported.has(loc)) fail(`the sitemap lists ${loc}, which is not in the export`)
  }
  for (const route of exported) {
    if (!locs.includes(route)) fail(`${route} is exported but missing from the sitemap`)
  }
}

if (failures > 0) {
  process.stderr.write(`\n${failures} metadata failure(s).\n`)
  process.exit(1)
}

process.stdout.write(
  `metadata ok — ${pages.length} documents, each with a title, a unique ` +
    `description, a canonical, an OG card and icons that resolve.\n`,
)
