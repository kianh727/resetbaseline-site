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
/**
 * Memo, keyed on the only argument.
 *
 * **`settleKeyframes` is a pure function of its sample count and the spring
 * constants**, so every call returns the same object — and it was being called
 * once per mark, integrating the spring *twice* each time. Twenty-three marks
 * meant forty-six integrations of an identical curve, all on the click that
 * also renders the plan.
 *
 * `check-perf.mjs` measured that at 640ms INP against §11.2's 200ms ceiling on
 * a 4× throttled mobile CPU, and a run with reduced motion — which skips the
 * animations entirely — came in at 168ms, which is what located it. **K-4 says
 * an animation that makes interaction feel slower is shortened or removed
 * unless it carries product meaning.** This one does: the marks landing is
 * SITE-025's beat and §6.3b's distinction between the band being the case and
 * the days arriving. So the fix is to stop recomputing it, not to drop it.
 */
const keyframeCache = new Map<number, Settle>()

export function settleKeyframes(sampleCount = 24): Settle {
  const cached = keyframeCache.get(sampleCount)
  if (cached) return cached

  const raw = settleProgress()
  const progress = resample(raw, sampleCount)
  const seconds = raw.length * STEP

  const frames = progress.map((p, i) => ({
    t: i / (progress.length - 1),
    opacity: Math.min(1, SETTLE_FROM.opacity + (1 - SETTLE_FROM.opacity) * p),
    scale: SETTLE_FROM.scale + (1 - SETTLE_FROM.scale) * p,
    y: SETTLE_FROM.y + (0 - SETTLE_FROM.y) * p,
  }))

  const settleValue: Settle = { durationMs: Math.round(seconds * 1000), frames }
  keyframeCache.set(sampleCount, settleValue)
  return settleValue
}

/**
 * The curve as a CSS `@keyframes` rule, installed once per document.
 *
 * **Why this replaced twenty-three `element.animate()` calls.** The marks land
 * on the same interaction that renders the plan, and `check-perf.mjs` measured
 * that interaction at **640ms INP against §11.2's 200ms ceiling** on a 4×
 * throttled mobile CPU. A run with reduced motion — which skips the animations
 * entirely — came in at 168ms, which is what located the cost. Memoising the
 * curve took it to 448ms and memoising the keyframe array took it nowhere:
 * **about 120ms of it is the browser constructing twenty-three animation
 * objects**, and it barely moves with the keyframe count (24 samples → 480ms,
 * 12 → 304ms, 6 → 288ms).
 *
 * Cutting samples was the cheap way out and is the wrong one: SITE-024 records
 * that **the overshoot is the signature**, and six samples across a spring that
 * crosses its target once do not describe an overshoot. So the curve stays at
 * full resolution and the *delivery* changes — one rule the browser parses
 * once, applied to every mark with its own `animation-delay`.
 *
 * **This refines SITE-024 rather than contradicting it.** That issue rejected a
 * CSS `linear()` *easing* on browser-support grounds — Chrome 113, Safari 17.2
 * — and 375px is the primary target, which means older iOS. A `@keyframes`
 * block with percentage stops is not `linear()`: it is as old as CSS
 * animations, and it carries the identical curve because it is generated from
 * the same `settleKeyframes()` samples.
 */
export const ANIMATION_NAME = 'baseline-settle'

/** Put this on an ancestor to start the settle on its marks. */
export const SETTLING_CLASS = 'is-settling'

/** Per-element stagger index, read by the CSS rule below. */
export const STAGGER_VAR = '--settle-i'

const installed = new WeakSet<Document>()

/**
 * Install the curve and the rule that plays it. **Idempotent, and called at
 * mount rather than at the interaction.**
 *
 * The delay is `calc(var(--settle-i) * <stagger>)`, so the stagger is a number
 * on each element rather than a separate animation per element. Starting the
 * beat is then **one class toggle on the container** and the browser does the
 * rest — which is the whole point.
 */
export function installSettleStyles(doc: Document, staggerMs: number): void {
  if (installed.has(doc)) return

  const { durationMs, frames } = settleKeyframes()
  const body = frames
    .map(
      (f) =>
        `${(f.t * 100).toFixed(3)}% { opacity: ${f.opacity.toFixed(4)}; ` +
        `transform: translateY(${f.y.toFixed(3)}px) scale(${f.scale.toFixed(4)}); }`,
    )
    .join('\n')

  const style = doc.createElement('style')
  style.dataset['settle'] = ''
  style.textContent =
    `@keyframes ${ANIMATION_NAME} {\n${body}\n}\n` +
    `.${SETTLING_CLASS} [data-mark] { animation: ${ANIMATION_NAME} ${durationMs}ms linear ` +
    `calc(var(${STAGGER_VAR}, 0) * ${staggerMs}ms) both; }`

  doc.head.appendChild(style)
  installed.add(doc)
}

/**
 * Play the settle on **one** element.
 *
 * **For a single element landing.** A *set* of elements uses
 * `installSettleStyles` and `SETTLING_CLASS` instead: twenty-three calls to
 * this function cost about 120ms on a throttled mobile CPU, which is most of a
 * §11.2 INP budget spent before anything moves.
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
