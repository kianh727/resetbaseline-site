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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import { createAnalytics, NULL_SINK, type AnalyticsSink } from '@/lib/analytics/client'
import type { EventName, EventPayloads, EventProperties } from '@/lib/analytics/events'
import { classifyInput } from '@/lib/parse/input-class'
import { occurrences } from '@/lib/plan/model'
import { useRenderTier } from '@/lib/hooks/use-render-tier'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

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

/**
 * SITE-050 · Where the fifteen events fire.
 *
 * **Each fires at the moment the thing it names happens**, not at the render
 * that follows it: `goal_input_started` on the first keystroke and not on every
 * one, `wall_reached` when the machine enters `walled` and not when the wall
 * paints. An event fired from a render effect counts renders, which is a
 * different measurement wearing the same name.
 *
 * **Nothing the visitor typed reaches a payload**, and that is not a discipline
 * applied here — `Analytics.track` admits no free-form string at all, so there
 * is no argument this component could pass one through (SITE-051).
 *
 * **The sink is injected and defaults to `NULL_SINK`.** The PRD names no
 * provider, so this measures nothing until Kian chooses one; the seam is what
 * makes that a one-argument change rather than an instrumentation pass.
 */
export default function Builder({ sink = NULL_SINK }: { sink?: AnalyticsSink } = {}) {
  const [text, setText] = useState('')
  const [state, setState] = useState(INITIAL_STATE)
  const [windowId, setWindowId] = useState(DEFAULT_WINDOW_ID)
  const [days, setDays] = useState<readonly Weekday[] | null>(null)
  const [apps, setApps] = useState<readonly string[]>([])

  /*
   * The tier is read once and attached to every event (§10.2). Reading it per
   * event would attribute a session that changed tier mid-way to whichever tier
   * it happened to be in at each moment, and SITE-EVAL-040's K-1 comparison
   * would be measuring something other than the cohort.
   */
  const tier = useRenderTier()
  const reducedMotion = useReducedMotion()
  const analytics = useMemo(() => createAnalytics(sink, tier), [sink, tier])

  /*
   * Refs, not state: these gate one-shot events and must not cause a render.
   * `submittedAt` is what `wall_reached` measures against, and it is a ref for
   * the same reason — a timestamp in state re-renders the builder at the moment
   * the visitor is typing.
   */
  const fired = useRef<Set<string>>(new Set())
  const submittedAt = useRef<number | null>(null)
  const walledAt = useRef<number | null>(null)

  /**
   * Fire at most once per session — `hero_view`, `builder_engaged` and
   * `goal_input_started` are all "the first time", not "every time".
   *
   * **Keyed on the event name itself** rather than on a separate string. An
   * arbitrary key is a second name for the same thing, and it drifts from the
   * event the first time somebody renames one and not the other.
   */
  const trackOnce = useCallback(
    <K extends EventName>(name: K, properties: Omit<EventPayloads[K], 'tier'> & EventProperties) => {
      if (fired.current.has(name)) return
      fired.current.add(name)
      analytics.track(name, properties)
    },
    [analytics],
  )

  /*
   * `hero_view` is the one event that legitimately fires from an effect: it
   * names a view, and mount is when the view happens. The `once` guard makes a
   * remount — a fast refresh, a tier upgrade re-running the memo — count one
   * view rather than two, which is the failure this event has by default.
   */
  useEffect(() => {
    trackOnce('hero_view', { reduced_motion: reducedMotion })
  }, [trackOnce, reducedMotion])

  /**
   * The only way state moves. `next()` returns `null` for a transition that is
   * not in the table, and an illegal event is **dropped rather than forced** —
   * a component that could not make a transition happen must not get one by
   * writing the state itself.
   */
  const send = useCallback(
    (event: BuilderEvent) => {
      setState((current) => {
        const moved = next(current, event)
        if (moved === null) return current

        /*
         * `wall_reached` fires on the **transition**, which is the only place
         * it can be correct: the wall is reachable by exactly one event
         * (SITE-012), so firing it here means the event and the guarantee have
         * the same single source. Fired from the wall's own mount it would
         * count paints, and a remount would count two.
         */
        if (moved === 'walled' && current !== 'walled') {
          walledAt.current = Date.now()
          analytics.track('wall_reached', {
            ms_since_submit: submittedAt.current === null ? 0 : Date.now() - submittedAt.current,
          })
        }
        return moved
      })
    },
    [analytics],
  )

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

    const startedAt = Date.now()
    submittedAt.current = startedAt

    analytics.track('goal_submitted', {
      // A length, never the text. A length cannot be read back into words.
      length: text.trim().length,
      input_class: classifyInput(text.trim()),
      has_deadline: match !== null,
    })

    send('submit')
    send('build')
    send('plan_ready')

    /*
     * Measured from the same `buildPlan` the render uses, so the number is the
     * plan's cost rather than React's. It is deterministic and client-side, so
     * this is honest: there is no request in it.
     */
    const built = buildPlan({ text, window: planWindow, days, appCount: apps.length })
    if (built !== null) {
      analytics.track('plan_generated', {
        node_count: built.nodes.length,
        occurrence_count: occurrences(built).length,
        ms_to_plan: Date.now() - startedAt,
      })
    }
  }

  return (
    <div className="flex w-full flex-col gap-10">
      <AskInput
        value={text}
        onChange={(v) => {
          if (v.trim().length > 0) trackOnce('goal_input_started', {})
          setText(v)
          send('engage')
          trackOnce('builder_engaged', {})
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
                analytics.track('plan_tuned', { control: 'window' })
                setWindowId(o.id)
                send('tune')
              }}
            />
            <DaysControl
              value={activeDays}
              onChange={(d) => {
                analytics.track('plan_tuned', { control: 'days' })
                setDays(d.length === 0 ? [] : WEEKDAYS.filter((w) => d.includes(w)))
                send('tune')
              }}
            />
            <ProtectControl
              value={apps}
              onChange={(a) => {
                trackOnce('protect_started', {})
                /* A count, never a name (§6.3a) — and the type cannot carry one. */
                analytics.track('protect_selected', { app_count: a.length })
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
              onClick={() => {
                analytics.track('activation_attempted', {})
                send('activation_attempted')
              }}
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
        onDismiss={() => {
          analytics.track('wall_dismissed', {
            dwell_ms: walledAt.current === null ? 0 : Date.now() - walledAt.current,
          })
          send('dismiss_wall')
        }}
        onSubmit={() => analytics.track('email_submitted', {})}
        onDownload={() => {
          if (plan !== null) {
            /*
             * The download **is** the share artifact today: the card is a
             * server-side render and the wall's control hands over a plain-text
             * plan (§11.5). Firing `share_card_created` here rather than at
             * some future share button is the honest reading — the event names
             * the moment a visitor takes the plan away with them, and that is
             * this one.
             */
            analytics.track('share_card_created', {})
            downloadPlan(plan)
          }
        }}
      />
    </div>
  )
}

export { RUN_AGAIN_LABEL }
