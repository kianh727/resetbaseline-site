/*
 * SITE-012 · Hero → builder state machine.
 *
 * The single source of truth for the whole demo. A pure reducer: `next` takes
 * a state and an event and returns the next state, or `null` when the
 * transition is not allowed. **No state is reachable by side effect** — if a
 * transition is not in the table below, it cannot happen.
 *
 * The rule this file exists to enforce is PRD §11.1 and Rejection 3:
 *
 *   > The wall is reachable **only** by pressing Activate on a gate, timer or
 *   > reminder. **Never** on elapsed time, scroll depth, section entry, exit
 *   > intent, or interaction count.
 *
 * That is enforced here rather than in the UI, because a UI-level rule is one
 * component away from being bypassed and a table is not. `WALL_EVENT` is the
 * only event anywhere in the table that produces `walled`, and a test asserts
 * that exhaustively over every state × event pair rather than by inspection.
 *
 * No rendering, no timing, no animation (SITE-012 non-goals). The beat timings
 * of §3.1 belong to the components that own those beats; this machine says
 * which states exist and how they are reached.
 */

export type BuilderState =
  | 'idle'
  | 'engaged'
  | 'submitted'
  | 'building'
  | 'plan_ready'
  | 'tuning'
  | 'protecting'
  | 'walled'

export type BuilderEvent =
  /** Typing, or selecting a suggestion chip. §3.2: this also stops rotation permanently. */
  | 'engage'
  /** A meaningful submit — §3.1 measures every beat from here. */
  | 'submit'
  /** Generation and deterministic construction have begun. */
  | 'build'
  /** §3.1: tune controls enable the moment recurrence exists. */
  | 'plan_ready'
  | 'tune'
  | 'protect'
  /** Pressing Activate on a gate, timer or reminder. The only route to `walled`. */
  | 'activation_attempted'
  /** §11.3: dismissible, returning to a fully tunable plan. */
  | 'dismiss_wall'

/** The only event that may produce `walled` (§11.1, Rejection 3). */
export const WALL_EVENT: BuilderEvent = 'activation_attempted'

export const STATES: readonly BuilderState[] = [
  'idle',
  'engaged',
  'submitted',
  'building',
  'plan_ready',
  'tuning',
  'protecting',
  'walled',
]

export const EVENTS: readonly BuilderEvent[] = [
  'engage',
  'submit',
  'build',
  'plan_ready',
  'tune',
  'protect',
  'activation_attempted',
  'dismiss_wall',
]

/**
 * The transition table. Absent pair means the transition is illegal — there is
 * no fallthrough, no default and no self-transition unless it is written.
 */
const TRANSITIONS: Readonly<Record<BuilderState, Partial<Record<BuilderEvent, BuilderState>>>> = {
  idle: { engage: 'engaged' },

  /*
   * `engage` is idempotent from `engaged`: a visitor keeps typing, and every
   * keystroke after the first is the same event. It must not fail, and it must
   * not advance anything.
   */
  engaged: { engage: 'engaged', submit: 'submitted' },

  submitted: { build: 'building' },
  building: { plan_ready: 'plan_ready' },

  /*
   * From a ready plan the visitor may tune or go straight to protect. Both are
   * reachable directly, because §3.1 enables tune controls the moment
   * recurrence exists and nothing requires tuning before protecting.
   */
  plan_ready: { tune: 'tuning', protect: 'protecting' },

  /* Tuning is repeatable, and protect remains available from it. */
  tuning: { tune: 'tuning', protect: 'protecting' },

  /*
   * Protecting is where Activate lives. `tune` returns to tuning because the
   * plan stays fully tunable throughout — the wall is the only thing that
   * interrupts, and even that is dismissible.
   */
  protecting: { tune: 'tuning', protect: 'protecting', activation_attempted: 'walled' },

  /*
   * §11.3: dismissible, returning to a **fully tunable** plan. Not to
   * `protecting` and not to a dead end — the plan is never hidden or trapped
   * (Rejection 3).
   */
  walled: { dismiss_wall: 'tuning' },
}

export const INITIAL_STATE: BuilderState = 'idle'

/**
 * @returns the next state, or `null` if the transition is not allowed.
 *
 * `null` rather than a thrown error or the unchanged state: a caller must
 * decide what an illegal transition means, and silently returning the current
 * state would let a bug look like a no-op forever.
 */
export function next(state: BuilderState, event: BuilderEvent): BuilderState | null {
  return TRANSITIONS[state][event] ?? null
}

/** Whether a transition is allowed, without caring where it lands. */
export function can(state: BuilderState, event: BuilderEvent): boolean {
  return next(state, event) !== null
}
