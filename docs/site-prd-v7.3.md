# Baseline Site — v7.3 PRD

**Authoritative. Replaces v7.2; delete v5, v6, v7, v7.1, v7.2.**

v7.3 is v7.2 with §2 and §3 rewritten against the capture report, §3 "What it won't do" promoted to P0, and the ban list given a boundary for V1-but-unbuilt capabilities.

---

## 0. The launch-state principle

### 0.1 The rule

**Every claim the site makes must trace to a capability that works, verified on a device, not to a line in the app PRD.**

The app PRD's V1 inventory is a *specification*. The site launches against a *build state*. They converge if the work lands, and until it does, anything written from the inventory is a claim about a product that may not ship.

This is not caution. It is the same rule as the §10 ban list — which stops the site promising V1.1 and V2 features — applied to the axis that actually bites: **features that are in V1 and not yet built.**

### 0.2 How v7 and v7.1 got this wrong

§2's six moments were written from the app PRD's §9 scope list. The capture report established that **five of the six describe behavior the app cannot currently perform:**

| Surface | Finding |
|---|---|
| Gate interception | **Blocking happens.** The screen is iOS's default system shield — no `ShieldConfigurationExtension` target exists. |
| Own-words gate coach | **Does not exist.** No target. The user's stated reason has nowhere to render. Unfiled until the capture report. |
| Agent conversational resolution | The agent route retrieves **no entity ids** (`context.ts` returns `NOTHING_RETRIEVED` for `explicit_user_directive`), so validator stage 6 refuses every action naming an existing entity. BAS-93 unbuilt; the retrieval gap under it is Urgent. |
| Intervention proposals | **No job handler has ever executed in production** (BAS-215). |
| Occurrence generation | **Job-queue work.** A commitment produces the commitment and the recurrence and **zero occurrences** — and post-BAS-213 it returns 200, so the user is told it worked. |

Six of seven surfaces render. Five depend on a worker that has never executed.

All of it passed every review in this document's history because the check being run was *"does the app PRD specify this,"* and the answer was yes.

**The distinction that governs what survives:** a moment's *claim* and its *asset* can fail separately. The apps really do go quiet — Screen Time, on-device, working — so that claim survives. What doesn't exist is a Baseline-designed interception, and the default shield is Apple's UI; screenshotting it would present Apple's design as ours.

A site assembled from what draws on device would be accurate about pixels and wrong about the product.

### 0.3 The shared failure mode

The app session found the identical mechanism in the codebase the same day: an acceptance criterion that closed green because **it was satisfiable by the absence of the thing being built.** An assembler fed nothing orders nothing deterministically, fits every budget, and passes all three clauses.

Generalised: **a criterion satisfiable by the absence of the thing it measures is measuring the container.**

The site's own artifacts are exposed. `SITE-EVAL-021`'s *"all validate"* passes on zero requests. `SITE-EVAL-027`'s *"each demonstrates its assigned behavior"* passes if the assertion is presence-of-render rather than presence-of-behavior. **Standing rule at §12.4.**

### 0.4 Consequences applied in this document

- **§2 is no longer a day.** It becomes a dated status section — §3 below.
- **"What's underneath" is cut**, not held. Its survivors are stated better in §2 and §3.
- **§3 "What it won't do" promotes P1 → P0.** It needs no runtime and cannot regress.
- **§4 "What Baseline knows" stays P1, gated.**
- **The ban list gains a boundary** for V1-but-unbuilt content (§10).
- **DS-18 gains two clauses** for roadmap entries and status freshness.

---

## 1. North star

```
messy human goal → Baseline visibly understands it → converts it into executable
structure → that becomes a real plan → the visitor tunes it → Baseline protects
execution → the visitor attempts activation → honest app boundary → conversion
```

20–30 seconds, no account, no scroll, no backend dependency.

> **The builder is the hero. The website is the product's home.**
> When the builder and the Peak conflict, the builder wins.
> **When the site and the build state conflict, the build state wins.**

---

## 2. Information architecture

| § | Section | Job | Phase |
|---|---|---|---|
| 1 | Hero + builder | Value prop above the fold in 30s | P0 |
| 2 | **Where Baseline is right now** | What the beta is, dated | P0 |
| 3 | **What it won't do** | The refusals — promoted from P1 | P0 |
| 4 | What Baseline knows | **P1, gated** — §15.1 | P1 |
| 5 | Day 1 → Day 30 | Retention | P1 |
| 6 | Method | Four principles, collapsed | P1 |
| 7 | Pricing | Free beta, paid at launch | P0 |
| 8 | FAQ | Twelve questions | P0 |
| 9 | Who's building this | Trust | P0 |
| 10 | Join | Conversion | P0 |
| 11 | Footer | Real footer | P0 |

Routes: `/` · `/pricing` · `/faq` · `/privacy` · `/terms`

---

## 3. §2 — "Where Baseline is right now"

### 3.1 Why this and not a day

§2 cannot be "a day, from the inside." One true moment is not a day, and stretching two into six is how the section got written wrong the first time.

The mismatch is deeper than the moment count. **The site's CTA is *join a free private beta*. The visitor's decision is "do I want in on this early."** §2 was answering a different question — is this product good — with material that only exists if the answer to that is already yes. A section describing a finished product sits wrong on a page recruiting for an unfinished one.

Three properties make this the right answer rather than a retreat:

1. **It cannot overclaim.** A status statement carries a date and is updated; it is true when written and stays true. A capability claim goes false silently.
2. **It matches the CTA.** Nothing else on the page tells someone what joining early means.
3. **Held content becomes the section instead of being hidden.** The moments cut from v7.2 are honest, specific and interesting as roadmap — and for an audience that builds systems for itself, a builder being straight about edges reads as competence.

It also does not describe the builder again. The builder shows what happens to a goal; §2 shows what the product is right now.

### 3.2 Structure

Three blocks, hairline-ruled, technical-drawing metadata. **No screenshots.** No device frames. A dated line at the top of the section, 11px metadata.

**Block 1 — What works today**

> It doesn't wake you up to tell you about your day. No morning briefing, no daily check-in, no notification asking how you're feeling. That isn't a feature we haven't gotten to — it's the design.
>
> You tell it what you want, in a sentence, and it builds the commitment and the schedule underneath it.
>
> At the time you set, the apps you named go quiet. Real blocking, through Screen Time, on your phone.
>
> There are no streaks, no scores, and no completeness meters. Nothing to break and nothing to fill.

Four claims, every one true today. The first and fourth are true **by absence** and cannot regress.

**Block 2 — What we're building next**

> **The interception screen** — when you reach for a blocked app, showing you the reason you wrote, in your words. The blocking works; this screen doesn't exist yet.
> **Occurrence generation** — so a commitment produces the actual days it's made of.
> **Conversational resolution** — mentioning that you finished something, and having it count.
> **Proposals** — when it notices a pattern worth one question.
> **What Baseline knows** — the model it builds of you, visible and editable.

Five entries. Each is a V1-specified capability with an owning issue. **No dates, no "soon," no quarters.**

**Block 3 — What you'd be joining**

> The beta is free and small. You'd be using something that's honest about its own edges, and you'd have a say in what lands next.

### 3.3 Rules

- **Dated, and updated in the same commit as any change to what's true.** A stale status section is worse than no status section.
- **No screenshots anywhere in §2.** The default shield is Apple's design; presenting it as Baseline's is the exact error this section exists to prevent.
- Block 2 entries are a capability name and one clause. Not features, not benefits, not copy.
- **Block 2 shrinks as things land.** An entry moves to Block 1 when it passes DS-18. The section improves by itself.
- No apology tone. This is a status report from people who know what they're building, not a disclaimer.

### 3.4 Connective line from the wall

> You just built one. Here's where Baseline actually is.

---

## 4. §3 — "What it won't do" — promoted to P0

The rebalance that makes this a website rather than a thin one.

§3 needs **no runtime**. No streaks, no completeness meters, no shame framing, silence is never failure — true today by the absence of the mechanisms, all on the app PRD's explicit-cut list, and the most differentiating content on the site. **It cannot regress and it cannot be wrong.**

With "What's underneath" cut, P0's explanatory weight falls on §2, §3, and the FAQ. Leaving §3 at P1 would have left a hole exactly where the strongest true content was sitting.

> **No streaks.**
> A streak makes one bad Tuesday cost you three weeks. We don't keep them.
>
> **No completeness meters.**
> There is no percentage. There is no bar to fill.
>
> **Silence is never failure.**
> If Baseline doesn't know whether you did something, it records that it doesn't know. It will not guess, and it will not call it a miss.
>
> **It refuses what it shouldn't guess at.**
> Injury, medical, legal, financial — it builds the path to real help instead of inventing an answer.

Full-bleed, near-black, type at maximum scale, `--veto` accent. The memorable screen; spend the boldness here.

**"Silence is never failure" carries a nuance worth holding.** The *absence of punishment* is true today. The *unknown state itself* requires occurrences, which are job work. The copy above is written so it stays true either way — it describes what Baseline won't do, not what it records.

### 4.1 What was cut, and where it went

"What's underneath" is deleted, not held. The audit left it with two or three defensible rows, and three rows is not a section. Its survivors:

| Row | Disposition |
|---|---|
| It builds structure, not a list | **Falls.** Its proof claimed ten dated occurrences; generation is job work. The builder already demonstrates the structure — restating it was duplication. |
| It protects the work | §2 Block 1, line 3 |
| It never punishes silence | §2 Block 1, line 4, and §3 in full |
| It decides when to speak | §2 Block 2 — *Proposals* |
| It infers instead of asking | §2 Block 2 — *Conversational resolution* |
| It won't let goals eat each other | **Held.** Needs a DS-18 verdict; the veto may be creation-time. If verified, it becomes a fifth line in Block 1. |
| It refuses what it shouldn't guess | §3, above |

---

## 5. §4 — "What Baseline knows" — P1, gated

The strongest differentiator in the product and it does not launch yet.

Beliefs require accumulated history. The alpha database has one real `app_user` (BAS-240) and the belief pipeline depends on job handlers that have never executed (BAS-215). A section describing a model of the user, on a product where no model has ever been built, is exactly what §0 exists to stop.

**Fully specified and held:**

```
WHAT BASELINE KNOWS

  You finish things in the morning or you don't finish them.      pattern
  Deadlines move you more than schedules do.                      pattern
  You said 6am. You have never once made 6am.                     observed

  ────────────────────────────────────────────────────────────
  Every line is yours to edit or delete. Nothing here was
  inferred from anywhere except what you told it and what
  it watched you do.
```

**The third line ships exactly as written when it ships.** The discomfort is the proof it isn't flattering the user.

It needs **no screenshot** — the section is typographic with authored example lines, and its own rules already say *editability stated, not demonstrated* and *site-side beliefs are authored examples, never real data*. What it needs is a reachability verdict.

**Gate for promotion to P0:** belief accumulation demonstrably working on a real account — at minimum `belief.created` firing in production and the surface rendering non-empty for a user who isn't Kian.

Rules on ship: three lines max · real `belief_tier` labels (`hypothesis · pattern · observed_fact`) · **no confidence numbers** · **nothing keyed by `sensitivity_class`** — `c3s` is forbidden from external context and a marketing site is external context.

Until then it appears only as a Block 2 roadmap entry (§3.2).

---

## 6. The builder

### 6.1 Beats and timing

Transformation block renders complete and empty at t=0. Deterministic classification and deadline parse land in ~40ms. Generation runs in parallel with a **4000ms hard timeout**. Route 450ms, occurrences 600ms, **interruptible**. Tune enabled the moment recurrence exists.

System time to tunable plan: **p50 ~2.2s, p95 ~4.6s.**

**The builder is unaffected by §0.** It runs entirely on the site — deterministic parsing, a site-local `/api/plan`, and client-side recurrence math. It demonstrates *what the app does with a goal*, and that transformation is specified, deterministic, and independent of the app's runtime state. **That is why the builder is the hero and the sections are not.**

**One boundary the capture report makes load-bearing.** The builder's occurrence fan-out is site-side math. The app does not currently generate occurrences. The builder may show the structure a commitment implies; **no copy anywhere may state that the app produces those occurrences today.** That claim lives in §2 Block 2 until it passes DS-18.

### 6.2 Plan model — derived, not hand-listed

Handles every `capability_type` the contracts define — exactly five: `commitment · reminder · timer · gate · tracker`. Generated from `contracts-manifest.json` (§6.6) with a layout rule per type. **A type without a layout rule fails the build.**

### 6.3 Vocabulary the site renders — closed list

| Axis | Values |
|---|---|
| `capability_type` | `commitment · reminder · timer · gate · tracker` |
| `authority_tier` | `auto · provisional · explicit` |
| Outcome (recorded) | `complete · partial · missed · cancelled_intentionally · unknown` |
| `belief_tier` | `hypothesis · pattern · observed_fact` |

**`rescheduled`** is a **derived display value**, not a stored outcome and not an action outcome. Nothing writes it; `displayOutcome` derives it when an occurrence is `pending` and was moved, and a resolution always wins — moved then completed is `complete`. The site **may** describe it as a state a user sees. It **must not** list it alongside the five resolvable values as something the system records.

**Banned entirely:** `AuthorityDecision` values (`execute · confirm · forbidden`) — rendering them alongside `provisional` puts two meanings of one word on the page · `pending` · `sensitivity_class` values and anything keyed by them · reason codes, validation errors, internal event names · user-visible confidence numbers.

### 6.4 Input handling

Seven deterministic classes, pre-generation, so garbage never reaches `/api/plan`: `empty · unreadable · out_of_scope · vague · multi_goal · bounded · actionable`.

**The clarification beat** — `vague` input gets one question, three tap answers plus free text, then builds. Never more than one per session; never blocks past 8s. This is the site's only demonstration of *it asks once*.

All response copy authored. All classification deterministic.

### 6.5 Determinism

The LLM's entire output surface is **one commitment title (≤48 chars) and one execution window from a closed set.**

### 6.6 Contracts manifest and drift detection

`CONTRACT_MANIFEST` committed as JSON with `captured_at` and the app commit SHA; types generated from it at build time.

**Primary mechanism:** app repo CI writes the manifest to a stable path on `main`; site CI fetches and diffs; any divergence fails the site build. This is an app-repo change of roughly five lines.

**Fallback:** staleness against `captured_at` — warn at 30 days, fail at 60.

**Rejected:** cross-repo build. Needs an app-repo token, couples build times, breaks on app dependency changes.

**Nothing generated may read `artifact_divergences`** — it records stale counts (33, 72) against current counts (45, 76) in the same object.

---

## 7. §7 — Pricing

> **Baseline is paid at launch. Beta access is free.**
>
> Everyone on the waitlist gets the beta at no cost. When it ships it's a paid app — trial, no free tier. We'd rather charge for something that works than farm attention with something that doesn't.
>
> Pricing is announced before launch. The waitlist hears first.

```ts
type PricingState = 'free_beta' | 'announced'
```

Both branches built in P0; `free_beta` launches.

---

## 8. §8 — FAQ

Twelve questions, plain answers under 60 words, accordion with all answers in the DOM.

1. What is Baseline, in one sentence?
2. What platforms? — *iPhone at launch. Android is not committed.*
3. What does it need access to? — *Screen Time for gates. Notifications. Sign in with Apple. Nothing else.*
4. Does it read my calendar, email, or health data? — **No. No connectors at launch.**
5. What does it cost? — *Nothing during beta. Paid when it ships — trial, no free tier.*
6. Is there a free version? — *The beta is free. The shipping product isn't.*
7. What happens to what I type on this page?
8. Can it actually block apps? — *On the phone, yes. In a browser, no — which is why this site stops where it does.*
9. What if I miss days? — *Nothing. No streaks, no score, no catch-up.*
10. What does it know about me, and can I see it? — **Held with §4.** Restore when §4 promotes.
11. How is this different from asking ChatGPT to plan my week?
12. Can I get my data out? — *Export and delete, both at launch.*

**Every answer describing app behavior carries a DS-18 verdict.** Question 12 in particular — export and delete must be verified working, not read off the inventory. Question 8's answer is true today; question 3's permission list must be verified against what the app actually requests.

Question 4 must be an unqualified no.

---

## 9. §9 and §11 — Company and footer

> **Baseline is built by two people.**
> Kian — product and design. Shayan — engineering.
> We built it because we kept rebuilding the same scaffolding for ourselves every few months and got tired of being the thing holding it together.
>
> `hello@resetbaseline.com`

Real names, real email. **No social proof until it's real.**

**Footer:** Product (Where Baseline is · Pricing · FAQ) · Company (Who's building this · email) · Legal (Privacy · Terms). Status line: *Private beta, free · iPhone · no connectors.*

---

## 10. Bans

All v5 §19 bans stand.

**Cut in the app, therefore banned here:** streaks · XP, badges, levels, leaderboards · life score · loss-aversion or shame framing · financial stakes · habit scorecards · standalone mood tracking · AI-therapist positioning · task-manager framing · calendar client · week/month views · user-facing rule builder · user-visible confidence numbers · progress or completeness meters · feature carousels · tutorial overlays · sample data.

**Not in V1:** HealthKit · Planner timeline · Live Activity · Calendar · lock-screen widget · MCP or external AI context · geofencing · social accountability · Android · **any connector** · Shortcuts · web app · B2B.

**In V1 but not yet built** — these may appear **only** in §2 Block 2, only as a capability name with one clause, only with an owning issue, and **never with a date, a quarter, or the word "soon."** They may not appear in the hero, the FAQ, §3, the share card, metadata, or any copy that reads as a present-tense capability.

An entry leaves Block 2 by passing DS-18 and moving to Block 1. It never leaves because someone decides it's close.

**Post-V1 tiers — V1.1, V2, Later — remain banned outright, including from Block 2.** V1 work is what the beta is becoming; V1.1 and beyond are not what anyone is joining.

**Site-specific:** no connector logos or integration strip · the site must not read as a web version of the app · nothing generated may read `artifact_divergences` · **no screenshot of iOS's default system shield, or any other Apple-supplied UI, presented as Baseline's.**

---

## 11. Carried forward unchanged

**The Peak** (v5 §7, P1) · **Motion** (v5 §8) · **Type and tokens** (v5 §14) · **Mobile** (v5 §9) · **Degradation** (v5 §15, the builder never degrades) · **Providers** (v5 §12) · **The wall** (v5 §11) · **Scope-kill rules** K-1…K-8.

| Metric | Ceiling |
|---|---|
| LCP, mobile 4G | 1.8s |
| CLS | 0.05 |
| INP | 200ms |
| Core bundle, gzip | 145 KB |
| Scene bundle, gzip, lazy | 140 KB, excluded |
| `/api/plan` timeout | 4000ms hard |
| Lighthouse mobile | ≥ 90 |

---

## 12. Quality gates

### 12.1 Demo success criteria

DS-1…DS-17 stand. New:

**DS-18 · No claim without a working capability.** Every §2 Block 1 line, §3 line, and FAQ answer describing app behavior traces to a capability verified working on a device — recorded verdict, dated, naming the verifying issue. **A PRD line is not evidence.**

**DS-18a · Roadmap entries.** §2 Block 2 entries are exempt from the working-capability requirement — stating that something isn't built is not a claim that it is. They carry their own requirement: each names a real owning issue, states no date, and sits only in Block 2. An entry with no issue is a wish and does not ship.

**DS-18b · The status section is dated and current.** §2 carries a visible date. Any change to what is true moves the relevant line between blocks **in the same commit as the change**. A status section that has gone stale fails this gate outright.

### 12.2 Product understanding

- **Q1** *"What do you think Baseline does?"* — 3 of 4 concepts
- **Q2** *"What would using it day to day be like?"* — 2 of 4
- **Q3** *"Does it know anything about you? Could you see that?"* — **held with §4.** Reinstated when §4 promotes.
- **Q4 · new** *"Is this finished?"* — a passing answer recognises it's an early beta with things still being built. **A participant who thinks the product is complete means §2 failed**, and that is a comprehension failure in the safer direction than the reverse, but still a failure.

Thresholds: 5/6 wall · 4/6 tune · 5/6 on each live question.

### 12.3 Engineering

v5 §18.2 in full, plus: every user-visible label traces to §6.3 · the drift check fails on divergence · input classification is deterministic and pre-generation · pricing renders both states by config · no section references anything on §10's lists · no Apple-supplied UI appears as Baseline's.

### 12.4 No criterion satisfiable by absence — standing

Every automated eval must **fail on an empty implementation.** Before an eval is accepted, it is run against a stub that does nothing. If it passes, it is measuring the container and must be rewritten.

Known exposure to audit first: **SITE-EVAL-021** (*"all validate"* passes on zero requests) · **SITE-EVAL-027** (*"each demonstrates its assigned behavior"* passes if the assertion is presence-of-render) · **SITE-EVAL-037** (event sequence assertion passes if no events are expected).

**This audit runs before the eval suite is trusted for anything, including SITE-085's design review gate.**

This rule exists because the same failure was found in the app's own acceptance criteria the same day it was written. It is not hypothetical.

---

## 13. Build order

**P0** — scaffold → tokens/type → contracts manifest + generated model + drift CI → plan model → `PlanLayout` → `FlatLayout` → occurrence generator → transformation block → input classification + clarification beat → providers → generation + fallback → tune → protect → wall → capture → share card → analytics → mobile → failure sweep

**and in parallel after tokens:** §2 status section → §3 What it won't do → §7 Pricing → §8 FAQ → §9 About → §11 Footer → legal, metadata, OG

**Gate:** DS-1…DS-18b, then the six-user study (Q1, Q2, Q4)

**P1** — Peak · §4 What Baseline knows when §15.1 clears · §5 Day 1→30 · §6 Method · performance and degradation

**P2** — aberration · edge catch · hidden B · seven-station choreography · live tier demotion · emailed plan

---

## 14. Prerequisite work

### PRE-1 · Correction pass
**Owner:** site session · **Gate:** blocks the Linear population run

Part A v2 is specified in `pre-1-patch-part-a-v2.md` — items 1, 3, 5, 6, 7 (SP-17), 8 (`CLAUDE.md` §12), 9 (counts pending). **Item 2 is a no-op**, verified.

**SP-17's scope line is updated by this PRD:** it covers §2 "Where Baseline is right now" and §3 "What it won't do", not "A day, from the inside" and "What's underneath".

Part B (item 4) — new issues for §2's three blocks, §3, §7, §8, §9, §11, legal routes, input classification, the clarification beat, held content, DS-18 and §12.4 owning issues, evals for DS-15 through DS-18, SITE-EVAL-070, and a critical-path re-walk. **No longer gated on the capture check, which is complete.** Gated only on Part A v2 being applied.

### PRE-2 · Ban-list copy audit
**Owner:** site session · Automated in CI from P0 onward, failing the build on any §10 banned term; plus a manual pre-launch review, because automation catches terms and not a section that *implies* a capability without naming it.

**Second check, same job: no copy string names an app.** App selections are opaque tokens the app cannot read — an app-PRD MUST. Copy says *"3 apps blocked"* and never names one, because naming one is a claim the product cannot make true. The build fails on any match of a committed app-name list against any authored copy string, site-wide.

Three things this check must get right, each of them a way the constraint fails in practice:

- **It is site-wide, not Gate-scoped.** The failure mode is a later rewrite of a line that reads correctly today. A check that only looks at strings currently near Gate copy does not catch it, and a recorded note catches it even less — which is why this is a CI check rather than a paragraph.
- **The list is committed and versioned**, and adding to it is a copy decision, not a lint tweak. It covers the apps a Gate is plausibly created against and their common short forms and rebrands; a name that becomes checkable only after it appears in copy is a check that already failed once.
- **A match is a failure, never a warning.** The §10 term check fails the build; so does this. An allowlist entry for a legitimate use — the App Store, iOS, Apple as the platform — is written into the list as an explicit exception, not granted by suppressing the check at the call site.

**Open, and not decided here:** where the app-name list comes from. A hand-maintained list in the site repo is the obvious start and the obvious thing to go stale. It is a §9 decision, not a session's.

---

## 15. Open items

### 15.1 Gates on held content

- **§4 promotes to P0** when belief accumulation is demonstrably working on a real account — `belief.created` firing in production, the surface rendering non-empty for someone who isn't Kian. Depends on BAS-215, BAS-240.
- **FAQ 10** restores with §4.
- **"It won't let goals eat each other"** becomes a fifth Block 1 line if the contention veto is verified creation-time.
- **§5 Day 1 → Day 30 needs its own DS-18 verdict at P1.** It describes a plan adapting over thirty days, which needs the same accumulated history §4 needs. Flagged now rather than discovered at P1.
- **Block 2 entries** move to Block 1 individually as each passes DS-18.

### 15.2 Read tasks

- **R-2** — app PRD §14–26 bodies and the onboarding spec. Onboarding matters most: if the site's builder and the app's onboarding diverge in shape, the handoff from wall to first launch feels like two products.
- **Weekly review** — in the V1 inventory, section not located. Needs a DS-18 verdict before appearing anywhere.

### 15.3 Decisions

1. Contracts publication route — registry, committed build output, or submodule. Not blocking (§6.6).
2. `dist/` gitignore — deliberate or incidental? Bears on 1.
3. Terminal action at launch — waitlist, TestFlight, or App Store. All branches built.
4. Typeface — decided at build item 1 on real display-scale type.
5. Cursor spring `0.055` — decided during P1 by feel.
6. Tier B mobile Peak — decided post-launch by conversion data.

### 15.4 Copy pass — Kian

§2's three blocks, §3's four refusals, twelve FAQ answers, §7, §9, and `docs/site-copy/roadmap-source.md`. Specified structure with example text; not final prose.

### 15.5 Two findings for the app, not the site

Surfaced by the capture check, neither a website problem:

- **The own-words gate coach has no target and was unfiled until the capture report.** The app PRD specifies it in V1.
- **Occurrence generation returns 200 while producing zero occurrences.** The user is told it worked. A commitment with no occurrences has no resolution cascade, no resolution card, and no adherence record — that reaches considerably further than this website.

---

## 16. What this costs, stated plainly

The site launches describing a product that blocks apps on a schedule, builds structure from a sentence, and refuses to shame you — and says clearly that the rest is being built.

That is less than v7 promised. It is also the only version that is true, and it is aimed at an audience that will check.
