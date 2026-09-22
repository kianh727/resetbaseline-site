/*
 * SITE-005 · Horizontal overflow check.
 *
 * "Zero horizontal scroll at 320px" is a P0 acceptance criterion, and §9 puts
 * it at every width the site claims to support. SITE-EVAL-046 owns the full
 * sweep across every builder state; this is the base-layout half of it, run on
 * every exported route at the six widths the issue names.
 *
 * It measures the rendered document rather than reading the stylesheet. An
 * overflow is a layout outcome — a long unbreakable string, a fixed-width
 * child, a negative margin — and none of those are visible in the CSS that
 * caused them.
 *
 * **It neutralises `overflow-x: clip` before measuring, and this is the whole
 * reason the check works.** §9 puts `clip` on the root, which is a safety net:
 * it stops a stray overflow from producing a scrollbar. But it also removes
 * the overflow from `scrollWidth`, so a check that reads `scrollWidth` on the
 * shipped page reports "clean" on a page that overflows by a thousand pixels.
 * The first version of this script did exactly that and passed a deliberate
 * 1200px probe at 320px wide. The guard was hiding the defect from the test
 * written to find the defect — §0.3 in miniature.
 *
 * So each page is measured twice: **unclipped**, which is the layout truth and
 * what fails the build, and **as shipped**, which is what a visitor's scrollbar
 * would actually do. A page can only fail on the first, because the second is
 * the net and a net that is holding something is still a defect.
 *
 * §12.4: a check that finds no routes and reports success is measuring the
 * container, so it asserts a non-zero route count before it asserts anything
 * about overflow.
 *
 * @implements SITE-EVAL-046
 */

import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { chromium } from 'playwright-core'
import { serve } from './serve-out.mjs'

/** The widths §9 and SITE-005 name. 320 is the floor; 375 is the primary target. */
const WIDTHS = [320, 375, 390, 768, 1440, 1920]

const OUT = 'out'

function routes(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) routes(full, acc)
    else if (entry === 'index.html') acc.push('/' + relative(OUT, dir).replace(/\\/g, '/'))
  }
  return acc
}

const found = [...new Set(routes(OUT))].sort()

if (found.length === 0) {
  console.error(
    'overflow: no routes found in out/. Run `npm run build` first — a sweep over ' +
      'zero pages reports success without having looked at anything.',
  )
  process.exit(1)
}

const { origin, close } = await serve(OUT)
const browser = await chromium.launch()
const failures = []

try {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    for (const route of found) {
      await page.goto(`${origin}${route}`, { waitUntil: 'load' })
      const result = await page.evaluate(() => {
        const root = document.documentElement
        const shipped = root.scrollWidth - root.clientWidth

        /*
         * Lift the clip so the layout can be measured as it actually is. A
         * style element rather than inline styles, so `!important` beats any
         * specificity the stylesheet brings.
         */
        const lift = document.createElement('style')
        lift.textContent = 'html,body{overflow-x:visible !important}'
        document.head.appendChild(lift)
        void root.offsetWidth // force reflow before reading

        const viewport = root.clientWidth
        const unclipped = root.scrollWidth - viewport

        /*
         * Name the widest offending element. An overflow report that says only
         * "8px" sends the next person hunting through the whole page.
         */
        let worst = null
        if (unclipped > 0) {
          for (const el of document.querySelectorAll('*')) {
            const r = el.getBoundingClientRect()
            const past = r.right - viewport
            if (past > 0.5 && (!worst || past > worst.past)) {
              worst = { past, tag: el.tagName.toLowerCase(), cls: el.className?.toString?.() ?? '' }
            }
          }
        }

        lift.remove()
        return { shipped, unclipped, culprit: worst }
      })
      if (result.unclipped > 0) {
        failures.push({ width, route, overflow: result.unclipped, shipped: result.shipped, culprit: result.culprit })
      }
    }
    await page.close()
  }
} finally {
  await browser.close()
  await close()
}

console.log(
  `Horizontal overflow — ${found.length} route(s) × ${WIDTHS.length} widths ` +
    `(${found.join(', ')}):\n`,
)

if (failures.length > 0) {
  for (const f of failures) {
    const where = f.culprit
      ? `${f.culprit.tag}${f.culprit.cls ? `.${f.culprit.cls.split(/\s+/).join('.')}` : ''} extends ${f.culprit.past.toFixed(0)}px past the viewport`
      : 'no single element identified — check a negative margin or a transform'
    const net = f.shipped > 0 ? 'and it is scrolling — the clip is not holding it' : 'clipped, so no scrollbar is visible, but the layout is still wrong'
    console.error(`  ${String(f.width).padStart(4)}px  ${f.route}  overflows by ${f.overflow}px — ${where} (${net})`)
  }
  console.error(
    `\noverflow: zero horizontal scroll is a P0 acceptance criterion at every ` +
      `width (PRD §9, SITE-005, SITE-057). Fix the layout — do not add ` +
      `\`overflow-x: hidden\` to a child to hide it.`,
  )
  process.exit(1)
}

for (const width of WIDTHS) console.log(`  ${String(width).padStart(4)}px  clean`)
console.log(`\noverflow: none at any width, measured with \`overflow-x: clip\` lifted.`)
