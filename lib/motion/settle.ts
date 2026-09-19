/*
 * SITE-024 · The settling spring — the site's one signature motion.
 *
 * PRD v7.3 §11 carries v5 §8 forward unchanged, and v5 §8.1 is the config:
 *
 *     spring: { stiffness: 260, damping: 24, mass: 0.9 }
 *     from:   { opacity: 0, scale: 0.94, y: 8 }
 *
 * **Used only when structure lands into place.** Banned everywhere else — "if a
 * section header uses it, the signature is gone. This is the rule most likely to
 * erode across a long build." A lint rule restricts the import to an allowlist,
 * and `tests/settle.test.ts` proves the rule fires.
 *
 * ---
 *
 * **Hand-rolled, and not by preference.** §11 measured `framer-motion` at
 * 40.5 kB gzip against a 120 kB ceiling with ~15 kB free — a third of the whole
 * budget for one spring. The integrator below is a few hundred bytes.
 *
 * **It emits keyframes for the Web Animations API rather than a CSS `linear()`
 * easing.** `linear()` would express the curve in one declaration and is the
 * tidier answer, but it needs Chrome 113, Safari 17.2 or Firefox 112 — and
 * 375px is the primary target, which means older iOS. A keyframe array works
 * everywhere WAAPI does. The curve is identical either way; only the delivery
 * differs.
 *
 * **The spring is integrated, not approximated by an eased duration.** ζ here is
 * 0.78 — underdamped — so the motion overshoots its target and settles back.
 * That overshoot *is* the signature: it is what makes structure read as landing
 * rather than as arriving. A cubic-bezier fitted to the same duration would look
 * close and never overshoot, which is the one property worth keeping.
 */

/** v5 §8.1, verbatim. Not tunable, not per-call, not a parameter. */
export const SETTLE_SPRING = { stiffness: 260, damping: 24, mass: 0.9 } as const

/** v5 §8.1, verbatim. The state structure settles *from*. */
export const SETTLE_FROM = { opacity: 0, scale: 0.94, y: 8 } as const

/**
 * Integration step, in seconds. 1/240 rather than 1/60 because semi-implicit
 * Euler accumulates error with step size, and the resulting keyframes are
 * resampled down anyway — the cost is arithmetic at module load, not bytes.
 */
const STEP = 1 / 240

/** Rest thresholds: within 0.1% of target and effectively stationary. */
const REST_DISPLACEMENT = 0.001
const REST_VELOCITY = 0.001

/** Hard stop, so a mis-specified spring cannot loop forever. */
const MAX_SECONDS = 5

/** One sampled point of the settle, `t` normalised 0–1 over the whole motion. */
export interface SettleFrame {
  readonly t: number
  readonly opacity: number
  readonly scale: number
  readonly y: number
}

export interface Settle {
  /** Milliseconds, derived from the spring rather than chosen. */
  readonly durationMs: number
  readonly frames: readonly SettleFrame[]
}

/**
 * Integrate the spring from 0 to 1 and return its normalised progress samples.
 *
 * Pure, and exported so the curve can be asserted directly — the overshoot, the
 * settle, and the duration are all properties of these numbers rather than of
 * anything a browser did. A test that could only observe the animation would be
 * asserting the browser.
 */
export function settleProgress(
  spring: { stiffness: number; damping: number; mass: number } = SETTLE_SPRING,
): readonly number[] {
  const samples: number[] = []
  let position = 0
  let velocity = 0

  for (let t = 0; t < MAX_SECONDS; t += STEP) {
    samples.push(position)
    const displacement = position - 1
    const acceleration = (-spring.stiffness * displacement - spring.damping * velocity) / spring.mass
    velocity += acceleration * STEP
    position += velocity * STEP
    if (Math.abs(position - 1) < REST_DISPLACEMENT && Math.abs(velocity) < REST_VELOCITY) break
  }

  samples.push(1)
  return samples
}

/** Resample to at most `count` evenly spaced points, always keeping the last. */
function resample(samples: readonly number[], count: number): readonly number[] {
  if (samples.length <= count) return samples
  const out: number[] = []
  for (let i = 0; i < count - 1; i++) {
    const s = samples[Math.round((i * (samples.length - 1)) / (count - 1))]
    if (s !== undefined) out.push(s)
  }
  const last = samples[samples.length - 1]
  if (last !== undefined) out.push(last)
  return out
}

/**
 * The settle as keyframes and a duration.
 *
 * Interpolates §8.1's `from` toward rest along the spring's own progress, so the
 * overshoot carries through every property — scale passes 1 and comes back,
 * which is what the eye reads as landing. Opacity is interpolated on the same
 * curve but clamped, because an overshoot past 1 is not a visible state and a
 * browser would clamp it anyway, less predictably.
 */
export function settleKeyframes(sampleCount = 24): Settle {
  const progress = resample(settleProgress(), sampleCount)
  const seconds = settleProgress().length * STEP

  const frames = progress.map((p, i) => ({
    t: i / (progress.length - 1),
    opacity: Math.min(1, SETTLE_FROM.opacity + (1 - SETTLE_FROM.opacity) * p),
    scale: SETTLE_FROM.scale + (1 - SETTLE_FROM.scale) * p,
    y: SETTLE_FROM.y + (0 - SETTLE_FROM.y) * p,
  }))

  return { durationMs: Math.round(seconds * 1000), frames }
}

/**
 * Play the settle on an element.
 *
 * **Returns the `Animation`**, so a caller can cancel or finish it — every
 * builder animation is interruptible (EVAL-016), and an interruptible animation
 * whose handle is thrown away is not interruptible.
 *
 * **`reducedMotion` is a parameter, not a media query read here.** SITE-006 owns
 * the detection and exposes it as a hook; reading it a second time in this file
 * would be two derivations of one fact that can disagree (PRD §0.3c). Under
 * reduced motion the element is placed at its settled state immediately — not
 * faded, not shortened — because the motion carries meaning the visitor has
 * asked not to receive, and the structure must still be there.
 */
export function settle(
  element: Element,
  options: { reducedMotion: boolean; delayMs?: number },
): Animation | null {
  if (options.reducedMotion) return null

  const { durationMs, frames } = settleKeyframes()
  return element.animate(
    frames.map((f) => ({
      opacity: String(f.opacity),
      transform: `translateY(${f.y}px) scale(${f.scale})`,
      offset: f.t,
    })),
    {
      duration: durationMs,
      delay: options.delayMs ?? 0,
      easing: 'linear',
      fill: 'both',
    },
  )
}
