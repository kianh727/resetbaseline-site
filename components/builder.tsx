'use client'

/*
 * The builder, wired end to end: input → plan → tune → protect → activate →
 * wall.
 *
 * **Every state change goes through `lib/builder-machine.ts`.** Nothing here
 * sets a state directly, and `walled` is produced by exactly one call —
 * `send('activation_attempted')`, from the Activate control and from nowhere
 * else. That is Rejection 3, and it is the reason the machine exists rather
 * than a `useState` holding a string: SITE-012's exhaustive test proves the
 * table has one route to `walled`, and that proof is worth nothing if a
 * component can bypass the table.
 *
 * **The plan is deterministic and client-side.** `buildPlan` reads the parse
 * and the controls; there is no provider, no `/api/plan`, and no fetch on this
 * path. SITE-037's accept — *"zero network requests, asserted"* — holds by
 * construction rather than by discipline, and `scripts/check-builder.mjs`
 * measures it in a browser.
 *
 * **Tune is live the moment recurrence exists** (§6.1, SITE-025): the controls
 * are rendered as soon as there is a plan and are never disabled pending an
 * animation. Controls enable on data, never on animation.
 *
 * **What changes when a control moves is the marks.** §6.3b: the band is
 * already there and does not animate; the marks inside it are what reveal. That
 * falls out of `FlatPlan` keying its animation on the occurrence set rather
 * than on mount.
 */

import { useCallback, useMemo, useState } from 'react'

import AskInput from '@/components/ask-input'
import TransformationBlock from '@/components/transformation-block'
import { FlatPlan } from '@/components/plan/flat-plan'
import PlanObjects from '@/components/plan/plan-objects'
import { DaysControl, ProtectControl, TimeControl } from '@/components/builder/controls'
import Wall from '@/components/wall'
import { buildPlan, parsedDays } from '@/lib/builder/build-plan'
import { INITIAL_STATE, next, type BuilderEvent } from '@/lib/builder-machine'
import { matchDeadline } from '@/lib/parse/deadline'
import { WEEKDAYS, type Weekday } from '@/lib/parse/recurrence'
import { downloadPlan } from '@/lib/plan/download'
import { DEFAULT_WINDOW_ID, WINDOW_OPTIONS } from '@/lib/copy/builder-controls'
import { ACTIVATE_LABEL, RUN_AGAIN_LABEL } from '@/lib/copy/builder-controls'
import type { RowValues } from '@/lib/builder/rows'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDeadline(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function formatWindow(startMinute: number, endMinute: number): string {
  const hhmm = (m: number, suffix: boolean): string => {
    const h24 = Math.floor(m / 60)
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    const mm = String(m % 60).padStart(2, '0')
    return `${h12}:${mm}${suffix ? (h24 < 12 ? 'am' : 'pm') : ''}`
  }
  const sameHalf = Math.floor(startMinute / 60) < 12 === Math.floor(endMinute / 60) < 12
  return `${hhmm(startMinute, !sameHalf)}–${hhmm(endMinute, true)}`
}

const FALLBACK_WINDOW = WINDOW_OPTIONS[0]!

export default function Builder() {
  const [text, setText] = useState('')
  const [state, setState] = useState(INITIAL_STATE)
  const [windowId, setWindowId] = useState(DEFAULT_WINDOW_ID)
  const [days, setDays] = useState<readonly Weekday[] | null>(null)
  const [apps, setApps] = useState<readonly string[]>([])

  /**
   * The only way state moves. `next()` returns `null` for a transition that is
   * not in the table, and an illegal event is **dropped rather than forced** —
   * a component that could not make a transition happen must not get one by
   * writing the state itself.
   */
  const send = useCallback((event: BuilderEvent) => {
    setState((current) => next(current, event) ?? current)
  }, [])

  const option = WINDOW_OPTIONS.find((o) => o.id === windowId) ?? FALLBACK_WINDOW
  const planWindow = { startMinute: option.startMinute, endMinute: option.endMinute }

  const match = matchDeadline(text)

  const plan = useMemo(
    () =>
      state === 'idle' || state === 'engaged'
        ? null
        : buildPlan({ text, window: planWindow, days, appCount: apps.length }),
    // planWindow is derived from windowId; listing the id keeps the identity stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, text, windowId, days, apps.length],
  )

  /*
   * The days the plan actually covers: the control's selection when the visitor
   * has touched it, and otherwise whatever the parse found. A control that
   * showed nothing selected while the plan ran on weekdays would be reporting a
   * different plan than the one rendered.
   */
  const activeDays = days ?? parsedDays(text) ?? []

  const values: RowValues = {}
  if (text.trim().length > 0) values.commitment = { value: text.trim() }
  if (match !== null) {
    values.deadline = { value: formatDeadline(match.date), qualifier: `from "${match.phrase}"` }
  }
  if (plan !== null) {
    values.window = {
      value: formatWindow(option.startMinute, option.endMinute),
      qualifier: 'you set this',
    }
    if (activeDays.length > 0) {
      values.frequency = { value: `${activeDays.length} days a week`, qualifier: 'from your words' }
    }
    if (apps.length > 0) {
      /* A count, never a name (§6.3a). The chips are input; this is the object. */
      values.protection = {
        value: `${apps.length} apps · ${formatWindow(option.startMinute, option.endMinute)}`,
      }
    }
  }

  const submit = () => {
    if (text.trim().length === 0) return
    send('submit')
    send('build')
    send('plan_ready')
  }

  return (
    <div className="flex w-full flex-col gap-10">
      <AskInput
        value={text}
        onChange={(v) => {
          setText(v)
          send('engage')
        }}
        onSubmit={submit}
      />

      <TransformationBlock rawIntent={text} values={values} />

      {plan === null ? null : (
        <>
          <FlatPlan plan={plan} />
          <PlanObjects plan={plan} />

          <div className="flex flex-col gap-8">
            <TimeControl
              value={option}
              onChange={(o) => {
                setWindowId(o.id)
                send('tune')
              }}
            />
            <DaysControl
              value={activeDays}
              onChange={(d) => {
                setDays(d.length === 0 ? [] : WEEKDAYS.filter((w) => d.includes(w)))
                send('tune')
              }}
            />
            <ProtectControl
              value={apps}
              onChange={(a) => {
                setApps(a)
                send('protect')
              }}
            />
          </div>

          {/*
            * SITE-041. The Activate control appears only once a gate object
            * exists, because activating nothing is not a thing to offer. Its
            * copy is one word — §11.1 names the control "Activate" — and there
            * is deliberately **no supporting line promising protection**: the
            * accept criterion is that no copy anywhere states or implies the
            * browser can block, and the honest place to say what happens is the
            * wall, after the press.
            */}
          {apps.length === 0 ? null : (
            <button
              type="button"
              onClick={() => send('activation_attempted')}
              className="text-body"
              style={{
                alignSelf: 'flex-start',
                minHeight: 44,
                padding: '0 20px',
                background: 'transparent',
                border: '1px solid var(--lavender)',
                color: 'var(--lavender-lit)',
                boxShadow: '0 0 12px rgba(139, 125, 255, 0.25)',
                cursor: 'pointer',
              }}
            >
              {ACTIVATE_LABEL}
            </button>
          )}
        </>
      )}

      <Wall
        open={state === 'walled'}
        onDismiss={() => send('dismiss_wall')}
        onDownload={() => {
          if (plan !== null) downloadPlan(plan)
        }}
      />
    </div>
  )
}

export { RUN_AGAIN_LABEL }
