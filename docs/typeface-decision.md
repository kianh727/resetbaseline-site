# Typeface — SITE-003

> **Status: undecided, and deliberately so.** This file is the record PRD §23
> item 3 asks for. It is not a canonical artifact and does not sit in the
> precedence order of CLAUDE.md §1; it is the decision log the issue's
> *Verify* line calls for.

## What §14 requires

> **Typeface:** PP Neue Montreal (licensed) or Satoshi (free). Decided at P0
> item 1, compared at display scale.

§23 item 3 repeats it: *"decided at P0 item 1, on real display-scale type."*
The comparison is not advisory. It is how the decision is specified to be
made, and §0.1's launch-state principle says the same thing in general: a
claim traces to something verified, not to something described.

## Why it is still open

Neither candidate's files could be obtained from this session.

- **PP Neue Montreal is commercially licensed.** Pangram Pangram sells a
  per-domain webfont licence. Acquiring it is a purchase, which is not a
  session's call, and `pangrampangram.com` is denied by this environment's
  network policy in any case.
- **Satoshi is free but unreachable.** It is distributed by Fontshare
  (`api.fontshare.com`), which the proxy answers `403` to on `CONNECT` —
  confirmed against the proxy's own status endpoint, which logged both
  denials. It is not published to npm under any name.

So the comparison §14 specifies could not be run. **No substitute face was
rendered in their place, and no verdict was recorded from description.**
Choosing between two faces from memory of what they look like is the exact
failure mode §0.1 names, and it would be indistinguishable in the tree from a
decision actually made on type.

The one axis that *is* decidable without seeing them — licence cost — is not
the axis §14 names, and settling a design decision on the cheaper option while
calling it the compared one would be worse than leaving it open.

## What is built, and what the decision costs to land

Everything except the verdict:

- The §14 type scale, with display and section-head clamps verbatim and lead
  and body interpolated to hit their range endpoints exactly at 375px and
  1440px (`app/globals.css`, asserted by `tests/type.test.mjs`).
- The metadata primitive — 11px, `+0.06em`, `--bone-38` as one named utility.
- `/type`, the side-by-side comparison harness, development-only. It renders
  both columns at display scale and reports which families the browser
  actually loaded, so two identical columns cannot be misread as "the faces
  are alike" when the truth is "neither file is present".
- `app/type/fonts.css`, which already declares both families at 400 and 500.
- `--font-candidate` on `:root`, the single seam either face is applied
  through. Nothing else in the codebase names a family, and a test enforces
  that.

**To land the decision:** put four `.woff2` files in `public/fonts/` —
`pp-neue-montreal-500`, `pp-neue-montreal-400`, `satoshi-500`, `satoshi-400`
(500 is §14's display and section-head weight, 400 is lead and body) — run
`npm run dev`, open `/type` at 1440px and 375px, and set `--font-candidate`.
No other code changes.

Until then the site renders in the system stack. That is not a third candidate
and not a default anybody chose; it is the absence of a decision, visible as
such.
