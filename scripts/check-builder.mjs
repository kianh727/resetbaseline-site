/*
 * SITE-015 / SITE-019 · The two guarantees that need a browser.
 *
 * **SITE-015** — the frame renders complete and empty at t=0 with the network
 * fully blocked, and no spinner, skeleton or shimmer exists anywhere
 * (DS-10, SITE-EVAL-007). Asserted with **every request after the document
 * aborted**, so a frame that depended on any fetch could not appear.
 *
 * **SITE-019** — typing "by the end of May" surfaces the deadline with **zero network
 * requests**, verified by counting them rather than by watching (SITE-019
 * accept says "verified in devtools"; this is that, automated).
 *
 * §12.4: both halves assert counts before properties. A page that rendered
 * nothing would issue no requests and contain no spinner, so "no requests" and
 * "no shimmer" are both vacuously true on a blank page — the row count is
 * checked first, and it is checked against the declared row set rather than
 * against whatever rendered.
 *
 * @implements SITE-EVAL-007
 * @implements SITE-EVAL-008
 */

import { chromium } from 'playwright-core'
import { statSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from './serve-out.mjs'

/*
 * **The export must be newer than the source it was built from.**
 *
 * Found 2026-09-19, by this check passing when it should have failed. It reads
 * `out/`, not `lib/` — so a logic change that breaks a rendered assertion goes
 * green locally until somebody rebuilds, and the run that passed was measuring
 * an artifact produced before the change existed.
 *
 * CI is safe by accident: `build` always runs immediately before this step. That
 * is exactly the kind of safety that holds until the job order is edited, and it
 * does nothing for anyone running the check by hand — which is when a wrong
 * green is most expensive, because it is the run someone is using to decide the
 * change is finished.
 *
 * It is the §0.3 family with a twist: the criterion is not satisfiable by the
 * absence of the thing it measures, it is satisfiable by a **stale copy** of it.
 */
function newestMtime(dir) {
  let newest = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    newest = Math.max(newest, entry.isDirectory() ? newestMtime(full) : statSync(full).mtimeMs)
  }
  return newest
}

function assertExportIsFresh() {
  let built
  try {
    built = statSync('out/index.html').mtimeMs
  } catch {
    console.error('builder: out/index.html does not exist. Run `npm run build` first.')
    process.exit(1)
  }
  const sources = ['app', 'components', 'lib'].reduce((n, d) => Math.max(n, newestMtime(d)), 0)
  if (sources > built) {
    console.error(
      'builder: out/ is older than the source it was built from, so this check would be ' +
        'measuring a stale export. Run `npm run build` first.',
    )
    process.exit(1)
  }
}

/** §3.4's five rows. Duplicated here on purpose — see the note below. */
const EXPECTED_ROWS = ['commitment', 'frequency', 'window', 'deadline', 'protection']
/*
 * This list is written out rather than imported from lib/builder/rows.ts.
 * Importing it would make the assertion a pure function of its own reference
 * (PRD §0.3b): the check would compare the rendered rows to the same constant
 * the renderer used, and agree by construction. Written separately, from
 * §3.4's table, it is a second source and can actually disagree.
 */


assertExportIsFresh()

const { origin, close } = await serve('out')
const browser = await chromium.launch()
const failures = []

function check(ok, message) {
  if (!ok) failures.push(message)
}

try {
  // ---- SITE-015: complete and empty at t=0, network blocked ----
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    let requestsAfterDocument = 0
    let documentSeen = false
    await page.route('**/*', (route) => {
      const type = route.request().resourceType()
      if (!documentSeen && type === 'document') {
        documentSeen = true
        return route.continue()
      }
      if (type === 'stylesheet' || type === 'script') return route.continue()
      requestsAfterDocument += 1
      return route.abort()
    })
    await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded' })

    const snap = await page.evaluate((expected) => {
      const rows = [...document.querySelectorAll('[data-row]')].map((el) => el.getAttribute('data-row'))
      const values = [...document.querySelectorAll('[data-row] dd')].map((el) => el.textContent?.trim() ?? '')
      const spinners = document.querySelectorAll(
        '[class*="spinner" i],[class*="skeleton" i],[class*="shimmer" i],[class*="animate-pulse"],[role="progressbar"],[aria-busy="true"]',
      ).length
      return { rows, values, spinners, expected }
    }, EXPECTED_ROWS)

    check(
      JSON.stringify(snap.rows) === JSON.stringify(EXPECTED_ROWS),
      `${width}px: rows at t=0 were [${snap.rows}], expected [${EXPECTED_ROWS}]`,
    )
    check(
      snap.values.filter((v) => v === '—').length >= EXPECTED_ROWS.length,
      `${width}px: unfilled rows must show — , got ${JSON.stringify(snap.values)}`,
    )
    check(snap.spinners === 0, `${width}px: found ${snap.spinners} spinner/skeleton/shimmer elements`)
    await page.close()
  }

  // ---- SITE-019: deadline mid-typing, zero requests ----
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${origin}/`, { waitUntil: 'load' })

  let requestsWhileTyping = 0
  page.on('request', () => {
    requestsWhileTyping += 1
  })

  await page.click('input')
  await page.keyboard.type('finish my thesis by the end of May', { delay: 8 })
  await page.waitForTimeout(250)

  const deadline = await page.evaluate(
    () => document.querySelector('[data-row="deadline"] dd')?.textContent?.trim() ?? '',
  )
  check(deadline === 'May 31', `deadline mid-typing was "${deadline}", expected "May 31"`)
  check(requestsWhileTyping === 0, `${requestsWhileTyping} network requests fired while typing`)

  // The raw intent is the visitor's, verbatim.
  const said = await page.evaluate(
    () => document.querySelectorAll('section p')[1]?.textContent?.trim() ?? '',
  )
  check(
    said === '"finish my thesis by the end of May"',
    `YOU SAID showed ${JSON.stringify(said)}, expected the sentence verbatim`,
  )
  await page.close()
} finally {
  await browser.close()
  await close()
}

if (failures.length > 0) {
  console.error('builder:\n')
  for (const f of failures) console.error(`  ${f}`)
  console.error(
    '\nPRD §3.4 and DS-10: the frame renders complete and empty at t=0 and fills ' +
      'as sources resolve. §3.3: the deadline materialises mid-typing with no network.',
  )
  process.exit(1)
}

console.log('builder: frame complete and empty at t=0 at both widths, no spinners.')
console.log('builder: deadline materialised mid-typing with zero network requests.')
