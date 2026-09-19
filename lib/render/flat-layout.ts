/*
 * SITE-022 · `FlatLayout` — the reference implementation.
 *
 * **Not a degraded mode.** PRD §6 and CLAUDE.md §3: a beautiful Peak with a
 * mediocre builder is a failed implementation; a great builder with a simplified
 * Peak is a launchable one. This is the composition the product demo is made of,
 * and it must stand as one with zero 3D and zero LLM.
 *
 * It satisfies `PlanLayout` (SITE-021) and computes the geometry §6.3b's grammar
 * implies. Every number below is a pure function of the plan and the frame size,
 * so the same plan at the same width composes identically every time — which is
 * this issue's one automated criterion, and also what lets a screenshot be
 * evidence of anything.
 *
 * **The grammar's geometry, and why each is a constant here rather than a prop:**
 *
 * - **Bands are level.** `y` depends on band index and nothing else. There is no
 *   slope term to set to zero, so §6.3b's question 12 — *does any band read as
 *   climbing, tilting, tapering?* — has no code path that could answer yes.
 * - **Bands bleed off both frame edges.** They are drawn from `-OVERHANG` to
 *   `width + OVERHANG`. Not clipped at the edge with a square cap: extended past
 *   it, so no end exists to be seen.
 * - **Days map to x by calendar position**, evenly, across the plan's whole span.
 *   A lit day and a dark day occupy the same slot width — an unscheduled day is
 *   not compressed away, because compressing it is how a sparse plan starts
 *   looking full.
 *
 * **Horizontal position is a fraction, not a pixel**, and that is a correction
 * rather than a preference. The first version composed at a fixed width and let
 * the renderer scale to fit, which at 375px — **the primary target** — shrank
 * 11px metadata to about 3px. Scaling a composition down is not responsiveness;
 * it is the same composition, unreadable. Fractions let the renderer lay the
 * band out at the real width with type at its real size, and let the adapter
 * turn the same fraction into a pixel for whatever frame it is asked about.
 *
 * **One fraction, two consumers.** The component and `anchorFor` both read
 * `xFraction`; neither recomputes it. Two derivations of one position can
 * disagree silently (§0.3c), and the disagreement here would be an overlay
 * drifting off the mark it labels.
 */

import type { Plan, PlanNode } from '../plan/model.ts'
import type { Anchor, PlanLayout } from '../plan/layout.ts'
import { bandsFor, type Band } from './bands.ts'

/** Vertical rhythm. A window band, its marks, and the gap to the next. */
export const BAND_HEIGHT = 44
const BAND_GAP = 16
const TOP_PAD = 24
const SIDE_PAD = 24

export interface BandMark {
  /**
   * Position across the band's track, 0–1. Width-independent by construction,
   * so the same number serves a 375px column and a 1440px frame.
   */
  readonly xFraction: number
  readonly lit: boolean
  readonly date: Date
}

export interface BandGeometry {
  readonly band: Band
  /** Top edge of the band, in layout space. Vertical rhythm is fixed, not fluid. */
  readonly y: number
  readonly height: number
  readonly marks: readonly BandMark[]
}

export interface FlatComposition {
  readonly height: number
  readonly bands: readonly BandGeometry[]
}

/**
 * Compose a plan.
 *
 * Pure, and **takes no width** — it reads no DOM, returns fractions for anything
 * horizontal, and is therefore testable without a browser and identical in one.
 */
export function compose(plan: Plan): FlatComposition {
  const bands = bandsFor(plan)

  const geometry = bands.map((band, i) => ({
    band,
    y: TOP_PAD + i * (BAND_HEIGHT + BAND_GAP),
    height: BAND_HEIGHT,
    marks: band.days.map((day, d) => ({
      // Centred in its slot, so the first and last marks sit inside the track
      // rather than on its edges — a mark at 0 would touch the gutter and read
      // as the band starting there.
      xFraction: (d + 0.5) / band.days.length,
      lit: day.lit,
      date: day.date,
    })),
  }))

  const height =
    bands.length === 0 ? 0 : TOP_PAD * 2 + bands.length * BAND_HEIGHT + (bands.length - 1) * BAND_GAP

  return { height, bands: geometry }
}

/**
 * The adapter.
 *
 * `anchorFor` returns **`null` for any node this composition does not draw**,
 * which after §6.3b's 2026-09-19 ruling is a real and expected case rather than
 * an error: a **timer** and a **tracker** have no recurring window, so they get
 * no band, and this layout has no position for them. `null` is the interface's
 * word for exactly that. **Do not add a fallback position** — an object placed
 * somewhere nobody chose is worse than an object not drawn, and inventing a
 * treatment here is the thing SITE-026's ruling reserves.
 */
export function flatLayout(plan: Plan, width: number): PlanLayout {
  const { bands } = compose(plan)
  const byNode = new Map(bands.map((g) => [g.band.nodeId, g]))
  const track = Math.max(0, width - SIDE_PAD * 2)

  return {
    anchorFor(node: PlanNode): Anchor | null {
      const g = byNode.get(node.id)
      if (g === undefined) return null
      const first = g.marks[0]
      return {
        // A band with no marks — protection — anchors at the frame's centre,
        // which is the only honest point for something that bleeds off both
        // edges and occupies no particular day.
        x: first === undefined ? width / 2 : SIDE_PAD + first.xFraction * track,
        y: g.y + g.height / 2,
      }
    },
  }
}
