/*
 * The plan axis's labels.
 *
 * **Pure date logic, in `lib/` rather than in the component**, and not only for
 * tidiness: Node's native type stripping runs `.ts` but cannot transform JSX,
 * so a `node --test` suite cannot import from a `.tsx` file at all. This lived
 * in `flat-plan.tsx` first and its test could not load. The constitution
 * records the stripping mechanism (§7); this is the edge of it, written down
 * where the next person putting testable logic in a component will hit it.
 */

import type { PlanDate } from './model.ts'

/**
 * Which marks carry a label, and what it says.
 *
 * **SITE-025 recorded the twelve-day case and both of the cases past it were
 * wrong.** That note reasoned about 375px giving each mark ~28px — room for
 * `4`, not for `May 4` — decided on the day number with the month named once,
 * and stopped. Two failures follow from stopping there, and neither is visible
 * to any check on this site: the DOM is correct, nothing overflows, every label
 * is present and correctly positioned. Both were found by looking.
 *
 * 1. **A twenty-day span at 375px gives ~17px per mark**, and a two-digit day
 *    at 11px is about 13px wide before its neighbours. The labels collapse into
 *    an unreadable strip. §12.3a forbids anything between the two type scales,
 *    so 11px is the floor and the *count* is what gives.
 *
 * 2. **A span that crosses months makes the day number meaningless.** A real
 *    deadline of "May 20" entered in September produces a 241-day span, and
 *    every twentieth day reads `22 13 3 24 15 5 26 …` — correct, in order, and
 *    communicating nothing, because the month changes and only the day is
 *    shown. "The month named once" is true of twelve days in May and false of
 *    eight months.
 *
 * So the axis changes register with the span: **day numbers inside one month,
 * month names across several.** Both are real dates, which is what §8.2 asks
 * for; neither is an ordinal or a count.
 *
 * **Not a completeness meter.** Which marks carry a number is a legibility
 * decision about the axis. Every mark is still drawn, lit or dark.
 */
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function markLabels(
  dates: readonly PlanDate[],
): readonly { readonly index: number; readonly text: string }[] {
  if (dates.length === 0) return []

  const months = new Set(dates.map((d) => `${d.getFullYear()}-${d.getMonth()}`))

  if (months.size > 1) {
    /*
     * One label per month, on that month's first mark. The span's own first
     * mark carries its month too, so the axis starts named rather than starting
     * mid-month with nothing to anchor it.
     */
    const out: { index: number; text: string }[] = []
    let previousMonth = ''
    let lastLabelled = -Infinity

    /*
     * **A minimum gap, because a span rarely starts on the 1st.** A deadline of
     * "May 20" entered on 22 September gives September six marks before October
     * begins, and `Sep` and `Oct` then render at 5–28px and 19–40px: they
     * overlap and read as `SepOct`. Measured at 375px, a three-letter month at
     * 11px is about 24px wide, which is 7% of the 343px content box — so a
     * month whose first mark falls inside that of the last labelled one is
     * skipped rather than drawn on top of it.
     *
     * **The first month is the one dropped, not the second**, because it is the
     * partial one: the axis then starts at the first *whole* month, which is
     * the honest label for where the span's body is. The marks themselves are
     * unaffected — every day is still drawn.
     */
    const minGap = Math.max(1, Math.ceil(dates.length * 0.07))

    dates.forEach((date, index) => {
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (key === previousMonth) return
      previousMonth = key
      if (index - lastLabelled < minGap) {
        // Replace rather than skip: the later month is the one with the marks.
        if (out.length > 0) out.pop()
      }
      lastLabelled = index
      out.push({ index, text: MONTHS_SHORT[date.getMonth()] ?? '' })
    })
    return out
  }

  /*
   * One month: day numbers, thinned to fit. The first and last are always
   * labelled — the span's ends are what a reader looks for — **unless the last
   * would sit on top of a strided one**, which is how `11` and `20` rendered as
   * `1120`.
   */
  const stride = labelStride(dates.length)
  const indices = new Set<number>([0])
  for (let i = stride; i < dates.length - 1; i += stride) indices.add(i)

  const last = dates.length - 1
  const nearest = Math.max(...indices)
  if (last - nearest >= Math.max(1, Math.floor(stride / 2))) indices.add(last)

  return [...indices]
    .sort((a, b) => a - b)
    .map((index) => ({ index, text: String(dates[index]?.getDate() ?? '') }))
}

export function labelStride(markCount: number): number {
  if (markCount <= 14) return 1
  if (markCount <= 28) return 2
  if (markCount <= 60) return 5
  return Math.ceil(markCount / 12)
}
