'use client'

/*
 * SITE-019 · Live pre-submit parse binding.
 *
 * PRD §3.3: as the visitor types, deterministic date-phrase parsing runs
 * client-side, and **the moment they land on "by May" the deadline field
 * materialises**. No network, no LLM, fully honest. §3.3 calls it the cheapest
 * high-signal detail on the site.
 *
 * The text lives here rather than in the input, because two things read it —
 * the input renders it and the block parses it — and a value owned by one of
 * them would have to be pushed to the other.
 *
 * **The parse is synchronous and runs during render.** No effect, no debounce,
 * no timer: a debounce would make the deadline arrive *after* the keystroke
 * that earned it, which is the one thing this detail exists to avoid. It costs
 * a regex pass over at most 300 characters.
 */

import { useState } from 'react'
import AskInput from '@/components/ask-input'
import TransformationBlock from '@/components/transformation-block'
import { matchDeadline } from '@/lib/parse/deadline'
import type { RowValues } from '@/lib/builder/rows'

/** §3.4's qualifier column explains where a value came from, in three words. */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDeadline(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export default function Builder() {
  const [text, setText] = useState('')

  /*
   * Parsed every render, from the live text. Nothing is stored — the deadline
   * is a function of what is in the field, so it cannot go stale or disagree
   * with what the visitor can see.
   */
  const match = matchDeadline(text)

  const values: RowValues = {}
  if (match !== null) {
    /*
     * The qualifier quotes the phrase the parser actually matched, reported by
     * the parser rather than re-derived here. §3.4 shows `from "by May"` — the
     * block saying *why* it believes the date is what separates parsing from
     * guessing in the visitor's reading of it, and a second regex claiming to
     * describe the same match could disagree with the one that made it.
     */
    values.deadline = { value: formatDeadline(match.date), qualifier: `from "${match.phrase}"` }
  }

  return (
    <div className="flex w-full flex-col gap-10">
      <AskInput value={text} onChange={setText} />
      <TransformationBlock rawIntent={text} values={values} />
    </div>
  )
}
