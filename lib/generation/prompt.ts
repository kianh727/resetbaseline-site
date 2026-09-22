/*
 * SITE-030 · The prompt — PRD v7.3 §6.4, §6.5.
 *
 * **The model's entire output surface is three fields**, so the prompt's job is
 * mostly subtraction: name the three, name the constraints on each, and say
 * plainly that anything else it returns is discarded. JSON only, `max_tokens`
 * 1000, a 300-character input cap matching the field's own (SITE-008).
 *
 * ---
 *
 * **SITE-030's scope line says "action vocabulary restricted to the 45 types in
 * `contracts-manifest.json`", and that clause no longer applies.** It predates
 * §6.5's amendment to three fields: a title, a window id and a question are not
 * action verbs, so **the model never emits a verb at all** and there is no
 * vocabulary for the prompt to restrict. This is the safer reading of the two —
 * a prompt listing 45 verbs would invite the model to use one — and it is why
 * generation is **not** blocked on the manifest while the plan model is. If a
 * later field ever carries a verb, the restriction comes back with it.
 *
 * **The window is selected by id, never by minutes.** Handing the model two
 * integers lets it return 6:05–7:25 — a window nobody designed, inside the
 * shape validation accepts, and wrong in a way that renders perfectly. An id
 * from a four-member set is either a member or it is discarded, which is the
 * §0.3c distinction (*did not match* versus *matched something impossible*)
 * applied to a closed set rather than to a date.
 */

import { WINDOW_OPTIONS } from '../copy/builder-controls.ts'
import { OPTION_COUNT, OPTION_MAX, QUESTION_MAX, TITLE_MAX } from '../providers/validate.ts'

/** SITE-008's cap, restated at the boundary because the edge trusts no client. */
export const INPUT_MAX = 300

/** SITE-030's scope. */
export const MAX_TOKENS = 1000

/**
 * The model. **Recorded as my call** — no artifact names one.
 *
 * One constant, so the choice is a one-line change rather than a string buried
 * in a request body. The task is small and highly constrained, and the cost
 * model below is what the daily cap is denominated in, so changing this means
 * changing that in the same edit — which is why they are adjacent.
 */
export const MODEL = 'claude-sonnet-5'

/** Cents per million tokens, input and output. Feeds the spend cap. */
export const COST_PER_MTOK_IN_CENTS = 300
export const COST_PER_MTOK_OUT_CENTS = 1500

export function costCents(inputTokens: number, outputTokens: number): number {
  const exact =
    (inputTokens * COST_PER_MTOK_IN_CENTS + outputTokens * COST_PER_MTOK_OUT_CENTS) / 1_000_000
  // Rounded **up**, always. A cap that rounds down never quite reaches itself:
  // a run of sub-cent requests costs real money and records zero.
  return Math.max(1, Math.ceil(exact))
}

const WINDOW_IDS = WINDOW_OPTIONS.map((w) => w.id)

/** Resolve a model-selected id to the window the site already renders. */
export function windowForId(id: unknown): { startMinute: number; endMinute: number } | null {
  const match = WINDOW_OPTIONS.find((w) => w.id === id)
  return match ? { startMinute: match.startMinute, endMinute: match.endMinute } : null
}

/**
 * The system prompt.
 *
 * Built from the same constants the validator checks against, which is the one
 * place that derivation is right rather than §0.3b: the prompt and the
 * validator are **not** two sources meant to agree about the world — the
 * validator is the authority and the prompt is an instruction to obey it. Two
 * hand-written copies of "under 48 characters" would drift, and the drift would
 * show up as a discard rate nobody could explain.
 */
export function systemPrompt(wantsClarification: boolean): string {
  const lines = [
    'You produce at most three fields for a planning tool. Reply with JSON only:',
    'no prose, no markdown fence, no explanation.',
    '',
    'Fields:',
    `1. "title" — a commitment title of at most ${TITLE_MAX} characters. Plain,`,
    "   concrete, in the person's own register. Not a slogan and not a pep talk.",
    `2. "window" — exactly one of these ids: ${WINDOW_IDS.map((id) => `"${id}"`).join(', ')}.`,
    '   Choose the one the goal fits best. Do not invent times.',
  ]

  if (wantsClarification) {
    lines.push(
      `3. "clarification" — an object { "question", "options" } asking the one`,
      '   thing you most need to know to plan this. Constraints, all required:',
      `   - the question is under ${QUESTION_MAX} characters`,
      `   - exactly ${OPTION_COUNT} options, each under ${OPTION_MAX} characters`,
      '   - every option is answerable by tapping; none asks the person to type',
      '   - no preamble: the field is the question itself, not a lead-in',
      '   - it ends in a question mark',
    )
  } else {
    lines.push('Do not include a "clarification" field.')
  }

  lines.push(
    '',
    'Omit any field you cannot produce well. A missing field is handled; a',
    'field that breaks its constraint is discarded. Never return dates, counts,',
    'schedules, advice, or any other field — they are computed elsewhere and',
    'anything extra is dropped.',
  )

  return lines.join('\n')
}

/** The Messages API request body. */
export function requestBody(rawGoal: string, wantsClarification: boolean): unknown {
  return {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(wantsClarification),
    messages: [{ role: 'user', content: rawGoal.slice(0, INPUT_MAX) }],
  }
}
