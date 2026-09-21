/*
 * SITE-EVAL-052 · The headline is the LCP element.
 *
 * PRD §6 (engineering invariants): **the Peak is never in the LCP path. The
 * headline is the LCP element**, the scene is lazy, initialises on
 * `requestIdleCallback`, and is excluded from first load.
 *
 * **Why this exists: the §12.4 stub audit, 2026-09-19.** SITE-007's accept was
 * verified through a `PerformanceObserver` registered before navigation — in
 * an ad-hoc run that left no artifact. There was no standing check, so nothing
 * would notice a font, a hero image, or the Peak itself displacing the H1. It
 * was the one eval in the audit with no implementation and an obvious one, and
 * the measurement already existed in the shape SITE-007 used.
 *
 * ---
 *
 * **Three things about how it measures, each of them a catalogued failure
 * shape avoided rather than a preference.**
 *
 * 1. **The observer is registered before navigation**, via `addInitScript`, and
 *    with `buffered: true` besides. An observer attached after `load` misses
 *    the entries it exists to read and reports nothing — which, asserted
 *    naively, reads exactly like "nothing displaced the headline" (§0.3).
 *
 * 2. **The entry count is asserted before the identity.** A page that produced
 *    no LCP entry at all satisfies "the LCP element is not the Peak" perfectly.
 *    So the first assertion at each width is that the observer saw at least one
 *    candidate, and only then that the final one is the H1. Same ordering as
 *    SITE-EVAL-021 and -037 after their rewrites: counts, then properties.
 *
 * 3. **It asserts against the export, and asserts the export is current**
 *    (§0.3d). A check reading a build artifact measures the last build, not the
 *    current source. CI happens to run `build` immediately before, which is job
 *    ordering rather than a guarantee and protects nothing on a hand run — the
 *    case where a wrong green is most expensive.
 *
 * **Both verification widths**, because the LCP element can differ between
 * them: the headline sets on two lines at 1440px and more at 375px, and a
 * different element can win at one width and not the other.
 */

import { chromium } from 'playwright-core'
import { statSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from './serve-out.mjs'

const WIDTHS = [1440, 375]
const failures = []

function check(ok, message) {
  if (!ok) failures.push(message)
}

/* ------------------------------------------------------------------ *
 * §0.3d — the export must be newer than the source it was built from.
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
  console.error('lcp: out/index.html does not exist. Run `npm run build` first.')
  process.exit(1)
}
if (['app', 'components', 'lib'].reduce((n, d) => Math.max(n, newestMtime(d)), 0) > built) {
  console.error(
    'lcp: out/ is older than the source it was built from, so this check would be ' +
      'measuring a stale export rather than the current headline. Run `npm run build` first.',
  )
  process.exit(1)
}

/* ------------------------------------------------------------------ *
 * The measurement.
 * ------------------------------------------------------------------ */

const OBSERVER = () => {
  window.__lcp = []
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const el = entry.element ?? null
      /*
       * Identity is resolved at capture time. `entry.element` is a live
       * reference and the DOM moves underneath it; resolving later would
       * answer a question about a different page than the one measured.
       */
      window.__lcp.push({
        tag: el === null ? '(none)' : el.tagName,
        isHeadline: el !== null && el === document.querySelector('h1'),
        size: entry.size,
        text: el === null ? '' : (el.textContent ?? '').trim().slice(0, 60),
      })
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true })
}

const server = await serve('out')
const browser = await chromium.launch()

try {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await ctx.newPage()
    await page.addInitScript(OBSERVER)
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' })
    /*
     * LCP is reported as a sequence of candidates, each larger than the last.
     * A short settle after network idle lets a late candidate — a font
     * swapping in, a lazily mounted element — arrive and be caught, which is
     * the case the check exists for.
     */
    await page.waitForTimeout(600)
    const entries = await page.evaluate(() => window.__lcp ?? [])
    await ctx.close()

    /* Counts before properties. */
    check(
      entries.length > 0,
      `${width}px: no largest-contentful-paint entry was observed at all. Every ` +
        'assertion about which element won is satisfied by that, which is why it ' +
        'is asserted first (§0.3).',
    )
    if (entries.length === 0) continue

    const final = entries[entries.length - 1]
    check(
      final.isHeadline,
      `${width}px: the LCP element is <${final.tag}> ${JSON.stringify(final.text)}, ` +
        `not the H1. PRD §6: the headline is the LCP element and the Peak is never ` +
        'in the LCP path. Candidates seen, in order: ' +
        entries.map((e) => `<${e.tag}> ${Math.round(e.size)}px²`).join(' → '),
    )
  }
} finally {
  await browser.close()
  await server.close()
}

if (failures.length > 0) {
  console.error('lcp: the headline is not the largest contentful paint.\n')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}

console.log(`lcp: the H1 is the LCP element at ${WIDTHS.map((w) => `${w}px`).join(' and ')}.`)
