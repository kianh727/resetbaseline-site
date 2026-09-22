/*
 * Reduced motion is asserted in both settings — PRD v7.3 §11.1 (v5 §8.3), §6.
 *
 * **Why this exists: the environment audit, 2026-09-19.** The timezone finding
 * generalised — *a behaviour that only exists in an environment CI never enters
 * is a behaviour CI does not test.* The audit asked which checks assert
 * something environment-dependent while running in exactly one environment.
 *
 * Four source files branch on `prefers-reduced-motion`: `app/globals.css` (the
 * grain overlay), `components/plan/flat-plan.tsx` (the mark fan-out),
 * `lib/hooks/use-reduced-motion.ts` and `lib/motion/settle.ts`. **No automated
 * check ever set it.** Both browser scripts ran at the runner's default, which
 * is motion-allowed — so every reduced-motion branch on the site was verified
 * only by hand, and by hand leaves no artifact.
 *
 * ---
 *
 * **It asserts both settings, and that is the whole design.**
 *
 * Checking only the reduced case passes perfectly on a site that never animates
 * at all — which is §0.3 with the motion as the missing thing. So each
 * assertion below is a **pair**: the behaviour must be absent under `reduce`
 * *and present without it*. A regression in either direction fails.
 *
 * **What the audit found no exposure for, recorded so it is not rebuilt:**
 *
 * - **Theme.** Zero `prefers-color-scheme`, `dark:` or `data-theme` in `app/`,
 *   `components/` or `lib/`. The site is single-theme by construction, so there
 *   is no theme-dependent assertion running in one environment — there is no
 *   theme-dependent assertion. A matrix here would have nothing to check.
 * - **Locale.** Zero `toLocale*` and zero `Intl.*`. Dates are formatted from
 *   `getDate()` and a written-out month list. That is a choice, and it is
 *   guarded by a scan below rather than left to erode.
 * - **Viewport.** Already a six-width matrix in `check-overflow.mjs`.
 *
 * **Reported and deliberately not matrixed:** device pixel ratio (hairlines are
 * 1px and marks 3px; both scripts run at DPR 1, and a retina device renders
 * both differently) and **font availability** — the site renders in the system
 * stack, so the overflow check measures the runner's fonts. A matrix cannot fix
 * the second, because the candidate faces are not obtainable; it lands with the
 * typeface decision instead.
 */

import { chromium } from 'playwright-core'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from './serve-out.mjs'

const ROUTE = '/'
const failures = []

function check(ok, message) {
  if (!ok) failures.push(message)
}

/* ------------------------------------------------------------------ *
 * The locale guard — a scan, because the absence of a call is the rule.
 * ------------------------------------------------------------------ */

function sourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (/\.tsx?$/.test(entry)) acc.push(full)
  }
  return acc
}

for (const dir of ['app', 'components', 'lib']) {
  for (const file of sourceFiles(dir)) {
    const source = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ')
    check(
      !/\.toLocale[A-Za-z]*\(|\bIntl\.[A-Za-z]/.test(source),
      `${file} formats through the locale. Dates and numbers on this site are ` +
        `formatted explicitly, so the same plan reads the same everywhere and ` +
        `the runner's locale is not a hidden input.`,
    )
  }
}

/* ------------------------------------------------------------------ *
 * The pair: reduced and not.
 * ------------------------------------------------------------------ */

const server = await serve('out')
const browser = await chromium.launch()

async function measure(reduced) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(reduced ? { reducedMotion: 'reduce' } : {}),
  })
  const page = await ctx.newPage()
  await page.goto(`${server.origin}${ROUTE}`, { waitUntil: 'load' })
  const result = await page.evaluate(() => {
    const grain = getComputedStyle(document.body, '::after')
    return {
      grainAnimation: grain.animationName,
      grainVisible: grain.content !== 'none' && Number(grain.opacity) > 0,
    }
  })
  await ctx.close()
  return result
}

const moving = await measure(false)
const still = await measure(true)

check(
  moving.grainVisible && still.grainVisible,
  'the grain overlay must render in both settings — §12.3a puts it in every tier, ' +
    'and reduced motion removes the movement, not the texture',
)
check(
  moving.grainAnimation !== 'none',
  'the grain must animate when motion is allowed. If it never animates, the ' +
    'reduced-motion assertion below passes against nothing (§0.3).',
)
check(
  still.grainAnimation === 'none',
  `the grain must not animate under prefers-reduced-motion; it is "${still.grainAnimation}". ` +
    'v5 §8.3, inlined at §11.1: "grain renders statically".',
)

await browser.close()
await server.close()

if (failures.length > 0) {
  console.error('motion: reduced-motion or locale handling is wrong.\n')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}

console.log(
  'motion: grain animates with motion allowed and is static under reduce; ' +
    'no locale-dependent formatting in app, components or lib.',
)
