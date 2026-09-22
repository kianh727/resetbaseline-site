/*
 * SP-05 · The provider seam — PRD v7.3 §6.4, §6.5, §12.
 *
 * **The model's entire output surface is three fields** (§6.5): one commitment
 * title ≤48 chars, one execution window from a closed set, and — **for `vague`
 * input only** — one clarification question with three options. Nothing else.
 * Dates, counts, tiers, refusals and every other line of copy are deterministic
 * code or authored constants.
 *
 * **Each of the three validates and falls back independently.** A title that
 * fails its constraint does not discard a valid window; a clarification question
 * that fails does not discard a valid title. There is no all-or-nothing
 * response, and that is a §6.5 requirement rather than a convenience.
 *
 * **The seam exists so generation is never load-bearing.** Every failure mode
 * resolves to the static source silently — no user-visible error, no dead state
 * (§12, DS-7, DS-10). The deterministic read-back is already on screen in every
 * case, which is why a silent fallback is honest rather than evasive: nothing
 * the visitor can see was waiting on the model.
 */

/** The window vocabulary is a closed set the model selects from, never invents. */
export interface ExecutionWindow {
  readonly startMinute: number
  readonly endMinute: number
}

export interface ClarificationQuestion {
  readonly question: string
  /** Exactly three, each tappable without typing. */
  readonly options: readonly [string, string, string]
}

/** What a provider may return. Three fields, each independently optional. */
export interface PlanFields {
  readonly title: string | null
  readonly window: ExecutionWindow | null
  readonly clarification: ClarificationQuestion | null
}

/**
 * Why a generated response was not used.
 *
 * **All five route to the static source** (SITE-033), each firing
 * `plan_generation_fallback` with its reason. Named rather than booleaned so the
 * analytics event can carry which one without a second mapping that could
 * disagree with this one (§0.3c).
 */
export type FallbackReason =
  | 'timeout'
  | 'invalid_schema'
  | 'rate_limit'
  | 'spend_cap'
  | 'network_error'

export interface PlanRequest {
  readonly rawGoal: string
  /** Whether the clarification beat runs at all — decided by classification, never by the model. */
  readonly wantsClarification: boolean
  readonly signal?: AbortSignal
}

export interface PlanProvider {
  readonly name: string
  generate(request: PlanRequest): Promise<PlanFields>
}

export interface PlanOutcome {
  readonly fields: PlanFields
  /** Null when the generated response was used as-is. */
  readonly fallback: FallbackReason | null
  /** Which of the three fields came from the static source rather than the model. */
  readonly substituted: readonly ('title' | 'window' | 'clarification')[]
}
