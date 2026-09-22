/*
 * Scroll is native, everywhere, always.
 *
 * @implements SITE-EVAL-064
 *
 * CLAUDE.md §6 and PRD §7.5 say it in the same words: *no wheel interception,
 * no Lenis, no locomotive, no `scroll-behavior` override, anywhere, ever.*
 *
 * **The eslint import ban covers the libraries and this covers the
 * hand-written form**, which is the half a scroll-scrubbed section invites —
 * §5 Day 1 → 30 is a scroll-driven section and it would be one `preventDefault`
 * from breaking the rule.
 *
 * **Scoped to wheel and touchmove, not to `preventDefault` in general.**
 * `components/wall.tsx` calls it on a form submit, which is the ordinary way to
 * stop a page navigation and has nothing to do with scrolling. A check that
 * banned the call outright would fire on that, and a check that fires on
 * correct code is argued down the first time it runs — which is how it stops
 * existing. The same reasoning `check-lavender` needed for `border-color`.
 *
 * *Stub check* — the file count is asserted before any scan, because "no wheel
 * handler anywhere" is satisfied perfectly by looking at nothing.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOTS = ['app', 'components', 'lib']

function sources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sources(full, acc)
    else if (/\.(ts|tsx|css)$/.test(entry)) acc.push(full)
  }
  return acc
}

const files = ROOTS.flatMap((root) => sources(root))

function stripped(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
}

test('there are sources to scan — counts before properties', () => {
  assert.ok(files.length > 30, `only ${files.length} files found — the scan is looking wrong`)
})

test('nothing intercepts the wheel or a touchmove', () => {
  /*
   * Two forms: a React `onWheel`/`onTouchMove` prop, and an
   * `addEventListener('wheel' | 'touchmove', …)`. Both are matched; a passive
   * listener cannot call `preventDefault` at all, so registering one passively
   * is the sanctioned form and is not flagged.
   */
  for (const file of files) {
    const source = stripped(file)

    assert.doesNotMatch(
      source,
      /\bon(?:Wheel|TouchMove)\s*=/,
      `${file} attaches a React wheel or touchmove handler — scroll is native`,
    )

    for (const match of source.matchAll(
      /addEventListener\(\s*['"`](wheel|touchmove)['"`]([\s\S]{0,200}?)\)/g,
    )) {
      const [, event, rest] = match
      assert.match(
        rest ?? '',
        /passive:\s*true/,
        `${file} listens for "${event}" without { passive: true }. A non-passive ` +
          'listener is one that can call preventDefault, and §7.5 forbids wheel ' +
          'interception anywhere, ever.',
      )
    }
  }
})

test('nothing overrides scroll-behavior', () => {
  for (const file of files) {
    assert.doesNotMatch(
      stripped(file),
      /scroll-behavior\s*:|scrollBehavior\s*:/,
      `${file} sets scroll-behavior — §7.5 forbids the override anywhere, ever`,
    )
  }
})

test('the scan can find what it looks for', () => {
  /*
   * The positive control. Every assertion above is satisfied by a scan that
   * matches nothing at all, and a regex that silently stopped matching would be
   * indistinguishable from a clean tree.
   */
  const planted = [
    { source: "<div onWheel={(e) => e.preventDefault()} />", pattern: /\bon(?:Wheel|TouchMove)\s*=/ },
    { source: "html { scroll-behavior: smooth; }", pattern: /scroll-behavior\s*:/ },
  ]
  for (const { source, pattern } of planted) {
    assert.match(source, pattern, `the scan would not catch: ${source}`)
  }

  const nonPassive = "window.addEventListener('wheel', onWheel)"
  const match = [...nonPassive.matchAll(/addEventListener\(\s*['"`](wheel|touchmove)['"`]([\s\S]{0,200}?)\)/g)]
  assert.equal(match.length, 1, 'the listener form is not matched at all')
  assert.doesNotMatch(match[0]?.[2] ?? '', /passive:\s*true/, 'a non-passive listener reads as passive')
})

test('a form submit is not scroll interception', () => {
  /*
   * The false positive this scan is scoped around. `components/wall.tsx` calls
   * `preventDefault` on a form submit, which stops a page navigation and has
   * nothing to do with scrolling — a check banning the call outright would fire
   * on correct code, and one that fires on correct code is argued down the
   * first time it runs.
   */
  const wall = stripped('components/wall.tsx')
  assert.match(wall, /preventDefault/, 'the file this rule is scoped around no longer has one')
  assert.match(wall, /onSubmit/, 'and it is still a form submit rather than something else')
})
