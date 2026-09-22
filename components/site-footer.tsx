/*
 * SITE-098 · §11 the footer.
 *
 * **This is SP-17's exit criterion.** SITE-098's accept is that all four routes
 * are linked from here and no link is dead, which is why the groups are data in
 * `lib/copy/company.ts` and asserted by `scripts/check-links.mjs` rather than
 * typed into JSX where a fifth link could be added without anything noticing.
 *
 * **No newsletter form** — the site has exactly one capture path (SP-08) and a
 * second one in the footer would be a second write path, which SITE-097's
 * accept forbids by name.
 *
 * **No social icons.** SITE-098's non-goal states the reason and it is worth
 * keeping next to the code: there is nothing to link to, and a dead icon row is
 * social proof that isn't real.
 *
 * The status line is §9 verbatim.
 */

import { FOOTER_GROUPS, FOOTER_STATUS_LINE } from '@/lib/copy/company'

export default function SiteFooter() {
  return (
    <footer
      className="page-x"
      style={{
        borderTop: '1px solid var(--edge)',
        paddingTop: 56,
        // The bottom inset clears the home indicator in portrait.
        paddingBottom: 'calc(56px + var(--safe-bottom))',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          /*
           * A wrapping row rather than a grid with a mobile collapse. At 375px
           * the three groups stack; at 768px they sit side by side. One
           * composition either way — a grid that reflows into a different
           * arrangement is two compositions to review.
           */
          gap: 40,
        }}
      >
        {FOOTER_GROUPS.map((group) => (
          <nav key={group.heading} aria-label={group.heading} style={{ minWidth: 160 }}>
            <p className="metadata" style={{ margin: 0, paddingBottom: 12 }}>
              {group.heading}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {group.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-body"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      // 44px minimum touch target (§9).
                      minHeight: 44,
                      color: 'var(--bone-60)',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="metadata" style={{ margin: 0, paddingTop: 40 }}>
        {FOOTER_STATUS_LINE}
      </p>
    </footer>
  )
}
