/*
 * SITE-014 · Deterministic domain classifier.
 *
 * PRD §4's table: **domain classification — deterministic client + server
 * mirror.** The LLM does not classify. It may later escalate an input to
 * bounded (SITE-033); it can never de-escalate.
 *
 * Five bounded domains: injury · medical · mental health · finance · legal.
 *
 * **Three answers, not two** (ruled 2026-09-19, Kian). `open` is a **positive
 * verdict** — *not bounded, safe to plan normally* — and handing it to input the
 * classifier could not assess is a clean bill of health nobody issued. Input
 * that is not a string, or is empty, or is whitespace, returns **`unknown`**.
 *
 * The asymmetry in §5 is the whole argument: a false positive is an odd demo, a
 * false negative builds a plan around an injury. A permissive default on the
 * un-assessable path is the shape that produces the second.
 *
 * **Err toward bounded.** SITE-014's accept names false negatives as the
 * failure mode that matters, and the two errors are not symmetric: a false
 * positive shows a refusal to someone who did not need one, which is a
 * slightly odd demo. A false negative has the site build a training plan
 * around an injury, or a budget around a debt problem — which is the exact
 * thing §3 promises it will not do.
 *
 * **There is one implementation, imported by both client and server.** That is
 * the mirror. A second implementation is the thing that can drift, so the
 * parity check is structural — `tests/domain.test.ts` asserts that nothing
 * outside this file classifies — rather than a behavioural comparison of the
 * module against itself, which would be PRD §0.3b's shape: a check whose input
 * is derived from its own reference cannot fail.
 */

export type DomainTier =
  | 'unknown'
  | 'open'
  | 'injury'
  | 'medical'
  | 'mental_health'
  | 'finance'
  | 'legal'

/** The five bounded tiers, in the order §4's table names them. */
export const BOUNDED_DOMAINS: readonly DomainTier[] = [
  'injury',
  'medical',
  'mental_health',
  'finance',
  'legal',
]

/**
 * **Membership in the declared set, not the absence of `open`.**
 *
 * This read `tier !== 'open'`, which was correct while there were exactly two
 * answers and **silently wrong the moment a third arrived**: `isBounded('unknown')`
 * would have returned `true`, and `unknown` would have been treated as a refusal
 * everywhere without one line changing. A predicate defined by what a value is
 * *not* inherits every value added after it.
 */
export function isBounded(tier: DomainTier): boolean {
  return BOUNDED_DOMAINS.includes(tier)
}

/** True for the one value that is neither a verdict nor a refusal. */
export function isUnknown(tier: DomainTier): boolean {
  return tier === 'unknown'
}

/*
 * Patterns are word-boundary anchored so "legal" does not fire on "illegally
 * good", and ordered most-specific-first within each domain.
 *
 * Mental health precedes medical, and injury precedes both: "I hurt my back
 * and it is depressing" is an injury the visitor wants a plan around, and the
 * refusal that matters is the injury one. Where two could fire, the earlier
 * domain in this list wins, and the order is asserted by test.
 */
const PATTERNS: readonly (readonly [DomainTier, RegExp])[] = [
  [
    'injury',
    /\b(injur\w*|torn|sprain\w*|strain\w*|fracture\w*|broke(?:n)?\s+(?:my|a|his|her|their)\b|(?:tweak\w*|hurt|jarred|jammed)\s+(?:my|his|her|their)\b|herniat\w*|tendon\w*|acl|mcl|rotator\s+cuff|shin\s+splints?|physio\w*|rehab\w*|pulled\s+(?:a|my)\s+\w+|slipped\s+disc|sciatica|plantar\s+fasciitis)\b/i,
  ],
  [
    'mental_health',
    /\b(depress\w*|anxiet\w*|anxious|panic\s+attacks?|suicidal|self[-\s]?harm|eating\s+disorder|anorexi\w*|bulimi\w*|bipolar|ptsd|ocd|adhd|autis\w*|therapy|therapist|psychiatr\w*|psycholog\w*|burn(?:t|ed)?\s*out|mental\s+health)\b/i,
  ],
  [
    'medical',
    /\b(diagnos\w*|symptom\w*|medication\w*|prescri\w*|dosage|doctor|physician|surgeon|surgery|chemo\w*|diabet\w*|cancer|tumou?r|blood\s+pressure|cholesterol|thyroid|migraine\w*|seizure\w*|chronic\s+\w+|autoimmune|pregnan\w*|fertilit\w*|ivf|menopaus\w*)\b/i,
  ],
  [
    'finance',
    /\b(debt|bankrupt\w*|foreclos\w*|credit\s+(?:card|score)|loan\w*|mortgage|invest\w*|portfolio|stocks?|crypto\w*|retirement|retiring|401k|pension|tax(?:es|ed)?\b|refinanc\w*|collections?\s+agency|payday\s+loan)\b/i,
  ],
  [
    'legal',
    /\b(lawsuit|sue|suing|sued|lawyer|attorney|solicitor|court|custody|divorce|visa|immigration|deport\w*|asylum|arrest\w*|charged\s+with|probation|parole|settlement|contract\s+dispute|landlord|evict\w*|tenanc\w*|restraining\s+order)\b/i,
  ],
]

/**
 * @returns the domain tier. Pure, synchronous, no network, no model.
 */
export function classifyDomain(text: string): DomainTier {
  // Input the classifier cannot assess. Not a verdict — it never looked.
  if (typeof text !== 'string' || text.trim() === '') return 'unknown'
  for (const entry of PATTERNS) {
    if (entry[1].test(text)) return entry[0]
  }
  /*
   * **Assessed, and no bounded signal found.** This stays `open` pending a
   * ruling, and the reason is recorded here rather than left as an assumption:
   * **every ordinary goal exits through this line.** Ten of ten sample goals do.
   * Returning `unknown` here would make `open` unreachable from this function,
   * and — with `unknown` routed to the clarification beat — would send every
   * visitor with a perfectly clear goal to a clarifying question.
   *
   * A false negative also leaves through this line, which is the argument for
   * changing it. But the fix for a false negative is **pattern coverage**: "my
   * back and my finances" is readable and was assessed, so a classifier with
   * complete patterns returns `injury` here, not `unknown`.
   */
  return 'open'
}

/**
 * The escalation seam (SITE-033).
 *
 * The model may move an input from `open` to a bounded tier. It may never move
 * a bounded tier to `open`, and it may never move one bounded tier to another
 * — the second would let it choose which refusal a visitor sees, which is
 * refusal-copy authority by another route.
 */
export function applyEscalation(deterministic: DomainTier, modelSuggestion: DomainTier): DomainTier {
  /*
   * `unknown` is not escalable and not de-escalable. The model may not turn
   * input the classifier could not read into a verdict of any kind — that would
   * be the model deciding what a refusal applies to, which is refusal authority
   * by another route (§5).
   */
  if (deterministic === 'unknown') return 'unknown'
  if (deterministic !== 'open') return deterministic
  return isBounded(modelSuggestion) ? modelSuggestion : 'open'
}
