'use client'

/*
 * SITE-006 · `useRenderTier()`.
 *
 * Returns the §15 tier for this device. Detection runs once, at mount — §15
 * says "tier detection at load" — and the result is cached for the session, so
 * a hundred consumers cost one WebGL probe rather than a hundred.
 *
 * `?tier=A|B|C|D` overrides it (SITE-006 accept). The override is read from
 * the live location rather than from a router hook, so it works on a static
 * export with no client-side routing in play.
 *
 * **Deliberately not here: the mid-session demotion.** §15 permits exactly one
 * demotion on two frame-budget breaches within 10s, never promoting back. That
 * needs a frame-budget monitor, which needs the scene, and this issue's
 * non-goals are "no consumers yet, no 3D". It belongs with the Peak's
 * performance work, not with detection.
 */

import { useSyncExternalStore } from 'react'
import {
  INITIAL_TIER,
  detectTier,
  parseTierOverride,
  readCapabilities,
  type RenderTier,
} from '../render-tier.ts'

let cached: RenderTier | null = null

function resolve(): RenderTier {
  if (cached !== null) return cached
  cached = parseTierOverride(window.location.search) ?? detectTier(readCapabilities())
  return cached
}

/*
 * The tier does not change after detection, so there is nothing to subscribe
 * to. The no-op subscribe is what `useSyncExternalStore` expects for a value
 * that is stable for the session, and it keeps the server snapshot honest
 * rather than reaching for `useEffect` and a render pass of `undefined`.
 */
function subscribe(): () => void {
  return () => {}
}

export function useRenderTier(): RenderTier {
  return useSyncExternalStore(subscribe, resolve, () => INITIAL_TIER)
}

/** Test seam: clears the session cache so a suite can vary the environment. */
export function resetRenderTierCache(): void {
  cached = null
}
