/*
 * SITE-006 · Render-tier detection.
 *
 * PRD §15's degradation ladder, as a pure function over a capability set:
 *
 *   A · Desktop, WebGL2, ≥4 cores  → full Peak, cursor authority, full post chain
 *   B · Modern mobile, WebGL2      → half-res upscaled, grain and bloom, auto-sweep
 *   C · WebGL1, ≤2 cores           → static pre-rendered peak + CSS light gradient
 *   D · No WebGL, or `save-data`   → static image or flat background
 *
 * **The builder never degrades.** C and D lose atmosphere and keep 100% of
 * function (DS-6). Nothing here may ever gate builder behaviour on a tier.
 *
 * Detection is split from measurement on purpose: `detectTier` is pure so the
 * ladder can be tested against a capability matrix rather than against
 * whatever browser happens to run the suite, and `readCapabilities` is the
 * only part that touches the DOM.
 */

export type RenderTier = 'A' | 'B' | 'C' | 'D'

/** WebGL support level. `0` means none — not "unknown". */
export type WebglLevel = 0 | 1 | 2

export type Capabilities = {
  webgl: WebglLevel
  /** `navigator.hardwareConcurrency`, or a conservative 2 where unreported. */
  cores: number
  /** `navigator.connection.saveData`. */
  saveData: boolean
  /** A pointer that can hover, as a proxy for desktop. §15 names the tier "desktop". */
  desktop: boolean
}

export const TIERS: readonly RenderTier[] = ['A', 'B', 'C', 'D']

export function isRenderTier(value: unknown): value is RenderTier {
  return typeof value === 'string' && (TIERS as readonly string[]).includes(value)
}

/**
 * §15's ladder. Evaluated worst-first: every rung is a reason to be *lower*,
 * so the first match wins and A is what is left when nothing disqualifies.
 *
 * Worst-first also makes `save-data` unconditional. A user who has asked for
 * less data gets D whatever their hardware could manage, which is the point of
 * the setting — reading it as one input among several would let a fast desktop
 * override an explicit request.
 */
export function detectTier(caps: Capabilities): RenderTier {
  // D — the user asked for less data, or there is no WebGL at all.
  if (caps.saveData || caps.webgl === 0) return 'D'

  // C — WebGL1 only, or a machine at or below two cores.
  if (caps.webgl === 1 || caps.cores <= 2) return 'C'

  // A — WebGL2, desktop, four cores or more.
  if (caps.desktop && caps.cores >= 4) return 'A'

  /*
   * B — WebGL2 and better than the C floor, but not all of A's conditions.
   *
   * §15 describes B as "modern mobile", which leaves one case unnamed: a
   * *desktop* with WebGL2 and three cores. It is not A (fewer than four
   * cores), and it is not C (more than two cores, WebGL2). B is the honest
   * answer — it is the rung whose capabilities it actually has — and it is
   * recorded here rather than decided silently, because a reader comparing
   * this against §15's table will not find that row.
   */
  return 'B'
}

/**
 * `?tier=A|B|C|D` forces a tier, for testing (SITE-006 accept).
 *
 * Case-insensitive, and an unrecognised value returns null rather than
 * throwing or defaulting — a typo should fall through to real detection, not
 * silently pin the site to a tier nobody chose.
 */
export function parseTierOverride(search: string): RenderTier | null {
  const value = new URLSearchParams(search).get('tier')
  if (value === null) return null
  const upper = value.toUpperCase()
  return isRenderTier(upper) ? upper : null
}

/**
 * The floor, used before detection has run.
 *
 * Starting at D and upgrading can only ever *add* atmosphere after first
 * paint. Starting at A and demoting would render the most expensive thing
 * first on the weakest device — exactly backwards. The Peak is never in the
 * LCP path and initializes on `requestIdleCallback`, so nothing visual
 * depends on this value being right before mount.
 */
export const INITIAL_TIER: RenderTier = 'D'

/**
 * Reads the capabilities §15 names. DOM-only; `detectTier` holds the ladder.
 *
 * The WebGL probe creates a context and immediately releases it via
 * `WEBGL_lose_context`. A detection probe that leaves a live context behind
 * costs a GPU allocation for the whole session on exactly the low-end devices
 * this function exists to identify.
 */
export function readCapabilities(): Capabilities {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
  }

  let webgl: WebglLevel = 0
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (gl) {
      webgl = canvas.getContext('webgl2') ? 2 : 1
      const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
      lose?.loseContext()
    }
  } catch {
    // A context creation that throws is a context the site does not have.
    webgl = 0
  }

  return {
    webgl,
    /*
     * Unreported concurrency is treated as 2, which lands on C. Guessing high
     * would promote an unknown device into A's full post chain; guessing low
     * costs it some atmosphere. Only one of those is recoverable.
     */
    cores: typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0
      ? nav.hardwareConcurrency
      : 2,
    saveData: nav.connection?.saveData === true,
    desktop: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  }
}
