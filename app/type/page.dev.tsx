/*
 * SITE-003 · Typeface comparison harness.
 *
 * "A comparison route renders the hero headline in both faces at display
 * scale, side by side" (SITE-003 accept). PRD §14 and §23 item 3 both require
 * the decision to be made on real display-scale type rather than from
 * description, which is what this route exists to make possible.
 *
 * `page.dev.tsx`, so `/type` exists under `npm run dev` and is never built
 * into the export — the same treatment as `/tokens`, for the same reason, and
 * one stronger: this route imports both candidate faces, and a production
 * build that loaded one of them would have decided the open question by
 * accident.
 *
 * The specimen is not the hero headline. SITE-007 owns that copy and it is
 * not written; §15.4 puts the copy pass with Kian. So the specimen is the
 * PRD's own north-star sentence, at the headline's size and treatment, and it
 * is labelled as a specimen on the page. Real text at display scale is what
 * §14 asks to be judged; inventing a headline here would both pre-empt
 * SITE-007 and put unapproved copy in the tree.
 */

import './fonts.css'
import FontPresence from './font-presence'

/** The two candidates named in §14. Nothing else in the tree names a family. */
const CANDIDATES = [
  {
    name: 'PP Neue Montreal',
    stack: "'PP Neue Montreal'",
    licence: 'Licensed — Pangram Pangram, per-domain webfont licence.',
  },
  {
    name: 'Satoshi',
    stack: "'Satoshi'",
    licence: 'Free — Fontshare / Indian Type Foundry.',
  },
] as const

/*
 * PRD §1, verbatim. Judged at display scale, this exercises what actually
 * decides the choice at 140px: the descenders, the double-l, the ligature
 * pressure in "fl", and how much the -0.04em tracking closes up.
 */
const SPECIMEN = 'A messy human goal becomes executable structure.'

/*
 * §14's Treatment column, spelled out so the harness shows what it is
 * applying. Display is absent from this list on purpose: the specimen above
 * is already at display scale, and repeating it here would put the same line
 * twice at the same size, which reads as a rendering bug rather than as a
 * scale.
 */
const ROLES = [
  { role: 'Section head', spec: 'clamp(32px, 5vw, 88px) · 500 · −0.035em', cls: 'text-section' },
  { role: 'Lead', spec: '18–22px · 400 · bone-60', cls: 'text-lead text-bone-60' },
  { role: 'Body', spec: '16–17px · 400 · max 62ch', cls: 'text-body' },
] as const

export default function TypeComparison() {
  return (
    <main className="px-4 py-12 sm:px-8">
      <header className="max-w-measure">
        <p className="metadata">SITE-003 · PRD §14 · decision route</p>
        <h1 className="mt-4 text-section">Typeface comparison</h1>
        <p className="mt-4 text-lead text-bone-60">
          Both candidates at display scale, side by side. The decision is made here, on
          the type, and recorded in CLAUDE.md §12 — not from description.
        </p>
      </header>

      <FontPresence families={CANDIDATES.map((c) => c.name)} />

      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        {CANDIDATES.map((c) => (
          /*
           * The column applies the face with `font-family` directly, not by
           * setting `--font-candidate`. A custom property substitutes at the
           * element that declares it: `--font-display` resolves once on
           * `:root`, and descendants inherit that resolved value, so setting
           * `--font-candidate` here would change nothing. `--font-candidate`
           * is the seam the *decision* lands on, set once on `:root`; this is
           * a side-by-side, which the cascade cannot express through one
           * variable.
           */
          <article key={c.name} style={{ fontFamily: `${c.stack}, var(--font-system)` }}>
            <p className="metadata">{c.name}</p>
            <p className="mt-1 metadata">{c.licence}</p>
            <p className="mt-4 metadata">Display · clamp(40px, 8vw, 140px) · 500 · −0.04em</p>
            <p className="mt-4 text-display">{SPECIMEN}</p>
            <div className="mt-10 border-t border-edge pt-6">
              {ROLES.map((r) => (
                <div key={r.role} className="mt-6 first:mt-0">
                  <p className="metadata">
                    {r.role} · {r.spec}
                  </p>
                  <p className={`mt-2 ${r.cls} max-w-measure`}>{SPECIMEN}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="mt-16 max-w-measure border-t border-edge pt-6">
        <p className="metadata">Specimen</p>
        <p className="mt-2 text-body text-bone-60">
          The specimen is PRD §1&rsquo;s north-star sentence, not the hero headline.
          SITE-007 owns that copy and it is unwritten; §15.4 puts the copy pass with
          Kian. Judging a face needs real text at real size, which this is — it is not
          standing in for the headline.
        </p>
      </footer>
    </main>
  )
}
