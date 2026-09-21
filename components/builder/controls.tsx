'use client'

/*
 * SITE-035, SITE-036, SITE-039 · the tune and protect controls.
 *
 * Three controls, one file, because they are one interaction surface and share
 * every ergonomic rule §9 sets: **44px minimum targets, no hover dependency,
 * keyboard operable, visible focus, and selection state legible without colour
 * alone.**
 *
 * **Selection is never colour alone.** Each control marks its selected state
 * with `aria-pressed` for assistive technology and with a **border and a lit
 * label** visually — the same lit-edge grammar §6.3b sets for lavender, which
 * `scripts/check-lavender.mjs` enforces. A filled chip would be both a §6.3b
 * violation and the one accessibility failure SITE-036's accept names.
 *
 * **No control animates its own state change.** The settling spring is confined
 * to structure landing (SITE-024), and a pill that eases its own background is
 * motion carrying no product meaning (K-4). What moves when a control changes
 * is the **marks**, in the plan, which is §6.3b's rule: the band does not
 * animate, the marks do.
 *
 * Copy is held — `lib/copy/builder-controls.ts`. None of these labels is in
 * v7.3.
 */

import { WEEKDAYS, type Weekday } from '@/lib/parse/recurrence'
import {
  APP_CHIPS,
  DAY_INITIALS,
  DAYS_CONTROL_LABEL,
  PROTECT_CONTROL_LABEL,
  TIME_CONTROL_LABEL,
  WINDOW_OPTIONS,
  type WindowOption,
} from '@/lib/copy/builder-controls'

/** The one visual definition of "selected", so three controls cannot drift. */
function selectedStyle(on: boolean): React.CSSProperties {
  return {
    background: 'transparent',
    border: `1px solid ${on ? 'var(--lavender)' : 'var(--edge)'}`,
    color: on ? 'var(--lavender-lit)' : 'var(--bone-60)',
    boxShadow: on ? '0 0 10px rgba(139, 125, 255, 0.2)' : 'none',
    cursor: 'pointer',
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="metadata" style={{ margin: 0, paddingBottom: 10 }}>
      {children}
    </p>
  )
}

/* ------------------------------------------------------------------ *
 * SITE-035 · Time of day.
 * ------------------------------------------------------------------ */

export function TimeControl({
  value,
  onChange,
}: {
  value: WindowOption
  onChange: (o: WindowOption) => void
}) {
  return (
    <div>
      <Label>{TIME_CONTROL_LABEL}</Label>
      <div role="group" aria-label={TIME_CONTROL_LABEL} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {WINDOW_OPTIONS.map((option) => {
          const on = option.id === value.id
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option)}
              className="text-body"
              style={{ ...selectedStyle(on), minHeight: 44, padding: '0 16px' }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * SITE-036 · Days of week.
 * ------------------------------------------------------------------ */

export function DaysControl({
  value,
  onChange,
}: {
  value: readonly Weekday[]
  onChange: (days: readonly Weekday[]) => void
}) {
  return (
    <div>
      <Label>{DAYS_CONTROL_LABEL}</Label>
      {/*
        * Seven pills wrapping rather than a seven-column grid. At 320px a grid
        * forces each below the target size; wrapping keeps it and costs a
        * second row, which SITE-036's accept explicitly allows.
        *
        * **The gap is 4px here and 8px everywhere else, and that is measured
        * rather than chosen.** At 375px the content box is 343px; seven 44px
        * pills are 308px, leaving 35px for six gaps. At 8px they need 48px, so
        * one pill wrapped alone onto a second row — a single orphan, which
        * reads as a mistake rather than as a two-row control. At 4px they need
        * 24px and all seven fit. At 320px the row still wraps, as the accept
        * allows.
        *
        * **The targets stay 44px.** SITE-036's scope says 40×40, and §9 says
        * 44×44 with no exceptions — that is a contradiction rather than a
        * refinement, so per CLAUDE.md §1 the PRD wins and the issue is wrong.
        * Closing the gap was the alternative to shrinking the target, and it is
        * the one that does not cost anyone a tap.
        */}
      <div role="group" aria-label={DAYS_CONTROL_LABEL} style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {WEEKDAYS.map((day) => {
          const on = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              aria-pressed={on}
              /* The initial is ambiguous — T and S repeat — so the name is the accessible one. */
              aria-label={day}
              onClick={() => onChange(on ? value.filter((d) => d !== day) : [...value, day])}
              className="text-body"
              style={{ ...selectedStyle(on), minWidth: 44, minHeight: 44, padding: '0 8px' }}
            >
              {DAY_INITIALS[day] ?? day.slice(0, 1)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * SITE-039 · App selection.
 * ------------------------------------------------------------------ */

export function ProtectControl({
  value,
  onChange,
}: {
  value: readonly string[]
  onChange: (apps: readonly string[]) => void
}) {
  return (
    <div>
      <Label>{PROTECT_CONTROL_LABEL}</Label>
      {/*
        * These chips are the **site's own input affordance** and legitimately
        * carry recognisable names (v7.3 §6.3a, SITE-039's non-goal). What the
        * MUST forbids is a name surviving into the assembled object, and it
        * cannot: `Gate.appCount` is a number, so only the count crosses.
        * `scripts/check-app-names.mjs` asserts that against the rendered page.
        */}
      <div role="group" aria-label={PROTECT_CONTROL_LABEL} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {APP_CHIPS.map((app) => {
          const on = value.includes(app)
          return (
            <button
              key={app}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((a) => a !== app) : [...value, app])}
              className="text-body"
              style={{ ...selectedStyle(on), minHeight: 44, padding: '0 16px' }}
            >
              {app}
            </button>
          )
        })}
      </div>
    </div>
  )
}
