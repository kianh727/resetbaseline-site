/*
 * SITE-029 · The StaticProvider — PRD v7.3 §12, §2 DS-7.
 *
 * **Serves the authored scenarios, matched to arbitrary input by archetype.**
 * It is what every failure mode resolves to, and it is what runs when
 * generation is switched off entirely — so its accept clause is that the full
 * loop *"must feel complete, not degraded"*.
 *
 * **No network.** Not as a policy but as a property: nothing here can reach one.
 *
 * ---
 *
 * **Raw intent stays the visitor's; only structure is substituted.** The
 * matcher decides which archetype's *shape* a goal takes — which window, which
 * signature behaviour — and never touches the words. The plan is labelled with
 * what the visitor wrote, which is §6.4's documented path (*"the build proceeds
 * on the original input"*) and is also the honest one: the site shows what it
 * understood rather than paraphrasing someone back to themselves.
 *
 * **Scoring is a count of distinct matched keywords, and ties go to the earlier
 * scenario.** Deterministic, because the same goal must produce the same plan
 * every time (§6.5) — a matcher resolving ties by iteration order over an
 * object's keys would be stable today and stable differently after a rename.
 */

import { AUTHORED_CLARIFICATIONS } from './authored.ts'
import type { PlanFields, PlanProvider, PlanRequest } from './types.ts'
import { windowForId } from '../generation/prompt.ts'
import { DEFAULT_SCENARIO_ID, SCENARIOS, type Scenario } from '../copy/scenarios.ts'

/**
 * The nearest archetype, or the default when nothing matches.
 *
 * **Returning the default here is not the §6.4 permissive-value defect.** That
 * rule is about a classifier reporting a *verdict* it did not reach; this
 * function reports a shape for rendering, every branch of it produces the same
 * complete plan, and the visitor's own words are what they read either way.
 * `matchedKeywords` is exposed so a caller can tell a match from a fallback
 * without re-running the scoring, which would be a second matcher able to
 * disagree with the first (§0.3c).
 */
export function matchScenario(rawGoal: string): {
  scenario: Scenario
  matchedKeywords: number
} {
  const text = rawGoal.toLowerCase()

  let best: Scenario | null = null
  let bestScore = 0

  for (const scenario of SCENARIOS) {
    const score = new Set(scenario.keywords.filter((k) => text.includes(k))).size
    if (score > bestScore) {
      best = scenario
      bestScore = score
    }
  }

  if (best === null) {
    const fallback = SCENARIOS.find((s) => s.id === DEFAULT_SCENARIO_ID)
    if (!fallback) throw new Error(`DEFAULT_SCENARIO_ID names no scenario: ${DEFAULT_SCENARIO_ID}`)
    return { scenario: fallback, matchedKeywords: 0 }
  }

  return { scenario: best, matchedKeywords: bestScore }
}

/**
 * @param clarifications injected so the empty and non-empty cases are both
 * tested today. It defaults to the authored set, which is empty pending
 * SITE-112 — and a test asserting the default is empty is what makes that copy
 * arriving a change somebody notices.
 */
export function createStaticProvider(
  clarifications: readonly (typeof AUTHORED_CLARIFICATIONS)[number][] = AUTHORED_CLARIFICATIONS,
): PlanProvider {
  return {
    name: 'static',

    async generate(request: PlanRequest): Promise<PlanFields> {
      const { scenario } = matchScenario(request.rawGoal)

      return {
        // Null until SITE-028 authors the five. The builder labels the plan with
        // the visitor's own sentence, which is what §6.4 already specifies.
        title: scenario.title,
        window: windowForId(scenario.windowId),
        clarification: request.wantsClarification ? (clarifications[0] ?? null) : null,
      }
    },
  }
}
