/*
 * SITE-004 · Arrival verification for contracts-manifest.json.
 *
 * Ruled 2026-09-19 (Kian): **verify the four lists are present with counts
 * 5/3/5/3 before building anything on them, and if any is missing or a count
 * disagrees, stop and report rather than working around it.** The envelope is
 * hand-assembled, and catching a bad publish costs one run where building on
 * one costs everything downstream of it.
 *
 * This is run once, by hand, at the moment the file lands — not a CI check.
 * The standing checks are check-manifest (staleness), check-layout-rules
 * (coverage) and check-generated-contracts (drift). This one answers a
 * different question: **is this delivery the thing we asked for at all.**
 *
 * It reports all four axes rather than stopping at the first failure. Four
 * problems surfaced one per run is three wasted round trips with a person in
 * the loop.
 *
 * The expected counts are PRD §6.3's, written into scripts/contract-axes.mjs
 * and not read from the manifest — a count read from the file it checks cannot
 * disagree with it (§0.3b). A legitimate vocabulary change makes them wrong,
 * and that is the intended outcome: a contract change should break this build
 * (§6.6, §12.3).
 *
 *   node scripts/verify-manifest-arrival.mjs [path]
 */

import { readFileSync } from 'node:fs'
import { verifyArrival } from './contract-axes.mjs'

const path = process.argv[2] ?? 'contracts-manifest.json'

let parsed
try {
  parsed = JSON.parse(readFileSync(path, 'utf8'))
} catch (err) {
  console.error(`arrival: cannot read ${path} — ${err.message}`)
  process.exit(1)
}

/* The envelope, per docs/contracts-manifest-delivery.md. */
const envelope = typeof parsed === 'object' && parsed !== null ? parsed : {}
const sha = envelope.app_commit_sha
const captured = envelope.captured_at

console.log(`arrival: ${path}`)
console.log(
  `  app_commit_sha  ${typeof sha === 'string' && /^[0-9a-f]{40}$/.test(sha) ? sha : `INVALID — ${JSON.stringify(sha)}`}`,
)
console.log(
  `  captured_at     ${typeof captured === 'string' ? captured : `INVALID — ${JSON.stringify(captured)}`}`,
)
console.log('')

const { ok, lines } = verifyArrival(parsed)
for (const line of lines) console.log(`  ${line}`)
console.log('')

const envelopeOk =
  typeof sha === 'string' && /^[0-9a-f]{40}$/.test(sha) && typeof captured === 'string'

if (!ok || !envelopeOk) {
  console.error(
    'arrival: STOP. This delivery does not match what the site was told to expect. ' +
      'Report it rather than adapting to it — a site built around a bad publish is ' +
      'indistinguishable from one built around a good one until the vocabulary moves.',
  )
  process.exit(1)
}

console.log('arrival: four axes present at 5/3/5/3, envelope well-formed. Safe to build on.')
