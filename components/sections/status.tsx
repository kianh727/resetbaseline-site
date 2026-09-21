/*
 * SITE-089…092 · §2 "Where Baseline is right now".
 *
 * Three hairline-ruled blocks, technical-drawing metadata, a dated line at
 * 11px (§3.2). **No screenshots, no device frames, anywhere** — §3.3's reason
 * is that the default shield is Apple's design and presenting it as Baseline's
 * is the exact error this section exists to prevent.
 *
 * **Every sentence here is held and belongs to SITE-109.** See
 * `lib/copy/status.ts`. What this file owns is structure.
 *
 * **The date is a build-time constant** (SITE-089's accept). Nothing here calls
 * `new Date()`, and a test asserts it: a section that dates itself is always
 * fresh and therefore never honest.
 *
 * **Composition, mine, provisional.** Hairline rules between blocks rather than
 * around them — §19 bans identical rounded cards in a row, and three bordered
 * boxes is that ban with the corners squared off. A rule above each block gives
 * the technical-drawing register §3.2 asks for without making three containers.
 * Block headings carry the metadata treatment rather than a type step, which is
 * what makes the section read as a status report rather than as three more
 * marketing sections.
 */

import {
  BLOCK_1_HEADING,
  BLOCK_1_LINES,
  BLOCK_2_ENTRIES,
  BLOCK_2_HEADING,
  BLOCK_3_BODY,
  BLOCK_3_HEADING,
  SECTION_HEADING,
  STATUS_DATE,
} from '@/lib/copy/status'

function Block({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <div style={{ borderTop: '1px solid var(--edge)', paddingTop: 16, paddingBottom: 40 }}>
      <p className="metadata" style={{ margin: 0, paddingBottom: 16 }}>
        {heading}
      </p>
      {children}
    </div>
  )
}

export default function Status() {
  return (
    <section
      id="status"
      aria-labelledby="status-heading"
      className="page-x"
      style={{ paddingTop: 96, paddingBottom: 96 }}
    >
      {/*
        * §3.2: a dated line at the top of the section, 11px metadata. It is the
        * first thing in the section because it qualifies everything after it —
        * a date at the bottom qualifies nothing, it just records.
        */}
      <p className="metadata" style={{ margin: 0 }}>
        Status · {STATUS_DATE}
      </p>

      <h2
        id="status-heading"
        className="text-section"
        style={{ margin: 0, paddingTop: 20, color: 'var(--bone)', maxWidth: '16ch' }}
      >
        {SECTION_HEADING}
      </h2>

      <div style={{ paddingTop: 56 }}>
        <Block heading={BLOCK_1_HEADING}>
          {BLOCK_1_LINES.map((line) => (
            <p
              key={line.slice(0, 32)}
              className="text-body max-w-measure"
              style={{ margin: 0, paddingBottom: 16, color: 'var(--bone-60)' }}
            >
              {line}
            </p>
          ))}
        </Block>

        <Block heading={BLOCK_2_HEADING}>
          {/*
            * §3.2: each entry is a capability name and **one clause**. Not
            * features, not benefits. §10 forbids a date, a quarter or the word
            * "soon" anywhere in here, which is why the clause is data rather
            * than prose someone could extend in place.
            */}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {BLOCK_2_ENTRIES.map((entry) => (
              <li
                key={entry.name}
                className="text-body max-w-measure"
                style={{ paddingBottom: 16, color: 'var(--bone-60)' }}
              >
                <span style={{ color: 'var(--bone)' }}>{entry.name}</span> — {entry.clause}
              </li>
            ))}
          </ul>
        </Block>

        <Block heading={BLOCK_3_HEADING}>
          <p
            className="text-lead max-w-measure"
            style={{ margin: 0, color: 'var(--bone-60)' }}
          >
            {BLOCK_3_BODY}
          </p>
        </Block>
      </div>
    </section>
  )
}
