/*
 * SITE-004 · Generate the site's contract vocabulary types from the manifest.
 *
 * PRD §6.2: the five `capability_type` values are **"generated from
 * `contracts-manifest.json`… derived, not hand-listed."** §6.3 says the same
 * of `authority_tier`, the recorded outcomes and `belief_tier`. This is the
 * derivation. It is the **only** place in the site where those strings are
 * written, and the file it writes says so at the top.
 *
 * Exports both a union type and a frozen array per axis. The array is what
 * makes exhaustiveness checkable at runtime — `Object.keys(LAYOUT_RULES)`
 * against `CAPABILITY_TYPES` — and the union is what makes it checkable at
 * compile time. **Deliberately both**, per the EVAL-033 finding: when a
 * guarantee rests on a type and a test together, the test is not the
 * guarantee, and the part the type carries is the part nobody re-checks.
 *
 * Usage:
 *   node scripts/generate-contract-types.mjs [--manifest <path>] [--out <path>]
 *   node scripts/generate-contract-types.mjs --stdout      (emit, write nothing)
 *
 * `--stdout` is what the drift guard uses: it regenerates in memory and
 * compares against the committed file, so an edit to either the manifest or
 * the generated file fails the build. That comparison has two real sources —
 * the manifest on disk and the file in git — rather than deriving its
 * expectation from the thing it is checking (§0.3b).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { AXES, readAxis } from './contract-axes.mjs'

const DEFAULT_MANIFEST = 'contracts-manifest.json'
const DEFAULT_OUT = 'lib/contracts/generated.ts'

/** TypeScript identifiers for each axis. Ours, not the contract's. */
const NAMES = {
  capability_type: { type: 'CapabilityType', list: 'CAPABILITY_TYPES' },
  authority_tier: { type: 'AuthorityTier', list: 'AUTHORITY_TIERS' },
  outcome: { type: 'RecordedOutcome', list: 'RECORDED_OUTCOMES' },
  belief_tier: { type: 'BeliefTier', list: 'BELIEF_TIERS' },
}

/**
 * @param {unknown} parsed  the parsed envelope
 * @param {string} manifestPath
 * @returns {string} the contents of the generated module
 */
export function emit(parsed, manifestPath = DEFAULT_MANIFEST) {
  const envelope = /** @type {Record<string, unknown>} */ (parsed ?? {})
  const sha = typeof envelope.app_commit_sha === 'string' ? envelope.app_commit_sha : '(none)'
  const captured = typeof envelope.captured_at === 'string' ? envelope.captured_at : '(none)'

  const blocks = []
  for (const { axis } of AXES) {
    const read = readAxis(parsed, axis)
    if (!read.ok) {
      throw new Error(
        `generate-contract-types: cannot read ${axis} from ${manifestPath} — ${read.reason}. ` +
          'Nothing is generated from a manifest the site cannot read: a partial ' +
          'vocabulary is worse than none, because the checks downstream would pass ' +
          'against the part that arrived.',
      )
    }
    const { type, list } = NAMES[axis]
    const union = read.values.map((v) => `'${v}'`).join(' | ')
    const members = read.values.map((v) => `  '${v}',`).join('\n')
    blocks.push(
      `/** \`${axis}\`, PRD §6.3. Derived from \`manifest.${read.key}\`. */\n` +
        `export type ${type} = ${union}\n\n` +
        `/**\n` +
        ` * The same axis as a value, so exhaustiveness is checkable at runtime and\n` +
        ` * not only by the compiler. Both halves, deliberately — see the header.\n` +
        ` */\n` +
        `export const ${list} = Object.freeze([\n${members}\n]) as readonly ${type}[]\n`,
    )
  }

  return (
    `/*\n` +
    ` * GENERATED FILE — DO NOT EDIT.\n` +
    ` *\n` +
    ` * SITE-004. Written by scripts/generate-contract-types.mjs from\n` +
    ` * ${manifestPath}, which carries the app's CONTRACT_MANIFEST verbatim.\n` +
    ` *\n` +
    ` *   app_commit_sha  ${sha}\n` +
    ` *   captured_at     ${captured}\n` +
    ` *\n` +
    ` * PRD §6.2 requires this vocabulary derived, not hand-listed. This is the\n` +
    ` * one file in the site that names these strings, and it is not written by\n` +
    ` * hand: scripts/check-generated-contracts.mjs regenerates it in memory and\n` +
    ` * fails the build on any difference, so editing either this file or the\n` +
    ` * manifest alone is caught rather than absorbed.\n` +
    ` *\n` +
    ` * Regenerate:  npm run generate:contracts\n` +
    ` */\n\n` +
    blocks.join('\n')
  )
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

function arg(flag) {
  const i = process.argv.indexOf(flag)
  return i === -1 ? null : process.argv[i + 1] ?? null
}

/* import.meta.main is Node 22.16+; guard so importing this module is inert. */
if (process.argv[1] !== undefined && process.argv[1].endsWith('generate-contract-types.mjs')) {
  const manifestPath = arg('--manifest') ?? DEFAULT_MANIFEST
  const outPath = arg('--out') ?? DEFAULT_OUT

  let parsed
  try {
    parsed = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (err) {
    console.error(
      `generate-contract-types: cannot read ${manifestPath} — ${err.message}. ` +
        'It lands with SITE-004; nothing is generated without it.',
    )
    process.exit(1)
  }

  let source
  try {
    source = emit(parsed, manifestPath)
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }

  if (process.argv.includes('--stdout')) {
    process.stdout.write(source)
  } else {
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, source)
    console.log(`generate-contract-types: wrote ${outPath} from ${manifestPath}.`)
  }
}
