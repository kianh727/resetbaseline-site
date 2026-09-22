/*
 * The Peak's geometry and light — v5 §7.1 and §7.2, recovered from
 * `9568a9a:docs/site-prd-v5.md` because §11 carries them forward by reference
 * to a document that is not in the working tree.
 *
 * *Stub check* — a `buildPeak` returning an empty mesh fails the triangle-count
 * assertion, which runs before every assertion about the shape; a `stepLight`
 * returning its input unchanged fails the sweep-moves test; and a `clampAngles`
 * that is the identity fails the blackout test by name. Counts and movement are
 * asserted before properties throughout, because "the silhouette has a notch"
 * and "the light never blacks out the peak" are both satisfied perfectly by
 * nothing being there.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildPeak,
  MAX_TRIANGLES,
  MIN_TRIANGLES,
  PROFILE,
  profileHeight,
} from '../lib/peak/geometry.ts'
import {
  AZIMUTH_MAX,
  AZIMUTH_MIN,
  clampAngles,
  cursorAuthority,
  CURSOR_AUTHORITY,
  CURSOR_DECAY_MS,
  ELEVATION_MAX,
  ELEVATION_MIN,
  lightDirection,
  stepLight,
  sweep,
} from '../lib/peak/light.ts'

/* ── §7.1 · the object ───────────────────────────────────────────────────── */

test('the ridge is inside §7.1\'s triangle budget', () => {
  const mesh = buildPeak()
  assert.ok(
    mesh.triangleCount >= MIN_TRIANGLES && mesh.triangleCount <= MAX_TRIANGLES,
    `${mesh.triangleCount} triangles, against §7.1's ${MIN_TRIANGLES}–${MAX_TRIANGLES}`,
  )
  assert.equal(mesh.positions.length, mesh.triangleCount * 9, 'three xyz vertices per triangle')
  assert.equal(mesh.normals.length, mesh.positions.length)
  assert.equal(mesh.occlusion.length, mesh.triangleCount * 3)
})

test('the silhouette is §7.1\'s: summit right of centre, shoulder left, hard notch between', () => {
  /*
   * The one constraint §7.1 states that can be checked without the mark. Its
   * **binding** constraint — *"recognizable as the Baseline icon to someone who
   * wasn't told to look for it"* — cannot: the icon does not exist in this
   * repository, and the favicon is a provisional lit line of mine. Stated in
   * `geometry.ts` rather than quietly skipped.
   */
  const summitX = PROFILE.reduce((best, p) => (p.y > best.y ? p : best), PROFILE[0]!).x
  assert.ok(summitX > 0.5, `the summit sits at ${summitX}, which is not right of centre`)

  // The shoulder: a local maximum left of the summit, lower than it.
  const left = PROFILE.filter((p) => p.x < 0.4)
  const shoulder = left.reduce((best, p) => (p.y > best.y ? p : best), left[0]!)
  assert.ok(shoulder.y > 0.25, 'there is no shoulder on the left')
  assert.ok(shoulder.y < profileHeight(summitX) * 0.75, 'the shoulder is not clearly lower')

  /*
   * **A hard notch, asserted as a slope rather than as a minimum.** A low point
   * between two peaks is a valley; §7.1 says *hard*, and what makes it hard is
   * the rate of the drop. A soft dip of the same depth reads as a hill.
   */
  const notchX = PROFILE.filter((p) => p.x > shoulder.x && p.x < summitX).reduce(
    (best, p) => (p.y < best.y ? p : best),
    { x: 0, y: Infinity },
  )
  assert.ok(notchX.y < shoulder.y, 'the notch is not below the shoulder')

  const drop = (shoulder.y - notchX.y) / (notchX.x - shoulder.x)
  assert.ok(drop > 1.2, `the notch falls at ${drop.toFixed(2)} per unit — that is a slope, not a notch`)
})

test('every triangle is flat-shaded — one normal across its three vertices', () => {
  /*
   * §7.1 says flat-shaded and §7.3 says the facets plus posterised diffuse give
   * all the definition needed. A smoothed normal undoes both and produces the
   * photoreal gradient §19 bans by name — and it is a one-line change that
   * looks like an improvement.
   */
  const mesh = buildPeak()
  assert.ok(mesh.triangleCount > 0)

  for (let t = 0; t < mesh.triangleCount; t++) {
    const base = t * 9
    for (const offset of [3, 6]) {
      for (let c = 0; c < 3; c++) {
        assert.equal(
          mesh.normals[base + offset + c],
          mesh.normals[base + c],
          `triangle ${t} has different normals across its vertices — that is smooth shading`,
        )
      }
    }
  }
})

test('every normal is unit length, and the mesh has real volume', () => {
  const mesh = buildPeak()
  let zMin = Infinity
  let zMax = -Infinity

  for (let v = 0; v < mesh.triangleCount * 3; v++) {
    const n = v * 3
    const length = Math.hypot(mesh.normals[n]!, mesh.normals[n + 1]!, mesh.normals[n + 2]!)
    assert.ok(Math.abs(length - 1) < 1e-5, `normal ${v} has length ${length}`)
    zMin = Math.min(zMin, mesh.positions[n + 2]!)
    zMax = Math.max(zMax, mesh.positions[n + 2]!)
  }

  assert.ok(zMax - zMin > 1, 'the ridge has no depth — a flat extrusion reads as a piece of card')
})

test('the build is deterministic', () => {
  // A jittered facet would make every build a different mountain and the
  // silhouette constraint unassertable.
  const a = buildPeak()
  const b = buildPeak()
  assert.deepEqual([...a.positions], [...b.positions])
  assert.deepEqual([...a.occlusion], [...b.occlusion])
})

/* ── §7.2 · the light ────────────────────────────────────────────────────── */

test('the sweep moves, and never visibly loops', () => {
  const samples = Array.from({ length: 400 }, (_, i) => sweep(i * 250))
  const azimuths = new Set(samples.map((s) => s.azimuth.toFixed(3)))
  assert.ok(azimuths.size > 300, `only ${azimuths.size} distinct azimuths — the light is static`)

  /*
   * **Coprime periods, asserted as the thing they buy.** §7.2 gives ~40s and
   * ~60s; what matters is that the pair does not return to its start inside a
   * span anybody watches. Checked over ten minutes, which is far longer than a
   * visit.
   */
  const start = sweep(0)
  for (let t = 1000; t < 600_000; t += 1000) {
    const now = sweep(t)
    const same =
      Math.abs(now.azimuth - start.azimuth) < 0.01 && Math.abs(now.elevation - start.elevation) < 0.01
    assert.ok(!same, `the sweep returns to its starting angles at ${t}ms — it visibly loops`)
  }
})

test('the light can never black out the peak', () => {
  /*
   * §7.2's safety property, and the reason the clamp is applied last in
   * `stepLight` rather than to its inputs: sweep, cursor and spring overshoot
   * are three ways past it and the clamp has to sit after all three.
   */
  let angles = { azimuth: 0, elevation: 0 }

  for (let frame = 0; frame < 4000; frame++) {
    const t = frame * 16
    // A cursor thrashing to the extremes, including outside the viewport.
    const phase = frame % 200
    const cursor =
      phase < 120
        ? { x: Math.sin(frame) * 4, y: Math.cos(frame) * 4, sinceLeaveMs: 0 }
        : { x: null, y: null, sinceLeaveMs: (phase - 120) * 16 }

    angles = stepLight(angles, t, cursor)

    assert.ok(
      angles.elevation >= ELEVATION_MIN && angles.elevation <= ELEVATION_MAX,
      `elevation ${angles.elevation} at frame ${frame} is outside the clamp`,
    )
    assert.ok(
      angles.azimuth >= AZIMUTH_MIN && angles.azimuth <= AZIMUTH_MAX,
      `azimuth ${angles.azimuth} at frame ${frame} is outside the clamp`,
    )

    // And the direction always has the light in front of and above the ridge.
    const [, y, z] = lightDirection(angles)
    assert.ok(y > 0, `the light is at or below the horizon at frame ${frame}`)
    assert.ok(z > 0, `the light is behind the ridge at frame ${frame}`)
  }

  // Positive control: an unclamped extreme really would be out of range.
  assert.notDeepEqual(clampAngles({ azimuth: 180, elevation: -40 }), { azimuth: 180, elevation: -40 })
})

test('cursor authority is 0.75 while present and decays to zero over 2000ms', () => {
  assert.equal(cursorAuthority({ x: 0.2, y: -0.1, sinceLeaveMs: 0 }), CURSOR_AUTHORITY)
  assert.equal(cursorAuthority({ x: null, y: null, sinceLeaveMs: CURSOR_DECAY_MS }), 0)
  assert.equal(cursorAuthority({ x: null, y: null, sinceLeaveMs: CURSOR_DECAY_MS * 2 }), 0)

  const half = cursorAuthority({ x: null, y: null, sinceLeaveMs: CURSOR_DECAY_MS / 2 })
  assert.ok(
    Math.abs(half - CURSOR_AUTHORITY / 2) < 1e-9,
    `halfway through the decay authority is ${half}, not half of ${CURSOR_AUTHORITY} — ` +
      '§7.2 says "decaying to 0 over 2000ms" and nothing more, so it is linear',
  )
})

test('the light springs toward the cursor rather than snapping', () => {
  /*
   * §7.2 calls the spring constant the most important tuning number on the
   * site. Its *value* is a VIS judgement tuned by feel against the real
   * geometry; what is assertable is that a spring is there at all — a pointer
   * that jumps must not move the light the whole way in one frame.
   */
  const start = { azimuth: -38, elevation: 22 }
  const cursor = { x: 1, y: -1, sinceLeaveMs: 0 }

  const after = stepLight(start, 0, cursor)
  const wanted = stepLight(after, 0, cursor)

  assert.notDeepEqual(after, start, 'the light did not move at all')
  assert.ok(
    Math.abs(after.azimuth - start.azimuth) < Math.abs(wanted.azimuth - start.azimuth) * 2,
    'the light reached its target in one frame — that is a snap, not a spring',
  )
})
