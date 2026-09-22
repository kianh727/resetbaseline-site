/*
 * SITE-015 · The transformation block.
 *
 * PRD §3.4: the conversion moment. **Not a card, not a chat bubble, not a
 * reasoning transcript.** Three columns — label, value, qualifier — hairline
 * rules between rows, and the whole frame present before any async work
 * resolves.
 *
 * **The anti-spinner guarantee is structural here, not cosmetic** (DS-10,
 * SITE-EVAL-007). Every row is in the DOM at t=0 showing `—`; none is
 * conditionally rendered, none is skeletonised, and nothing about the frame's
 * shape depends on what has arrived. A frame assembled from available data
 * would grow as data landed, which is the same experience as a spinner with
 * better manners.
 *
 * §3.4's other constraint is negative and just as load-bearing: **no prose, no
 * explanation, no "why."** An instrument parsing intent into structure. There
 * is no sentence anywhere in this component.
 */

import { ROWS, resolveRow, type RowValues } from '@/lib/builder/rows'

export default function TransformationBlock({
  rawIntent,
  values,
}: {
  /** What the visitor typed, verbatim. Theirs, never paraphrased. */
  rawIntent: string
  values: RowValues
}) {
  return (
    <section className="w-full max-w-[42rem]" aria-label="What Baseline built">
      <p className="metadata">YOU SAID</p>
      {/*
        * Quoted and verbatim. §3.4 shows the visitor's own sentence back —
        * substituting a tidied version would be the first place the site
        * stopped being honest about what it received.
        */}
      <p className="mt-2 text-lead text-bone">{rawIntent === '' ? '—' : `"${rawIntent}"`}</p>

      <hr className="mt-5 border-0 border-t border-edge" />

      <p className="mt-5 metadata">BASELINE BUILT</p>

      <dl className="mt-3">
        {ROWS.map((spec, i) => {
          const { value, qualifier } = resolveRow(spec, values)
          return (
            <div
              key={spec.key}
              data-row={spec.key}
              className={`grid grid-cols-[7rem_1fr_auto] items-baseline gap-3 py-2.5 ${
                i === 0 ? '' : 'border-t border-edge'
              }`}
            >
              <dt className="metadata">{spec.label}</dt>
              {/*
                * Only opacity changes when a row fills (SITE-016). No height
                * change, no layout shift, nothing that reads as arrival.
                */}
              <dd
                className="text-body text-bone transition-opacity duration-200"
                style={{ opacity: value === '—' ? 0.38 : 1 }}
              >
                {value}
              </dd>
              <dd className="metadata text-right">{qualifier}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
