/*
 * PRD v7.3 §6.6 · Nothing generated may read `artifact_divergences`.
 *
 * That key records **stale counts (33, 72) against current counts (45, 76) in
 * the same object**. Anything generated from it would be generated from two
 * contradictory numbers, and the wrong one is the one that looks like data.
 *
 * The ban was prose with nothing behind it until the manifest was about to
 * enter the repository. This is the construction: source that references the
 * key fails the build.
 *
 * **Scope is source, not prose.** The PRD, the decomposition, this file and
 * the delivery spec all name the key in order to ban it — a check that failed
 * on those would be the veto-token rule catching its own definition, which is
 * a shape this repo has hit twice already. So it scans the directories that
 * become the site, and the manifest itself is exempt because holding the key
 * is not reading it.
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const KEY = 'artifact_divergences'

/** The directories whose contents become the running site or its build. */
const SOURCE_DIRS = ['app', 'lib', 'components', 'scripts']

/**
 * Paths that may name the key. Each is a file whose job is to police or
 * document the ban, or the manifest itself.
 */
const ALLOWED = new Set([
  'scripts/check-divergences.mjs', // this file, which necessarily names it
  'contracts-manifest.json', // holding the key is not reading it
])

function sourceFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (/\.(ts|tsx|js|jsx|mjs|cjs|css|json)$/.test(entry)) acc.push(full)
  }
  return acc
}

const scanned = SOURCE_DIRS.flatMap((d) => sourceFiles(d))

/*
 * §12.4: a scan that finds no files reports success without having looked at
 * anything. The floor is low on purpose — it catches a broken path or a
 * renamed directory, not a small tree.
 */
if (scanned.length < 5) {
  console.error(
    `divergences: scanned only ${scanned.length} source files across ` +
      `${SOURCE_DIRS.join(', ')}. That is too few to be a real scan — check the ` +
      `directory list before trusting this result.`,
  )
  process.exit(1)
}

const offenders = scanned.filter((f) => !ALLOWED.has(f) && readFileSync(f, 'utf8').includes(KEY))

console.log(`Divergences ban — ${scanned.length} source files scanned for \`${KEY}\`.`)

if (offenders.length > 0) {
  console.error(`\ndivergences: these files reference \`${KEY}\`:\n`)
  for (const f of offenders) console.error(`  ${f}`)
  console.error(
    `\nPRD v7.3 §6.6: nothing generated may read it. It records stale counts ` +
      `(33, 72) against current counts (45, 76) **in the same object**, so a ` +
      `value read from it is a coin flip between the two. Read \`counts\` or the ` +
      `arrays themselves. If a file genuinely needs to name the key in order to ` +
      `police or document the ban, add it to ALLOWED with the reason.`,
  )
  process.exit(1)
}

console.log(`divergences: no source file reads it.`)
