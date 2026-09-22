/*
 * SITE-049 / SITE-051 · The event schema, and the guard that is a type.
 *
 * **Fifteen events.** The twelve of `SITE-EVAL-037`'s sequence, plus
 * `suggestion_selected`, `plan_generation_fallback` and `wall_dismissed` from
 * `SITE-EVAL-038`. The decomposition cites *"§10"* for their properties, and
 * **v7.3 §10 is "Bans"** — the citation is v5's numbering, and v5 §10 is not in
 * §11's carry-forward list, so the property tables are carried forward by
 * nothing and are in the working tree nowhere. That is the DS-1…DS-10 shape
 * again, reported rather than resolved: the **names and the ordering** come
 * from `SITE-EVAL-037` and `-038`, which are tier-four and precise, and the
 * **properties are this file's**, chosen structurally and recorded as mine.
 *
 * ---
 *
 * **SITE-051's accept is a compile-time rule, so the guard is a type rather
 * than a validator.** *"Attempting to attach `raw_goal` or a commitment title
 * to any analytics event fails at compile time."* A runtime scan cannot do
 * that: it fails after the payload exists, in an environment somebody has to be
 * running, and the failure is a log line rather than a build.
 *
 * The mechanism is that **no event property accepts `string`.** A value is a
 * number, a boolean, or a member of a closed set — and a closed set is a union
 * of string *literals*, to which an arbitrary `string` is not assignable. So
 * `{ goal: rawGoal }` does not type-check anywhere, for any event, without a
 * rule naming `raw_goal` and without anybody remembering this constraint
 * exists.
 *
 * **Why that is stronger than banning the known field names.** A ban on
 * `raw_goal` and `title` catches the two fields somebody thought of. The
 * visitor's words can reach an event under any name at all — `label`,
 * `subject`, `context`, `q` — and every one of those is an ordinary-looking
 * property. Enumerating what is *accepted* inherits nothing later (§0.3e).
 */

/** Fifteen. Written out, and the sequence's twelve are the first twelve. */
export const EVENT_NAMES = [
  'hero_view',
  'builder_engaged',
  'goal_input_started',
  'goal_submitted',
  'plan_generated',
  'plan_tuned',
  'protect_started',
  'protect_selected',
  'activation_attempted',
  'wall_reached',
  'email_submitted',
  'share_card_created',
  'suggestion_selected',
  'plan_generation_fallback',
  'wall_dismissed',
] as const

export type EventName = (typeof EVENT_NAMES)[number]

/** `SITE-EVAL-037`'s ordering, which is the first twelve in order. */
export const SEQUENCE: readonly EventName[] = EVENT_NAMES.slice(0, 12)

/** §10.2's segmentation axis. A closed set, so it is a structural value. */
export type RenderTier = 'A' | 'B' | 'C' | 'D'

/** The five §12 failure modes, as analytics sees them. */
export type FallbackReasonName =
  | 'timeout'
  | 'invalid_schema'
  | 'rate_limit'
  | 'spend_cap'
  | 'network_error'

/** Which of the seven deterministic classes the input fell into. */
export type InputClassName =
  | 'empty'
  | 'unreadable'
  | 'out_of_scope'
  | 'vague'
  | 'multi_goal'
  | 'bounded'
  | 'actionable'

/** Which control the visitor changed. Never what they typed into it. */
export type TuneControl = 'window' | 'days' | 'duration'

/**
 * **The only thing an event property may be.**
 *
 * `string` is deliberately absent. Every closed set on this union is a union of
 * literals, and an arbitrary `string` is assignable to none of them — which is
 * the whole guard, expressed once.
 */
export type StructuralValue =
  | number
  | boolean
  | RenderTier
  | FallbackReasonName
  | InputClassName
  | TuneControl

/**
 * A property bag.
 *
 * Deliberately **not** `Record<string, StructuralValue>` at the call site: each
 * event names its own properties below, so an event carrying a property no
 * event has is also a type error. The index signature here is what the client
 * reads a payload through, and nothing constructs one.
 */
export type EventProperties = Readonly<Record<string, StructuralValue>>

/*
 * Per-event properties. **Mine, chosen structurally**, since the table is in no
 * artifact. The rule applied throughout: a count, a duration, a flag, or a
 * member of a closed set — never a value the visitor authored, and never a
 * value that could reconstruct one.
 */
export interface EventPayloads {
  hero_view: { readonly tier: RenderTier; readonly reduced_motion: boolean }
  builder_engaged: { readonly tier: RenderTier }
  goal_input_started: { readonly tier: RenderTier }
  goal_submitted: {
    readonly tier: RenderTier
    /** A length, not the text. A length cannot be read back into words. */
    readonly length: number
    readonly input_class: InputClassName
    readonly has_deadline: boolean
  }
  plan_generated: {
    readonly tier: RenderTier
    readonly node_count: number
    readonly occurrence_count: number
    readonly ms_to_plan: number
  }
  plan_tuned: { readonly tier: RenderTier; readonly control: TuneControl }
  protect_started: { readonly tier: RenderTier }
  /** §6.3a: a count, never a name. The type cannot express one. */
  protect_selected: { readonly tier: RenderTier; readonly app_count: number }
  activation_attempted: { readonly tier: RenderTier }
  wall_reached: { readonly tier: RenderTier; readonly ms_since_submit: number }
  email_submitted: { readonly tier: RenderTier }
  share_card_created: { readonly tier: RenderTier }
  suggestion_selected: {
    readonly tier: RenderTier
    /** Which chip, by position. The chip's text is copy, not a measurement. */
    readonly index: number
  }
  plan_generation_fallback: {
    readonly tier: RenderTier
    readonly reason: FallbackReasonName
  }
  wall_dismissed: { readonly tier: RenderTier; readonly dwell_ms: number }
}

/** One event, as the client takes it. */
export type AnalyticsEvent = {
  [K in EventName]: { readonly name: K; readonly properties: EventPayloads[K] }
}[EventName]

/**
 * Runtime companion to the type, for the payload scan `SITE-EVAL-039` requires.
 *
 * **Both, deliberately, per §12.4's amendment**: the type closes the property
 * space at compile time and a scan can iterate an actual payload, and neither
 * covers the other's case. A payload assembled through an `as` cast, or arriving
 * from a source the compiler never saw, is invisible to the type and visible
 * here.
 */
export function isStructural(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return true
  if (typeof value !== 'string') return false
  return (CLOSED_SET_MEMBERS as readonly string[]).includes(value)
}

/**
 * Every literal any closed set admits.
 *
 * Written out rather than derived from the types, because types do not exist at
 * runtime — and written out rather than assembled from the four unions' own
 * declarations, which would make the scan agree with the schema by construction
 * (§0.3b). A test asserts this list and the unions agree, which is a real
 * second source: the list is hand-written and the unions are hand-written, and
 * a drift between them is a drift a person introduced.
 */
export const CLOSED_SET_MEMBERS = [
  'A', 'B', 'C', 'D',
  'timeout', 'invalid_schema', 'rate_limit', 'spend_cap', 'network_error',
  'empty', 'unreadable', 'out_of_scope', 'vague', 'multi_goal', 'bounded', 'actionable',
  'window', 'days', 'duration',
] as const
