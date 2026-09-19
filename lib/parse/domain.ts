/*
 * SITE-014 · Deterministic domain classifier.
 *
 * PRD §4's table: **domain classification — deterministic client + server
 * mirror.** The LLM does not classify. It may later escalate an input to
 * bounded (SITE-033); it can never de-escalate.
 *
 * Five bounded domains: injury · medical · mental health · finance · legal.
 *
 * **Three answers, and the third is about whether classification happened at
 * all** (ruled 2026-09-19, corrected the same day, Kian).
 *
 * - **A bounded tier** — it ran, and matched.
 * - **`open`** — it ran, and matched nothing. **A real verdict**: not bounded,
 *   safe to plan normally. Ten of ten ordinary goals land here, and that is what
 *   a working classifier looks like rather than a gap in one.
 * - **`unknown`** — **classification did not occur.** It was never called, could
 *   not complete, or was handed input it cannot assess.
 *
 * **The first ruling collapsed the last two and was wrong to.** *"Unmatched"*
 * named the fallback after the verdict: a classifier that ran and found no
 * bounded signal has said something, and a classifier that never ran has said
 * nothing. Returning `unknown` for the first would have made `open` unreachable
 * and — with `unknown` routed to the clarification beat — sent every visitor
 * with a perfectly clear goal to a clarifying question.
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

/**
 * **`unknown` means classification did not occur — not that it occurred and
 * found nothing.** That distinction is the entire reason the value exists, and
 * it is written here because without it the value reads as dead code.
 *
 * **It is currently unreachable through the only production call site, and that
 * is correct rather than a defect.** `classifyInput` tests readability before
 * domain, so degenerate input never reaches this classifier. `unknown` is for
 * the callers that do not readability-gate first — SITE-033's server mirror
 * above all — and for the failure modes a pure function does not have today but
 * a network-boundary one will.
 *
 * **Two things follow, and both are easy to get wrong:**
 *
 * - **Do not delete it as dead code.** Its unreachability is a property of one
 *   caller's ordering, not of the type.
 * - **Do not route anything to it to make it reachable.** In particular it is
 *   not the clarification beat's input: that is `vague`, which is a statement
 *   about what the visitor wrote, and this is a statement about whether anything
 *   read it.
 *
 * Because a value that cannot occur is handled by code nobody has run, its
 * handling carries a **positive control** in `tests/domain.test.ts` — the path
 * is exercised against a constructed `unknown` before SITE-033 makes it
 * reachable in production.
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
  // Input this classifier cannot assess: it never looked, so it has nothing to
  // report. Not a verdict, and not the same thing as looking and finding nothing.
  if (typeof text !== 'string' || text.trim() === '') return 'unknown'
  for (const entry of PATTERNS) {
    if (entry[1].test(text)) return entry[0]
  }
  /*
   * **Assessed, and no bounded signal found. This is a verdict, and it is
   * `open`** — confirmed by ruling 2026-09-19 after the first ruling collapsed
   * it with `unknown`.
   *
   * **A false negative also leaves through this line**, and that is a real
   * problem with a different fix. *"my back and my finances"* is readable and was
   * assessed; a classifier with complete patterns returns `injury` here. **The
   * fix is pattern coverage, not the return value** — renaming this exit would
   * have relabelled every correct verdict in order to catch the incorrect ones,
   * and caught none of them, because a missed pattern is missed either way.
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
  if (isUnknown(deterministic)) return 'unknown'
  /*
   * **A bounded verdict is final.** Written as membership rather than as
   * `!== 'open'`, per §0.3e — and this is the second instance in one file. The
   * negative form here would mean "anything that is not open is bounded", which
   * was true of a two-value type and is an assumption the type never recorded.
   * It happened to stay correct only because the `unknown` guard sits above it;
   * a sixth non-bounded value would have been treated as a refusal.
   */
  if (isBounded(deterministic)) return deterministic
  return isBounded(modelSuggestion) ? modelSuggestion : 'open'
}
