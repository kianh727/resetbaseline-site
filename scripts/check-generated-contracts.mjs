/*
 * SITE-004 · The generated contract types match the manifest.
 *
 * Regenerates lib/contracts/generated.ts in memory from
 * contracts-manifest.json and fails on any difference from the committed
 * file. That is SITE-004's *Tests* line — "a deliberately altered manifest
 * still fails CI" — and it is the half PRD §6.2's "derived, not hand-listed"
 * actually rests on: a generated file nobody re-derives is a hand-list with a
 * comment at the top saying it isn't.
 *
 * **Its two sources are the manifest on disk and the file in git.** Neither is
 * computed from the other at check time, so it is not §0.3b — unlike the
 * rejected "the derivation still matches the verb list", which derived from
 * the verb list and compared the result to the verb list.
 *
 * NOT YET IN THE CI SWEEP. Joins it in the same commit as the manifest, with
 * check-manifest and check-layout-rules. Wiring a red check in ahead of a
 * pending dependency everyone knows about is noise, not signal.
 */

import { readFileSync } from 'node:fs'
import { emit } from './generate-contract-types.mjs'

const MANIFEST = 'contracts-manifest.json'
const GENERATED = 'lib/contracts/generated.ts'

let parsed
try {
  parsed = JSON.parse(readFileSync(MANIFEST, 'utf8'))
} catch (err) {
  console.error(
    `generated-contracts: cannot read ${MANIFEST} — ${err.message}. Absence is a ` +
      'failure, not a pass: a drift guard that goes green with no manifest goes ' +
      'green on exactly the state it exists to catch.',
  )
  process.exit(1)
}

let expected
try {
  expected = emit(parsed, MANIFEST)
} catch (err) {
  console.error(`generated-contracts: ${err.message}`)
  process.exit(1)
}

let actual
try {
  actual = readFileSync(GENERATED, 'utf8')
} catch {
  console.error(
    `generated-contracts: ${GENERATED} is missing. Run \`npm run generate:contracts\`.`,
  )
  process.exit(1)
}

if (actual !== expected) {
  const a = actual.split('\n')
  const e = expected.split('\n')
  const at = a.findIndex((line, i) => line !== e[i])
  console.error(
    `generated-contracts: ${GENERATED} does not match ${MANIFEST}.\n` +
      `  first difference at line ${at + 1}\n` +
      `    committed: ${JSON.stringify(a[at] ?? '(end of file)')}\n` +
      `    manifest:  ${JSON.stringify(e[at] ?? '(end of file)')}\n` +
      '  Either the manifest moved and the types were not regenerated, or the ' +
      'generated file was edited by hand. Both are drift. Run ' +
      '`npm run generate:contracts`.',
  )
  process.exit(1)
}

console.log(`generated-contracts: ${GENERATED} matches ${MANIFEST}.`)
