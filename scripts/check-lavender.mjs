/*
 * Lavender is light, never paint — PRD v7.3 §6.3b, enforced.
 *
 * §6.3b: *"Lavender appears only as a thin lit line on its upper boundary and on
 * active marks. Never as fill."* The clause is written about the band, and the
 * rule it states is about the token: a viewer cannot learn that lavender means
 * **lit** from a page that also uses it to colour things in. One token, one
 * meaning, or it has no meaning.
 *
 * **This exists because the rule was already being broken in the most prominent
 * place on the page.** The Run button rendered as a solid `--color-lavender`
 * fill, and the input's status dot was a filled lavender disc **with a lavender
 * glow on it** — the same token used as paint and as light in one element.
 * Neither was caught by review, by the type system, or by any of the eleven
 * checks, because nothing was looking.
 *
 * **What counts as paint:** `background`, `background-color`, `fill`, or a
 * Tailwind `bg-`/`fill-` utility, resolving to a lavender token.
 *
 * **What is still light, and deliberately not matched:** `color`,
 * `border-color`, `box-shadow`, `outline`, `stroke`, `text-shadow`. A lit edge
 * and a glow are what the rule asks for, so a check that flagged them would be
 * banning the sanctioned form along with the forbidden one.
 *
 * Comments are stripped first. A scan that failed on the sentence stating the
 * rule is a ban catching its own definition — the shape this repository has hit
 * three times now.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SOURCE_DIRS = ['app', 'components', 'lib']

/**
 * **The allowlist, named explicitly rather than by pattern.**
 *
 * One entry. `/tokens` is the swatch route and its entire job is to render each
 * of §14's nine tokens as a filled block — a token swatch that could not show
 * the colour would be useless. It is `page.dev.tsx`, so it is never built into
 * the export and no visitor ever sees a lavender fill.
 *
 * A pattern here would be the wrong shape: `app/**\/*.dev.tsx` would allow any
 * future dev route to paint with lavender, and the point is that each exception
 * is a decision somebody made about the site's one signature colour.
 */
/*
 * **Two entries, each named explicitly rather than by pattern.** A glob like
 * `app/**\/tokens/**` would let any future file claim the exemption by being
 * named correctly, which is how a hole gets opened by someone who needs it
 * today.
 *
 * - `app/tokens/page.dev.tsx` renders every token as a filled block and never
 *   ships.
 * - `lib/share/card.ts` emits **SVG**, where `fill` is how you draw anything at
 *   all: a 1px lit line and a 3px mark are both `fill`. This scan's rule is
 *   about lavender covering an *area*, and SVG does not distinguish the two, so
 *   the scan would ban the sanctioned form along with its violation — the shape
 *   it was itself written to avoid for `color`, `border-color` and `box-shadow`.
 *
 *   **The rule is not unenforced there, it is enforced better.**
 *   `tests/share-card.test.ts` asserts every lavender rect in the rendered SVG
 *   is at most 1px high or 3px wide — a geometry check, which is what "only as
 *   a lit line and on active marks" actually means, and which a text scan
 *   cannot express. A lavender band fill in that file exits 1 there; proven.
 */
const ALLOWED = new Set(['app/tokens/page.dev.tsx', 'lib/share/card.ts'])

const LAVENDER = String.raw`(?:--(?:color-)?lavender(?:-lit)?|lavender(?:-lit)?)`

const PAINT_PATTERNS = [
  // CSS property: `background: var(--lavender)`, `fill: var(--color-lavender)`
  new RegExp(String.raw`\b(?:background|background-color|backgroundColor|fill)\s*[:=]\s*[^;,\n}]*${LAVENDER}`, 'i'),
  // Tailwind utility: `bg-lavender`, `fill-lavender-lit`
  new RegExp(String.raw`\b(?:bg|fill)-lavender(?:-lit)?\b`),
]

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
}

function sourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (/\.(ts|tsx|css)$/.test(entry)) acc.push(full)
  }
  return acc
}

const offences = []
for (const dir of SOURCE_DIRS) {
  for (const file of sourceFiles(dir)) {
    if (ALLOWED.has(file)) continue
    const source = stripComments(readFileSync(file, 'utf8'))
    for (const pattern of PAINT_PATTERNS) {
      const hit = pattern.exec(source)
      if (hit) offences.push(`${file}: ${hit[0].trim()}`)
    }
  }
}

if (offences.length > 0) {
  console.error('lavender: used as paint, not as light.\n')
  for (const o of offences) console.error(`  ${o}`)
  console.error(
    '\nPRD v7.3 §6.3b: lavender appears only as a lit line and on active marks, ' +
      'never as fill. Use a border, a colour, or a glow — or add the path to ' +
      'ALLOWED in scripts/check-lavender.mjs if it is a token swatch.',
  )
  process.exit(1)
}

console.log(`lavender: light only, across ${SOURCE_DIRS.join(', ')}.`)
