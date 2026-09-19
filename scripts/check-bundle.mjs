/*
 * Core bundle budget — 120 kB gzip (PRD v7.3 §11, CLAUDE.md §12).
 *
 * **Decimal kB throughout, ruled 2026-09-19 (Kian).** This check previously
 * divided by 1024 and labelled the result `KB`, while Next's build output
 * divides by 1000. The same five chunks read 102.5 here and 105 there — one
 * artifact, two divisors, and no way to compare the gate against the framework
 * floor §11 records, which is Next's number. A dependency ban whose ceiling and
 * whose floor are in different units is not a ban anybody can reason about.
 *
 * The ruling **tightens** the gate by 2,880 bytes rather than loosening it:
 * 120 * 1024 was 122,880, and the extra 2,880 was an accident of the tool, not
 * a grant.
 *
 * The budget is enforced as a dependency ban, not as a coding-discipline
 * target: the framework floor is ~103 kB and a hand-written interactive
 * component costs ~0.4 kB, so the only thing that can breach 120 kB is a
 * runtime dependency. This check is what says so at the commit that adds
 * one rather than at SITE-078.
 *
 * It measures what a browser actually downloads: for every document in the
 * static export, the JavaScript that document references, gzipped and summed.
 * It does not read Next's own summary line — a reported number and a shipped
 * byte count are two different things, and the export is what gets served.
 *
 * Every route is checked, not just `/`. A dependency added to a sibling route
 * is still a dependency in the tree, and a check that watches one page is a
 * check that can be walked around by putting the import on another.
 *
 * `noModule` scripts are not counted. Next emits its legacy polyfill chunk
 * that way and no browser supporting ES modules ever fetches it, so counting
 * it would be measuring bytes nobody downloads — the 103 kB floor §11 records
 * is the module set. Excluded files are printed rather than dropped silently.
 *
 * Run after `npm run build`. Exits 1 over budget, with the breakdown.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { gzipSync, constants } from 'node:zlib'

/**
 * PRD v7.3 §11. Ruled 120 over the earlier 145; the artifacts agree. Decimal,
 * so it is the same unit as the 103 kB framework floor and as Next's report.
 */
const BUDGET_BYTES = 120_000

const OUT = 'out'

function documents(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) documents(full, acc)
    else if (entry.endsWith('.html')) acc.push(full)
  }
  return acc
}

let docs
try {
  docs = documents(OUT).sort()
} catch {
  console.error(
    `bundle: ${OUT}/ does not exist. Run \`npm run build\` first; a budget ` +
      `check that passes because there is no output is measuring the container.`,
  )
  process.exit(1)
}

if (docs.length === 0) {
  console.error(`bundle: ${OUT}/ contains no HTML. The export produced nothing to measure.`)
  process.exit(1)
}

const sizes = new Map()
function measure(ref) {
  if (sizes.has(ref)) return sizes.get(ref)
  const path = join(OUT, ref.replace(/^\//, ''))
  let raw
  try {
    raw = readFileSync(path)
  } catch {
    console.error(`bundle: a document references ${ref}, which is not in the export.`)
    process.exit(1)
  }
  const entry = { ref, raw: raw.length, gzip: gzipSync(raw, { level: constants.Z_BEST_COMPRESSION }).length }
  sizes.set(ref, entry)
  return entry
}

/*
 * Three ways a document pulls JavaScript on first load: a script tag, a
 * modulepreload, and a preload with as="script".
 */
function references(html) {
  const refs = new Set()
  const legacy = new Set()
  for (const m of html.matchAll(/<script[^>]+src="([^"]+\.js)"[^>]*>/g)) {
    if (/\bnomodule\b/i.test(m[0])) legacy.add(m[1])
    else refs.add(m[1])
  }
  for (const m of html.matchAll(/<link[^>]+href="([^"]+\.js)"[^>]*>/g)) {
    if (/rel="(modulepreload|preload)"/.test(m[0])) refs.add(m[1])
  }
  return { refs: [...refs], legacy: [...legacy] }
}

const byGzip = (a, b) => b.gzip - a.gzip
const kb = (n) => `${(n / 1000).toFixed(1)} kB`

const routes = docs.map((doc) => {
  const { refs, legacy } = references(readFileSync(doc, 'utf8'))
  const files = refs.map(measure).sort(byGzip)
  return {
    route: '/' + relative(OUT, doc).replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''),
    files,
    legacy: legacy.map(measure).sort(byGzip),
    total: files.reduce((sum, f) => sum + f.gzip, 0),
  }
})

/*
 * The export writes some routes twice — `404.html` and `404/index.html` are
 * the same page served two ways. Same route, same bytes; list it once.
 */
const seen = new Set()
const unique = routes.filter((r) => (seen.has(r.route) ? false : seen.add(r.route)))
routes.length = 0
routes.push(...unique)

const empty = routes.filter((r) => r.files.length === 0)
if (empty.length === routes.length) {
  console.error(
    `bundle: no document in the export references any JavaScript. That is ` +
      `either a broken export or a changed output shape; either way this ` +
      `check is no longer measuring anything. Fix the check, do not delete it.`,
  )
  process.exit(1)
}

const worst = [...routes].sort((a, b) => b.total - a.total)[0]

console.log(`Core bundle — first-load JavaScript per route, gzip:\n`)
for (const r of [...routes].sort((a, b) => b.total - a.total)) {
  console.log(`  ${kb(r.total).padStart(9)}  ${r.route}`)
}
console.log(`\nHeaviest route, ${worst.route}:\n`)
for (const f of worst.files) {
  console.log(`  ${kb(f.gzip).padStart(9)}  ${f.ref}  (${kb(f.raw)} raw)`)
}
console.log(`  ${'—'.repeat(9)}`)
console.log(`  ${kb(worst.total).padStart(9)}  total, against a ${kb(BUDGET_BYTES)} budget`)
console.log(`  ${kb(BUDGET_BYTES - worst.total).padStart(9)}  remaining\n`)

const excluded = [...new Set(routes.flatMap((r) => r.legacy))]
if (excluded.length > 0) {
  console.log(`Not counted — noModule, fetched only by pre-ES-module browsers:\n`)
  for (const f of excluded) {
    console.log(`  ${kb(f.gzip).padStart(9)}  ${f.ref}  (${kb(f.raw)} raw)`)
  }
  console.log('')
}

const over = routes.filter((r) => r.total > BUDGET_BYTES)
if (over.length > 0) {
  for (const r of over) {
    console.error(`bundle: ${r.route} is over budget by ${kb(r.total - BUDGET_BYTES)}.`)
  }
  console.error(
    `\nThe 120 kB ceiling is a dependency ban (PRD v7.3 §11). The framework ` +
      `floor is ~103 kB and a hand-written component costs ~0.4 kB, so what ` +
      `breached this is almost certainly a runtime dependency. Binding ` +
      `consequences already ruled: no animation library, no client-side ` +
      `schema validator, no date library. Remove it — do not raise the number.`,
  )
  process.exit(1)
}

console.log(`bundle: every route within budget.`)
