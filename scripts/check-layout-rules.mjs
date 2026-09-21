/*
 * SITE-004 · CLI for the layout-rule coverage check.
 *
 * Two modes, one code path:
 *
 *   node scripts/check-layout-rules.mjs
 *       the real manifest at the repository root against the real layout
 *       rules in lib/render/layout-rules.ts.
 *
 *   node scripts/check-layout-rules.mjs --manifest <path> --rules <path.json>
 *       a fixture pair. This is how accept part 3's positive control runs in
 *       CI — a fixture manifest carrying a sixth unknown type must exit 1.
 *
 * The fixture mode drives **the same evaluate()** the real run drives. A
 * positive control that exercised a second implementation would prove that
 * implementation works and nothing about the one that ships.
 *
 * NOT YET IN THE CI SWEEP for its default mode. contracts-manifest.json has
 * not landed and lib/render/layout-rules.ts cannot be authored until it does
 * — the rules are keyed by the contract vocabulary, and writing them from the
 * PRD's prose ahead of the derivation is the hand-list §6.2 forbids. Both join
 * the sweep in the same commit as the manifest. **The positive control joins
 * now**, because it depends on neither: its logic is what would otherwise ship
 * unexercised.
 */

import { readFileSync } from 'node:fs'
import { evaluate } from './layout-rule-coverage.mjs'

const DEFAULT_MANIFEST = 'contracts-manifest.json'
const RULES_MODULE = '../lib/render/layout-rules.ts'

function arg(flag) {
  const i = process.argv.indexOf(flag)
  return i === -1 ? null : process.argv[i + 1] ?? null
}

const manifestPath = arg('--manifest') ?? DEFAULT_MANIFEST
const rulesPath = arg('--rules')

/* The manifest. Absent is a failure, never a pass (§0.3). */
let parsed = null
try {
  parsed = JSON.parse(readFileSync(manifestPath, 'utf8'))
} catch (err) {
  if (err instanceof SyntaxError) {
    console.error(`layout-rules: ${manifestPath} is not valid JSON — ${err.message}`)
    process.exit(1)
  }
  /* Absent. evaluate() reports it, naming the manifest. */
}

/* The rules. A fixture list, or the real module's own keys. */
let ruleKeys
if (rulesPath !== null) {
  const fixture = JSON.parse(readFileSync(rulesPath, 'utf8'))
  if (!Array.isArray(fixture)) {
    console.error(`layout-rules: ${rulesPath} is not a JSON array of rule keys.`)
    process.exit(1)
  }
  ruleKeys = fixture
} else {
  try {
    const mod = await import(RULES_MODULE)
    if (mod.LAYOUT_RULES === undefined) {
      console.error(
        'layout-rules: lib/render/layout-rules.ts exports no LAYOUT_RULES. The coverage ' +
          'check reads the rules’ own keys; it cannot read a set nobody exported.',
      )
      process.exit(1)
    }
    ruleKeys = Object.keys(mod.LAYOUT_RULES)
  } catch {
    console.error(
      'layout-rules: lib/render/layout-rules.ts is missing. It lands with ' +
        'contracts-manifest.json (SITE-004); until then this check has nothing to ' +
        'measure, and reporting that as a pass is the shape the accept criterion was ' +
        'rewritten to delete.',
    )
    process.exit(1)
  }
}

const result = evaluate(parsed, ruleKeys, manifestPath)

if (result.status === 'fail') {
  console.error(`layout-rules: ${result.message}`)
  process.exit(1)
}
console.log(`layout-rules: ${result.message}`)
