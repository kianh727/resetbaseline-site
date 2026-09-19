/*
 * SITE-002 · Token value assertions.
 *
 * "Unit: token values match §14 exactly." The expected table below is
 * transcribed from PRD §14, carried forward unchanged by v7.3 §11. It is the
 * independent copy — if globals.css drifts from it, this fails.
 *
 * Node's built-in runner, no test dependency. Dev dependencies do not count
 * against the 120 KB core bundle, but fewer of them is still better.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const CSS = readFileSync('app/globals.css', 'utf8')

/** PRD §14, verbatim. Nine tokens, no more and no fewer. */
const EXPECTED = {
  void: '#0a0a0a',
  surface: '#0e0c18',
  lavender: '#8b7dff',
  'lavender-lit': '#c9c0ff',
  bone: '#f2f0ec',
  'bone-60': 'rgba(242, 240, 236, 0.6)',
  'bone-38': 'rgba(242, 240, 236, 0.38)',
  edge: 'rgba(242, 240, 236, 0.08)',
  veto: '#c4614f',
}

function themeValue(name) {
  const m = CSS.match(new RegExp(`--color-${name}:\\s*([^;]+);`))
  return m ? m[1].trim() : undefined
}

test('all nine §14 tokens are declared as Tailwind theme values', () => {
  for (const [name, value] of Object.entries(EXPECTED)) {
    assert.equal(themeValue(name), value, `--color-${name} must be exactly ${value}`)
  }
})

test('all nine §14 tokens are declared under the bare names §14 uses', () => {
  for (const name of Object.keys(EXPECTED)) {
    assert.match(
      CSS,
      new RegExp(`(^|\\n)\\s*--${name}:\\s*var\\(--color-${name}\\);`),
      `--${name} must alias --color-${name}`,
    )
  }
})

test('there are exactly nine tokens — no tenth has been added quietly', () => {
  const declared = [...CSS.matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1])
  assert.deepEqual(
    [...declared].sort(),
    Object.keys(EXPECTED).sort(),
    'the token set must match §14 exactly',
  )
})

/*
 * `--veto` is refusal and veto states only (§14). The eslint rule covers
 * TS and TSX; this covers every file type, because the lint rule cannot see
 * a stylesheet and a colour smuggled in through CSS would be just as wrong.
 */
const VETO_ALLOWED = new Set([
  'app/globals.css', // where it is defined
  'app/tokens/page.tsx', // the swatch route, which must render all nine
  'tests/tokens.test.mjs', // this file, which names the token in order to police it
])

function sourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'out' || entry === '.git') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (/\.(ts|tsx|css|mjs|js)$/.test(entry)) acc.push(full)
  }
  return acc
}

test('--veto is confined to refusal and veto paths', () => {
  const offenders = sourceFiles('app')
    .concat(sourceFiles('tests'))
    .filter((f) => !VETO_ALLOWED.has(f))
    .filter((f) => /veto/i.test(readFileSync(f, 'utf8')))
  assert.deepEqual(
    offenders,
    [],
    'veto is a refusal/veto token; add the path to VETO_ALLOWED only if it is one',
  )
})
