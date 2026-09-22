/*
 * SITE-004 · Layout-rule coverage against the contract vocabulary.
 *
 * PRD §6.2: the plan model "handles every `capability_type` the contracts
 * define — exactly five … generated from `contracts-manifest.json`", and
 * **derived, not hand-listed.**
 *
 * The accept criterion was rewritten 2026-09-19 (Kian) *before* the manifest
 * landed, because the original — "every `capability_type` in the manifest has
 * a layout rule" — would have iterated an empty set and passed. That is §0.3
 * exactly: a criterion satisfiable by the absence of the thing it measures.
 * Three parts replace it, and all three live in `evaluate()` below:
 *
 *   1. The manifest declares a **non-empty** `capability_type` list. Absent or
 *      empty fails **naming the manifest**, never the layout rules — the fault
 *      is in the input, and an error pointing at the rules sends the reader to
 *      the wrong file.
 *   2. Every declared type has a rule **and the counts match in both
 *      directions.** A rule with no type is as much a failure as a type with
 *      no rule; one-way coverage passes a rule set that has quietly drifted
 *      past the contract.
 *   3. A fixture manifest carrying a sixth unknown type fails the build, in
 *      CI rather than once by hand. Without it parts 1 and 2 are untested
 *      assertions about an input that has never varied.
 *
 * **Why this exists at all when the rules are typed `Record<CapabilityType,
 * LayoutRule>` and exhaustiveness is already a type error.** That is the
 * EVAL-033 finding applied: when a guarantee rests on a type and a test
 * together, the test is not the guarantee, and the part the type carries is
 * the part nobody re-checks. The type closes the key space against the
 * *generated union*; it says nothing about whether that union still matches
 * the manifest on disk, and one edit widening `CapabilityType` back to
 * `string` would leave every other check green. Both halves, deliberately.
 *
 * The decision logic is pure so its boundaries can be tested against
 * constructed inputs rather than against whatever the manifest happens to say
 * today — and so the fixture in the positive control drives the same code the
 * real manifest drives, not a second implementation of it.
 */

import { AXES, readAxis } from './contract-axes.mjs'

/**
 * The key spellings `capability_type` is looked for under. Re-exported from
 * the shared reader rather than restated: the generator, this check and the
 * arrival verification must not be able to disagree about where the
 * vocabulary lives, and two lists that are meant to be identical are two
 * lists that will one day differ silently.
 */
export const CAPABILITY_KEYS = AXES.find((a) => a.axis === 'capability_type').keys

const MANIFEST_FAULT =
  'The fault is in the manifest, not in the layout rules. PRD §6.2 requires the ' +
  'capability vocabulary derived from contracts-manifest.json, not hand-listed ' +
  'in the site.'

/**
 * @param {unknown} parsed     parsed contracts-manifest.json, or null if absent
 * @param {readonly string[]} ruleKeys  the layout rules' own keys
 * @param {string} manifestPath  named in every message, so a fixture run says which fixture
 * @returns {{ status: 'ok'|'fail', message: string, declared?: string[] }}
 */
export function evaluate(parsed, ruleKeys, manifestPath = 'contracts-manifest.json') {
  /* Part 1 — the input, and every failure here names the manifest. */

  if (parsed === null || parsed === undefined) {
    return {
      status: 'fail',
      message: `${manifestPath} is missing. ${MANIFEST_FAULT}`,
    }
  }

  const read = readAxis(parsed, 'capability_type')

  if (!read.ok) {
    return {
      status: 'fail',
      message: `${manifestPath}: ${read.reason}. ${MANIFEST_FAULT}`,
    }
  }

  const { key } = read
  const declared = read.values

  /* Part 2 — coverage, in both directions. */

  const rules = [...ruleKeys]
  const missingRule = declared.filter((t) => !rules.includes(t))
  const orphanRule = rules.filter((r) => !declared.includes(r))

  if (missingRule.length > 0 || orphanRule.length > 0) {
    const lines = []
    if (missingRule.length > 0) {
      lines.push(`declared in ${manifestPath} with no layout rule: ${missingRule.join(', ')}`)
    }
    if (orphanRule.length > 0) {
      lines.push(`layout rules for types ${manifestPath} does not declare: ${orphanRule.join(', ')}`)
    }
    return {
      status: 'fail',
      declared,
      message:
        `Layout-rule coverage is not bidirectional — ${lines.join(' · ')}. ` +
        `${declared.length} declared, ${rules.length} rules. A rule with no type is as ` +
        'much a failure as a type with no rule: one-way coverage passes a rule set that ' +
        'has drifted past the contract.',
    }
  }

  return {
    status: 'ok',
    declared,
    message:
      `${declared.length} capability_type values declared in ${manifestPath} ` +
      `(\`manifest.${key}\`), ${rules.length} layout rules, matched in both directions: ` +
      `${declared.join(', ')}.`,
  }
}
