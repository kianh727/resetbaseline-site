/*
 * SITE-059 · The failure-state hardening sweep, plus the degradation paths
 * §11's "Degradation (v5 §15, the builder never degrades)" names.
 *
 * **Every axis is a way the site can be worse than intended, and the claim is
 * the same for all of them: something honest renders and nothing is broken.**
 * SITE-059's accept is *"zero dead states, zero spinners, zero broken layouts"*,
 * and each of those three is asserted as a separate thing, because a page that
 * failed to render satisfies all three vacuously.
 *
 * ---
 *
 * **SITE-059's matrix is five generation failures × four tiers × two widths.**
 * The five failure modes do not vary the client loop at all, and that is the
 * result rather than a gap: **there is no provider on the builder's path.** The
 * plan is deterministic and client-side, so a generation failure cannot reach
 * it — which is DS-7 and DS-10 satisfied by construction. The five are exercised
 * against the handler in `tests/plan-route.test.ts`, each as its own reason.
 * What this sweep varies is what *can* change the rendered result: the tier, the
 * width, the network, JavaScript, motion, and the reader's own text size.
 *
 * **Counts before properties, throughout.** "No spinner" and "no overflow" are
 * both satisfied perfectly by a blank page, so every combination asserts the
 * plan actually rendered before asserting anything about how.
 *
 * §0.3d: the export is asserted newer than its sources.
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

import { serve } from './serve-out.mjs'

const OUT = 'out'
const TIERS = ['A', 'B', 'C', 'D']
const WIDTHS = [1440, 375]
const GOAL = 'finish my thesis by May 20, weekdays'

let failures = 0
const fail = (message) => {
  failures++
  process.stderr.write(`FAIL  ${message}\n`)
}

const newest = (dir) =>
  readdirSync(dir).reduce((max, entry) => {
    const full = join(dir, entry)
    const stat = statSync(full)
    return Math.max(max, stat.isDirectory() ? newest(full) : stat.mtimeMs)
  }, 0)

if (!existsSync(join(OUT, 'index.html'))) {
  process.stderr.write('FAIL  no export. Run the build first.\n')
  process.exit(1)
}
if (
  Math.max(...['app', 'components', 'lib'].map(newest)) >
  statSync(join(OUT, 'index.html')).mtimeMs
) {
  fail(`${OUT}/ is older than its sources — this just measured the previous build (§0.3d).`)
}

/**
 * The three SITE-059 clauses, asserted on a page that has just built a plan.
 *
 * Returns nothing; it fails by name, with the combination in the message,
 * because "one of forty combinations is broken" is not an actionable report.
 */
async function assertHealthy(page, label, { expectPlan = true } = {}) {
  /* ── Zero dead states ───────────────────────────────────────────────── */

  if (expectPlan) {
    const marks = await page.locator('[data-mark]').count()
    if (marks === 0) {
      fail(`${label}: no plan rendered. Every assertion below would pass vacuously.`)
      return
    }
  }

  const bodyText = (await page.locator('body').innerText()).trim()
  if (bodyText.length < 200) {
    fail(`${label}: the page has ${bodyText.length} characters of text — it is blank or broken`)
  }

  /* ── Zero spinners ──────────────────────────────────────────────────── */

  /*
   * DS-10 and Rejection 4: no spinner, skeleton or shimmer exists anywhere in
   * the builder. Checked as rendered classes and as animated placeholder
   * elements, because a skeleton is usually a div with a pulse rather than
   * anything named "spinner".
   */
  const spinners = await page.evaluate(() => {
    const suspect = [...document.querySelectorAll('*')].filter((el) => {
      const cls = typeof el.className === 'string' ? el.className : ''
      return /spinner|skeleton|shimmer|animate-pulse|loading/i.test(cls)
    })
    return suspect.map((el) => el.tagName + '.' + el.className).slice(0, 3)
  })
  if (spinners.length > 0) {
    fail(`${label}: waiting state present — ${spinners.join(', ')}`)
  }

  /* ── Zero broken layouts ────────────────────────────────────────────── */

  /*
   * `overflow-x: clip` is on the root (SITE-005), and it removes the overflow
   * from `scrollWidth` — the guard §9 requires hides the defect from the test
   * written to find it (§0.3a). So the clip is lifted before measuring, and
   * the output says that it was.
   */
  const overflow = await page.evaluate(() => {
    const html = document.documentElement
    const body = document.body
    const before = [html.style.overflowX, body.style.overflowX]
    html.style.overflowX = 'visible'
    body.style.overflowX = 'visible'
    const width = Math.max(html.scrollWidth, body.scrollWidth)
    let widest = ''
    if (width > html.clientWidth) {
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect()
        if (r.right > html.clientWidth + 1) {
          widest = `${el.tagName}.${typeof el.className === 'string' ? el.className : ''}`
          break
        }
      }
    }
    html.style.overflowX = before[0]
    body.style.overflowX = before[1]
    return { width, viewport: html.clientWidth, widest }
  })

  if (overflow.width > overflow.viewport + 1) {
    fail(
      `${label}: horizontal overflow — ${overflow.width}px unclipped against a ` +
        `${overflow.viewport}px viewport, widest element ${overflow.widest}`,
    )
  }
}

/** Type a goal and press Run. */
async function buildPlan(page) {
  await page.fill('input[type="text"]', GOAL)
  await page.getByRole('button', { name: /run/i }).first().click()
  await page.waitForTimeout(600)
}

const { origin, close } = await serve(OUT)
const browser = await chromium.launch()
let combinations = 0

try {
  /* ── Tier × width ─────────────────────────────────────────────────────── */

  for (const tier of TIERS) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 800 } })
      await page.goto(`${origin}/?tier=${tier}`, { waitUntil: 'networkidle' })
      await buildPlan(page)
      await assertHealthy(page, `tier ${tier} @ ${width}px`)
      combinations++
      await page.close()
    }
  }

  /* ── Network off after load ───────────────────────────────────────────── */

  /*
   * **The strongest claim on the site, tested as one.** Tuning is fully local
   * and the plan is deterministic, so the whole loop must complete with the
   * network cut — not degrade, complete. If anything here needed a request,
   * this is where it shows.
   */
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 800 } })
    const page = await context.newPage()
    await page.goto(origin, { waitUntil: 'networkidle' })

    await context.setOffline(true)
    const requests = []
    page.on('request', (r) => requests.push(r.url()))

    await buildPlan(page)
    await assertHealthy(page, `offline @ ${width}px`)

    if (requests.length > 0) {
      fail(`offline @ ${width}px: ${requests.length} request(s) attempted — ${requests[0]}`)
    }
    combinations++
    await context.close()
  }

  /* ── JavaScript disabled ──────────────────────────────────────────────── */

  /*
   * DS-6's neighbour: the site must be comprehensible without the builder
   * running. **It does not have to be interactive** — that would be a claim the
   * page cannot honour — so this asserts the sections render and read, and that
   * nothing pretends to work. `expectPlan` is false because no plan can exist.
   */
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
      javaScriptEnabled: false,
    })
    const page = await context.newPage()
    await page.goto(origin, { waitUntil: 'load' })
    await assertHealthy(page, `no-JS @ ${width}px`, { expectPlan: false })

    const heading = await page.locator('h1').first().innerText()
    if (heading.trim().length === 0) {
      fail(`no-JS @ ${width}px: no headline — the page is not comprehensible`)
    }
    combinations++
    await context.close()
  }

  /* ── The reader's own text size ───────────────────────────────────────── */

  /*
   * **A reader who has set a larger default font size is not an edge case**,
   * and it is the one degradation axis that is invisible to every other check
   * here, because it changes nothing about the markup. 200% is the ceiling
   * WCAG 1.4.4 names.
   */
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 800 } })
    await page.goto(origin, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    await buildPlan(page)
    await assertHealthy(page, `200% text @ ${width}px`)
    combinations++
    await page.close()
  }

  /* ── The narrowest viewport, in the plan state ────────────────────────── */

  {
    const page = await browser.newPage({ viewport: { width: 320, height: 800 } })
    await page.goto(origin, { waitUntil: 'networkidle' })
    await buildPlan(page)
    await assertHealthy(page, '320px with a plan')
    combinations++
    await page.close()
  }
} finally {
  await browser.close()
  await close()
}

if (combinations < 15) {
  fail(`only ${combinations} combinations ran — the sweep is not sweeping`)
}

if (failures > 0) {
  process.stderr.write(`\n${failures} degradation failure(s) across ${combinations} combinations.\n`)
  process.exit(1)
}

process.stdout.write(
  `degradation ok — ${combinations} combinations: 4 tiers × 2 widths, offline, ` +
    'no-JS, 200% text, and 320px. Zero dead states, zero spinners, zero broken ' +
    'layouts (overflow measured with the root clip lifted).\n',
)
