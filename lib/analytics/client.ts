/*
 * SITE-049 · The analytics client — first-party, with a no-op default.
 *
 * **No third-party SDK**, which SITE-049's non-goal states and §6's privacy
 * invariants require: an SDK is a script the site does not control, reading a
 * page that carries what the visitor typed.
 *
 * **The PRD names no provider.** v7.3 §10 is "Bans"; the analytics section the
 * decomposition cites is v5 §10, which §11 does not carry forward. So this is a
 * **seam with a no-op default**, recorded as the resolution rather than a
 * provider chosen by a session: `NULL_SINK` counts nothing and sends nowhere,
 * and it is named so that a green build is not read as a site that is
 * measuring. Choosing the destination is Kian's, and it is one argument.
 *
 * ---
 *
 * **Every event carries the render tier**, because §10.2's segmentation is the
 * whole point of `SITE-EVAL-040` — if the tier is attached at query time
 * instead, a session that changed tier mid-way is attributed to one of them and
 * the K-1 comparison quietly measures something else.
 *
 * **Nothing here reads, stores or forwards what the visitor typed.** It cannot:
 * the payload type admits no `string` that is not a member of a closed set
 * (`events.ts`), so there is no field for it to arrive in.
 */

import {
  isStructural,
  type AnalyticsEvent,
  type EventName,
  type EventPayloads,
  type EventProperties,
  type RenderTier,
} from './events.ts'

export interface AnalyticsSink {
  readonly name: string
  send(event: AnalyticsEvent): void
}

/**
 * The default. **Named so a green build is not read as a site that measures.**
 *
 * Same reasoning as `NULL_CAPTURE` in the capture seam: a sink that silently
 * succeeds and stores nothing is indistinguishable from a working one at every
 * call site, and the difference matters at exactly the moment somebody asks
 * what the funnel says.
 */
export const NULL_SINK: AnalyticsSink = {
  name: 'null',
  send() {
    /* Nothing. The destination is Kian's to choose (SITE-049). */
  },
}

/** Collects events in memory. The test double, and the dev-time inspector. */
export function memorySink(): AnalyticsSink & { readonly events: AnalyticsEvent[] } {
  const events: AnalyticsEvent[] = []
  return { name: 'memory', events, send: (event) => void events.push(event) }
}

export interface Analytics {
  /**
   * Fire an event.
   *
   * **The parameter is intersected with `EventProperties` deliberately, and
   * that intersection is the guard.** Without it the only thing rejecting
   * `{ raw_goal }` is TypeScript's excess-property check, which applies to a
   * *fresh object literal* and to nothing else — so building the payload in a
   * variable first and passing the variable compiles cleanly.
   *
   * That was the state of this file when its own check first went green: the
   * negative fixture's five literal attempts were rejected and a sixth, through
   * a variable, was not. The check passed because its threshold was five. It is
   * the §12.4 shape exactly — a guarantee resting on a type and a test, where
   * the half the type actually carried was not the half I thought it was
   * carrying, and the test could not see the difference.
   *
   * Intersecting with `Record<string, StructuralValue>` constrains the *values*
   * rather than the key set, so a `string` property fails whether it arrives in
   * a literal or through twenty variables.
   */
  track<K extends EventName>(
    name: K,
    properties: Omit<EventPayloads[K], 'tier'> & EventProperties,
  ): void
}

/**
 * @param tier read once per session and attached to every event (§10.2).
 */
export function createAnalytics(sink: AnalyticsSink, tier: RenderTier): Analytics {
  return {
    track(name, properties) {
      const payload = { ...properties, tier } as EventPayloads[typeof name]

      /*
       * **The runtime half of the guard** (§12.4: a property asserted partly by
       * a type is asserted explicitly, or it is not asserted). The type closes
       * the property space for code the compiler saw; this catches a payload
       * that arrived through an `as` cast or from a boundary it did not.
       *
       * It **drops the event rather than throwing**. Analytics must not be able
       * to break the loop — a thrown error inside `track` at the wall would
       * take out the one screen that converts. Dropping is silent to the
       * visitor and loud in the only place it matters: the event does not
       * arrive, so the funnel shows the gap.
       */
      for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
        if (!isStructural(value)) {
          if (typeof console !== 'undefined') {
            console.warn(`analytics: dropped ${name} — "${key}" is not a structural value`)
          }
          return
        }
      }

      sink.send({ name, properties: payload } as AnalyticsEvent)
    },
  }
}
