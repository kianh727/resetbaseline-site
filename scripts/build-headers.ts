/*
 * `out/_headers`, written **after** the build because it depends on it.
 *
 * Next's App Router export emits its hydration payload as inline `<script>`
 * elements whose content changes every build, so a CSP that permits them must
 * be derived from the export. This reads every exported document, hashes each
 * inline script, and writes the policy carrying those hashes.
 *
 * **The alternative was `'unsafe-inline'`**, which permits exactly what a
 * script CSP exists to stop, and would have made the header decorative.
 * `check-csp.mjs` refuses a policy containing it, so that road is closed
 * deliberately rather than by preference.
 *
 * Writing to `out/` rather than `public/`: `public/` is copied *into* the
 * export by the build, so a file written there before the build cannot know
 * what the build produced.
 */

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { headersFile } from '../lib/deploy/headers.ts'

const OUT = 'out'

function documents(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return entry === '_next' ? [] : documents(full)
    return entry.endsWith('.html') ? [full] : []
  })
}

/**
 * Every inline script in the export, hashed.
 *
 * Matches `<script>` **without a `src`**, which is what CSP hashing applies to:
 * an external script is covered by `'self'` and hashing it would be a hash of
 * the tag rather than of anything.
 */
function inlineScriptHashes(): string[] {
  const hashes = new Set<string>()

  for (const document of documents(OUT)) {
    const html = readFileSync(document, 'utf8')
    for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
      const body = match[1] ?? ''
      if (body.length === 0) continue
      hashes.add(`sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`)
    }
  }

  return [...hashes].sort()
}

const hashes = inlineScriptHashes()

if (hashes.length === 0) {
  /*
   * **Not silently fine.** Today the export always contains inline scripts, so
   * zero means the scan stopped matching — a regex that no longer fits Next's
   * output, or a document walk looking in the wrong place. The resulting policy
   * would be *stricter* than intended and would block hydration, which is the
   * failure this whole file exists to prevent. If a future Next genuinely emits
   * none, this line is the place to say so.
   */
  process.stderr.write(
    'FAIL  no inline scripts found in the export. Either the build changed ' +
      'shape or the scan stopped matching; a policy built from zero hashes ' +
      'blocks hydration.\n',
  )
  process.exit(1)
}

writeFileSync(join(OUT, '_headers'), headersFile(hashes))
process.stdout.write(`headers: _headers written with ${hashes.length} inline-script hashes.\n`)
