/*
 * §11.5's `[ download your plan ]`.
 *
 * **Plain text, and that is my call, recorded** — §11.5 specifies the control
 * and not the format. A visitor who presses *"download your plan"* wants the
 * plan, not a serialisation of it: JSON would be the easy choice and would hand
 * someone a file they cannot read, which makes the control a gesture. Text also
 * costs no dependency and no schema, and there is nothing downstream that has
 * to parse it back.
 *
 * **This is a real browser capability and therefore honest** (DS-8). The wall
 * exists because a browser cannot hold a gate; a browser can absolutely write a
 * file. The control is the one thing on that screen that does what it says.
 *
 * **Zero network.** The plan is already in memory — it was built client-side
 * from a deterministic parse — so the file is assembled locally and no request
 * is made. That is the same boundary SITE-037 asserts for tuning, and it holds
 * here for free rather than by effort.
 *
 * **Dates are written out, never localised.** `check-motion.mjs` scans `lib/`
 * for `toLocale*` and `Intl.*` and fails on either: the same plan must read the
 * same everywhere, and a downloaded file is the one artifact that outlives the
 * session that produced it.
 */

import type { Plan, PlanDate } from './model.ts'
import { descriptorFor } from '../render/object-list.ts'

const MONTHS: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function formatDate(date: PlanDate): string {
  const month = MONTHS[date.getMonth()] ?? '—'
  return `${month} ${date.getDate()}, ${date.getFullYear()}`
}

/**
 * The plan as a readable file.
 *
 * Pure, so the format is tested against fixtures rather than against whatever a
 * browser happens to produce — and so the one part that could silently change,
 * the date formatting, is asserted directly.
 *
 * **Carries no ordinal and no total** — no *"3 of 12"*, no count of occurrences
 * against a target. §10 bans progress and completeness meters and §4 promises
 * none, and a downloaded file is exactly where one would get added without
 * anybody reviewing it. The occurrence dates are listed; nothing counts them
 * toward anything.
 */
export function planAsText(plan: Plan): string {
  const lines: string[] = []

  lines.push(plan.title)
  if (plan.deadline !== null) {
    lines.push(`Deadline: ${formatDate(plan.deadline)}`)
  }
  lines.push('')

  for (const node of plan.nodes) {
    lines.push(node.label)

    const descriptor = descriptorFor(node)
    if (descriptor !== null) lines.push(`  ${descriptor}`)

    /*
     * §6.1a's metadata line, carried through from the node exactly as the band
     * and the object list carry it. When SITE-004 lands and the tier becomes a
     * pure function of capability, this reads that function instead — and
     * nothing about the file's shape changes.
     */
    lines.push(`  ${node.capability} · ${node.authority}`)

    const detail: unknown = node.detail
    if (typeof detail === 'object' && detail !== null) {
      const occurrences = (detail as Record<string, unknown>).occurrences
      if (Array.isArray(occurrences)) {
        for (const occurrence of occurrences) {
          const o = occurrence as { date: PlanDate }
          lines.push(`  ${formatDate(o.date)}`)
        }
      }
    }

    lines.push('')
  }

  /*
   * The file says where it came from and that it is not the product. Someone
   * opening it three weeks later should not have to infer either, and a plan
   * file that reads as though Baseline produced it would be the site implying
   * a capability it does not have.
   */
  lines.push('—')
  lines.push('Built at resetbaseline.com. This is the plan, not the app.')

  return lines.join('\n')
}

/** A filename with no date in it — the file is the plan, not a snapshot of one. */
export const PLAN_FILENAME = 'baseline-plan.txt'

/**
 * Write the file. Separated from `planAsText` because this half touches the DOM
 * and cannot be tested by `node --test`, while the half worth testing is pure.
 */
export function downloadPlan(plan: Plan): void {
  const blob = new Blob([planAsText(plan)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = PLAN_FILENAME
  anchor.click()
  /* Released immediately; the click has already taken its own reference. */
  URL.revokeObjectURL(url)
}
