'use client'

/*
 * SITE-003 · Whether the candidate faces are actually loaded.
 *
 * Two columns rendering identically can mean "these faces are very alike" or
 * "neither file is present and both fell back". Those are opposite readings of
 * the same picture, and the decision this route exists for cannot survive the
 * confusion. So the page reports which families the browser actually has
 * rather than asserting it in prose that goes stale the moment the files land.
 *
 * Dev-only, like the route that imports it. No spinner and no waiting state:
 * it renders its unresolved answer complete and empty at t=0 and fills when
 * the font set settles (DS-10 is about the builder, but the shape is the house
 * style and costs nothing to keep here).
 */

import { useEffect, useState } from 'react'

export default function FontPresence({ families }: { families: readonly string[] }) {
  const [loaded, setLoaded] = useState<readonly string[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const check = () => {
      if (cancelled) return
      setLoaded(families.filter((f) => document.fonts.check(`500 140px "${f}"`)))
    }
    document.fonts.ready.then(check, check)
    return () => {
      cancelled = true
    }
  }, [families])

  const missing = loaded === null ? [] : families.filter((f) => !loaded.includes(f))

  return (
    <p className="mt-8 metadata">
      {loaded === null
        ? 'Font presence — checking'
        : missing.length === 0
          ? `Font presence — both candidates loaded. This is a real comparison.`
          : `Font presence — not loaded: ${missing.join(', ')}. Those columns are the system fallback, so this is not yet a comparison. See docs/typeface-decision.md.`}
    </p>
  )
}
