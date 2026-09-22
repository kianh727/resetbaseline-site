/*
 * The deployment's headers, exercised against the real page.
 *
 * **A CSP is the one piece of deployment config that breaks the site
 * silently in the direction nobody tests.** Every check in this repository
 * loaded the export over a permissive local server, so all of them were
 * measuring a more permissive site than the one that ships. This runs the page
 * under the headers `_headers` actually declares — `scripts/serve-out.mjs`
 * applies them from the same module that writes the file — and fails on any
 * violation.
 *
 * **It asserts the policy is present and non-trivial first**, because "no CSP
 * violations" is satisfied perfectly by a page served with no CSP, which is
 * §0.3 with the policy as the missing thing. And it asserts the **builder still
 * runs**, because a page that renders and cannot be interacted with produces no
 * violations either.
 *
 * §0.3d: the export is asserted newer than its sources.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

import { serve } from './serve-out.mjs'
import { headerRules } from '../lib/deploy/headers.ts'

const OUT = 'out'
const WIDTHS = [1440, 375]

let failures = 0
const fail = (message) => {
  failures++
  process.stderr.write(`FAIL  ${message}\n`)
}

/* ── §0.3d ───────────────────────────────────────────────────────────────── */

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

/* ── The policy exists and denies something ──────────────────────────────── */

/*
 * **Read from the shipped artefact**, not recomputed from the module. The
 * policy carries per-build hashes, so a check that rebuilt it would be
 * asserting its own input (§0.3b) and would pass against an `_headers` the
 * build never wrote.
 */
const headersText = existsSync(join(OUT, '_headers'))
  ? readFileSync(join(OUT, '_headers'), 'utf8')
  : ''
const csp = headersText.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? ''

if (!csp) {
  fail('no Content-Security-Policy applies to /. Everything below would pass vacuously.')
} else {
  for (const directive of ['default-src', 'script-src', 'connect-src', 'frame-ancestors']) {
    if (!csp.includes(directive)) fail(`the CSP declares no ${directive}`)
  }
  if (/script-src[^;]*'unsafe-inline'/.test(csp)) {
    fail("script-src allows 'unsafe-inline', which is a CSP that permits what CSPs exist to stop")
  }
  const hashes = (csp.match(/'sha256-/g) ?? []).length
  if (hashes === 0) {
    fail(
      'script-src carries no inline-script hashes. The export emits its ' +
        'hydration payload inline, so a policy without them ships a page that ' +
        'renders and does nothing — which is what this check was written for.',
    )
  }
}

if (!existsSync(join(OUT, '_headers'))) {
  fail('_headers is not in the export, so none of this applies in production')
} else {
  /*
   * **Two sources.** The file on disk and the module the server applies. They
   * are generated from one declaration, so this catches the case where the
   * build did not rerun — a stale `_headers` with a policy nobody is testing.
   */
  for (const rule of headerRules()) {
    if (!headersText.includes(rule.path)) fail(`_headers has no rule for ${rule.path}`)
    for (const [name, value] of Object.entries(rule.headers)) {
      // The CSP is compared by name only: its value is per-build by design.
      if (name === 'Content-Security-Policy') continue
      if (!headersText.includes(value)) fail(`_headers is missing ${name} for ${rule.path}`)
    }
  }
}

/* ── The page under those headers ────────────────────────────────────────── */

const { origin, close } = await serve(OUT)
const browser = await chromium.launch()

try {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })

    const violations = []
    const errors = []
    page.on('console', (message) => {
      const text = message.text()
      if (/content security policy|refused to/i.test(text)) violations.push(text)
    })
    page.on('pageerror', (error) => errors.push(String(error)))

    await page.goto(origin, { waitUntil: 'networkidle' })

    /*
     * **The builder must actually run.** A page that renders but whose
     * JavaScript the CSP blocked produces no violations after load and looks
     * exactly like a working one from the outside.
     */
    try {
      await page.fill('input[type="text"]', 'finish my thesis by May 20, weekdays', {
        timeout: 5000,
      })
      await page.getByRole('button', { name: /run/i }).first().click({ timeout: 5000 })
      await page.waitForTimeout(500)

      const marks = await page.locator('[data-mark], rect, [class*="band"]').count()
      if (marks === 0) {
        fail(`at ${width}px the builder produced nothing after Run — the page is not interactive`)
      }
    } catch (error) {
      /*
       * **Reported rather than thrown.** A blocked script makes the input
       * unreachable, and the interesting output is the violation that caused
       * it, not the selector timeout that followed. Throwing here would print
       * a stack trace about a locator and bury the one line naming the
       * directive.
       */
      fail(`at ${width}px the builder is not usable: ${String(error).split('\n')[0]}`)
    }

    for (const violation of violations) fail(`at ${width}px: ${violation}`)
    for (const error of errors) fail(`at ${width}px, page error: ${error}`)

    await page.close()
  }
} finally {
  await browser.close()
  await close()
}

if (failures > 0) {
  process.stderr.write(`\n${failures} CSP/header failure(s).\n`)
  process.exit(1)
}

process.stdout.write(
  `csp ok — ${headerRules().length} header rules, ${(csp.match(/'sha256-/g) ?? []).length} ` +
    `inline-script hashes, the builder runs under them at ` +
    `${WIDTHS.join('px and ')}px, no violations.\n`,
)
