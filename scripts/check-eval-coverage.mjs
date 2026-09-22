/*
 * The machine-readable link between an eval and its implementation.
 *
 * **SITE-106 found that there isn't one, and recorded its own open half too
 * narrowly.** It said the stub gate checks the document and not the code; the
 * audit's finding was that *nothing connects the two at all*. Ten eval IDs
 * appeared across `tests/`, `scripts/`, `lib/`, `components/` and `app/`, and
 * every one of them was prose in a comment — so *"audit every eval against a
 * stub"* could not be executed mechanically, and the drift ran both ways: most
 * verification in this repository traced to no eval, and most evals traced to
 * no check.
 *
 * The convention is one line: **`@implements SITE-EVAL-NNN`** in a comment, in
 * the file that implements it. That is the whole mechanism, and it is
 * deliberately not a separate registry file — a list somewhere else is a second
 * thing to update, and the one that goes stale is always the one further from
 * the code.
 *
 * ---
 *
 * **What this asserts, and in this order:**
 *
 * 1. The eval document parses into a non-trivial set. A coverage report over
 *    zero evals is 100%.
 * 2. Every `@implements` marker names an eval that **exists**. A marker for a
 *    withdrawn or mistyped ID is worse than no marker: it reports coverage of
 *    something that is not there.
 * 3. Every `AUTO` eval is either implemented or **listed below with a reason**.
 *    The list is the honest part. Many `AUTO` evals depend on things that do
 *    not exist yet — the manifest, the authored copy, the Peak — and a registry
 *    that reported them covered would be exactly the §0.3 shape at the level of
 *    the verification system itself.
 * 4. Nothing is in both states, and the pending list contains no eval that has
 *    since been implemented — so landing an implementation fails this check
 *    until its entry is removed, which is the same expiry mechanism the SITE-004
 *    exemption uses.
 *
 * **Non-`AUTO` evals are not required to have one.** A `VIS` or `FTU` verdict
 * is a human's and is recorded, never inferred (§7) — a marker claiming to
 * implement one would be the thing that section forbids.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const EVALS_DOC = 'docs/site-evals-v1.md'
const ROOTS = ['lib', 'components', 'app', 'scripts', 'tests']
/*
 * Root-level config files, which are implementations too: `eslint.config.mjs`
 * carries SITE-EVAL-064's import ban. They are named rather than globbed
 * because the repository root holds a lot that is not source.
 */
const ROOT_FILES = ['eslint.config.mjs', 'next.config.ts']

/**
 * `AUTO` evals with no implementation, each with the reason it has none.
 *
 * **An entry is a statement that the eval cannot be implemented today**, not
 * that nobody got to it. Removing one is part of landing its implementation:
 * an eval that is both implemented and listed here fails below.
 */
const PENDING = {
  'SITE-EVAL-005': 'Needs the authored scenarios (SITE-028) to define a meaningful plan.',
  'SITE-EVAL-010': 'Chip content does not exist — SITE-010, blocked on copy (SITE-110).',
  'SITE-EVAL-011': 'Chips are not built — SITE-010/011, blocked on copy.',
  'SITE-EVAL-012': 'Autotype is not built — SITE-009, blocked on chip copy.',
  'SITE-EVAL-018': 'Needs four of the five per-domain refusals (SITE-111).',
  'SITE-EVAL-021': 'Needs /api/plan deployed with a live provider; the seam is unit-tested.',
  'SITE-EVAL-027': 'Needs the authored scenarios (SITE-028).',
  'SITE-EVAL-030': 'Needs a live provider to vary wording against.',
  'SITE-EVAL-031': 'Needs the manifest (SITE-004) and SITE-026 tier derivation.',
  'SITE-EVAL-034': 'The wall has no legal trigger in the export until SITE-041 lands one on /.',
  'SITE-EVAL-035': 'Same: the wall cannot be reached on / to be dismissed.',
  'SITE-EVAL-036': 'Two of three terminal branches have no destination yet (SITE-045).',
  'SITE-EVAL-049': 'Contrast needs the typeface decision; non-colour signalling is partly VIS.',
  'SITE-EVAL-058': 'Needs the Peak to exist before "WebGL disabled" is a distinct path.',
  'SITE-EVAL-068': 'Needs the `mornings` scenario (SITE-028).',
  'SITE-EVAL-069': 'Needs the `back` scenario and its refusal (SITE-028, SITE-111).',
  'SITE-EVAL-071': 'DS-18 verdict rows do not exist yet — SITE-108 owns the table.',
  'SITE-EVAL-065': 'Peak — P1, not built.',
  'SITE-EVAL-066': 'Peak — P1, not built.',
  'SITE-EVAL-067': 'Peak — P1, not built.',
  'SITE-EVAL-076': 'The clarification beat needs /api/plan deployed and the authored set (SITE-112).',
  'SITE-EVAL-079': 'Same — the generated question needs a live route and a fallback set.',
}


let failures = 0
const fail = (message) => {
  failures++
  process.stderr.write(`FAIL  ${message}\n`)
}

/* ── 1. The eval document ────────────────────────────────────────────────── */

const doc = readFileSync(EVALS_DOC, 'utf8')
const evals = new Map()

for (const line of doc.split('\n')) {
  const match = line.match(/^\*\*(SITE-EVAL-\d{3})[^*]*\*\*(.*)$/)
  if (!match) continue
  const [, id, rest] = match
  const types = [...rest.matchAll(/`(AUTO|VIS|FTU|PERF|ANLY)`/g)].map((m) => m[1])
  evals.set(id, { types, auto: types.includes('AUTO') })
}

if (evals.size < 70) {
  fail(`only ${evals.size} evals parsed from ${EVALS_DOC} — a coverage report over nothing is 100%`)
}

const autoEvals = [...evals.entries()].filter(([, e]) => e.auto).map(([id]) => id)
if (autoEvals.length < 30) {
  fail(`only ${autoEvals.length} AUTO evals parsed — the type markers are not being read`)
}

/* ── 2. The markers ──────────────────────────────────────────────────────── */

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx|mjs|js)$/.test(entry)) acc.push(full)
  }
  return acc
}

/** eval id → the files claiming to implement it. */
const implemented = new Map()

for (const file of [...ROOTS.flatMap((r) => walk(r)), ...ROOT_FILES.filter(existsSync)]) {
  const source = readFileSync(file, 'utf8')
  for (const [, id] of source.matchAll(/@implements\s+(SITE-EVAL-\d{3})/g)) {
    if (!evals.has(id)) {
      fail(
        `${file} claims @implements ${id}, which is in no eval in ${EVALS_DOC}. ` +
          'A marker for a withdrawn or mistyped ID reports coverage of nothing.',
      )
      continue
    }
    if (!evals.get(id).auto) {
      fail(
        `${file} claims @implements ${id}, which is ${evals.get(id).types.join('/')} and not ` +
          'AUTO. A VIS or FTU verdict is a human\'s and is recorded, never inferred (§7).',
      )
      continue
    }
    if (!implemented.has(id)) implemented.set(id, [])
    implemented.get(id).push(file)
  }
}

if (implemented.size === 0) {
  fail('no @implements markers found anywhere — the scan is looking in the wrong place')
}

/* ── 3 and 4. Coverage, and the pending list's own expiry ────────────────── */

for (const id of autoEvals) {
  const hasImpl = implemented.has(id)
  const isPending = Object.hasOwn(PENDING, id)

  if (!hasImpl && !isPending) {
    fail(
      `${id} is AUTO, has no @implements marker, and is not in PENDING. Either ` +
        'implement it or say in PENDING why it cannot be implemented today.',
    )
  }
  if (hasImpl && isPending) {
    fail(
      `${id} is implemented in ${implemented.get(id).join(', ')} and still listed in ` +
        'PENDING. Remove the entry in the commit that lands the implementation — a ' +
        'pending list that outlives its reason is a permanent hole.',
    )
  }
}

for (const id of Object.keys(PENDING)) {
  if (!evals.has(id)) fail(`PENDING names ${id}, which is in no eval`)
  else if (!evals.get(id).auto) fail(`PENDING names ${id}, which is not AUTO`)
}

if (failures > 0) {
  process.stderr.write(`\n${failures} eval-coverage failure(s).\n`)
  process.exit(1)
}

const covered = autoEvals.filter((id) => implemented.has(id)).length
process.stdout.write(
  `eval coverage — ${covered} of ${autoEvals.length} AUTO evals implemented, ` +
    `${Object.keys(PENDING).length} pending with a stated reason, ` +
    `${evals.size} evals total.\n`,
)
