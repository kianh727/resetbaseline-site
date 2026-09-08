# Baseline Site — v5 PRD

**Authoritative. Replaces v4 entirely; archive v4.**

Refinement, not redirection. The Peak concept, the static-object/moving-light principle, native scroll, the provider seam, schema validation, the honest wall, the degradation philosophy, the typography concept, the wide funnel, and the hero direction are all unchanged.

---

## 1. North star

```
messy human goal
  → Baseline visibly understands it
  → converts it into executable structure
  → that structure becomes a real plan
  → the visitor tunes it
  → Baseline protects execution
  → the visitor attempts activation
  → honest app boundary
  → conversion
```

A first-time visitor completes this in **20–30 seconds** with no account, no documentation, no prior knowledge of Baseline, no scrolling below the fold, and no dependency on the Baseline production backend.

**The builder is the product demo. The Peak is atmosphere and memory device. When they conflict, the builder wins.**

> **A beautiful Peak with a mediocre builder is a failed implementation.**
> **A great builder with a simplified Peak is a launchable implementation.**

---

## 2. Demo success criteria

Binary, testable, and gating. These sit alongside the engineering gates in §18, not beneath them.

| # | Criterion | How it's verified |
|---|---|---|
| DS-1 | Landing → personalized plan with **zero scroll below the fold**, at 375px and 1440px | Manual, both widths |
| DS-2 | No account, email, or identifier required before seeing and tuning a plan | Code review + manual |
| DS-3 | System time from submit → tunable plan: **p50 ≤ 2.5s, p95 ≤ 5s** (excludes user hesitation) | Instrumented, `plan_generated` latency |
| DS-4 | Tuning visibly alters the plan in **< 400ms**, every time | Instrumented |
| DS-5 | Activation wall reachable without leaving the builder or scrolling | Manual |
| DS-6 | Demo fully functional with **WebGL disabled** | Force Tier D, run full loop |
| DS-7 | Demo fully functional with **`/api/plan` returning 500 or timing out** | Force failure, run full loop |
| DS-8 | The site never implies a capability is active that a browser cannot activate | Copy audit + §11 |
| DS-9 | Transformation from intent → executable structure is understood **without explanatory copy** | §18.3 user test |
| DS-10 | No dead spinner state exists anywhere in the builder | Manual, throttled |

### 2.1 Usability test protocol

Six first-time users. None have seen Baseline. Two on mobile, four on desktop. No introduction beyond *"this is a website, use it."*

1. **Silent observation**, screen recorded, to the point they hit the wall or stop. No prompting.
2. Record: time to first submit, time to first tune, whether they tuned unprompted, whether they reached the wall, where they hesitated.
3. Immediately after, **before showing any marketing section**, ask: *"What do you think Baseline does?"* (§18.3).
4. Then: *"What would you have expected to happen when you pressed Activate?"* — validates the wall reads as a real boundary rather than a signup gate.
5. Then: *"Was there anything you wanted to change that you couldn't?"*

**Pass bar:** 5 of 6 reach the wall unprompted. 4 of 6 tune without being told to. 5 of 6 give a §18.3-passing answer.

Run this at the end of P0, **before any Peak work begins.**

---

## 3. The builder

### 3.1 Beat sequence and timing budget

Every beat below is measured from meaningful submit. **Controls enable when their data exists, not when their animation completes. Every builder animation is interruptible.**

| Beat | Starts | Duration | Source |
|---|---|---|---|
| `YOU SAID` renders with raw intent | 0ms | instant | user |
| `BASELINE BUILT` frame renders, fields empty | 0ms | instant | deterministic |
| Deadline field fills | ~40ms | instant | deterministic parse |
| Domain classification resolves | ~40ms | instant | deterministic |
| Generation request fires | 0ms, **parallel** | p50 1.4s / p95 3.5s | `/api/plan` |
| Commitment + window fields fill | on arrival | 200ms | generated, validated |
| Occurrence dates computed | +0ms | instant | deterministic |
| Route draws | +0ms | 450ms | deterministic |
| Occurrences land | +150ms | 45ms stagger, ~600ms total | deterministic |
| **Tune controls enabled** | **the moment recurrence exists** | — | — |

**System time to interactive plan: p50 ~2.2s, p95 ~4.6s.** The remaining 15–25s of the north star is human time — reading, tuning, choosing apps.

### 3.2 Step 1 — Ask

Input reads `Ask Baseline`. Three suggestion chips beneath, from a pool of twelve, rotating every 6s with a staggered crossfade, pausing on hover, plus a manual shuffle.

Clicking a chip fills the input, focuses it, and places the caret at the end so they can extend it. **Any typing or chip selection stops rotation permanently.**

The input self-types one example after 800ms and then **stops and waits.** It never auto-submits.

**Chip rotation must always expose breadth** — every displayed set of three contains at least one non-habit archetype (§5). Sampling is constrained, not random.

### 3.3 Step 2 — Live parse, before submit

As they type, deterministic date-phrase parsing runs client-side. The moment they land on "by May," the deadline field materializes in the read-back frame. No network, no LLM, fully honest.

This is the cheapest high-signal detail on the site. Build it in P0, early.

### 3.4 Step 3 — The transformation block

The conversion moment. Not a card, not a chat bubble, not a reasoning transcript.

```
YOU SAID
"finish my thesis by May and stop losing my mornings"
───────────────────────────────────────────────────────
BASELINE BUILT
commitment    Thesis block                      provisional
frequency     weekdays · 10 occurrences         through May 15
window        08:00 – 09:30                     90 min
deadline      May 15                            from "by May"
protection    —                                 pending
```

**Rules:**

- Three columns: field label (11px, `+0.06em`, `--bone-38`) · value (`--bone`) · qualifier (11px, `--bone-38`). Hairline rules between rows.
- **The frame renders complete and empty at t=0, then fills.** It never appears after a wait. This is what removes the spinner problem structurally.
- Fields fill in source order: raw intent and deadline instantly, commitment and window on generation arrival, protection at step 6.
- **No prose. No explanation. No "why."** An instrument parsing intent into structure.
- Unfilled fields show `—`, never a skeleton shimmer.
- Every value here is a real object that then lands on the plan. Same data, two views.

The visitor should conclude, without being told: *I gave it intent; it built the machinery.*

**Bounded domains fire the refusal here**, on their own text, replacing `BASELINE BUILT` with:

```
YOU SAID
"I tweaked my back deadlifting, help me train around it"
───────────────────────────────────────────────────────
BASELINE DECLINED
⊘  I'm not going to program around an injury I can't see.
   I'd be guessing, and you'd follow it.

BASELINE BUILT INSTEAD
commitment    Book a physio appointment          deadline Friday
tracker       Pain, 0–10, daily                  not load
```

The refusal copy is **authored, never generated** (§4).

### 3.5 Step 4 — The plan

Route, occurrences, timer render into whichever layout adapter is active (§6). Real dates, real counts.

### 3.6 Step 5 — Tune

Two controls: **time of day** and **days per week**. Changing either regenerates occurrences live — deterministic recurrence math, client-side, instant, zero API cost, **under 400ms end to end** (DS-4).

This is the ownership moment and the cheapest thing in the build. It converts a demo into a tool.

Contention veto fires on a colliding pick, from a deterministic rule table:

> ⚠ 6am conflicts with how your evenings actually run. I'd rather fix 12:40am than fight 6am.

### 3.7 Step 6 — Protect

*"What pulls you away from this?"* Six app chips. Their selections assemble the gate object, marked `explicit`, dimmed, with a live **Activate**.

### 3.8 Step 7 — The wall

§11. Reached only by pressing Activate.

---

## 4. Determinism: the authoritative table

**The LLM must never gain authority over dates, recurrence math, rendering, safety boundaries, authority tiers, or product capabilities.** This table is the single source of truth; anywhere else in this document that seems to contradict it, this table wins.

| Output | Source | Notes |
|---|---|---|
| Raw intent | User | Stored verbatim in capture only, never in analytics |
| Parsed deadline | **Deterministic client** | Date-phrase parser. Runs pre-submit. |
| Domain classification | **Deterministic client + server mirror** | Pattern list: injury, medical, mental health, finance, legal. |
| Refusal decision | **Deterministic** | Classification triggers it. The LLM may **escalate** to bounded; it can never de-escalate. |
| Refusal copy | **Authored, per domain** | Never generated. Five variants, one per bounded domain. |
| Commitment title | **GeneratedProvider** | Schema-validated string, ≤ 48 chars. The largest generated surface on the site. |
| Execution window | GeneratedProvider | Selected from a closed set of windows; validated. |
| Recurrence rule | GeneratedProvider **selects**, deterministic **computes** | LLM picks from the closed rule set; all expansion is code. |
| Occurrence dates | **Deterministic client** | Real calendar math, DST-safe. |
| Occurrence count | **Deterministic client** | Follows the real rolling-window generator. |
| Time / day tuning | **Deterministic client** | No network. |
| Contention / veto | **Deterministic client** | Fixed rule table. |
| Protection selection | **User** | — |
| Route layout | **Deterministic client** | Layout adapter (§6). |
| Authority tier | **Contract-derived** | Fixed per object type. Gate is always `explicit`. |
| All other copy | **Authored templates** | — |

**The generated surface is one title and one window selection.** Everything a visitor could be misled by is code.

---

## 5. Authored scenarios

Not fallback filler. Five demo scripts, each demonstrating a distinct Baseline behavior, each valid against the frozen contracts.

| ID | Archetype | Demonstrates |
|---|---|---|
| `thesis` | Work / project deadline | Deadline inference, grounded-only refusal (won't outline content it can't see), long-horizon occurrences |
| `gym` | Recurring physical goal | Contention veto, upstream intervention, the anti-streak refusal |
| `lsat` | Studying / procrastination | Timer primitive, gate at `explicit`, high-frequency recurrence |
| `mornings` | Routine / time-of-day failure | Gate as the primary object, protection before scheduling |
| `back` | **Bounded domain** | Refusal, then process construction: book real help, track state not load |

Chip pool is twelve, tagged by archetype. **Every rotation set of three contains at least one of `back`, `thesis`, or `lsat`** — never three generic habits.

`StaticProvider` serves these verbatim when generation fails, when the spend cap trips, or when validation rejects output. **A visitor hitting the fallback still gets a complete, coherent, personalized-feeling demo** — the raw intent stays theirs, only the structure is substituted.

---

## 6. Plan model and layout adapters

The architectural fix that lets P0 ship before any 3D exists.

```ts
// One semantic model. Never coupled to a renderer.
interface Plan {
  goal: { text: string; deadline?: Date }
  domain: DomainTier
  commitment?: Commitment
  occurrences: Occurrence[]      // real dates
  timer?: Timer
  gate?: Gate
  tracker?: Tracker
}

interface PlanLayout {
  anchorFor(node: PlanNode): { x: number; y: number; depth: number }
}
```

Three adapters, one builder:

| Adapter | Anchors from | Used by |
|---|---|---|
| `FlatLayout` | Deterministic 2D composition — a vertical route with dated marks | **P0**, all mobile, Tiers C and D |
| `StaticPeakLayout` | Pre-computed anchors against a static peak image | Tier C when the static peak is present |
| `ProjectedPeakLayout` | Live 3D vertex projection | **P1**, desktop Tiers A and B |

**Builder logic never changes across adapters.** Swapping is one constructor.

`FlatLayout` is not a degraded mode — it is **the reference implementation** and it must be reviewable as a complete, compelling product demo on its own, before 3D exists. It renders as an ascending route with dated occurrence marks, a shaded protection band, and a timer segment: the same semantics, composed in 2D.

---

## 7. The Peak — P1

Concept unchanged from v4. Condensed here; nothing removed, several things reclassified.

### 7.1 Object

Hand-authored low-poly ridge, 300–450 triangles, flat-shaded, derived from the mark: tall asymmetric summit right of center, lower shoulder left, hard notch between.

**Binding constraint:** the silhouette at the home camera must be recognizable as the Baseline icon to someone who wasn't told to look for it.

It never rotates, drifts, or pulses. Camera FOV 28° — telephoto compression reads photographic.

### 7.2 Light

| Light | Type | Role |
|---|---|---|
| Key | Directional, `#C9C0FF`, 1.0 | The only light that models form |
| Fill | Hemisphere from below, `#1A1530`, 0.12 | Prevents pure black |
| Rim | Fresnel in shader, power 4.5, `#8B7DFF`, 0.85 | Where the visible color lives |

Autonomous sweep, coprime periods so it never visibly loops:
```
azimuth   = -38° + sin(t · 0.0157) · 46°     // ~40s
elevation =  22° + cos(t · 0.0104) · 14°     // ~60s
```

Cursor authority 0.75 while the pointer is active, decaying to 0 over 2000ms after leave. Spring at `0.055` — **the most important tuning number on the site.** Higher feels sticky, lower feels broken. Tune by feel against the real geometry.

Cursor Y → elevation, X → azimuth, both clamped so the light can never black out the peak.

### 7.3 Material

- Albedo `#0E0C18`. Lavender is *light*, never paint.
- **Posterized Lambert, 3 bands**, 0.04 transition. The primary anti-cliché lever — smooth photoreal gradient makes it a mountain photo; banding makes it machined.
- Vertex AO baked at build.
- No shadow maps. Flat shading plus posterized diffuse gives all needed definition.

### 7.4 Post chain, in order

1. Bloom — threshold 0.82, radius 0.4, strength 0.35. **Rim only.** *(P1)*
2. Grain — animated, 0.032, 1:1 pixel scale, over everything including UI. **Cheap, and it hides the half-res upscale on mobile.** *(P1)*
3. Vignette — 0.25 *(P1)*
4. Chromatic aberration — radial, 1.4px at corners *(**P2**)*
5. Facet edge catch *(**P2**)*

### 7.5 Camera

**P1: three stations.** Base (fold) · Mid (raised, route receding) · Wide (cold silhouette for §12 "What it won't do").

**P2: the full seven-station choreography** including the return-to-base close and the Day 1 → Day 30 scrub.

Native scroll throughout. We read `scrollY` and lerp along an authored spline. **No wheel interception, no Lenis, no scroll-behavior override, anywhere, ever.**

### 7.6 The B — P2

The logo's negative space forms a B, and in the geometry that space is real. At key azimuth ≈ 34°, elevation ≈ 18°, it resolves. When the light holds within 6° for 600ms, a hairline lavender trace draws the counters over 800ms.

No copy, no hint, no tooltip. **Explicitly not a launch blocker.**

---

## 8. Motion

### 8.1 The signature: settling

One spring, used **only** when structure lands into place.

```
spring: { stiffness: 260, damping: 24, mass: 0.9 }
from:   { opacity: 0, scale: 0.94, y: 8 }
```

Match the app's sheet spring if it differs. **Banned everywhere else** — if a section header uses it, the signature is gone. This is the rule most likely to erode across a long build.

### 8.2 Timing

| Element | Motion |
|---|---|
| Route draw | 450ms stroke-reveal *(shortened from v4's 900ms — it was serial time before comprehension)* |
| Occurrence fan-out | 45ms stagger, settling spring, ~600ms. **Interruptible; controls enable before it finishes.** |
| Occurrence regenerate | Exit 120ms, re-enter 30ms stagger. **Under 400ms total** (DS-4). |
| Refusal beats | **No spring.** Opacity 300ms, `--veto` left rule, 400ms hold *(reduced from 600ms)*. The system stopping must not look like the system producing. |
| Transformation block fills | Per-row opacity 200ms. No stagger — rows fill as sources resolve, not on a schedule. |
| The wall | Dim 240ms, content fades up. No scale, no bounce. A boundary, not an event. |
| Section reveals | Opacity 0→1, 400ms, ease-out, 20% entry, once. No slide, no stagger, no hover lift. |

**Removed from v4:** the 38ms/token read-back stream. It is an AI-transcript pattern, it is serial time before comprehension, and §3.4 replaces it with structured fields that fill.

### 8.3 Reduced motion

Light sweep stops at the hero angle, cursor authority off. Grain renders statically. Camera snaps between stations. Builder renders final states; no autoplay, no self-typing. **The site must be fully comprehensible with every animation disabled.**

---

## 9. Mobile — 375px is the primary target

The builder matters more on mobile than desktop composition does.

**Layout:** on mobile the plan renders via `FlatLayout` in-flow, and the Peak sits **behind it** at reduced opacity. The projected-3D overlay is desktop-only. This resolves the DS-1 conflict cleanly and honestly rather than cramming a projected face into 375px.

| Concern | Specification |
|---|---|
| Keyboard | `visualViewport` listener keeps the input **and** the transformation block above the keyboard. Never scroll the input off-screen. |
| Chips | Horizontal scroll, no wrap, momentum, hidden scrollbar, 44px min height, 16px leading inset |
| Tune — time | Horizontal segmented scroller, 44px targets |
| Tune — days | Seven pills, 40×40 minimum, wrapping to two rows if needed |
| Plan density | Occurrences collapse to the **next 5 + "and 5 more"** below 700px viewport height. Full list on tap. |
| Wall | **Bottom sheet, not a centered modal.** Keyboard-aware. Plan visible above it. |
| Safe areas | `env(safe-area-inset-*)` on the wall, the pinned save bar, and the fold |
| Hover | **No interaction may depend on hover.** Chip pause-on-hover is desktop-only enhancement. |
| Overflow | `overflow-x: clip` on root. Zero horizontal scroll at 320px. |
| Touch targets | 44×44 minimum, everywhere, no exceptions |
| Gestures | **No touch-drag on the Peak.** Vertical drag is scroll. |

---

## 10. Analytics

First-party. **No free-form user content in analytics** — raw goals and generated plans go only through the explicit capture system in §11.

| Event | Properties |
|---|---|
| `hero_view` | `tier`, `viewport_w`, `reduced_motion` |
| `builder_engaged` | `entry` (`typed` \| `chip` \| `autotype_edited`) |
| `suggestion_selected` | `archetype`, `rotation_index` |
| `goal_input_started` | `source` |
| `goal_submitted` | `char_len`, `deadline_present`, `domain_tier` |
| `plan_generated` | `latency_ms`, `source` (`generated` \| `fallback`), `occurrence_count`, `has_timer`, `has_gate` |
| `plan_generation_fallback` | `reason` (`timeout` \| `invalid_schema` \| `rate_limit` \| `spend_cap` \| `error`), `latency_ms` |
| `plan_tuned` | `control` (`time` \| `days`), `interaction_index`, `veto_fired` |
| `protect_started` | — |
| `protect_selected` | `app_count` |
| `activation_attempted` | `object_type` (`gate` \| `timer` \| `reminder`) |
| `wall_reached` | `time_since_submit_ms`, `tune_count`, `app_count` |
| `wall_dismissed` | `dwell_ms` |
| `email_submitted` | `terminal_action`, `time_since_wall_ms` |
| `share_card_created` | `surface` (`download` \| `copy`) |

### 10.1 Conversion ratios — tracked as the primary dashboard

```
builder_engaged  → plan_generated
plan_generated   → plan_tuned
plan_generated   → wall_reached
wall_reached     → email_submitted
```

### 10.2 The Peak guardrail

**Segment every ratio above by render tier.** If Tier A (full Peak) shows lower `hero_view → builder_engaged` than Tier C/D (flat), the Peak is a vanity interaction that costs conversion, and §17 rule K-1 applies. This is measured, not argued.

---

## 11. The wall

### 11.1 Trigger

**Only** by pressing Activate on a gate, timer, or reminder. **Never** on elapsed time, scroll depth, section entry, exit intent, or interaction count. It is the consequence of attempting a real device capability.

### 11.2 Content

> **This is where the website ends.**
>
> Gates run on your phone — a browser can't hold one. Everything you just built is saved. Add your email and it's waiting when your invite lands.

### 11.3 Rules

- **No modal on desktop; bottom sheet on mobile.** The plan stays visible behind a 40% dim.
- **Never fake-activate.** No "Activated!" then reveal. This audience punishes bait, and it violates DS-8.
- **Dismissible**, returning to a fully tunable plan. A single pinned `save my plan` bar remains.
- Timer and reminder are walled identically, so the wall isn't gate-specific.

### 11.4 Terminal action

```ts
type TerminalAction = 'waitlist' | 'testflight' | 'appstore'
```

A config value with three complete UI branches built, not a hardcoded form. StoreKit and paywall work is tracked as a launch blocker (BAS-217–225), so this **will** change before the site is old.

### 11.5 Capture

Supabase, **staging project**: `raw_goal`, `email`, `generated_plan`, `domain_tier`, `tuned_time`, `tuned_days`, `blocked_apps`, `terminal_action`, `hit_wall_at`, `created_at`. Honeypot, rate limit, no CAPTCHA.

`generated_plan` accumulates real prospect goals alongside the structures Baseline proposed. That dataset is worth more than the emails.

---

## 12. Provider architecture

Unchanged and still load-bearing. **Zero dependency on the Baseline backend.**

```ts
interface ScenarioProvider {
  run(input: string, signal: AbortSignal): AsyncIterable<AgentEvent>
}
```

`AgentEvent` imported from `@baseline/contracts` — the app's generated types, so **a contract change breaks this build.**

| Provider | Source | Status |
|---|---|---|
| `StaticProvider` | Five authored scenarios (§5) | Permanent fallback |
| `GeneratedProvider` | `/api/plan` → Claude, site-local | Ships in P0 |
| `LiveProvider` | `/v1/agent/turn` | Later, optional |

`/api/plan` is the only server surface. Constrained prompt, few-shot on the five scenarios, closed action vocabulary, JSON only, schema-validated before anything reaches the client.

**Never blocking.** Timeout at **4000ms**, hard. On timeout, invalid schema, rate limit, or spend cap: the deterministic read-back is already on screen, `StaticProvider` resolves the structure, `plan_generation_fallback` fires, and the visitor sees a complete plan. **No dead spinner exists** (DS-10) because §3.4's frame renders full and empty at t=0.

Controls: 5/hr/IP, 2/min burst, `max_tokens: 1000`, 300-char input cap, daily spend cap with a kill switch to `StaticProvider`.

All four staging blockers (BAS-187, BAS-197, BAS-212, BAS-215) sit below this seam.

---

## 13. Sections and copy

| § | Section | Job | Phase |
|---|---|---|---|
| 1 | Fold + builder | The entire value prop, above the fold | **P0** |
| 2 | What you didn't see | The half that runs after: it notices, it asks once, it stays out of the way | P1 |
| 3 | Day 1 → Day 30 | Retention argument | P1 |
| 4 | What it won't do | No streaks. No completeness meters. Silence is never failure. | P1 |
| 5 | Method | Four principles, collapsed. Optional depth, not a wall. | P1 |
| 6 | Join | — | P1 |

**Hero:**
> **Become who you said you would.**
> Tell Baseline what you want. It builds the days, protects the work, and learns how you actually operate.

**ICP — recognition, not exclusion**, folded into §2. Wide behavioral funnel; **explicitly not positioned as an ADHD product.**

> If you've ever written yourself a system — a notes doc of your goals, a morning prompt you paste into an AI, a habit tracker you rebuilt in January — you already know the problem. It isn't that the system was wrong. It's that you were the one holding it up.

The differentiation is **demonstrated by the builder, not argued in copy**: Baseline is not another place to record the system, it turns intent into structure and carries it forward.

**Deleted from the live site:** the 8-beat drift timeline, the loop diagram with its live `placeholder` strings, the separate Coach and Gate blocks, all five ALL-CAPS eyebrows, both iframes, the `lovable.app` OG image.

---

## 14. Type and tokens

**Technical drawing:** enormous display type against very small, very precise metadata, hairline rules, real measurements. Density against scale, not scale alone.

| Role | Size | Treatment |
|---|---|---|
| Display | `clamp(40px, 8vw, 140px)` | 500, `-0.04em` |
| Section head | `clamp(32px, 5vw, 88px)` | 500, `-0.035em` |
| Lead | 18–22px | 400, `--bone-60` |
| Body | 16–17px, max 62ch | 400 |
| Metadata | 11px | `+0.06em`, `--bone-38` |

Metadata is always real: dates, occurrence counts, durations, authority tiers. Never decorative numbers.

| Token | Value |
|---|---|
| `--void` | `#0A0A0A` |
| `--surface` | `#0E0C18` |
| `--lavender` | `#8B7DFF` |
| `--lavender-lit` | `#C9C0FF` |
| `--bone` | `#F2F0EC` |
| `--bone-60` | `rgba(242,240,236,.6)` |
| `--bone-38` | `rgba(242,240,236,.38)` |
| `--edge` | `rgba(242,240,236,.08)` |
| `--veto` | `#C4614F` — **refusal and veto states only** |

*(v4's "three appearances total" cap on `--veto` is removed — it conflicted with scenarios where a refusal and a contention veto both fire.)*

**Typeface:** PP Neue Montreal (licensed) or Satoshi (free). Decided at P0 item 1, compared at display scale.

---

## 15. Degradation ladder

| Tier | Detection | Renders | Plan adapter |
|---|---|---|---|
| **A** | Desktop, WebGL2, ≥4 cores | Full Peak, cursor authority, full post chain | `ProjectedPeakLayout` |
| **B** | Modern mobile, WebGL2 | Half-res target upscaled, grain and bloom kept, aberration dropped, auto-sweep only | `FlatLayout` |
| **C** | WebGL1, ≤2 cores, or frame budget breached | Static pre-rendered peak + CSS light gradient | `FlatLayout` or `StaticPeakLayout` |
| **D** | No WebGL, or `save-data` | Static WebP or flat background | `FlatLayout` |

**The builder never degrades.** Tiers C and D lose atmosphere and keep 100% of function (DS-6).

Tier detection at load. **One demotion permitted mid-session** on two frame-budget breaches within 10s; never promote back. *(v4's continuous live demotion is demoted to P2 — oscillation risk exceeded its value.)*

---

## 16. Performance

| Metric | Ceiling |
|---|---|
| LCP, mobile 4G | 1.8s |
| CLS | 0.05 |
| INP | 200ms |
| **Core bundle (builder), gzip** | **120 KB** |
| **Scene bundle, gzip, lazy** | **140 KB — not counted in first load** |
| Time to first Peak paint | 900ms after LCP |
| Frame budget, Tier A / B | 8ms / 12ms |
| `/api/plan` timeout | 4000ms hard |
| Lighthouse mobile perf | ≥ 90 |

*(Resolves v4's double-count: the scene was inside a 240KB first-load figure while also being specified as lazy.)*

The headline is the LCP. **The Peak is never in the LCP path** and initializes on `requestIdleCallback` after it.

---

## 17. Scope-kill rules

Binding. Any of these firing is a decision already made, not a discussion.

**K-1.** If Peak work threatens P0 completion, **stop Peak work.** If Tier A conversion underperforms Tier C/D (§10.2), simplify the Peak.

**K-2.** If a post effect materially hurts mobile performance, remove the effect. It is not negotiable against the frame budget.

**K-3.** If exact logo geometry prevents a readable plan overlay, **plan readability wins** — preserve a recognizable silhouette and adjust the mesh.

**K-4.** If an animation makes interaction feel slower, shorten or remove it, unless it carries product meaning. The occurrence fan-out carries meaning; a section reveal does not.

**K-5.** If an interaction can't be understood without explanatory copy, **redesign the interaction** rather than adding the copy.

**K-6.** If a feature doesn't improve comprehension, differentiation, conversion, trust, or memorability, it needs a written reason to exist.

**K-7.** Any P2 item still open when P0 and P1 pass their gates ships as-is or gets cut. P2 never delays launch.

---

## 18. Quality gates

### 18.1 Product — gates launch

All of §2 (DS-1 through DS-10), verified individually.

### 18.2 Engineering

- [ ] Every verb, object type, and enum traced to the frozen contracts
- [ ] `@baseline/contracts` imported — a schema change breaks the build
- [ ] §4 determinism table holds in code; the LLM's total output surface is the commitment title and window selection
- [ ] Domain classification is deterministic; the LLM can escalate to refusal, never de-escalate
- [ ] `/api/plan` schema-validated; timeout, invalid schema, rate limit, and spend cap each force-tested end to end
- [ ] Settling spring appears **only** on structure landing
- [ ] Refusal beats use no spring
- [ ] Wall triggers **only** on activation attempt; never fake-activates; dismissible; plan visible
- [ ] Terminal action is a config value with all three branches built
- [ ] Occurrence math correct — real dates, real counts, DST-safe
- [ ] Scroll is native; no wheel interception anywhere
- [ ] All four tiers force-tested; full loop completes in C and D
- [ ] `FlatLayout` reviewable as a standalone complete demo
- [ ] Site comprehensible with every animation disabled
- [ ] Keyboard-operable end to end; 44px touch targets; zero horizontal scroll at 320px
- [ ] No free-form user content in analytics
- [ ] Zero `placeholder`, lorem, invented verbs, iframes, or duplicated DOM
- [ ] No §19 banned word in any copy
- [ ] Lighthouse mobile ≥ 90, number reported
- [ ] Real iOS Safari · 320 / 375 / 390 / 768 / 1280 / 1920
- [ ] `og:image` no longer a `lovable.app` URL

### 18.3 Product understanding — the hardest gate

After using the builder, with no marketing sections shown: *"What do you think Baseline does?"*

**Passing answers contain approximately:** I tell it what I'm trying to do · it turns that into a plan or system · it schedules or structures the actual execution · it can protect the work or adapt over time.

Baseline terminology is not required.

**Failing answers:** "AI habit tracker" · "AI planner" · "goal-setting app" · "cool mountain website."

A failure here means the demo hasn't communicated the differentiation. **The fix is the interaction, not added copy** (K-5).

---

## 19. Bans

**Scene:** sunrise or warm color · photographic or displacement-mapped terrain · smooth photoreal diffuse gradients · fog, haze, atmosphere · god rays · clouds · stars · reflections or environment maps · a rotating, drifting, or pulsing peak · summit flags or climbing imagery beyond the literal route.

**Copy:** *journey · climb · summit · peak · ascent · reach new heights.* The visual carries the metaphor; copy naming it is what makes it embarrassing.

**Type:** italic or colored accent on one headline word · tracked-out ALL-CAPS eyebrows · `01 / 02 / 03` numbering · `→` appended to buttons · monospace anywhere *(the read-back stream that justified it is removed)*.

**Layout:** identical rounded cards in a row · fade-and-slide-up on every section · hover lift · centered body type.

---

## 20. Build order

### P0 — conversion-critical. Nothing ships without all of it.

| # | Item | Gate |
|---|---|---|
| 1 | Scaffold, tokens, both typefaces, `@baseline/contracts` wired | Both faces compared at display scale |
| 2 | `Plan` model + `PlanLayout` + `FlatLayout` | Renders a hand-fed plan coherently |
| 3 | Deterministic parse: deadline + domain classification | Deadline appears mid-typing, no network |
| 4 | Transformation block (§3.4) | Frame renders full and empty at t=0 |
| 5 | `/api/plan` + `GeneratedProvider` + schema validation + 4s timeout | All four failure modes force-tested |
| 6 | Five authored scenarios + `StaticProvider` + constrained chip rotation | Every rotation set exposes breadth |
| 7 | Occurrence generation, route, settling motion (flat) | Real dates; controls enable before animation ends |
| 8 | Tune controls + live regeneration | < 400ms, verified |
| 9 | Protect + gate assembly | — |
| 10 | Activation wall + capture + all three terminal branches | Triggers only on Activate |
| 11 | Share card (§21) | Correct at 1200×630 |
| 12 | Analytics + conversion dashboard | All events firing with correct properties |
| 13 | **Mobile pass at 375px** (§9) | Full loop at 320px with keyboard open |
| 14 | **§2 demo criteria + §18.3 user test** | 5/6 reach wall · 4/6 tune · 5/6 pass understanding |

**Stop here and the site is launchable.**

### P1 — brand and memorability

| # | Item |
|---|---|
| 15 | Peak geometry + silhouette match |
| 16 | Light rig, sweep, cursor authority (tune `0.055`) |
| 17 | Material, posterized diffuse, rim, vertex AO |
| 18 | Bloom, grain, vignette |
| 19 | `ProjectedPeakLayout` — anchor projection, desktop only |
| 20 | Three camera stations, native scroll |
| 21 | Sections 2 / 4 / 5 / 6 and copy |
| 22 | Day 1 → Day 30 |
| 23 | Metadata, OG card, `/privacy`, `/terms` |

### P2 — polish. Never blocks launch (K-7).

| # | Item |
|---|---|
| 24 | Chromatic aberration |
| 25 | Facet edge catch |
| 26 | The hidden B and its light angle |
| 27 | Full seven-station camera choreography |
| 28 | Live tier demotion |
| 29 | Emailed plan delivery |

---

## 21. The share card

The visitor gets something valuable before installing anything.

**Contains:** their goal in their own words · the commitment · frequency and occurrence count · execution window · deadline where present · protected apps where selected · the Baseline mark and URL.

**Format:** 1200×630, void ground, generated client-side to canvas. Download and copy-to-clipboard. **No export system, no formats, no options.** Emailed delivery is P2.

It renders after the wall so it rewards conversion rather than competing with it.

---

## 22. Claude Code kickoff

> You're building the marketing site for Baseline. Read `docs/site-prd-v5.md` in full before writing code. It is authoritative — where your instincts disagree, the PRD wins and you flag it rather than deviating silently.
>
> **The builder is the product. The Peak is atmosphere. When they conflict, the builder wins.** A beautiful Peak with a mediocre builder is a failed implementation.
>
> Build all of P0 (§20) before touching any 3D. P0 renders through `FlatLayout` and must stand on its own as a complete demo. The `PlanLayout` abstraction in §6 means adding the Peak later changes no builder logic.
>
> **The Baseline backend is not ready and this site does not wait for it.** Generation is a site-local `/api/plan` route, schema-validated against the frozen contracts in `/docs/engineering/`, with a hard 4s timeout and a `StaticProvider` fallback. §4 is the authoritative determinism table — the LLM's entire output surface is one commitment title and one window selection. It never decides dates, recurrence math, safety boundaries, authority tiers, or capabilities.
>
> After each item: run the dev server, screenshot at 375px and 1440px, review against §8, §17, §18 and §19, report. Wait for confirmation.
>
> Seven rejections:
> 1. Any action verb, object type, or enum not in the frozen contracts.
> 2. The LLM given authority over anything §4 marks deterministic.
> 3. A wall triggered by anything other than an activation attempt, or one that fake-activates, traps, or hides the plan.
> 4. Any spinner or empty waiting state in the builder.
> 5. The settling spring used anywhere other than structure landing.
> 6. Scroll hijacking of any kind.
> 7. Anything in the §19 ban list, or `placeholder`/lorem anywhere.
>
> Start with P0 item 1, and render the hero headline in both PP Neue Montreal and Satoshi so I can compare.

---

## 23. Open decisions

1. **Terminal action at launch** — waitlist, or TestFlight if BAS-217–225 land first. All three branches get built; the choice is a config value set at launch.
2. **Trial length and price** — site ships without both; `/pricing` added when set.
3. **Typeface** — decided at P0 item 1, on real display-scale type.
4. **Cursor spring `0.055`** — decided at P1 item 16, by feel, against the real geometry.
5. **Whether Tier B mobile gets the Peak at all** — decided by §10.2 data after launch, not by preference.
