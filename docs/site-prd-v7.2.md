# Baseline Site — v7.2 PRD

**Authoritative. Replaces v7.1; archive v5, v6, v7, v7.1.**

v7.2 changes one thing and follows it through: **the site launches against what exists, not what is specified.** That principle is now §0 and governs every other section.

---

## 0. The launch-state principle

### 0.1 The rule

**Every claim the site makes must trace to a capability that works, verified on a device, not to a line in the app PRD.**

The app PRD's V1 inventory is a *specification*. The site launches against a *build state*. They converge if the work lands, and until it does, anything written from the inventory is a claim about a product that may not ship.

This is not caution. It is the same rule as the §10 ban list — which stops the site promising V1.1 and V2 features — applied to the axis that actually bites: **features that are in V1 and not yet built.**

### 0.2 How v7 and v7.1 got this wrong

§2's six moments were written from the app PRD's §9 scope list. Two of them describe behavior the app cannot currently perform:

- **2:15pm** — the agent hears that the intro got finished and marks Tuesday done. Requires resolving a reference to an occurrence. The agent route retrieves **no entity ids at all** (`context.ts` returns `NOTHING_RETRIEVED` for `explicit_user_directive`), so validator stage 6 refuses every action naming an existing entity as `entity_not_in_context`. BAS-93 is unbuilt and the retrieval gap under it is Urgent.
- **6:00pm** — a proposal from an observed pattern. Requires an intervention lifecycle that has fired. BAS-215 records that **no job handler has ever executed in production.**

Both passed every review in this document's history because the check being run was *"does the app PRD specify this,"* and the answer was yes.

### 0.3 The shared failure mode

The app session found the identical mechanism in the codebase the same day: an acceptance criterion that closed green because **it was satisfiable by the absence of the thing being built.** An assembler fed nothing orders nothing deterministically, fits every budget, and passes all three clauses.

Generalised: **a criterion satisfiable by the absence of the thing it measures is measuring the container.**

The site's own artifacts are exposed to this. `SITE-EVAL-021`'s *"all validate"* passes on zero requests. `SITE-EVAL-027`'s *"each demonstrates its assigned behavior"* passes if the assertion is presence-of-render rather than presence-of-behavior.

**Therefore, a standing rule on this project's verification — §12.4.**

### 0.4 Consequences applied in this document

- **§2 drops to three moments** (§3 below). Three reachable beat six including two the app can't do.
- **§3 "What Baseline knows" moves to P1, gated.** Fully specified, does not launch until belief accumulation demonstrably works.
- **§4's seven rows require a per-row reachability audit** before copy is written.
- **New gate DS-18** — no claim without a verified working capability.
- **New verification rule §12.4** — no eval may pass on an empty implementation.

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
| 2 | A day, from the inside | What using it is like — **three moments** | P0 |
| 3 | What's underneath | Capability scan, **reachability-audited** | P0 |
| 4 | **What Baseline knows** | **Moved to P1, gated on §15.1** | P1 |
| 5 | Day 1 → Day 30 | Retention | P1 |
| 6 | What it won't do | The refusals | P1 |
| 7 | Method | Four principles, collapsed | P1 |
| 8 | Pricing | Free beta, paid at launch | P0 |
| 9 | FAQ | Twelve questions | P0 |
| 10 | Who's building this | Trust | P0 |
| 11 | Join | Conversion | P0 |
| 12 | Footer | Real footer | P0 |

Routes: `/` · `/pricing` · `/faq` · `/privacy` · `/terms`

---

## 3. §2 — "A day, from the inside", rebuilt

Three moments. All three sit in the **protection chain**, which is the part of the product that works today — and that turns out to be a better section, not a compromised one, because it tells one coherent story instead of sampling four subsystems.

```
6:40am   Nothing. It doesn't wake you up to tell you about your day.

8:00am   Your block starts. The timer is already running, and the three
         apps you named have gone quiet.
         └─ [gate interception, cropped]

11:40am  You reach for your phone. It shows you the sentence you wrote
         about why this mattered — your words, not ours.
         └─ [own-words screen, cropped]
```

**Why these three:**

- **6:40am** is not a behavior — it's an absence, and absence cannot fail to render. It is also the strongest differentiator on the page, because every competitor's day opens with a notification.
- **8:00am** and **11:40am** are the gate chain: scheduled activation and own-words interception. On-device Screen Time enforcement, not the job queue.

**Still pending the capture report:** BAS-197 records `update_gate` refused 4/4 on a live device. That is *update*, not create-or-activate, so these two are expected to hold — but if the report says otherwise, §2 drops to 6:40am plus one and the section becomes two moments. **Two honest moments still beat six.**

**Conditionally restorable** — written, held, and added only when the report or a later build confirms reachability:

- **9:30pm resolution card** — needs occurrences to exist and their windows to close. Occurrence generation and window closing are job-queue work, and no job handler has executed in production. **Marginal; expect the report to decide it.**
- **2:15pm conversational resolution** — restore when BAS-93 and the retrieval gap land.
- **6:00pm proposal card** — restore when the intervention lifecycle has fired on a real account.

Keep all three drafted in the repo as `docs/site-copy/held-moments.md` so restoring one is an edit, not a rewrite.

**Rules unchanged:** text leads, UI appears as cropped detail never a device mockup · deliberate gaps · hairline rule connecting timestamps · no cards, no icons, no alternating layout.

**Connective line from the wall:**
> You just built one. Here's what the first morning looks like.

*(Changed from "what Tuesday looks like" — a three-moment section that ends at 11:40am shouldn't promise a day.)*

---

## 4. §3 — "What's underneath"

Seven rows, hairline-ruled, no icons, ~130 words, built to be scanned.

**Each row carries a reachability verdict. No row ships without one.** The audit runs with the capture check; rows marked ✗ are held in `docs/site-copy/held-rows.md`, not deleted.

**The verdicts below are predictions, not findings.** They are my expectations written down so the capture check has something to confirm or overturn. **Every one is replaced by a real verdict from that check before any copy is written**, and a prediction that survives unverified is exactly the §0 error in miniature.

| Claim | Proof | Expected verdict |
|---|---|---|
| It builds structure, not a list | One sentence becomes a commitment, a recurrence, ten dated occurrences, a timer | **? see below** |
| It protects the work | App-level gates on a schedule, your own reasoning at the moment you reach | ✓ on-device |
| It decides when to speak | A budget governs how often it can interrupt you. Most days it doesn't | **? needs the arbiter to have run** |
| It infers instead of asking | Completion is picked up from what you already said | **✗ BAS-93** |
| It won't let goals eat each other | Adding something that breaks an existing commitment gets vetoed, not queued | **? veto may be creation-time** |
| It never punishes silence | An unknown day stays unknown. It doesn't become a miss later | **? window closing is job work** |
| It refuses what it shouldn't guess | Injury, medical, legal, financial — it builds the path to real help instead | ✓ deterministic |

If the audit leaves three rows, the section runs with three. A short honest scan beats a long one with two claims the product can't back — and DS-16 already forbids the latter.

### 4.1 Row 1 — the question that reaches further than one row

Row 1 was written ✓ on the assumption that occurrence generation is synchronous at commitment creation. **That assumption is unverified, and if the rolling 14-day expansion is job-queue work, no occurrence has ever been generated in production** (BAS-215).

It matters more than the row, because **the builder's occurrence fan-out is the single most persuasive moment on the site.** Ten dated marks landing from one sentence is the proof that Baseline produces structure rather than text.

The two are not the same claim, and the distinction is the whole answer:

- **The builder's fan-out is site-side.** Deterministic recurrence math, client-side, no app runtime involved. It demonstrates *what the structure looks like*, and that is specified and stable regardless of build state.
- **Row 1 claims the app does this.** That is an app-runtime claim and it needs a DS-18 verdict like any other.

If the app cannot currently generate occurrences, the builder is unaffected and row 1 is held. **But that gap would be worth surfacing to the app side immediately** — a commitment that produces no occurrences has no resolution cascade, no resolution card, and no adherence record, which reaches considerably further than this website.

**Capture check addition — two separate questions, because they have different answers:**

1. Is occurrence generation at commitment creation **synchronous**, or enqueued?
2. Is rolling-window regeneration job-queue work?

A yes to 1 and a yes to 2 means row 1 ships and the window maintenance is a separate concern. A no to 1 means nothing generates occurrences today, and that is a finding for the app, not just for this section.

---

## 5. §4 — "What Baseline knows" — **P1, gated**

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

**Correction to v7.1:** §15.3 listed this section as needing a screenshot. It does not — the section is typographic, with authored example lines, and v7.1's own rules already said *"editability stated, not demonstrated"* and *"site-side beliefs are authored examples, never real data."* The capture need was my error. **What it needs is a reachability verdict, not an asset.**

**Gate for promotion to P0:** belief accumulation demonstrably working on a real account with real history — at minimum, `belief.created` events firing in production and the *What Baseline knows* surface rendering non-empty for a user who isn't Kian.

Rules on ship: three lines max · real `belief_tier` labels (`hypothesis · pattern · observed_fact`) · **no confidence numbers** · **nothing keyed by `sensitivity_class`** — `c3s` is forbidden from external context and a marketing site is external context.

---

## 6. The builder

### 6.1 Beats and timing

Transformation block renders complete and empty at t=0. Deterministic classification and deadline parse land in ~40ms. Generation runs in parallel with a **4000ms hard timeout**. Route 450ms, occurrences 600ms, **interruptible**. Tune enabled the moment recurrence exists.

System time to tunable plan: **p50 ~2.2s, p95 ~4.6s.**

**The builder is unaffected by §0.** It runs entirely on the site — deterministic parsing, a site-local `/api/plan`, and client-side recurrence math. It demonstrates *what the app does with a goal*, and that transformation is specified, deterministic, and independent of the app's runtime state. **That is why the builder is the hero and the sections are not.**

### 6.2 Plan model — derived, not hand-listed

Handles every `capability_type` the contracts define — exactly five: `commitment · reminder · timer · gate · tracker`. Generated from `contracts-manifest.json` (§6.6) with a layout rule per type. **A type without a layout rule fails the build.**

### 6.3 Vocabulary the site renders — closed list

| Axis | Values |
|---|---|
| `capability_type` | `commitment · reminder · timer · gate · tracker` |
| `authority_tier` | `auto · provisional · explicit` |
| Outcome (recorded) | `complete · partial · missed · cancelled_intentionally · unknown` |
| `belief_tier` | `hypothesis · pattern · observed_fact` |

**`rescheduled` — corrected from v7.1.** The app session settled it: `rescheduled` is a **derived display value**, not a stored outcome and not an action outcome. Nothing writes it; `displayOutcome` derives it when an occurrence is `pending` and was moved, and a resolution always wins — moved then completed is `complete`.

So: the site **may** describe `rescheduled` as a state a user sees. It **must not** list it alongside the five resolvable values as something the system records. v7.1's blanket ban was over-broad.

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

## 7. §8 — Pricing

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

## 8. §9 — FAQ

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

**Every answer carries the same reachability requirement as §3's rows.** Question 12 in particular — export and delete must be verified working, not read off the inventory.

Question 4 must be an unqualified no.

---

## 9. §10 and §12 — Company and footer

> **Baseline is built by two people.**
> Kian — product and design. Shayan — engineering.
> We built it because we kept rebuilding the same scaffolding for ourselves every few months and got tired of being the thing holding it together.
>
> `hello@resetbaseline.com`

Real names, real email. **No social proof until it's real.**

**Footer:** Product (What it does · Pricing · FAQ) · Company (Who's building this · email) · Legal (Privacy · Terms). Status line: *Private beta, free · iPhone · no connectors.*

---

## 10. Bans

All v5 §19 bans stand.

**Cut in the app, therefore banned here:** streaks · XP, badges, levels, leaderboards · life score · loss-aversion or shame framing · financial stakes · habit scorecards · standalone mood tracking · AI-therapist positioning · task-manager framing · calendar client · week/month views · user-facing rule builder · user-visible confidence numbers · progress or completeness meters · feature carousels · tutorial overlays · sample data.

**Not in V1:** HealthKit · Planner timeline · Live Activity · Calendar · lock-screen widget · MCP or external AI context · geofencing · social accountability · Android · **any connector** · Shortcuts · web app · B2B.

**New — in V1 but not yet built.** Nothing on this list appears on the site until §0's verification passes: conversational completion inference · intervention proposals · belief accumulation and *What Baseline knows* · anything depending on the job queue.

**Site-specific:** no connector logos or integration strip · the site must not read as a web version of the app · nothing generated may read `artifact_divergences`.

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

**DS-18 · No claim without a working capability.** Every §2 moment, §3 row, and FAQ answer describing app behavior traces to a capability verified working on a device — recorded verdict, dated, with the verifying issue. **A PRD line is not evidence.**

### 12.2 Product understanding

- **Q1** *"What do you think Baseline does?"* — 3 of 4 concepts
- **Q2** *"What would using it day to day be like?"* — 2 of 4
- **Q3** *"Does it know anything about you? Could you see that?"* — **held with §4.** Reinstated when §4 promotes to P0.

Thresholds: 5/6 wall · 4/6 tune · 5/6 on each live question.

### 12.3 Engineering

v5 §18.2 in full, plus: every user-visible label traces to §6.3 · the drift check fails on divergence · input classification is deterministic and pre-generation · pricing renders both states by config · no section references anything on §10's three lists.

### 12.4 No criterion satisfiable by absence — **new, standing**

Every automated eval must **fail on an empty implementation.** Before an eval is accepted, it is run against a stub that does nothing. If it passes, it is measuring the container and must be rewritten.

Known exposure to audit first: **SITE-EVAL-021** (*"all validate"* passes on zero requests) · **SITE-EVAL-027** (*"each demonstrates its assigned behavior"* passes if the assertion is presence-of-render rather than presence-of-behavior) · **SITE-EVAL-037** (event sequence assertion passes if no events are expected).

This rule exists because the same failure was found in the app's own acceptance criteria the same day this was written. It is not hypothetical.

---

## 13. Build order

**P0:** scaffold → tokens/type → contracts manifest + generated model + drift CI → plan model → `PlanLayout` → `FlatLayout` → occurrence generator → transformation block → input classification + clarification beat → providers → generation + fallback → tune → protect → wall → capture → share card → analytics → mobile → failure sweep · **and in parallel after tokens:** §2 (three moments) → §3 (audited rows) → §8 → §9 → §10 → §12 → legal, metadata, OG

**Gate:** DS-1…DS-18, then the six-user study (Q1, Q2)

**P1:** Peak · **§4 What Baseline knows, when §15.1 clears** · §5 Day 1→30 · §6 What it won't do · §7 Method · performance and degradation

**P2:** aberration · edge catch · hidden B · seven-station choreography · live tier demotion · emailed plan

---

## 14. Prerequisite work

### PRE-1 · Correction pass
**Owner:** site session · **Gate:** blocks the Linear population run

Part A (items 1, 3, 5, 6) is specified in `pre-1-patch-part-a.md`. **Item 2 is a no-op** — verified zero hits in both documents; the error existed only in the archived v5 PRD. Recorded rather than fabricated.

Part B (item 4) — new P0 issues for §2, §3, §8, §9, §10, §12, input classification, and the clarification beat. **Now also:** a `docs/site-copy/held-moments.md` and `held-rows.md` issue, a DS-18 verification issue, and a §12.4 eval audit issue. Runs after the capture report.

### PRE-2 · Ban-list copy audit
**Owner:** site session · Automated in CI from P0 onward, failing the build on any §10 banned term; plus a manual pre-launch review, because automation catches terms and not a section that *implies* a capability without naming it.

---

## 15. Open items

### 15.1 Gates on held content

- **§4 promotes to P0** when belief accumulation is demonstrably working on a real account — `belief.created` firing in production and the surface rendering non-empty for someone who isn't Kian. Depends on BAS-215 and BAS-240.
- **§2's 9:30pm** restores when occurrence generation and window closing run in production. Depends on BAS-215, BAS-212.
- **§2's 2:15pm** restores when BAS-93 and the agent-route retrieval gap land.
- **§2's 6:00pm** restores when the intervention lifecycle has fired on a real account.
- **FAQ 10** restores with §4.

### 15.2 Read tasks

- **R-2** — app PRD §14–26 bodies and the onboarding spec. Onboarding matters most: if the site's builder and the app's onboarding diverge in shape, the handoff from wall to first launch feels like two products.
- **Weekly review** — in the V1 inventory, section not located, and §5 argues retention without it. Also needs a DS-18 verdict.
- **Capture check** — four questions per surface, per `pre-1-patch-part-a.md`. Expected negatives are planned for, not hoped against.

### 15.3 Decisions

1. Contracts publication route — registry, committed build output, or submodule. Not blocking (§6.6).
2. `dist/` gitignore — deliberate or incidental? Bears on 1.
3. Terminal action at launch — waitlist, TestFlight, or App Store. All branches built.
4. Typeface — decided at build item 1 on real display-scale type.
5. Cursor spring `0.055` — decided during P1 by feel.
6. Tier B mobile Peak — decided post-launch by conversion data.

### 15.4 Copy pass — Kian

§2's three moments, §3's audited rows, twelve FAQ answers, §8, §10, and the held content in `docs/site-copy/`. Specified structure with example text; not final prose.
