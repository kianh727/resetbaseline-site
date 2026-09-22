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

---

## The comparison run, 2026-09-19 — criteria, not a verdict

**Asked for:** run the comparison against whatever stand-ins are available and report **what the decision actually turns on at display scale**, with the instruction that if it cannot be decided without the real files, say so and stop.

**It cannot be decided without the real files, and the reason is concrete.** What follows is the measurement that establishes why, and the criteria it produced.

### What was measured

Four faces available on this machine, none in the candidates' register — Liberation Sans, DejaVu Sans, FreeSans, Bitstream Charter — rendered at **115.2px**, which is §14's display clamp evaluated at 1440px, in a 900px frame.

| face | cap % of frame | cap / size | x / cap | set width | lines @18ch | ink ÷ line box | size for 12% cap |
|---|---|---|---|---|---|---|---|
| Liberation Sans | 8.89% | 0.694 | 0.762 | 18.64 | 2 | **1.010** | 156px |
| DejaVu Sans | 9.44% | 0.738 | 0.753 | 21.09 | 2 | **1.057** | 146px |
| FreeSans | 9.33% | 0.729 | 0.714 | 18.13 | 2 | **1.038** | 148px |
| Bitstream Charter | 8.33% | 0.651 | 0.707 | 16.92 | 2 | 0.991 | 166px |

### The five criteria, ranked by how much they separate faces

1. **Ink height against the 0.92 line box — and this is the decisive one.** Line height 0.92 is *below* 1.0, so any face whose ascender-plus-descender exceeds the line box **collides between lines**. **Three of the four measured faces exceed it**, by up to 5.7%. The H1 sets on two lines, so a collision is visible in the most prominent element on the site. SITE-003 chose 0.92 deliberately — the browser's 1.5 on a 140px headline contradicts *"density against scale"* outright — but chose it **without either candidate's vertical metrics**, which are what decide whether 0.92 is tight or broken. This is **pass/fail, face-specific, and impossible to judge from description.**

2. **Cap-height ratio.** 0.651 to 0.738 across four faces — a **13% spread**. Two faces set at the same px are not the same optical size. This is why *"display type at its clamp ceiling"* is not a statement about a number until the face is known.

3. **Set width.** 16.92 to 21.09 em for the same headline — a **25% spread**. It decides the line count inside `max-w-[18ch]`, which is a **layout** outcome, not a preference. All four land on two lines here; a face 15% wider than the widest measured would not.

4. **x-height over cap-height.** 0.707 to 0.762. At display scale this is what makes type read dense or airy, and *"density against scale"* is the whole of §14's intent.

5. **Tracking response at −0.04em.** At 115.2px that is −4.6px per pair. Whether it tightens or closes counters depends on default sidebearings, which vary independently of everything above — so it cannot be predicted from the other four.

### A finding that is not about the typeface

**No measured face reaches 12% cap height at §14's rendered size, and none reaches it at the clamp ceiling either.** The required font size is **146–166px**, against a ceiling of **140px**. At the ceiling, cap height lands at **10.8–11.5%** of a 900px frame.

So the 12% figure and §14's clamp do not currently meet. That is recorded here because it surfaced during this run; **it is a §14 question, not a typeface one**, and it is reported rather than resolved.

### Why no verdict

Criterion 1 is pass/fail and face-specific. Criteria 2 and 3 change the layout rather than the look. **A face judged from memory is §0.1's failure mode exactly**, and a face judged from a stand-in is the same failure with a measurement attached to make it look like evidence.

**What landing the decision needs:** the four `.woff2` files in `public/fonts/`, a run of this same table with both candidates in it, and a look at `/type` at 1440px and 375px. The harness, the metadata primitive and the `--font-candidate` seam are all built and waiting.

---

## The procedure — run this first when the files arrive

**Recorded 2026-09-19 so it is executed rather than rediscovered.** The 0.92 collision is a pass/fail that would otherwise be found by looking at a broken hero, which is the expensive way to find it.

### 0. Before anything

Drop the four `.woff2` files into `public/fonts/` and set `--font-candidate`. **Do not look at the page yet.** The first measurement is numeric, and an opinion formed before it is an opinion the numbers then have to argue with.

### 1. The collision check — run this before any judgement

For each candidate, at the display size §11.4's clamp produces at 1440px:

```
ink   = actualBoundingBoxAscent('Hbdfhkl') + actualBoundingBoxDescent('gjpqy')
box   = fontSize * 0.92
ratio = ink / box
```

**`ratio > 1.0` means the H1's two lines collide.** Three of four stand-ins measured 1.010 – 1.057, so this is not a hypothetical.

If a candidate fails: **the line height is the thing that moves, not the candidate.** 0.92 was set by SITE-003 against the browser's 1.5, without either face's vertical metrics; it was a correction of a default, not a measurement of these faces. Record the smallest line height that clears the ink for each candidate, and note that the two candidates may need different values — which is itself a finding, because §11.4's table gives one number for the role.

### 2. The four comparison measurements

Run the same table as the 2026-09-19 stand-in run, with both candidates in it:

| | what it decides |
|---|---|
| `cap / size` | the optical size at a given px — two faces at 140px are not the same size |
| `x-height / cap` | whether display type reads dense or airy; §11.4's *"density against scale"* |
| set width of the H1, in em | the line count inside `max-w-[18ch]` — a **layout** outcome |
| advance change at `-0.04em` | whether the tracking tightens or closes counters, which sidebearings decide |

**Set width is the one that can force a redesign rather than a preference**: a candidate 15% wider than the widest stand-in measured takes the headline to three lines, and the fold was composed for two.

### 3. Then, and only then, look

`/type` at **1440px and 375px**, both candidates, real text at display scale. The harness already reports which families the browser actually loaded — check that line first, because two identical columns read as *"these faces are alike"* when the truth is *"neither file is present."*

### 4. Record

The choice, and **which of the four measurements decided it.** A verdict with no measurement attached is the thing §0.1 exists to prevent, and it is indistinguishable a month later from a preference.

### What must not happen

- **No verdict from a substitute.** The 2026-09-19 run used stand-ins deliberately, to find *which properties discriminate* — not to pick. A measurement attached to the wrong face makes a guess look like evidence.
- **No verdict from the licence cost.** It is the one axis decidable without the files and it is not the axis §11.4 names.
