/*
 * SITE-102 · Input classification — seven classes.
 *
 * Runs **before** `/api/plan`, so unusable input never reaches generation
 * (SITE-102 accept: garbage never produces a network request). Deterministic,
 * and **no class is assigned by the model** — classification is what decides
 * whether the clarification beat runs at all, and the model only writes that
 * sentence once the decision is already made (PRD §6.4, §6.5).
 */

import { classifyDomain, isBounded } from './domain.ts'

export type InputClass =
  | 'empty'
  | 'unreadable'
  | 'out_of_scope'
  | 'vague'
  | 'multi_goal'
  | 'bounded'
  | 'actionable'

/** The closed set, in the order §6.4 declares it. */
export const INPUT_CLASSES: readonly InputClass[] = [
  'empty',
  'unreadable',
  'out_of_scope',
  'vague',
  'multi_goal',
  'bounded',
  'actionable',
]

/** Classes that must never reach `/api/plan`. */
export const NO_NETWORK_CLASSES: readonly InputClass[] = ['empty', 'unreadable', 'out_of_scope']

export function reachesGeneration(cls: InputClass): boolean {
  return !NO_NETWORK_CLASSES.includes(cls)
}

/** A question or a request for information, rather than something to execute. */
const OUT_OF_SCOPE =
  /^\s*(?:who|what|when|where|why|how|is|are|can|could|do|does|did|will|would|should|tell me|explain|write me|summari[sz]e)\b|\?\s*$/i

/**
 * Vague: a direction with no object. "Get healthy" names a wish; "run three
 * times a week" names a thing to do. This is the class that triggers the
 * clarification beat, which is the site's only demonstration of *it asks once*.
 */
const VAGUE =
  /^\s*(?:i\s+(?:want|need|would like)\s+to\s+)?(?:be|get|become|feel|stay|do)\s+(?:more\s+|less\s+|a\s+bit\s+)?(?:better|good|great|healthy|fit|happy|productive|organi[sz]ed|consistent|disciplined|focused|successful)\b[\s.!]*$/i

/** Two or more distinct goals joined together. */
const MULTI_GOAL = /\b(?:and (?:also )?|,\s*(?:and\s+)?|;\s*|\+\s*|as well as )\b(?=.*\b(?:start|stop|finish|learn|build|run|write|read|train|study|quit|get|make|do|practi[sc]e|lose|save)\b)/i

function looksUnreadable(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 3) return true
  const letters = trimmed.replace(/[^a-z]/gi, '')
  // Mostly punctuation or digits is not a sentence about a goal.
  if (letters.length / trimmed.length < 0.5) return true
  /*
   * A keyboard mash has no vowels to speak of. Checked against letters only,
   * so punctuation and spacing do not dilute the ratio.
   */
  const vowels = letters.replace(/[^aeiou]/gi, '')
  return letters.length >= 6 && vowels.length / letters.length < 0.15
}

/**
 * @returns the input class. Pure; the only dependency is the domain
 *   classifier, which is itself pure.
 *
 * **Evaluation order is not the declared order, deliberately.** `bounded` is
 * tested immediately after readability, ahead of `vague` and `multi_goal`,
 * because an input can be both — *"I want to get healthy after my surgery"* is
 * vague **and** medical. If `vague` won, the site would ask a clarifying
 * question about a medical situation it has already decided it will not
 * advise on. §6.4 lists the classes; it does not order the tests, and
 * SITE-014's "err toward bounded" settles which way an overlap resolves.
 */
export function classifyInput(text: string): InputClass {
  if (typeof text !== 'string' || text.trim() === '') return 'empty'
  if (looksUnreadable(text)) return 'unreadable'
  if (isBounded(classifyDomain(text))) return 'bounded'
  if (OUT_OF_SCOPE.test(text)) return 'out_of_scope'
  if (MULTI_GOAL.test(text)) return 'multi_goal'
  if (VAGUE.test(text)) return 'vague'
  return 'actionable'
}
