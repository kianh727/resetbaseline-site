/*
 * Every rendered sentence declares where it came from.
 *
 * PRD §15.4 records the copy pass as the largest unmitigated risk with **no
 * gate catching it** — design review checks composition, the study checks
 * comprehension, §12.4 checks evals against stubs, and none asks whether the
 * prose is worth reading or whether it was approved at all.
 *
 * This does not close that gap. It closes a smaller one that would otherwise
 * make it worse: **held copy and final copy are indistinguishable once they are
 * strings in a component**, so text standing in for `SITE-109`'s work ships by
 * default, because nobody deletes a sentence that looks finished.
 *
 * *Stub check* — a stub that exports `PROVENANCE = { status: 'final' }` and
 * nothing else fails the shape assertions by name; one that exports nothing
 * fails the first test with the module named. The count assertion runs first,
 * so a suite that discovered zero copy modules cannot report success: "every
 * module declares its provenance" is trivially true of no modules, which is
 * §0.3 with the copy as the missing thing.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

import { isHeld, type Provenance } from '../lib/copy/provenance.ts'

const COPY_DIR = 'lib/copy'

/** Every copy module. `provenance.ts` is the type, not copy. */
const modules = readdirSync(COPY_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'provenance.ts')
  .sort()

async function provenanceOf(file: string): Promise<Provenance | undefined> {
  const mod: Record<string, unknown> = await import(`../${COPY_DIR}/${file}`)
  return mod.PROVENANCE as Provenance | undefined
}

test('there are copy modules to check — counts before properties', () => {
  /*
   * Without this every assertion below is satisfied by an empty directory,
   * which is the shape SITE-EVAL-021 and -037 were rewritten to delete.
   */
  assert.ok(
    modules.length >= 7,
    `only ${modules.length} copy modules found in ${COPY_DIR}. The sections ` +
      'each own one, so a number this low means the scan is looking in the ' +
      'wrong place and is about to report success over nothing.',
  )
})

test('every copy module declares its provenance', async () => {
  for (const file of modules) {
    const p = await provenanceOf(file)
    assert.ok(
      p !== undefined,
      `${COPY_DIR}/${file} exports no PROVENANCE. Copy that does not say ` +
        'whether it is approved is copy that ships as though it were.',
    )
  }
})

test('a held block names the issue that owes the final text', async () => {
  for (const file of modules) {
    const p = (await provenanceOf(file)) as Provenance
    if (!isHeld(p)) continue
    assert.ok(
      typeof p.owner === 'string' && p.owner.length > 0,
      `${COPY_DIR}/${file} is held with no owner. Held copy with nobody ` +
        'coming back for it is final copy that nobody approved.',
    )
  }
})

test('a final block names no owner, because nothing is still owed', async () => {
  for (const file of modules) {
    const p = (await provenanceOf(file)) as Provenance
    if (isHeld(p)) continue
    assert.equal(
      p.owner,
      undefined,
      `${COPY_DIR}/${file} is final but still names an owner. That reads as ` +
        'unfinished work marked done, which is the one direction this check ' +
        'exists to catch.',
    )
  }
})

test('every block cites a source and says why, held or final', async () => {
  for (const file of modules) {
    const p = (await provenanceOf(file)) as Provenance
    assert.ok(p.source.length > 0, `${COPY_DIR}/${file} cites no source`)
    assert.ok(p.note.length > 0, `${COPY_DIR}/${file} gives no reason`)
  }
})

test('exactly two modules are final, and they are the two the PRD verified', async () => {
  /*
   * Ruled 2026-09-21 (Kian): *"DS-18 applies to every line you ship as final.
   * §3 and the wall copy pass because the PRD already verified them; anything
   * else you ship stays held."*
   *
   * **Written out here rather than counted from the modules**, which is the
   * whole point — a test that reports whichever modules happen to be marked
   * final agrees with the tree by construction (§0.3b) and would go green on
   * the exact change it exists to catch: somebody promoting a section to final
   * because the text looked finished. This list changes when a ruling changes
   * it, and the diff is where that is visible.
   */
  const finals: string[] = []
  for (const file of modules) {
    const p = (await provenanceOf(file)) as Provenance
    if (!isHeld(p)) finals.push(file)
  }
  assert.deepEqual(
    finals.sort(),
    ['refusals.ts', 'wall.ts'],
    'Copy was promoted to final without a ruling. §3 (v7.3 §4) and the wall ' +
      '(v5 §11.2) are the two the PRD verified; everything else on this site ' +
      'is SITE-109’s and stays held until it lands.',
  )
})

test('no copy module hard-codes a date it computes at runtime', () => {
  /*
   * SITE-089's accept: the §2 date is a build-time constant, not `now()`. A
   * section that dates itself is always fresh and therefore never honest — the
   * date would advance on a deploy that changed nothing, which is the one thing
   * a status line must not do.
   *
   * Scanned rather than tested by calling, because the defect is the presence
   * of a call and a passing render proves nothing about which day it ran.
   */
  for (const file of modules) {
    const source = readFileSync(`${COPY_DIR}/${file}`, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ')
    assert.equal(
      /new Date\(|Date\.now\(/.test(source),
      false,
      `${COPY_DIR}/${file} computes a date at runtime. SITE-089: the status ` +
        'date is a committed constant.',
    )
  }
})
