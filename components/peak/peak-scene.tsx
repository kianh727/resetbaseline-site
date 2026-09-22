'use client'

/*
 * The Peak — v5 §7, P1, mounted so that it can cost nothing.
 *
 * **Four separate guarantees, and each is a different mechanism:**
 *
 * 1. **Never in the LCP path.** The canvas has no intrinsic content, the
 *    headline is the LCP element, and `scripts/check-lcp.mjs` asserts that at
 *    both widths. Nothing here changes what paints first.
 * 2. **Excluded from the core bundle.** The renderer and the geometry are
 *    reached through a dynamic `import()` inside an effect, so they land in
 *    their own chunk. §11.2 gives the core 120 kB and the scene 140 kB,
 *    separately — a static import would spend the first on the second.
 * 3. **Initialised on `requestIdleCallback`**, so the import does not compete
 *    with hydration or with the first interaction. On a browser without it the
 *    fallback is a timeout rather than an immediate start: Safari is where it
 *    is missing and iOS is the primary target.
 * 4. **Tier-gated and reduced-motion aware**, below.
 *
 * ---
 *
 * **It degrades to nothing, and that is the whole design.** §3 of the
 * constitution: a great builder with a simplified Peak is launchable, and
 * `FlatLayout` is the reference implementation rather than a degraded mode. So
 * this renders atmosphere behind the fold and **carries no meaning the flat
 * layout does not already carry** — if the canvas never appears, nothing the
 * visitor needed is missing. DS-6: the full loop completes with WebGL disabled.
 *
 * **Tiers C and D get no scene at all** (SITE-058). §15's ladder puts them on
 * the flat rendering path, and a low-end device that has already been detected
 * as low-end should not then be asked to compile a shader.
 *
 * **Under reduced motion it renders once and stops.** Not faded, not skipped —
 * §7.2's sweep is the motion, so the scene draws a single frame at the sweep's
 * t=0 angles and never schedules another. The structure is still there, which
 * is the same rule `settle()` follows.
 */

import { useEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import { useRenderTier } from '@/lib/hooks/use-render-tier'

/** §15's ladder: A and B get the scene, C and D get the flat path (SITE-058). */
const SCENE_TIERS = new Set(['A', 'B'])

/**
 * Run `callback` when the browser is idle **and the visitor is not typing**.
 *
 * **The second half is not a refinement of the first.** `requestIdleCallback`
 * fires as soon as the main thread is free, which on a fast connection is while
 * the visitor is still in the input — and `scripts/check-builder.mjs` caught
 * exactly that: two network requests during typing, which are the scene's own
 * chunk being fetched.
 *
 * SITE-019's claim is narrower than that check — the *deadline* materialises
 * with no network, and it still does — but the behaviour is wrong on its own
 * terms. Typing the goal is the single most important interaction on this site,
 * it happens on a 375px phone on mobile data, and the Peak is atmosphere. §3
 * settles that conflict in one direction: the builder wins. So the scene waits
 * rather than competing for the connection with the thing the visitor came for.
 *
 * **And it waits out the LCP window first, which is the floor rather than a
 * tuning number.** §11.2 budgets LCP at 1800ms on mobile 4G; a scene chunk
 * fetched inside that window competes for the connection with the paint it is
 * measured against, so the earliest honest moment to fetch it is after the
 * window closes. Deferring only until idle was not enough: idle fires between
 * `load` and the visitor's first keystroke, which is precisely the gap.
 */
const LCP_WINDOW_MS = 1800
function whenIdle(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let cancelled = false
  let handle: number | null = null
  let timer: number | null = null

  const busy = () => {
    const active = document.activeElement
    return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
  }

  const attempt = () => {
    if (cancelled) return
    if (busy()) {
      // Check back rather than subscribing to blur: the visitor may type, pause,
      // and resume, and a blur listener would start the fetch in the pause.
      timer = window.setTimeout(attempt, 700)
      return
    }
    callback()
  }

  const afterLcpWindow = () => {
    if (cancelled) return
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback
    if (typeof ric === 'function') handle = ric(attempt)
    // Safari has no requestIdleCallback, and iOS is the primary target.
    else timer = window.setTimeout(attempt, 240)
  }

  timer = window.setTimeout(afterLcpWindow, LCP_WINDOW_MS)

  return () => {
    cancelled = true
    if (timer !== null) window.clearTimeout(timer)
    if (handle !== null) {
      const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback
      cancel?.(handle)
    }
  }
}

export default function PeakScene() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const tier = useRenderTier()
  const reducedMotion = useReducedMotion()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!SCENE_TIERS.has(tier) || failed) return

    let disposed = false
    let renderer: { draw: (a: { azimuth: number; elevation: number }) => void; resize: (w: number, h: number) => void; dispose: () => void } | null = null
    let frame = 0
    let observer: ResizeObserver | null = null

    const cursor = { x: null as number | null, y: null as number | null, leftAt: 0 }

    const cancelIdle = whenIdle(() => {
      void (async () => {
        /*
         * **The dynamic import is what keeps the scene out of the core chunk**,
         * and it is inside the idle callback rather than at module scope so the
         * fetch itself does not compete with hydration.
         */
        const [{ createRenderer }, { stepLight, sweep }] = await Promise.all([
          import('@/lib/peak/renderer'),
          import('@/lib/peak/light'),
        ])
        if (disposed) return

        const element = canvas.current
        if (!element) return

        /*
         * **Pulled back and framed low.** The first render filled the fold and
         * sat over the headline — §3 is explicit that the Peak is atmosphere
         * and the builder wins, and a scene competing with the H1 has that
         * backwards. The camera is further out so the ridge occupies the lower
         * band of the section.
         */
        const created = createRenderer(element, undefined, [0, 1.35, 6.4])
        if (!created) {
          // No WebGL2, or a major performance caveat. Nothing is missing.
          setFailed(true)
          return
        }
        renderer = created

        const fit = () => {
          const rect = element.getBoundingClientRect()
          /*
           * **Capped at 1.5× rather than the device ratio.** A 3× retina phone
           * would otherwise render nine times the pixels for a scene that is
           * atmosphere, and K-2 says a post effect that materially hurts mobile
           * performance is removed — the same argument applies to resolution.
           */
          const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
          created.resize(Math.round(rect.width * ratio), Math.round(rect.height * ratio))
        }
        fit()
        observer = new ResizeObserver(fit)
        observer.observe(element)

        if (reducedMotion) {
          /*
           * One frame at the sweep's own t=0, then nothing. The scene is there;
           * the motion is not. §7.2's sweep *is* the motion, so stopping it is
           * the whole of what reduced motion means here.
           */
          created.draw(sweep(0))
          return
        }

        let angles = sweep(0)
        const start = performance.now()
        const loop = () => {
          if (disposed) return
          const t = performance.now() - start
          angles = stepLight(angles, t, {
            x: cursor.x,
            y: cursor.y,
            sinceLeaveMs: cursor.x === null ? performance.now() - cursor.leftAt : 0,
          })
          created.draw(angles)
          frame = requestAnimationFrame(loop)
        }
        frame = requestAnimationFrame(loop)
      })()
    })

    /*
     * Pointer tracking is on the window rather than the canvas: §7.2 gives the
     * cursor authority over the light while the pointer is *active*, and a
     * listener on the canvas would only ever see a pointer already over the
     * scene — which is the one position where moving the light reads least.
     */
    const onMove = (event: PointerEvent) => {
      cursor.x = (event.clientX / window.innerWidth) * 2 - 1
      cursor.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    const onLeave = () => {
      cursor.x = null
      cursor.y = null
      cursor.leftAt = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    return () => {
      disposed = true
      cancelIdle()
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      renderer?.dispose()
    }
  }, [tier, reducedMotion, failed])

  if (!SCENE_TIERS.has(tier) || failed) return null

  return (
    <canvas
      ref={canvas}
      /*
       * `aria-hidden` and no accessible name: the scene carries no information
       * the flat layout does not, so announcing it would be announcing
       * decoration. `pointer-events: none` so it can never intercept a tap —
       * it sits behind the content and the content is the product.
       */
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        /*
         * Atmosphere, not an illustration. The ridge sits behind the type at a
         * weight where it reads as a presence rather than as a picture — §3's
         * "atmosphere and memory device", and the level at which §19's ban on
         * a peak that competes for attention stays satisfied.
         */
        opacity: 0.5,
        // Behind everything. The Peak is atmosphere and memory device (§3).
        zIndex: -1,
      }}
    />
  )
}
