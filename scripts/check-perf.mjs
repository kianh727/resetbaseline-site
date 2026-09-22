/*
 * §11.2's budgets, measured — LCP on mobile 4G, CLS, INP.
 *
 * **Measured rather than estimated**, which §7 requires of DS-3 and DS-4 and
 * which the numbers here are only worth anything under. Throttling is applied
 * through CDP: Lighthouse's own Slow-4G shape (1.6 Mbps down, 750 Kbps up,
 * 150ms RTT) and a 4× CPU slowdown, on a 375px viewport, because "mobile 4G" is
 * a device as much as a connection and an unthrottled headless run on a server
 * CPU measures neither.
 *
 * **Lighthouse itself is not run**, and that is a stated gap rather than a
 * silent one: it is ~30 MB of dev dependency whose mobile score is a weighted
 * blend of the three metrics below plus checks this repository already makes
 * standing gates (metadata, contrast, touch targets, viewport). The three
 * ceilings are what a regression would move, and they are measured directly.
 * Running Lighthouse for the ≥90 line is a real remaining item; it is recorded
 * in the output rather than implied to have passed.
 *
 * ---
 *
 * **Observers are registered before navigation** via `addInitScript`, because
 * one attached after `load` misses the entries it exists to read and reports
 * nothing — which, asserted naively, reads exactly like a fast page. Same
 * reasoning as `check-lcp.mjs`, and the entry counts are asserted before the
 * values for the same reason.
 *
 * **§0.3d: the export is asserted newer than its sources.**
 *
 * @implements SITE-EVAL-053
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

import { serve } from './serve-out.mjs'

const OUT = 'out'

/** §11.2, verbatim. Written here and nowhere else in this file. */
const BUDGETS = { lcpMs: 1800, cls: 0.05, inpMs: 200 }

/** Lighthouse's Slow 4G. The network shape is absolute; the CPU is not. */
const THROTTLE = {
  downloadKbps: 1600,
  uploadKbps: 750,
  latencyMs: 150,
}

/*
 * **The CPU multiplier is calibrated to the host, not fixed at 4x.**
 *
 * A fixed 4x means something different on every machine: it multiplies whatever
 * the host already is. This check read INP at 40ms on a developer machine and
 * 688ms on a shared CI runner from the same commit -- and the 688 was not a
 * regression, it was a slower machine with the same multiplier applied on top.
 * An absolute budget measured through a relative throttle is measuring the
 * runner, which is the timezone finding in a different costume: the environment
 * quietly changed what the number meant.
 *
 * So the host is benchmarked first and the multiplier chosen to land it on a
 * fixed reference speed -- which is what Lighthouse itself does, and why it
 * warns when the host is too slow to simulate a mobile device at all. The
 * budget is then compared against roughly the same simulated device wherever it
 * runs.
 *
 * `TARGET_MS` is the benchmark's intended duration on the device §11.2 means by
 * "mobile". A host already slower than that gets 1x, because slowing it further
 * would measure a device nobody has.
 */
const CPU_BENCHMARK_TARGET_MS = 260
const CPU_MULTIPLIER_MAX = 6

/** A fixed, allocation-free integer loop. Deliberately dull and deterministic. */
const CPU_BENCHMARK = () => {
  const started = performance.now()
  let acc = 0
  for (let i = 0; i < 6_000_000; i++) acc = (acc + i * 7) % 1_000_003
  return { ms: performance.now() - started, acc }
}

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

const COLLECT = () => {
  const store = { lcp: 0, lcpEntries: 0, shifts: [], clsEntries: 0, inp: 0, inpName: '', inpEntries: 0 }
  // eslint-disable-next-line no-undef
  window.__perf = store

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      store.lcpEntries++
      store.lcp = Math.max(store.lcp, entry.startTime)
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true })

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      store.clsEntries++
      // Shifts the user caused are excluded, which is what CLS means.
      if (!entry.hadRecentInput) store.shifts.push(entry.value)
    }
  }).observe({ type: 'layout-shift', buffered: true })

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      store.inpEntries++
      if (entry.duration > store.inp) {
        store.inp = entry.duration
        // Naming the slowest interaction, because "INP is 504ms" sends the
        // next person profiling the whole page.
        store.inpName = entry.name
      }
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 })
}

const { origin, close } = await serve(OUT)
const browser = await chromium.launch()
const results = {}
let calibration = { hostMs: 0, cpuSlowdown: 0 }

try {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  await page.addInitScript(COLLECT)

  const cdp = await context.newCDPSession(page)

  /*
   * Calibrate before throttling anything, on a blank page, so the benchmark
   * measures the host rather than the host plus this site.
   */
  await page.goto('about:blank')
  const hostMs = (await page.evaluate(CPU_BENCHMARK)).ms
  const cpuSlowdown = Math.min(
    CPU_MULTIPLIER_MAX,
    Math.max(1, Math.round((CPU_BENCHMARK_TARGET_MS / hostMs) * 10) / 10),
  )
  calibration = { hostMs, cpuSlowdown }

  if (cpuSlowdown === 1) {
    /*
     * Reported rather than failed. A host this slow cannot simulate the target
     * device, so the numbers below are the host's own — still a regression
     * signal, but not comparable to the budget. Saying so beats a silent pass.
     */
    process.stdout.write(
      `perf: the host ran the benchmark in ${hostMs.toFixed(0)}ms against a ` +
        `${CPU_BENCHMARK_TARGET_MS}ms target, so no CPU throttle was applied — ` +
        'it is already at or below the simulated device.\n',
    )
  }

  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (THROTTLE.downloadKbps * 1000) / 8,
    uploadThroughput: (THROTTLE.uploadKbps * 1000) / 8,
    latency: THROTTLE.latencyMs,
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuSlowdown })

  await page.goto(origin, { waitUntil: 'load' })
  await page.waitForTimeout(1500)

  /*
   * INP needs an interaction to measure. The one that matters is the first
   * keystroke, because that is where the deterministic parse runs synchronously
   * during render — the single place on this page where typing does real work.
   */
  await page.click('input[type="text"]')
  await page.type('input[type="text"]', 'finish my thesis by May 20, weekdays', { delay: 40 })
  await page.getByRole('button', { name: /run/i }).first().click()
  await page.waitForTimeout(1200)

  const perf = await page.evaluate(() => {
    const s = window.__perf
    return {
      lcp: s.lcp,
      lcpEntries: s.lcpEntries,
      cls: s.shifts.reduce((a, b) => a + b, 0),
      clsEntries: s.clsEntries,
      inp: s.inp,
      inpName: s.inpName ?? '(none)',
      inpEntries: s.inpEntries,
    }
  })

  Object.assign(results, perf)

  /* ── Counts before values ─────────────────────────────────────────────── */

  if (perf.lcpEntries === 0) {
    fail('no LCP entry was recorded. A page producing none reports 0ms, which reads as instant.')
  }
  if (perf.inpEntries === 0) {
    fail('no interaction entries were recorded, so 0ms INP means "not measured", not "fast".')
  }
  /*
   * A zero CLS with zero entries is ambiguous, and the ambiguity matters in
   * only one direction: it is either a page that never shifted or an observer
   * that never fired. The LCP and INP counts above tell us the observers work,
   * so zero entries here is the good case and is reported rather than failed.
   */

  if (perf.lcp > BUDGETS.lcpMs) {
    fail(`LCP ${perf.lcp.toFixed(0)}ms exceeds §11.2's ${BUDGETS.lcpMs}ms on mobile 4G`)
  }
  if (perf.cls > BUDGETS.cls) {
    fail(`CLS ${perf.cls.toFixed(3)} exceeds §11.2's ${BUDGETS.cls}`)
  }
  if (perf.inp > BUDGETS.inpMs) {
    fail(`INP ${perf.inp.toFixed(0)}ms on "${perf.inpName}" exceeds §11.2's ${BUDGETS.inpMs}ms`)
  }
} finally {
  await browser.close()
  await close()
}

process.stdout.write(
  `perf, 375px, Slow 4G (${THROTTLE.downloadKbps}kbps, ${THROTTLE.latencyMs}ms RTT), ` +
    `${calibration.cpuSlowdown}x CPU calibrated from a ${calibration.hostMs.toFixed(0)}ms ` +
    `host benchmark against a ${CPU_BENCHMARK_TARGET_MS}ms target:\n` +
    `  LCP  ${results.lcp?.toFixed(0)}ms   of ${BUDGETS.lcpMs}ms   (${results.lcpEntries} entries)\n` +
    `  CLS  ${results.cls?.toFixed(3)}      of ${BUDGETS.cls}      (${results.clsEntries} shifts)\n` +
    `  INP  ${results.inp?.toFixed(0)}ms     of ${BUDGETS.inpMs}ms    (${results.inpEntries} events, worst: ${results.inpName})\n` +
    '  Lighthouse mobile ≥90: not run here — see this file\'s header.\n',
)

if (failures > 0) {
  process.stderr.write(`\n${failures} budget failure(s).\n`)
  process.exit(1)
}
