/*
 * SITE-026's other half · What a plan object says about itself.
 *
 * The pure half of `components/plan/plan-objects.tsx`, split out so it can be
 * tested by `node --test` — Node 22's type stripping runs `.ts` directly but
 * does not parse JSX, so a pure function living in a `.tsx` file is a function
 * no logic suite can reach (CLAUDE.md §7).
 */

import type { PlanNode } from '../plan/model.ts'

/**
 * A one-line description of what the object *is*, derived from its own detail
 * shape rather than from its capability.
 *
 * **Keyed on structure, not on the contract vocabulary**, which is what keeps
 * it out of §6.2's way: it asks what fields the detail has, never what the
 * capability string says. That is not a workaround — it is the same discipline
 * `bandsFor` already uses, and it means this file names no contract value and
 * needs no exemption from the hand-list scan.
 *
 * Returns `null` when the detail carries nothing worth restating. A row with no
 * descriptor renders its label and metadata alone rather than inventing a
 * phrase for it.
 */
export function descriptorFor(node: PlanNode): string | null {
  const d: unknown = node.detail

  if (typeof d === 'object' && d !== null) {
    const rec = d as Record<string, unknown>

    if (typeof rec.durationMinutes === 'number') {
      const m = rec.durationMinutes
      /*
       * Written out rather than formatted through a locale, per the locale
       * guard in check-motion: the same plan must read the same everywhere.
       */
      if (m < 60) return `${m} min`
      const hours = Math.floor(m / 60)
      const rest = m % 60
      return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
    }

    if (typeof rec.subject === 'string') {
      const unit = typeof rec.unit === 'string' ? rec.unit : null
      return unit === null ? rec.subject : `${rec.subject} · ${unit}`
    }

    /*
     * §6.3a, a MUST: a count, never an app name. The field is a number in the
     * model precisely so that naming one is not expressible, and this restates
     * the rule at the only place a string is built from it.
     */
    if (typeof rec.appCount === 'number') {
      return `${rec.appCount} apps`
    }
  }

  return null
}
