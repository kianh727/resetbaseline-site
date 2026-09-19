/*
 * SITE-015 / SITE-016 · The transformation block's rows, as data.
 *
 * PRD §3.4 specifies the frame exactly: three columns — field label, value,
 * qualifier — with hairline rules between rows, and **unfilled fields show
 * `—`, never a skeleton shimmer.**
 *
 * The row set is a constant rather than something the renderer assembles,
 * because §3.4's guarantee is that **the frame renders complete and empty at
 * t=0 and then fills**. A frame built from whatever data has arrived is a
 * frame that grows, which is the spinner problem wearing different clothes —
 * the visitor still watches structure appear. Declaring all five up front is
 * what makes the guarantee structural rather than cosmetic (DS-10).
 *
 * Source order is §3.1's: raw intent and deadline instantly, commitment and
 * window on generation arrival, protection at the protect step.
 */

/** When a row's data becomes available. Not a timeline — a source. */
export type RowSource = 'instant' | 'generation' | 'protect'

export type RowKey = 'commitment' | 'frequency' | 'window' | 'deadline' | 'protection'

export type RowSpec = {
  key: RowKey
  /** The label exactly as §3.4 prints it. */
  label: string
  source: RowSource
}

/** §3.4's five rows, in its order. `YOU SAID` is the block's header, not a row. */
export const ROWS: readonly RowSpec[] = [
  { key: 'commitment', label: 'commitment', source: 'generation' },
  { key: 'frequency', label: 'frequency', source: 'generation' },
  { key: 'window', label: 'window', source: 'generation' },
  { key: 'deadline', label: 'deadline', source: 'instant' },
  { key: 'protection', label: 'protection', source: 'protect' },
]

/** What §3.4 shows in an unfilled field. Never a shimmer, never blank. */
export const EMPTY = '—'

export type RowValue = { value?: string | undefined; qualifier?: string | undefined }
export type RowValues = Partial<Record<RowKey, RowValue>>

/**
 * Resolves a row for rendering. A row with no data is not omitted and not
 * skeletonised — it renders its label and `—`.
 */
export function resolveRow(spec: RowSpec, values: RowValues): { value: string; qualifier: string } {
  const v = values[spec.key]
  return { value: v?.value ?? EMPTY, qualifier: v?.qualifier ?? '' }
}

/** How many rows currently carry data. For timing assertions. */
export function filledCount(values: RowValues): number {
  return ROWS.filter((r) => (values[r.key]?.value ?? '') !== '').length
}
