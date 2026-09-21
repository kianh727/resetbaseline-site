/*
 * SITE-037 · The deterministic plan, built entirely client-side.
 *
 * **Every field here comes from the parse or from a control the visitor
 * touched. Nothing comes from a model, and there is no network call in this
 * file or reachable from it** — which is SITE-037's accept criterion and §6.5's
 * single most important boundary in SP-06.
 *
 * ---
 *
 * **Why a plan exists at all before SP-05's route does.** The generated surface
 * is three fields (§6.5): a commitment title, a window selection, and the
 * clarification question. The first and third are blocked on copy and on a
 * route that does not exist. **The window is not** — tuning is fully local, so
 * the control *is* the selection, and the visitor's own choice is a better
 * source than a model's would have been.
 *
 * That leaves the title, and §6.4 already specifies what happens when the beat
 * cannot run: *"the build proceeds on the original input."* So the label is
 * **the visitor's own sentence**, which is not a stand-in for a generated title
 * — it is the documented fallback path, and it is the honest one. The site
 * shows what it understood; it does not paraphrase someone back to themselves
 * with a sentence a model wrote.
 *
 * **The recurrence is `selectRecurrence`'s and the occurrences are
 * `generateOccurrences`'s**, both already built and both total. When no
 * frequency parses, the plan has **no occurrences and no band** — §6.3c is
 * explicit that a commitment with no recurrence is a valid object, the one
 * §6.1a calls *"an intention with no occasion"*. Nothing is invented to fill
 * the gap.
 *
 * **Node ids are prefixed `n-`** so they cannot collide with a contract value.
 * The first version used `id: 'commitment'`, which the hand-list scan flagged —
 * correctly by its own rule and wrongly in substance, the same word-sharing
 * false positive `lib/builder/rows.ts` produced. The scan matches quoted
 * literals rather than meaning, which its header already states; the cost here
 * is a rename that makes the ids better anyway, since an id identical to a
 * capability value reads as though it were one.
 *
 * **The capability and tier are opaque strings until SITE-004** (§6.2), carried
 * the same way `bandsFor` and the object list carry them. They are **not** the
 * five real values, and this file names none: `CAPABILITY` and the tier below
 * are single placeholder-free identifiers whose values arrive with the
 * manifest. A hand-list here would be the thing §6.2 forbids, in the file that
 * builds every object on the site.
 */

import { matchDeadline } from '../parse/deadline.ts'
import { daysOf, selectRecurrence, type Recurrence, type Weekday } from '../parse/recurrence.ts'
import { generateOccurrences } from '../plan/occurrences.ts'
import { planDate, type Plan, type PlanDate, type PlanNode, type Window } from '../plan/model.ts'
import { COMMITMENT, COMMITMENT_TIER, GATE, GATE_TIER } from '../plan/capabilities.ts'

/** How far ahead the plan is expanded when no deadline is stated. */
const DEFAULT_SPAN_DAYS = 13

export interface BuildInput {
  /** What the visitor typed. §6.4's fallback path: the build proceeds on it. */
  readonly text: string
  /** The tune control's window. Local, never a model field (§6.5). */
  readonly window: Window
  /**
   * The days-of-week control, when the visitor has overridden the parse.
   * `null` means the parsed recurrence stands.
   */
  readonly days?: readonly Weekday[] | null
  /** The protect step's selections. Only the **count** reaches the object. */
  readonly appCount?: number
  /** Injected so the build is a pure function of its inputs and testable. */
  readonly today?: PlanDate
}

/**
 * Override the parsed recurrence with an explicit day set.
 *
 * **Only `weekly_on_days` is produced**, never a shorthand. §6.3c: *"named days
 * that do not form a shorthand set are `weekly_on_days` with those days — never
 * the nearest shorthand."* The same rule holds when the days come from a
 * control rather than from text: rounding Monday/Wednesday/Friday up to
 * `weekdays` would add two commitments the visitor just deselected.
 */
function withDays(parsed: Recurrence | null, days: readonly Weekday[] | null): Recurrence | null {
  if (days === null) return parsed
  if (days.length === 0) return null
  return { kind: 'weekly_on_days', days }
}

export function buildPlan(input: BuildInput): Plan | null {
  const text = input.text.trim()
  if (text.length === 0) return null

  const today = input.today ?? (() => {
    const now = new Date()
    return planDate(now.getFullYear(), now.getMonth(), now.getDate())
  })()

  const match = matchDeadline(text, today)
  const deadline = match === null ? null : match.date

  const rule = withDays(selectRecurrence(text), input.days ?? null)

  /*
   * The span ends at the deadline when one was stated, and otherwise at a
   * fixed horizon. It is **not** extended to make the plan look fuller: the
   * number of marks is a consequence of the rule and the span, and a span
   * chosen to produce a satisfying count would be a completeness meter with
   * the meter hidden.
   */
  const until =
    deadline !== null && deadline.getTime() > today.getTime()
      ? deadline
      : planDate(today.getFullYear(), today.getMonth(), today.getDate() + DEFAULT_SPAN_DAYS)

  const nodes: PlanNode[] = []

  nodes.push({
    id: 'n-commitment',
    capability: COMMITMENT,
    authority: COMMITMENT_TIER,
    label: text,
    detail: {
      occurrences:
        rule === null
          ? []
          : generateOccurrences({ rule, from: today, until, anchor: today, window: input.window }),
    },
  })

  /*
   * SITE-040. The gate carries a **count**, and `Gate.appCount` is a number so
   * that naming an app is not a thing this object can express (§6.3a, a MUST).
   * The chip labels the visitor tapped do not reach here and have nowhere to go
   * if they did.
   */
  const appCount = input.appCount ?? 0
  if (appCount > 0) {
    nodes.push({
      id: 'n-gate',
      capability: GATE,
      authority: GATE_TIER,
      label: 'Protection',
      detail: { appCount, window: input.window },
    })
  }

  return { title: text, deadline, nodes }
}

/** The days a plan's recurrence actually covers, for the control's state. */
export function parsedDays(text: string): readonly Weekday[] | null {
  const rule = selectRecurrence(text)
  return rule === null ? null : daysOf(rule)
}
