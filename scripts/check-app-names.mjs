/*
 * §6.3a · **No depicted Baseline UI names an app.** A MUST.
 *
 * Screen Time returns opaque tokens: the app knows a **count** and nothing
 * else, so a gate object rendering `Instagram, TikTok blocked · 6:00–7:30am` is
 * a UI state the product is structurally incapable of producing. v5 through
 * v7.2 specified exactly that, and it would have shipped a picture of something
 * that cannot exist (v7.3 §6.3a, §10, SITE-040).
 *
 * ---
 *
 * **The rule has two sides and this check is about the boundary between them.**
 *
 * The Protect step's chips are the **site's own input affordance** and
 * legitimately carry recognisable names — SITE-039's non-goal says so, and
 * §6.3a agrees: *"the user picks recognisable names, and the object that lands
 * shows what the app would show."* A check that banned the strings outright
 * would ban the rule along with its violation, which is the shape the lavender
 * scan had to avoid too.
 *
 * So this does not scan for the names. **It drives the actual flow in a
 * browser** — type a goal, run it, select two chips — and then asserts that the
 * assembled **plan object** carries a count and no name.
 *
 * **Why a browser and not a source scan.** The defect is a rendered state. A
 * scan over `lib/` would pass on a component that interpolated a chip label
 * into the gate's label at runtime, because the string never appears in the
 * source. The thing §6.3a forbids is what a visitor sees.
 *
 * **Counts before properties** (§12.4). It asserts the chips were really
 * selected and a gate object really rendered **before** asserting no name is in
 * it — because "no app name in the gate" is satisfied perfectly by a page with
 * no gate, which is the §0.3 shape and is what this check would silently
 * degrade into the first time the selector changed.
 *
 * It also asserts the export is newer than its sources (§0.3d).
 */

import { chromium } from 'playwright-core'
import { readFileSync, statSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from './serve-out.mjs'

const failures = []
const check = (ok, message) => {
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
  console.error('app-names: out/index.html does not exist. Run `npm run build` first.')
  process.exit(1)
}
if (['app', 'components', 'lib'].reduce((n, d) => Math.max(n, newestMtime(d)), 0) > built) {
  console.error(
    'app-names: out/ is older than the source it was built from, so this check would be ' +
      'measuring a stale export rather than the current gate object. Run `npm run build` first.',
  )
  process.exit(1)
}

/*
 * The chip labels, read from the copy module.
 *
 * **This is the one place reading the source is right**, and it is not §0.3b:
 * the check needs to know which strings are *allowed on a chip* in order to
 * assert they are *absent from the object*, and the two are different places in
 * the rendered page. Its second source is the DOM, not the file.
 */
const chipSource = readFileSync('lib/copy/builder-controls.ts', 'utf8')
const APP_CHIPS = [...chipSource.matchAll(/^\s+'([A-Z][A-Za-z]*)',$/gm)].map((m) => m[1])

check(
  APP_CHIPS.length >= 4,
  `only ${APP_CHIPS.length} chip labels were read from the copy module. The check ` +
    'cannot assert their absence from the object without knowing what they are, ' +
    'and an empty list makes every assertion below vacuous (§0.3).',
)

const server = await serve('out')
const browser = await chromium.launch()

try {
  for (const width of [1440, 375]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' })

    await page.fill('input[type="text"]', 'write every weekday by May 20')
    await page.click('button:has-text("Run")')
    await page.waitForSelector('[aria-label="Plan objects"]', { timeout: 5000 })

    /* Select two chips. Counts before properties: assert they took. */
    const chosen = APP_CHIPS.slice(0, 2)
    for (const app of chosen) {
      await page.click(`button[aria-pressed][aria-label="${app}"], button:text-is("${app}")`)
    }
    const pressed = await page.locator('button[aria-pressed="true"]').count()
    check(
      pressed >= chosen.length,
      `${width}px: only ${pressed} controls read as selected after tapping ` +
        `${chosen.length} chips. Every assertion below is satisfied by a page ` +
        'where nothing was selected, so this is asserted first (§0.3).',
    )

    await page.waitForTimeout(200)

    const objects = await page.locator('[aria-label="Plan objects"]').innerText()
    check(
      /\d+\s+apps/.test(objects),
      `${width}px: no gate object rendered a count. "No app name in the gate" is ` +
        'satisfied perfectly by a page with no gate.',
    )

    for (const app of APP_CHIPS) {
      check(
        !objects.includes(app),
        `${width}px: the plan object list contains "${app}". §6.3a is a MUST — ` +
          'Screen Time returns opaque tokens, the app knows a count and nothing ' +
          'else, and a chip label must not survive into the assembled object.',
      )
    }

    await ctx.close()
  }
} finally {
  await browser.close()
  await server.close()
}

if (failures.length > 0) {
  console.error('app-names: a chip label reached a rendered object, or the flow did not run.\n')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}

console.log(
  `app-names: the gate object renders a count at 1440px and 375px; none of ` +
    `${APP_CHIPS.length} chip labels survives into it.`,
)
