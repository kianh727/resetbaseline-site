/*
 * SITE-098 · Every footer link resolves. No dead link.
 *
 * **This is SP-17's exit criterion**, and SITE-098's accept names the footer as
 * where it is verified: *"All four routes are linked from the footer."* A
 * section that exists and is unreachable is a section nobody sees, and the four
 * routes are exactly the ones most likely to be built and then orphaned.
 *
 * ---
 *
 * **It reads the exported HTML, not the source** (§0.3d), and therefore asserts
 * the export is newer than the source it was built from and says so in its own
 * failure message. A link check reading `lib/copy/company.ts` would verify that
 * the constants agree with themselves, which is §0.3b: the same list the footer
 * renders from, compared to the footer rendered from it.
 *
 * The two sources here are **the rendered document** and **the filesystem the
 * export produced**. Neither is computed from the other.
 *
 * **Three link kinds, checked three ways, because they fail differently:**
 *
 * - A route (`/privacy`) must exist as a document in `out/`.
 * - An in-page anchor (`/#faq`) must match an `id` that is actually present in
 *   the rendered home document. This is the one that rots silently — renaming a
 *   section's `id` breaks the link with nothing else changing, and the browser
 *   scrolls to the top rather than erroring.
 * - A `mailto:` is checked for a plausible address and nothing more; whether a
 *   mailbox receives is not a thing a build can know, and a check pretending to
 *   answer it would be measuring its own regex.
 *
 * **A positive control, because "no dead links" passes perfectly on a footer
 * with no links at all** (§0.3). The check asserts a minimum link count and
 * that all four routes named in §9 — the two on-page sections plus Privacy and
 * Terms — are among them, before it asserts anything about resolution.
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

/* ------------------------------------------------------------------ *
 * §0.3d — the export must be newer than its sources.
 * ------------------------------------------------------------------ */

function newestMtime(dir) {
  let newest = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    newest = Math.max(newest, entry.isDirectory() ? newestMtime(full) : statSync(full).mtimeMs)
  }
  return newest
}

let built
try {
  built = statSync('out/index.html').mtimeMs
} catch {
  console.error('links: out/index.html does not exist. Run `npm run build` first.')
  process.exit(1)
}
if (['app', 'components', 'lib'].reduce((n, d) => Math.max(n, newestMtime(d)), 0) > built) {
  console.error(
    'links: out/ is older than the source it was built from, so this check would be ' +
      'measuring a stale export rather than the current footer. Run `npm run build` first.',
  )
  process.exit(1)
}

/* ------------------------------------------------------------------ *
 * The footer, as rendered.
 * ------------------------------------------------------------------ */

const home = readFileSync('out/index.html', 'utf8')

const footerStart = home.lastIndexOf('<footer')
check(footerStart !== -1, 'the home document renders no <footer> at all')
if (footerStart === -1) {
  console.error('links: no footer.')
  process.exit(1)
}
const footer = home.slice(footerStart)

const hrefs = [...footer.matchAll(/href="([^"]+)"/g)].map((m) => m[1])

/*
 * Counts before properties. A footer with no links satisfies "no link is
 * dead" and every assertion below it.
 */
check(
  hrefs.length >= 7,
  `the footer renders ${hrefs.length} links. §9 specifies seven — three under ` +
    'Product, two under Company, two under Legal. Fewer means a group is missing, ' +
    'and "no dead links" is satisfied by a footer with no links (§0.3).',
)

/* The four destinations SP-17 exits on. */
for (const required of ['/#status', '/#pricing', '/#faq', '/privacy', '/terms']) {
  check(
    hrefs.includes(required),
    `the footer does not link ${required}. SITE-098's accept is that all four ` +
      'routes are linked from the footer, and this is where that is verified.',
  )
}

/* ------------------------------------------------------------------ *
 * Resolution.
 * ------------------------------------------------------------------ */

const ids = new Set([...home.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))

for (const href of hrefs) {
  if (href.startsWith('mailto:')) {
    const address = href.slice('mailto:'.length)
    check(
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address),
      `footer link ${href} is not a plausible address. Whether the mailbox ` +
        'receives is not something a build can know, and is not claimed here.',
    )
    continue
  }

  check(href.startsWith('/'), `footer link ${href} is neither a site path nor a mailto:`)
  if (!href.startsWith('/')) continue

  const [path, fragment] = href.split('#')

  if (path !== '' && path !== '/') {
    const doc = join('out', path.replace(/\/$/, ''))
    check(
      existsSync(`${doc}.html`) || existsSync(join(doc, 'index.html')),
      `footer link ${href} points at a route the export does not contain. ` +
        'A link to a route nobody built is the dead link SITE-098 forbids.',
    )
  }

  if (fragment !== undefined && fragment !== '') {
    /*
     * The one that rots silently. Renaming a section's id breaks this link
     * with nothing else changing — the browser scrolls to the top rather than
     * reporting anything, so the failure is invisible in use.
     */
    check(
      ids.has(fragment),
      `footer link ${href} points at #${fragment}, which no element on the home ` +
        'document carries. The browser will scroll to the top and report nothing.',
    )
  }
}

if (failures.length > 0) {
  console.error('links: the footer does not reach everything it claims to.\n')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}

console.log(
  `links: ${hrefs.length} footer links, every route and anchor resolves against the export.`,
)
