/*
 * Development-only routes must not be in the production export.
 *
 * A route whose page file is `page.dev.tsx` exists under `npm run dev` and is
 * absent from the build, because `dev.tsx` is in `pageExtensions` only outside
 * production (next.config.ts). `/tokens` is the token swatch surface;
 * `/type` is the typeface comparison harness, which also carries the two
 * candidate webfonts and would decide an open question by accident if it
 * shipped.
 *
 * The list of such routes is derived from the source tree rather than written
 * down here. A hardcoded list is a list that drifts: the first version of
 * this check named `out/tokens` alone, and adding `/type` silently left half
 * the surface unguarded.
 */

import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const APP = 'app'
const OUT = 'out'

function devPages(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) devPages(full, acc)
    else if (entry === 'page.dev.tsx') acc.push(relative(APP, dir))
  }
  return acc
}

const routes = devPages(APP)

if (routes.length === 0) {
  console.log('dev-routes: none declared.')
  process.exit(0)
}

const shipped = routes.filter((r) => existsSync(join(OUT, r)) || existsSync(join(OUT, `${r}.html`)))

for (const r of routes) {
  console.log(`  ${shipped.includes(r) ? 'SHIPPED' : 'absent '}  /${r}`)
}

if (shipped.length > 0) {
  console.error(
    `\ndev-routes: ${shipped.map((r) => `/${r}`).join(', ')} reached the export. ` +
      `A development surface on the marketing site is a URL nobody designed. ` +
      `Check pageExtensions in next.config.ts.`,
  )
  process.exit(1)
}

console.log('dev-routes: none shipped.')
