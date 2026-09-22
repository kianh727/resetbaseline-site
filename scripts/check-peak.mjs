/*
 * The Peak's guarantees — v5 §7, §11.2, DS-6, and §3 of the constitution.
 *
 * **Every one of these is a way the scene must be able to cost nothing.** §3 is
 * explicit that `FlatLayout` is the reference implementation and a great
 * builder with a simplified Peak is launchable, so the scene's correctness is
 * mostly about what happens when it is absent.
 *
 * Runs with software GL, because the runner has no GPU — which is also what
 * makes the "no WebGL" branch testable on the same machine.
 *
 * §0.3d: the export is asserted newer than its sources.
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

import { serve } from './serve-out.mjs'

const OUT = 'out'
/* ANGLE's software backend. Without these the runner has no WebGL at all. */
const GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']

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

const { origin, close } = await serve(OUT)

/** Count canvases after the scene has had time to mount. */
async function canvases(browser, url, contextOptions = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...contextOptions })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1600)
  const count = await page.locator('canvas').count()
  const animations = await page.evaluate(() =>
    typeof window.__peakFrames === 'number' ? window.__peakFrames : null,
  )
  await context.close()
  return { count, errors, animations }
}

const gpu = await chromium.launch({ args: GL_ARGS })

try {
  /* ── Tier gating (SITE-058, §15) ──────────────────────────────────────── */

  const tierA = await canvases(gpu, `${origin}/?tier=A`)
  if (tierA.count !== 1) {
    fail(`tier A renders ${tierA.count} canvases — expected exactly 1, so everything below is vacuous`)
  }
  for (const error of tierA.errors) fail(`tier A page error: ${error}`)

  for (const tier of ['C', 'D']) {
    const result = await canvases(gpu, `${origin}/?tier=${tier}`)
    if (result.count !== 0) {
      fail(
        `tier ${tier} renders a canvas. §15's ladder puts C and D on the flat path ` +
          '(SITE-058) — a device already detected as low-end should not then be ' +
          'asked to compile a shader.',
      )
    }
  }

  /* ── Reduced motion draws once and stops (§7.2) ───────────────────────── */

  {
    const context = await gpu.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto(`${origin}/?tier=A`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1600)

    if ((await page.locator('canvas').count()) !== 1) {
      fail('reduced motion removed the scene entirely — the structure must still be there')
    }

    /*
     * **A running rAF loop is what reduced motion must not have.** Measured by
     * counting frames over a window rather than by inspecting state: a loop
     * that scheduled itself and drew nothing would pass a state check.
     */
    const frames = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let n = 0
          const start = performance.now()
          const tick = () => {
            n++
            if (performance.now() - start < 400) requestAnimationFrame(tick)
            else resolve(n)
          }
          requestAnimationFrame(tick)
        }),
    )
    // The page's own rAF still runs; what matters is that the scene is not
    // driving one. Asserted via the canvas not changing.
    const first = await page.locator('canvas').screenshot()
    await page.waitForTimeout(600)
    const second = await page.locator('canvas').screenshot()
    if (!first.equals(second)) {
      fail(
        'under reduced motion the scene is still animating. §7.2\'s sweep is the ' +
          'motion, so stopping it is the whole of what reduced motion means here.',
      )
    }
    if (frames < 1) fail('the frame probe never ran, so the comparison above proves nothing')

    await context.close()
  }

  /* ── The scene never intercepts a tap ─────────────────────────────────── */

  {
    const context = await gpu.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    await page.goto(`${origin}/?tier=A`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1600)

    /*
     * The builder must still be usable with the canvas over the fold. A scene
     * that swallowed a click on Run would be the atmosphere beating the product,
     * which §3 settles the other way.
     */
    await page.fill('input[type="text"]', 'finish my thesis by May 20, weekdays')
    await page.getByRole('button', { name: /run/i }).first().click({ timeout: 3000 })
    await page.waitForTimeout(500)
    if ((await page.locator('[data-mark]').count()) === 0) {
      fail('the builder did not produce a plan with the scene mounted')
    }
    await context.close()
  }
} finally {
  await gpu.close()
}

/* ── DS-6 · no WebGL at all ──────────────────────────────────────────────── */

const noGpu = await chromium.launch({ args: ['--disable-gpu', '--disable-webgl', '--disable-3d-apis'] })
try {
  const context = await noGpu.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(`${origin}/?tier=A`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1600)

  for (const error of errors) fail(`with WebGL disabled: ${error}`)

  if ((await page.locator('canvas').count()) !== 0) {
    fail('a canvas survived with WebGL disabled — it would render nothing and occupy layout')
  }

  /* DS-6: the full loop completes with WebGL disabled. */
  await page.fill('input[type="text"]', 'finish my thesis by May 20, weekdays')
  await page.getByRole('button', { name: /run/i }).first().click({ timeout: 3000 })
  await page.waitForTimeout(500)
  const marks = await page.locator('[data-mark]').count()
  if (marks === 0) fail('DS-6: the loop did not complete with WebGL disabled')

  await context.close()
} finally {
  await noGpu.close()
  await close()
}

if (failures > 0) {
  process.stderr.write(`\n${failures} Peak failure(s).\n`)
  process.exit(1)
}

process.stdout.write(
  'peak ok — tier A renders it, C and D do not, reduced motion draws once and stops, ' +
    'the builder works with it mounted, and with WebGL disabled there is no canvas ' +
    'and the loop still completes (DS-6).\n',
)
