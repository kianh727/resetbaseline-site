'use client'

/*
 * SITE-008 · The Ask Baseline input.
 *
 * "Must not read as a generic chat box" is the acceptance criterion doing the
 * most work here (SITE-EVAL-009 fails on a centered composition, send-arrow
 * iconography, or a placeholder implying open-ended conversation). So: left
 * aligned, a labelled `Run` button rather than an arrow — §19 bans `→`
 * appended to buttons — and a placeholder that names the thing being asked
 * rather than inviting a conversation.
 *
 * **No submit handling** (SITE-008 non-goal). The button reports enablement
 * and nothing else; SITE-012's machine owns what submitting means, and wiring
 * the two together is SP-03's.
 *
 * The rules live in lib/ask-input.ts so the thresholds are unit-tested at
 * exactly 1, 2 and 300 characters rather than through the DOM.
 */

import { useId, useState } from 'react'
import { canRun, clamp, MAX_CHARS } from '@/lib/ask-input'

export default function AskInput() {
  const [value, setValue] = useState('')
  const inputId = useId()
  const enabled = canRun(value)

  return (
    <div className="w-full max-w-[36rem]">
      {/*
        * A real label, visually hidden rather than absent. SITE-EVAL-048 asserts
        * every control carries a name; a placeholder is not a name, and it
        * disappears the moment anyone types.
        */}
      <label htmlFor={inputId} className="sr-only">
        Ask Baseline what you are trying to do
      </label>

      <div className="group flex items-center gap-3 border border-edge bg-surface px-4 py-3 transition-colors focus-within:border-lavender">
        {/*
          * The lavender status dot. Decorative, so it is hidden from assistive
          * technology — it carries no information a screen reader user lacks.
          */}
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-lavender transition-shadow group-focus-within:shadow-[0_0_12px_2px_var(--color-lavender)]"
        />

        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => setValue(clamp(e.target.value))}
          maxLength={MAX_CHARS}
          placeholder="Ask Baseline"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-body text-bone outline-none placeholder:text-bone-38"
        />

        <button
          type="button"
          disabled={!enabled}
          /*
           * 44px minimum touch target (§9, no exceptions). `disabled` rather
           * than hidden: the control's existence is what tells a visitor there
           * is something to press once they have typed enough.
           */
          className="min-h-11 shrink-0 px-4 text-body font-medium text-void transition-colors disabled:cursor-not-allowed"
          style={{
            backgroundColor: enabled ? 'var(--color-lavender)' : 'var(--color-edge)',
            color: enabled ? 'var(--color-void)' : 'var(--color-bone-38)',
          }}
        >
          Run
        </button>
      </div>
    </div>
  )
}
