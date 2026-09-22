/*
 * SITE-004 · Reading the four contract vocabularies out of the manifest.
 *
 * One reader, used by three things that must not disagree about where the
 * vocabulary lives: the type generator, the layout-rule coverage check, and
 * the arrival verification that asserts the four lists are present with counts
 * 5/3/5/3 before anything is built on them.
 *
 * ---
 *
 * **Why the key spellings are candidates and not one guess.**
 *
 * `docs/contracts-manifest-delivery.md` fixes the envelope — `captured_at`,
 * `app_commit_sha`, `manifest` — and nests `CONTRACT_MANIFEST` verbatim under
 * `manifest`. It fixes nothing inside that object, because those keys are the
 * app's and the site does not get to name them. Ruled 2026-09-19: the app adds
 * the object vocabulary; the shape it arrives in is theirs.
 *
 * So each axis carries the spellings it is looked for under, in order, and a
 * miss **fails naming the manifest and listing what was looked for** — the
 * next reader adapts one array entry instead of hunting. That is the same
 * lesson as the delivery spec's own defect: the spec constrained the container
 * and not the contents, and the file arrived exactly as asked and unusable.
 *
 * **Deliberately not a recursive search** for any key that looks right. A scan
 * that finds *a* list of five strings somewhere in the object binds to
 * whichever one it reaches first and then reports coverage against the wrong
 * vocabulary — a check agreeing with itself about the wrong input, which is
 * the §0.3b shape with the search standing in for the derivation.
 *
 * **The expected counts are from PRD §6.3's closed-vocabulary table, written
 * out here rather than read from the manifest.** A count read from the file it
 * is checking cannot disagree with it (§0.3b). They are asserted on arrival
 * and never used to generate anything: the *members* are always the
 * manifest's, only the *arity* is ours, and a disagreement is a stop.
 */

/**
 * The four axes, their candidate key spellings, and the count §6.3 states.
 *
 * `expected` is a precondition on the delivery, not a definition of the axis.
 * If the app's vocabulary legitimately grows, this number is wrong and the
 * arrival check says so loudly — which is the intended outcome, because a
 * vocabulary change is a contract change and should break this build
 * (PRD §6.6, §12.3).
 */
export const AXES = Object.freeze([
  Object.freeze({
    axis: 'capability_type',
    expected: 5,
    keys: Object.freeze(['capability_type', 'capability_types', 'capabilityType', 'capabilityTypes']),
  }),
  Object.freeze({
    axis: 'authority_tier',
    expected: 3,
    keys: Object.freeze(['authority_tier', 'authority_tiers', 'authorityTier', 'authorityTiers']),
  }),
  Object.freeze({
    axis: 'outcome',
    expected: 5,
    keys: Object.freeze(['outcome', 'outcomes', 'recorded_outcome', 'recorded_outcomes']),
  }),
  Object.freeze({
    axis: 'belief_tier',
    expected: 3,
    keys: Object.freeze(['belief_tier', 'belief_tiers', 'beliefTier', 'beliefTiers']),
  }),
])

/**
 * The envelope's nested `CONTRACT_MANIFEST`, or null.
 *
 * @param {unknown} parsed
 * @returns {Record<string, unknown> | null}
 */
export function innerManifest(parsed) {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const inner = /** @type {Record<string, unknown>} */ (parsed).manifest
  if (inner === null || typeof inner !== 'object' || Array.isArray(inner)) return null
  return /** @type {Record<string, unknown>} */ (inner)
}

/**
 * Read one axis. Returns the key it bound to so every message can say which
 * spelling the manifest used, and a pass leaves that visible in its output.
 *
 * @param {unknown} parsed
 * @param {string} axis  one of AXES[].axis
 * @returns {{ ok: true, key: string, values: string[] } | { ok: false, key: string|null, reason: string }}
 */
export function readAxis(parsed, axis) {
  const spec = AXES.find((a) => a.axis === axis)
  if (spec === undefined) throw new Error(`readAxis: ${axis} is not a contract axis.`)

  const inner = innerManifest(parsed)
  if (inner === null) {
    return { ok: false, key: null, reason: 'the envelope has no `manifest` object' }
  }

  const key = spec.keys.find((k) => Object.hasOwn(inner, k)) ?? null
  if (key === null) {
    return {
      ok: false,
      key: null,
      reason: `no ${axis} list — looked for ${spec.keys.join(', ')} inside \`manifest\``,
    }
  }

  const values = inner[key]
  if (!Array.isArray(values)) {
    return { ok: false, key, reason: `\`manifest.${key}\` is not an array` }
  }
  const notStrings = values.filter((v) => typeof v !== 'string')
  if (notStrings.length > 0) {
    return {
      ok: false,
      key,
      reason: `\`manifest.${key}\` holds ${notStrings.length} non-string entr${
        notStrings.length === 1 ? 'y' : 'ies'
      }`,
    }
  }
  if (values.length === 0) {
    return { ok: false, key, reason: `\`manifest.${key}\` is empty` }
  }
  const duplicates = [...new Set(values.filter((v, i) => values.indexOf(v) !== i))]
  if (duplicates.length > 0) {
    return { ok: false, key, reason: `\`manifest.${key}\` repeats ${duplicates.join(', ')}` }
  }

  return { ok: true, key, values: /** @type {string[]} */ ([...values]) }
}

/**
 * The arrival verification, per the instruction of 2026-09-19: **verify the
 * four lists are present with counts 5/3/5/3 before building anything on
 * them, and if any is missing or a count disagrees, stop and report rather
 * than working around it.**
 *
 * The envelope is hand-assembled, so a bad publish is a real possibility and
 * catching one is cheaper than building on it. This returns a report rather
 * than throwing, so the caller can print all four lines instead of the first
 * failure — four separate problems reported one per run is three wasted
 * round trips with a human in the loop.
 *
 * @param {unknown} parsed
 * @returns {{ ok: boolean, lines: string[] }}
 */
export function verifyArrival(parsed) {
  const lines = []
  let ok = true
  for (const { axis, expected } of AXES) {
    const read = readAxis(parsed, axis)
    if (!read.ok) {
      ok = false
      lines.push(`FAIL  ${axis} — ${read.reason}`)
      continue
    }
    if (read.values.length !== expected) {
      ok = false
      lines.push(
        `FAIL  ${axis} — \`manifest.${read.key}\` declares ${read.values.length}, ` +
          `PRD §6.3 states ${expected}: ${read.values.join(', ')}`,
      )
      continue
    }
    lines.push(`ok    ${axis} — ${read.values.length} via \`manifest.${read.key}\`: ${read.values.join(', ')}`)
  }
  return { ok, lines }
}
