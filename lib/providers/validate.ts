/*
 * SITE-031 · Validation — PRD v7.3 §6.4's five constraints, §6.5's three fields.
 *
 * **No lenient parsing. No coercion. No repair attempts.** A field that does not
 * satisfy its constraint is discarded, not fixed — repairing a model response is
 * the model's authority widening by the back door, because the repaired value is
 * one nothing specified and nobody chose.
 *
 * **Each field is validated alone**, which is what makes §6.5's independent
 * fallback possible: a validator that returned one verdict for the response
 * would force all three to fall back together, and §6.5 forbids that by name.
 */

import type { ClarificationQuestion, ExecutionWindow, PlanFields } from './types.ts'

/** §6.5: one commitment title, ≤48 characters. */
export const TITLE_MAX = 48

/** §6.4's five constraints on the clarification question. */
export const QUESTION_MAX = 90
export const OPTION_MAX = 24
export const OPTION_COUNT = 3

export function validTitle(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= TITLE_MAX
}

/**
 * A window is valid when it names two minute-of-day values inside a day.
 *
 * **The closed set itself is not enumerated here**, because §6.5 says the model
 * selects from one and no artifact writes it down — the same gap SITE-112 and
 * SITE-113 record. What is checked is the shape; membership is checked where the
 * set exists. A validator that invented the set to check against would be
 * asserting its own reference (§0.3b).
 */
export function validWindow(value: unknown): value is ExecutionWindow {
  if (typeof value !== 'object' || value === null) return false
  const w = value as { startMinute?: unknown; endMinute?: unknown }
  return (
    Number.isInteger(w.startMinute) &&
    Number.isInteger(w.endMinute) &&
    (w.startMinute as number) >= 0 &&
    (w.startMinute as number) < 1440 &&
    (w.endMinute as number) >= 0 &&
    (w.endMinute as number) < 1440
  )
}

/**
 * §6.4's five constraints, checked as five.
 *
 * Under 90 chars · exactly three options, each under 24 · every option tappable
 * without typing · no preamble · ends in a question mark.
 *
 * *"Tappable without typing"* is checked as **each option being non-empty and
 * short enough to be a button label** — the constraint is about the option not
 * requiring the visitor to compose anything, and an option that is a prompt to
 * type is caught by the preamble and length rules together.
 */
export function validClarification(value: unknown): value is ClarificationQuestion {
  if (typeof value !== 'object' || value === null) return false
  const c = value as { question?: unknown; options?: unknown }

  if (typeof c.question !== 'string') return false
  const q = c.question.trim()
  if (q.length === 0 || q.length >= QUESTION_MAX) return false
  if (!q.endsWith('?')) return false
  // No preamble: the field is the question, not a sentence leading into one.
  if (/^(great|good|interesting)\b|^(sure|okay|ok)\b|^(i |let me |just )/i.test(q)) return false
  // One question, not several.
  if ((q.match(/\?/g) ?? []).length !== 1) return false

  if (!Array.isArray(c.options) || c.options.length !== OPTION_COUNT) return false
  const options = c.options as unknown[]
  if (!options.every((o) => typeof o === 'string' && o.trim().length > 0 && o.trim().length < OPTION_MAX)) {
    return false
  }
  // Mutually exclusive, at the only level a validator can check: distinctness.
  if (new Set(options.map((o) => (o as string).trim().toLowerCase())).size !== OPTION_COUNT) {
    return false
  }
  return true
}

/**
 * Validate a raw response into the three fields, **independently**.
 *
 * @returns each field, or `null` where it failed. Never throws — a malformed
 * response is an expected input here, not an exception.
 */
export function validateFields(raw: unknown): PlanFields {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    title: validTitle(r['title']) ? r['title'].trim() : null,
    window: validWindow(r['window']) ? r['window'] : null,
    clarification: validClarification(r['clarification']) ? r['clarification'] : null,
  }
}
