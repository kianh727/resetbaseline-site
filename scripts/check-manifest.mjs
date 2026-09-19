/*
 * SITE-004 · CLI wrapper for §6.6's staleness fallback.
 *
 * Exits 1 on fail, 0 on warn or ok. A warning is deliberately not a failure —
 * §6.6 gives 30 days of notice precisely so the manifest can be re-captured
 * without a red build in the meantime.
 *
 * NOT YET IN THE CI SWEEP. contracts-manifest.json has not landed (the app
 * session commits it, ruled 2026-09-19), and wiring this in before it exists
 * would paint CI red for a dependency everyone already knows is pending —
 * which is noise, not a signal. It joins the sweep in the same commit as the
 * manifest. Its logic is exercised now by tests/manifest-staleness.test.mjs.
 */

import { readFileSync } from 'node:fs'
import { evaluate } from './manifest-staleness.mjs'

const PATH = 'contracts-manifest.json'

let parsed = null
try {
  parsed = JSON.parse(readFileSync(PATH, 'utf8'))
} catch (err) {
  if (err instanceof SyntaxError) {
    console.error(`manifest: ${PATH} is not valid JSON — ${err.message}`)
    process.exit(1)
  }
  // Absent. evaluate() treats that as a failure rather than a pass.
}

const result = evaluate(parsed, new Date())

if (result.status === 'fail') {
  console.error(`manifest: ${result.message}`)
  process.exit(1)
}
if (result.status === 'warn') {
  console.warn(`manifest: ${result.message}`)
  process.exit(0)
}
console.log(`manifest: ${result.message}`)
