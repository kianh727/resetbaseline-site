/*
 * The Peak's geometry — v5 §7.1, carried forward by v7.3 §11.
 *
 * **The spec is not in the working tree.** §11 carries *"The Peak (v5 §7, P1)"*
 * forward by reference to a document §1 keeps in git history only, so it was
 * recovered from `9568a9a:docs/site-prd-v5.md` — the same recovery SITE-024
 * needed for the spring constants, and the fifth citation of this shape in this
 * repository. Reported, not fixed: inlining v5 §7 into v7.3 is a §10 amendment
 * and Kian's.
 *
 * §7.1, verbatim on the parts that bind:
 *
 * > Hand-authored low-poly ridge, **300–450 triangles**, flat-shaded, derived
 * > from the mark: **tall asymmetric summit right of center, lower shoulder
 * > left, hard notch between.** … It never rotates, drifts, or pulses.
 *
 * ---
 *
 * **Generated from a profile rather than hand-placed vertices, and that is a
 * call of mine.** "Hand-authored" in §7.1 is about the silhouette being
 * designed rather than noise-generated; the profile below *is* the authored
 * part, and it is eleven control points. Generating the mesh from it keeps the
 * triangle budget checkable, keeps the shape editable as numbers rather than as
 * a binary, and makes the silhouette assertable by a test — which a hand-placed
 * vertex list is not.
 *
 * **Deterministic, with no randomness anywhere.** A jittered facet would make
 * every build a different mountain and the silhouette constraint unassertable.
 *
 * **Unverifiable today, and stated rather than dressed up: §7.1's binding
 * constraint is that the silhouette "must be recognizable as the Baseline icon
 * to someone who wasn't told to look for it."** The mark does not exist in this
 * repository — the favicon is a provisional lit line of mine — so that
 * constraint cannot be checked against anything. It is the typeface situation
 * again: everything around the decision is built, and the decision needs an
 * artifact only Kian has. What *is* asserted is §7.1's described shape.
 */

/** §7.1's budget. Asserted, not aspired to. */
export const MIN_TRIANGLES = 300
export const MAX_TRIANGLES = 450

/**
 * The authored silhouette, as height against normalised width.
 *
 * Read left to right: a low shoulder, a **hard notch** that drops sharply, then
 * the tall asymmetric summit right of centre with a steeper face on its right.
 * The asymmetry is the point — a symmetric ridge reads as a logo mark rather
 * than as a landform, and a soft notch reads as a hill.
 */
export const PROFILE: readonly { readonly x: number; readonly y: number }[] = [
  { x: 0.0, y: 0.06 },
  { x: 0.12, y: 0.2 },
  { x: 0.22, y: 0.44 },
  { x: 0.3, y: 0.38 },
  { x: 0.38, y: 0.17 },
  { x: 0.44, y: 0.14 },
  { x: 0.55, y: 0.5 },
  { x: 0.63, y: 0.78 },
  { x: 0.68, y: 1.0 },
  { x: 0.78, y: 0.55 },
  { x: 0.9, y: 0.22 },
  { x: 1.0, y: 0.05 },
]

export interface Mesh {
  /** Flat `xyz` triples, three vertices per triangle — flat shading needs no sharing. */
  readonly positions: Float32Array
  /** One normal per vertex, constant across each triangle's three. */
  readonly normals: Float32Array
  /** Baked vertex ambient occlusion, §7.3. One scalar per vertex. */
  readonly occlusion: Float32Array
  readonly triangleCount: number
}

/** Height at a normalised x, linearly interpolated between control points. */
export function profileHeight(x: number): number {
  const clamped = Math.min(1, Math.max(0, x))
  for (let i = 1; i < PROFILE.length; i++) {
    const a = PROFILE[i - 1]
    const b = PROFILE[i]
    if (!a || !b) continue
    if (clamped <= b.x) {
      const span = b.x - a.x
      const t = span === 0 ? 0 : (clamped - a.x) / span
      return a.y + (b.y - a.y) * t
    }
  }
  return PROFILE[PROFILE.length - 1]?.y ?? 0
}

/**
 * Depth falloff across the ridge, so it is a landform rather than a cutout.
 *
 * A flat extrusion reads as a piece of card at any light angle, and §7.2 says
 * the key light is *"the only light that models form"* — there has to be form
 * for it to model.
 */
function depthScale(z: number): number {
  // z runs -1..1; the ridge is fullest at the centre and tapers to the edges.
  return 1 - 0.55 * z * z
}

function cross(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
): [number, number, number] {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
}

/**
 * Build the ridge.
 *
 * @param columns segments across the ridge. @param rows segments through it.
 * Two triangles per cell, so the triangle budget is `columns * rows * 2` and
 * the defaults land inside §7.1's 300–450.
 */
export function buildPeak(columns = 14, rows = 13): Mesh {
  const triangleCount = columns * rows * 2
  const positions = new Float32Array(triangleCount * 9)
  const normals = new Float32Array(triangleCount * 9)
  const occlusion = new Float32Array(triangleCount * 3)

  const vertex = (ix: number, iz: number): [number, number, number] => {
    const u = ix / columns
    const z = (iz / rows) * 2 - 1
    const height = profileHeight(u) * depthScale(z)
    // x centred on 0, y from the ground up, z through the ridge.
    return [u * 2 - 1, height, z]
  }

  let p = 0
  let o = 0

  for (let ix = 0; ix < columns; ix++) {
    for (let iz = 0; iz < rows; iz++) {
      const a = vertex(ix, iz)
      const b = vertex(ix + 1, iz)
      const c = vertex(ix + 1, iz + 1)
      const d = vertex(ix, iz + 1)

      for (const tri of [
        [a, b, c],
        [a, c, d],
      ] as [number, number, number][][]) {
        const [v0, v1, v2] = tri as [
          [number, number, number],
          [number, number, number],
          [number, number, number],
        ]

        /*
         * **One normal per triangle, written to all three vertices.** That is
         * what flat shading *is* — §7.1 says flat-shaded and §7.3 says the
         * facets plus posterised diffuse give all the definition needed, so a
         * smoothed normal here would undo both and produce the photoreal
         * gradient §19 bans by name.
         */
        const [nx, ny, nz] = cross(
          v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2],
          v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2],
        )
        const length = Math.hypot(nx, ny, nz) || 1

        for (const v of [v0, v1, v2]) {
          positions[p] = v[0]
          positions[p + 1] = v[1]
          positions[p + 2] = v[2]
          normals[p] = nx / length
          normals[p + 1] = ny / length
          normals[p + 2] = nz / length
          p += 3

          /*
           * **Vertex AO baked here** (§7.3), as a cheap analytic approximation:
           * low and interior points are more occluded than high and exposed
           * ones. No shadow maps, which §7.3 also rules out.
           */
          occlusion[o] = Math.min(1, 0.35 + 0.65 * v[1] + 0.15 * Math.abs(v[2]))
          o += 1
        }
      }
    }
  }

  return { positions, normals, occlusion, triangleCount }
}
