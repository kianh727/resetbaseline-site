/*
 * SITE-106 · §12.4 made operational.
 *
 * "Every automated eval must fail on an empty implementation. Before an eval
 * is accepted, it is run against a stub that does nothing. If it passes, it is
 * measuring the container and must be rewritten."
 *
 * A standing rule enforced by remembering is a rule satisfiable by forgetting,
 * so this is a build step: every eval in docs/site-evals-v1.md carries a
 * `*Stub check*` line saying how it fails against a stub, and an eval added
 * without one fails CI rather than review.
 *
 * What it can and cannot do, stated plainly. It checks that the question was
 * *answered* — not that the answer is true. Whether SITE-EVAL-021 really does
 * assert counts before properties is a thing only running it can establish.
 * This gate makes the omission impossible; it cannot make the reasoning
 * correct.
 *
 * §12.4 applied to this script: its own failure mode is passing when it finds
 * no evals, so it asserts a plausible floor before it asserts anything else.
 *
 * @implements SITE-EVAL-078
 */

import { readFileSync } from 'node:fs'

const DOC = 'docs/site-evals-v1.md'

/*
 * Every eval opens `**SITE-EVAL-0NN · Title** · ` followed by its type tags.
 * A block runs until the next eval or the next heading.
 */
const HEADER = /^\*\*SITE-EVAL-(\d{3}) · (.+?)\*\*(.*)$/

/**
 * The floor. Set below the current count so adding an eval never trips it, and
 * high enough that a truncated or mis-parsed document cannot pass. If evals
 * are ever deliberately removed, this number moves in the same commit and the
 * reason goes in the message.
 */
const MINIMUM_EVALS = 70

const lines = readFileSync(DOC, 'utf8').split('\n')
const evals = []
let current = null

for (const line of lines) {
  const match = HEADER.exec(line)
  if (match) {
    current = { id: `SITE-EVAL-${match[1]}`, title: match[2], tags: match[3], body: [] }
    evals.push(current)
    continue
  }
  if (current) {
    // A horizontal rule or a section heading ends the current block.
    if (/^---\s*$/.test(line) || /^#{2,3} /.test(line)) current = null
    else current.body.push(line)
  }
}

/*
 * Three tier evals (055–057) are written as single lines, with everything
 * after the title on the header row rather than in a block beneath it. The
 * stub check is searched for across the header remainder and the body
 * together, so the document's two shapes are both first-class rather than one
 * of them being reformatted to suit the parser.
 */
for (const e of evals) e.text = [e.tags, ...e.body].join('\n')

if (evals.length < MINIMUM_EVALS) {
  console.error(
    `eval-stubs: found only ${evals.length} evals in ${DOC}, expected at least ` +
      `${MINIMUM_EVALS}. Either the document is truncated or this script has ` +
      `stopped parsing it — both of which would let every check below pass ` +
      `on almost nothing.`,
  )
  process.exit(1)
}

const missing = evals.filter((e) => !e.text.includes('*Stub check*'))

/*
 * An automated eval's stub check may not be `n/a`. `n/a` is the right answer
 * for a VIS or FTU eval, whose verdict is a human's and is recorded rather
 * than inferred — there is no stub to run it against. An AUTO, PERF or ANLY
 * eval has code behind it, and "not applicable" there means the question was
 * dismissed rather than answered.
 */
const AUTOMATED = /`(AUTO|PERF|ANLY)`/
const dismissed = evals.filter((e) => {
  if (!AUTOMATED.test(e.tags)) return false
  const line = e.text.split('\n').find((l) => l.includes('*Stub check*'))
  return line !== undefined && /\*Stub check\*\s*n\/a/i.test(line)
})

console.log(`Eval stub checks — ${evals.length} evals in ${DOC}:\n`)
console.log(`  ${String(evals.length - missing.length).padStart(3)}  carry a *Stub check* line`)
console.log(`  ${String(missing.length).padStart(3)}  do not`)

if (missing.length > 0) {
  console.error(`\neval-stubs: these evals have no *Stub check* line:\n`)
  for (const e of missing) console.error(`  ${e.id} · ${e.title}`)
  console.error(
    `\nEvery eval states how it fails against a stub that does nothing (PRD ` +
      `v7.3 §12.4, §0.3). For a VIS or FTU eval the answer is "n/a — judged by ` +
      `a human and recorded, never inferred". For an automated one, say what ` +
      `it asserts *before* it asserts any property — usually a count, because ` +
      `an empty implementation produces zero of everything and every ` +
      `statement about "all of them" is then vacuously true.`,
  )
  process.exit(1)
}

if (dismissed.length > 0) {
  console.error(`\neval-stubs: these automated evals answer their stub check with "n/a":\n`)
  for (const e of dismissed) console.error(`  ${e.id} · ${e.title}${e.tags}`)
  console.error(
    `\n"n/a" is only correct for a VIS or FTU eval, where the verdict is a ` +
      `human's. An eval with code behind it has a stub to run against, and ` +
      `"not applicable" there is the question dismissed rather than answered.`,
  )
  process.exit(1)
}

console.log(`\neval-stubs: every eval states how it fails against a stub.`)
