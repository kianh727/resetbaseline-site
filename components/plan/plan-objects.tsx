/*
 * SITE-026's other half · The plan object list.
 *
 * **Ruled 2026-09-21 (Kian), provisional and recorded as his:** a timer and a
 * tracker get **no band and no mountain presence at all.** They render as
 * objects in the transformation block and the plan list only. *"The mountain
 * carries recurring windows and protection and nothing else — a timer or
 * tracker appearing on it would be the grammar degrading into ambient
 * decoration."*
 *
 * That closes the gap §6.3b left open. The earlier ruling established the
 * negative half — a band means a recurring time window, a timer is a duration
 * with no recurrence and a tracker a direction with no occasion, so
 * *"nothing else ever gets a band"* applies to both by name. What was missing
 * was where they go instead, and the answer is *not onto the mountain in some
 * other form*. A thickened segment or an off-route node would have been a
 * second visual vocabulary competing with a closed one.
 *
 * ---
 *
 * **This list is not a section listing the five primitives.** SITE-104's
 * non-goal is explicit and it binds here: a section enumerating the primitives
 * would imply five *working* primitives, which is what got "What's underneath"
 * cut. This renders **the objects a particular plan actually contains**, in the
 * builder, at the moment of highest attention. A plan with one commitment
 * renders one row.
 *
 * **Every object appears here, including the ones that also have a band.** The
 * list is the plan's contents; the mountain is a view of the subset that has a
 * recurring window. Rendering only the band-less objects here would make the
 * list a leftovers bin, and a reader would have no single place that answers
 * "what did it build?".
 *
 * **The Problem line is deliberately absent, and that is SITE-104.** §6.1a
 * requires one verbatim line per primitive beneath each object. That map is
 * keyed by `capability_type`, so writing it today is the hand-list §6.2 forbids
 * by name — and SITE-104's own test is *"every `capability_type` in
 * `contracts-manifest.json` resolves a Problem line"*, which cannot run against
 * a manifest that carries no capability vocabulary. It lands with the manifest,
 * alongside the layout rules and by the same bidirectional coverage check.
 * Leaving a visible gap is the honest form; a paraphrase would be worse than
 * absence, and SITE-104 says so — *"the lines are quoted or absent."*
 *
 * **Capability and tier are carried through from the node**, exactly as the
 * band carries them, for the same reason: the manifest has no `authority_tier`
 * to derive from, and a derivation written now would be a hand-list wearing a
 * function's clothes. When SITE-004 lands, this stops carrying and reads the
 * pure function SITE-EVAL-031 asserts.
 */

import type { Plan } from '@/lib/plan/model'

import { descriptorFor } from '@/lib/render/object-list'

export function PlanObjects({ plan }: { plan: Plan }) {
  if (plan.nodes.length === 0) return null

  return (
    <ul
      aria-label="Plan objects"
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {plan.nodes.map((node) => {
        const descriptor = descriptorFor(node)
        return (
          <li
            key={node.id}
            style={{
              /*
               * A hairline rule per row — §14's "hairline rules, real
               * measurements". Top rather than bottom so the list does not end
               * on a rule that reads as a cut-off.
               */
              borderTop: '1px solid var(--edge)',
              paddingTop: 10,
              paddingBottom: 14,
            }}
          >
            <p
              className="text-body"
              style={{ margin: 0, color: 'var(--bone)' }}
            >
              {node.label}
            </p>

            {descriptor === null ? null : (
              <p
                className="text-body"
                style={{ margin: 0, color: 'var(--bone-60)' }}
              >
                {descriptor}
              </p>
            )}

            {/*
              * §6.1a's first metadata line: type and authority tier. The
              * Problem line that belongs beneath it is SITE-104's and waits on
              * the manifest — quoted or absent, never paraphrased.
              */}
            <p className="metadata" style={{ margin: 0, paddingTop: 4 }}>
              {node.capability} · {node.authority}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

export default PlanObjects
