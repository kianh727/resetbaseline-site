/*
 * SITE-020 · Plan semantic model.
 *
 * PRD §6: **one semantic plan model, never coupled to a renderer.** Layout is
 * an adapter behind `PlanLayout` (SITE-021), and swapping adapters changes zero
 * builder code (SITE-EVAL-063). The issue's non-goal states the direction that
 * matters: **the model must not know a layout exists.**
 *
 * That non-goal is load-bearing beyond tidiness. The site's visual language is
 * unsettled — the ascending route is under review, and §10 bans progress and
 * completeness meters outright while §4's "No completeness meters" is the
 * strongest claim on the page. A changed visual language costs one adapter
 * **only while the model has not learned the metaphor.** If elevation, summit,
 * position or completion enter here, the change stops being an adapter swap and
 * becomes a rewrite of everything downstream.
 *
 * So this file is held to semantics: what a commitment is, when its occurrences
 * fall, how long a timer runs, what window a gate protects, what a tracker
 * observes. Nothing about where any of it is drawn, and nothing about how much
 * of it is finished. `tests/plan-model.test.ts` enforces that as a scan rather
 * than a convention, because a rule this easy to break in passing needs to fail
 * in CI and not in review.
 *
 * ---
 *
 * **Held: the contract vocabulary is not in this file, and could not be.**
 *
 * PRD §6.2 requires the model to handle every `capability_type` the contracts
 * define, **"generated from `contracts-manifest.json`… derived, not
 * hand-listed."** §6.3 says the same of `authority_tier`, and SITE-EVAL-031
 * requires tier assignment to be a pure function of object type with no model
 * input. SITE-004 owns that generation and is blocked: the delivered manifest
 * is an action and event vocabulary and carries no `capability_type`,
 * `authority_tier` or `belief_tier` (CLAUDE.md §12).
 *
 * Hand-listing the five here is the one thing §6.2 forbids by name, and it
 * would decouple the site from the contract silently — the failure would be a
 * site that keeps building after the app's vocabulary moves. So the two axes
 * are **opaque**: the model is parameterised over them, every structure below
 * is complete and typed, and SITE-004 lands by narrowing two aliases. Nothing
 * downstream is written against a placeholder, and no file in this repository
 * names a capability or tier value.
 */

/* ------------------------------------------------------------------ *
 * The contract axes — SITE-004's seam.
 * ------------------------------------------------------------------ *
 *
 * **The narrowing, written out so it is a mechanical edit rather than a
 * decision made under deadline pressure the night the manifest lands.**
 *
 * When `contracts-manifest.json` is committed and `npm run generate:contracts`
 * has written `lib/contracts/generated.ts`, the two aliases below become:
 *
 *     import type { CapabilityType, AuthorityTier } from '@/lib/contracts/generated'
 *     export type { CapabilityType, AuthorityTier }
 *
 * and the two `= string` lines are deleted. Nothing else in this file moves,
 * and no call site downstream of it moves either — which is the whole point of
 * the aliases having been opaque rather than the five values having been
 * written here provisionally.
 *
 * The order matters: **verify the delivery before narrowing anything.** Run
 * `npm run verify:manifest-arrival`, which asserts the four axes are present
 * at PRD §6.3's counts 5/3/5/3 and the envelope is well-formed. A count that
 * disagrees is a stop-and-report, not something to adapt around — the envelope
 * is hand-assembled, and a site built on a bad publish is indistinguishable
 * from one built on a good publish until the vocabulary moves.
 */

/**
 * `capability_type`, per PRD §6.3. Exactly five values, contract-derived.
 *
 * Opaque until SITE-004 generates them from `contracts-manifest.json`. When it
 * does, this alias narrows to that generated union and every structure below
 * narrows with it — no call site changes.
 */
export type CapabilityType = string

/**
 * `authority_tier`, per PRD §6.3. Contract-derived, a pure function of object
 * type, with the gate always `explicit` (SITE-EVAL-031). Opaque for the same
 * reason as `CapabilityType`; the derivation function is SITE-026's and cannot
 * be written before its domain exists.
 */
export type AuthorityTier = string

/* ------------------------------------------------------------------ *
 * Time.
 * ------------------------------------------------------------------ */

/**
 * A calendar day, noon-anchored local — the convention `lib/parse/deadline.ts`
 * established and the reason for it is unchanged here: a date at local midnight
 * can shift a day across a DST transition, and the calendar day the visitor
 * sees must be the calendar day stored. Only the calendar day is meaningful;
 * the time component is an anchor, not data.
 */
export type PlanDate = Date

/** Noon-anchor a local calendar day. The only sanctioned way to build a `PlanDate`. */
export function planDate(year: number, month: number, day: number): PlanDate {
  return new Date(year, month, day, 12, 0, 0, 0)
}

/**
 * A time-of-day window, as minutes from local midnight. `6:00–7:30am` is
 * `{ startMinute: 360, endMinute: 450 }`.
 *
 * Minutes rather than a `Date` because a window is a daily shape, not an
 * instant: it recurs, and binding it to a particular day would make every
 * occurrence carry a redundant copy of the same two numbers.
 *
 * A window may wrap past midnight — `22:00–01:00` is `{ 1320, 60 }` — so
 * `endMinute` less than `startMinute` is legal and means the next day.
 */
export interface Window {
  readonly startMinute: number
  readonly endMinute: number
}

/** Whether a window crosses local midnight. */
export function windowWraps(w: Window): boolean {
  return w.endMinute < w.startMinute
}

/** A window's length in minutes, wrap included. */
export function windowMinutes(w: Window): number {
  return windowWraps(w) ? 1440 - w.startMinute + w.endMinute : w.endMinute - w.startMinute
}

/* ------------------------------------------------------------------ *
 * Occurrences.
 * ------------------------------------------------------------------ */

/**
 * One dated instance of a commitment.
 *
 * **It carries no outcome and no ordinal, and both omissions are deliberate.**
 *
 * No outcome: the builder's plan is prospective. It shows the structure a goal
 * implies, on a site with no account and no history. §6.1 is explicit that the
 * app does not generate occurrences today and **no copy may state that it
 * does**; a model field for `complete` or `missed` would be the first place
 * that claim could leak in, and §6.3 bans rendering `pending` outright.
 *
 * No ordinal: "3 of 12" is a completeness meter with better manners, and §10
 * bans those. The array's order carries sequence for anything that needs it.
 */
export interface Occurrence {
  readonly id: string
  /** The calendar day this occurrence falls on, noon-anchored local. */
  readonly date: PlanDate
  /** The time-of-day window it occupies, when the commitment has one. */
  readonly window: Window | null
}

/* ------------------------------------------------------------------ *
 * The five detail shapes.
 * ------------------------------------------------------------------ *
 *
 * One per primitive the site renders (PRD §6.1a, §6.3). Each is a plain
 * structure and **none carries a `capability_type` literal**: the capability is
 * on the node, from the contract, and these say only what that capability's
 * payload looks like. The mapping from value to shape is SITE-004's to generate.
 */

/** An intention with an occasion — the dated instances the commitment implies. */
export interface Commitment {
  /**
   * Expanded by SITE-023 from a recurrence rule, over the rolling window. The
   * model holds the result; it does not hold the rule and never expands one.
   * Occurrence dates and counts are deterministic and outside the model's
   * surface entirely (§6.5).
   */
  readonly occurrences: readonly Occurrence[]
}

/** A cue with a time to arrive. */
export interface Reminder {
  readonly at: PlanDate
  /** Minutes from local midnight on that day. */
  readonly atMinute: number
}

/** A bounded session. */
export interface Timer {
  readonly durationMinutes: number
}

/**
 * Protection over a window.
 *
 * **`appCount`, never app names** — PRD §6.3a, a MUST. Screen Time returns
 * opaque tokens; the app knows a count and nothing else, and no Baseline UI
 * depicted on this site may name a specific app. The field is a number so that
 * naming one is not a thing this type can express.
 */
export interface Gate {
  readonly appCount: number
  readonly window: Window
}

/** A direction with feedback — what is observed, not how much of it is done. */
export interface Tracker {
  /** What the tracker observes, as the visitor named it. */
  readonly subject: string
  /** The unit it is observed in, when there is one. */
  readonly unit: string | null
}

/** The payload of a plan node. Which shape goes with which capability is SITE-004's. */
export type PlanDetail = Commitment | Reminder | Timer | Gate | Tracker

/* ------------------------------------------------------------------ *
 * Nodes and the plan.
 * ------------------------------------------------------------------ */

/**
 * One object in the plan.
 *
 * Generic over its detail so a caller that knows what it holds keeps the
 * precise type — `PlanNode<Gate>` — without the model inventing a discriminant
 * to narrow on. The real discriminant is `capability`, and it arrives with the
 * contract.
 */
export interface PlanNode<D extends PlanDetail = PlanDetail> {
  readonly id: string
  /** Contract vocabulary. Never inferred, never defaulted, never model-supplied. */
  readonly capability: CapabilityType
  /** Contract-derived, a pure function of `capability` (SITE-EVAL-031). */
  readonly authority: AuthorityTier
  /** What the object is called in the plan. */
  readonly label: string
  readonly detail: D
}

/**
 * A whole plan.
 *
 * The node list is **unordered as far as this model is concerned.** Consumers
 * that need a sequence derive one from the data — occurrence dates, window
 * start — rather than reading an order the model asserts. A stored order would
 * be the first half of a layout, and the model does not have one.
 */
export interface Plan {
  /** The commitment title. ≤48 characters — the model's field, validated server-side (§6.5). */
  readonly title: string
  /** The parsed deadline, deterministic and client-side (SITE-013). Null when none was stated. */
  readonly deadline: PlanDate | null
  readonly nodes: readonly PlanNode[]
}

/* ------------------------------------------------------------------ *
 * Derived reads.
 * ------------------------------------------------------------------ *
 *
 * Pure functions over the model. They exist so consumers do not each write
 * their own walk of `nodes`, which is how a second plan model starts
 * (SITE-EVAL-063 fails on "any duplicated plan model").
 */

/** Every occurrence in the plan, in date order. Ties keep node order, so the result is stable. */
export function occurrences(plan: Plan): readonly Occurrence[] {
  const all: Occurrence[] = []
  for (const node of plan.nodes) {
    if (isCommitment(node.detail)) all.push(...node.detail.occurrences)
  }
  return all.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/** The plan's date span, or null when it contains no dated occurrence. */
export function span(plan: Plan): { readonly first: PlanDate; readonly last: PlanDate } | null {
  const all = occurrences(plan)
  const first = all[0]
  const last = all[all.length - 1]
  if (first === undefined || last === undefined) return null
  return { first: first.date, last: last.date }
}

/**
 * A structural test for the commitment shape, used only by the reads above.
 *
 * It asks whether the payload has occurrences, which is the one thing that
 * makes a commitment a commitment here. It is **not** a capability check and
 * must not become one — that is `capability`'s job, and doing it structurally
 * would be a second vocabulary growing alongside the contract's.
 */
function isCommitment(detail: PlanDetail): detail is Commitment {
  return Array.isArray((detail as Commitment).occurrences)
}
