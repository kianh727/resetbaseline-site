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

import { useId } from 'react'
import { canRun, clamp, MAX_CHARS } from '@/lib/ask-input'

/*
 * Controlled by the builder rather than holding its own text (SITE-019). The
 * deadline has to materialise **as the visitor types**, which means the parse
 * runs on a value the transformation block can also see — so the text lives
 * one level up and this component reports changes.
 */
export default function AskInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (next: string) => void
  /**
   * Pressing Run. Optional because SITE-008 shipped before there was anything
   * to submit to, and the input's own rules — the thresholds, the cap,
   * whitespace not counting — are unchanged by its arrival.
   */
  onSubmit?: () => void
}) {
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
          * The status dot. Decorative, so it is hidden from assistive
          * technology — it carries no information a screen reader user lacks.
          *
          * **Lavender is light, never paint** (§6.3b). Fixed 2026-09-19: this
          * was `bg-lavender` — a filled lavender disc — with a lavender glow on
          * focus, which is **the same token used two ways in one element**, and
          * that is precisely what the grammar exists to stop. A viewer cannot
          * learn that lavender means *lit* from a page that also uses it to
          * colour things in.
          *
          * It is now an unfilled ring in the hairline colour that **lights** on
          * focus: the glow is the signal, and the dot is the thing being lit.
          */}
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full border border-edge transition-shadow group-focus-within:border-lavender group-focus-within:shadow-[0_0_12px_2px_var(--color-lavender)]"
        />

        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(clamp(e.target.value))}
          /*
           * Enter submits. A single-line field where Enter does nothing is a
           * dead key, and the visitor who types a sentence and presses it is
           * the common case rather than the edge.
           */
          onKeyDown={(e) => {
            if (e.key === 'Enter' && enabled) onSubmit?.()
          }}
          maxLength={MAX_CHARS}
          placeholder="Ask Baseline"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-body text-bone outline-none placeholder:text-bone-38"
        />

        <button
          type="button"
          disabled={!enabled}
          onClick={() => onSubmit?.()}
          /*
           * 44px minimum touch target (§9, no exceptions). `disabled` rather
           * than hidden: the control's existence is what tells a visitor there
           * is something to press once they have typed enough.
           */
          /*
           * **Lavender is light, never paint** (§6.3b). Fixed 2026-09-19: this
           * was a solid `--color-lavender` fill with void-coloured text — a
           * painted region, which is what the grammar forbids whatever the
           * element is. A filled button is not an exception to the rule; it is
           * the most prominent violation of it on the page.
           *
           * Enabled is now a **lit edge**: a lavender border and lavender label
           * over the surface, with the same glow the input's focus ring uses.
           * The affordance is unchanged — the control still reads as the thing
           * to press — and it now reads as lit rather than as coloured in.
           *
           * Disabled keeps the hairline border and `--bone-38`, so the two
           * states differ by *light*, not by presence of fill.
           */
          className="min-h-11 shrink-0 border px-4 text-body font-medium transition-[color,border-color,box-shadow] disabled:cursor-not-allowed"
          style={{
            borderColor: enabled ? 'var(--color-lavender)' : 'var(--color-edge)',
            color: enabled ? 'var(--color-lavender)' : 'var(--color-bone-38)',
            boxShadow: enabled ? '0 0 12px -2px var(--color-lavender)' : 'none',
          }}
        >
          Run
        </button>
      </div>
    </div>
  )
}
