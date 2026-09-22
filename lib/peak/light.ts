/*
 * The Peak's light — v5 §7.2, recovered from `9568a9a:docs/site-prd-v5.md`.
 *
 * > Autonomous sweep, **coprime periods so it never visibly loops**:
 * >
 * >     azimuth   = -38° + sin(t · 0.0157) · 46°     // ~40s
 * >     elevation =  22° + cos(t · 0.0104) · 14°     // ~60s
 * >
 * > **Cursor authority 0.75** while the pointer is active, decaying to 0 over
 * > **2000ms** after leave. Spring at **0.055** — *the most important tuning
 * > number on the site.* … Cursor Y → elevation, X → azimuth, **both clamped so
 * > the light can never black out the peak.**
 *
 * ---
 *
 * **Pure, and separated from anything that draws.** The sweep is a function of
 * time and the cursor state is a function of its previous value — both are
 * arithmetic, and putting them in the renderer would make them testable only by
 * watching a canvas, which is asserting the browser. The clamp in particular is
 * a safety property (*"can never black out the peak"*) and safety properties
 * asserted by eye are asserted by nobody.
 *
 * **The constants are §7.2's, verbatim, and are not tuned here.** §7.2 says the
 * spring is tuned by feel against the real geometry; that is a `VIS` judgement
 * and a session may prepare the evidence for one but never record it (§7).
 */

/** §7.2's sweep. Degrees. */
export const AZIMUTH_CENTRE = -38
export const AZIMUTH_AMPLITUDE = 46
export const AZIMUTH_RATE = 0.0157

export const ELEVATION_CENTRE = 22
export const ELEVATION_AMPLITUDE = 14
export const ELEVATION_RATE = 0.0104

/** §7.2's cursor authority and its decay. */
export const CURSOR_AUTHORITY = 0.75
export const CURSOR_DECAY_MS = 2000
/** *"The most important tuning number on the site."* */
export const CURSOR_SPRING = 0.055

/**
 * The clamp §7.2 requires.
 *
 * **Elevation never reaches the horizon**, because a key light at 0° grazes the
 * ridge and leaves the front faces unlit — the peak goes black, which §7.2
 * forbids by name. Azimuth is bounded to the front hemisphere for the same
 * reason: a light behind the ridge silhouettes it and models no form, and §7.2
 * says the key is the only light that models form.
 */
export const ELEVATION_MIN = 8
export const ELEVATION_MAX = 62
export const AZIMUTH_MIN = -84
export const AZIMUTH_MAX = 84

export interface LightAngles {
  readonly azimuth: number
  readonly elevation: number
}

export function clampAngles(angles: LightAngles): LightAngles {
  return {
    azimuth: Math.min(AZIMUTH_MAX, Math.max(AZIMUTH_MIN, angles.azimuth)),
    elevation: Math.min(ELEVATION_MAX, Math.max(ELEVATION_MIN, angles.elevation)),
  }
}

/** The autonomous sweep at time `t` in milliseconds. */
export function sweep(t: number): LightAngles {
  return clampAngles({
    azimuth: AZIMUTH_CENTRE + Math.sin(t * AZIMUTH_RATE) * AZIMUTH_AMPLITUDE,
    elevation: ELEVATION_CENTRE + Math.cos(t * ELEVATION_RATE) * ELEVATION_AMPLITUDE,
  })
}

export interface CursorState {
  /** -1..1 across the viewport, or null when the pointer is not over the scene. */
  readonly x: number | null
  readonly y: number | null
  /** Milliseconds since the pointer left. */
  readonly sinceLeaveMs: number
}

/**
 * How much the cursor is allowed to move the light, right now.
 *
 * 0.75 while the pointer is present, decaying **linearly** to 0 over 2000ms
 * after it leaves. Linear because §7.2 says "decaying to 0 over 2000ms" and
 * nothing more; an eased decay would be a second motion curve nobody specified,
 * and the settling spring is reserved for structure landing (SITE-024).
 */
export function cursorAuthority(state: CursorState): number {
  if (state.x !== null && state.y !== null) return CURSOR_AUTHORITY
  if (state.sinceLeaveMs >= CURSOR_DECAY_MS) return 0
  return CURSOR_AUTHORITY * (1 - state.sinceLeaveMs / CURSOR_DECAY_MS)
}

/**
 * Where the cursor would put the light, at full authority.
 *
 * **Y → elevation and X → azimuth**, which is §7.2's mapping and is the one
 * that reads as moving a light rather than turning a model: raising the pointer
 * raises the light.
 */
export function cursorTarget(x: number, y: number): LightAngles {
  return clampAngles({
    azimuth: AZIMUTH_CENTRE + x * AZIMUTH_AMPLITUDE,
    elevation: ELEVATION_CENTRE - y * ELEVATION_AMPLITUDE * 1.6,
  })
}

/**
 * One frame of the light.
 *
 * The sweep is the base and the cursor blends over it by its current authority;
 * the result is then sprung toward, so a pointer that jumps does not snap the
 * light. **The clamp is applied last**, so nothing — sweep, cursor, spring
 * overshoot — can put the light where it blacks out the peak.
 */
export function stepLight(
  previous: LightAngles,
  t: number,
  cursor: CursorState,
): LightAngles {
  const base = sweep(t)
  const authority = cursorAuthority(cursor)

  let target = base
  if (cursor.x !== null && cursor.y !== null) {
    const wanted = cursorTarget(cursor.x, cursor.y)
    target = {
      azimuth: base.azimuth + (wanted.azimuth - base.azimuth) * authority,
      elevation: base.elevation + (wanted.elevation - base.elevation) * authority,
    }
  } else if (authority > 0) {
    // Mid-decay: hold the previous offset from the sweep and let it shrink.
    target = {
      azimuth: base.azimuth + (previous.azimuth - base.azimuth) * (authority / CURSOR_AUTHORITY),
      elevation:
        base.elevation + (previous.elevation - base.elevation) * (authority / CURSOR_AUTHORITY),
    }
  }

  return clampAngles({
    azimuth: previous.azimuth + (target.azimuth - previous.azimuth) * CURSOR_SPRING,
    elevation: previous.elevation + (target.elevation - previous.elevation) * CURSOR_SPRING,
  })
}

/** Unit direction toward the light, for the shader. */
export function lightDirection(angles: LightAngles): [number, number, number] {
  const az = (angles.azimuth * Math.PI) / 180
  const el = (angles.elevation * Math.PI) / 180
  return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
}
