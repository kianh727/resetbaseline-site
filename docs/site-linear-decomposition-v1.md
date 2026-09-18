# resetbaseline.com — Linear Decomposition v1

> **Superseded in part.** `docs/site-execution-addendum-v1.md` is authoritative
> over this document for: Linear project/milestone organization, issue creation
> order and numbering, PR policy, and the four design review gates
> (SITE-085…088).
>
> The "PROJECTS" section below and the project/issue-count tables in "SUMMARY"
> describe sixteen Linear *projects*. Those sixteen groupings are preserved as
> **milestones** inside three projects. Read the addendum first.
>
> Everything else here — all 84 issue scopes, acceptance criteria, tests,
> verification requirements, and the dependency graph of the original 84 issues —
> stands unchanged. The four review gates in addendum §3 add four edges and the
> critical path has been re-walked.

Derived from `docs/site-prd-v7.3.md`. The PRD is product truth; this is execution truth. Where they conflict, the PRD wins.

**IDs are provisional decomposition IDs, not Linear IDs.**

Governing principle, encoded in every priority and dependency below:

> **The builder is the product demo. The Peak is atmosphere.**
> A beautiful Peak with a mediocre builder is a failed implementation.
> A great builder with a simplified Peak is a launchable implementation.

---

## PROJECTS

---

### SP-01 · Website Foundation — **P0**

**Purpose** Scaffold, design system, contract wiring, and the primitives every later project consumes.
**Dependencies** None.
**Entry** Repo created, Cloudflare Pages project provisioned.
**Exit** A deployed empty shell with tokens, type scale, both candidate typefaces renderable, `contracts-manifest.json` committed with types generated from it and the §6.6 drift check breaking the build on divergence, and reduced-motion + tier primitives available as hooks.
**PRD** §14, §15, §16, §20 P0/1
**Non-goals** No builder logic. No 3D. No copy beyond the hero headline used to compare typefaces.

---

### SP-02 · Ask Baseline Hero — **P0**

**Purpose** The fold: headline, input, suggestion chips, and the state machine that hands off to the builder.
**Dependencies** SP-01
**Entry** Tokens and type scale merged.
**Exit** A visitor can land, see the headline as LCP, read three archetype-diverse chips, click one or type freely, and submit. Autotype demonstrates and stops. Rotation locks permanently on engagement.
**PRD** §3.2, §5, §13
**Non-goals** No parsing, no generation, no plan rendering. Submitting emits an event and nothing else at this stage.

---

### SP-03 · Intent → Structure — **P0**

**Purpose** The conversion moment. Deterministic parsing, the transformation block, and the refusal path.
**Dependencies** SP-02
**Exit** `YOU SAID` / `BASELINE BUILT` renders complete-and-empty at t=0 and fills from sources; deadline and domain resolve pre-submit with no network; bounded domains render the authored refusal and the built-instead structure.
**PRD** §3.3, §3.4, §4, §5
**Non-goals** No LLM dependency. No plan geometry. No prose or reasoning transcript of any kind.

---

### SP-04 · Execution Plan Renderer — **P0**

**Purpose** The semantic plan model, the layout abstraction, `FlatLayout`, and the object rendering that makes structure legible.
**Dependencies** SP-01
**Exit** A hand-fed `Plan` renders as an ascending route with dated occurrence marks, a protection band, and a timer segment — coherent and compelling with zero 3D and zero LLM. Reviewable as a standalone demo.
**PRD** §6, §8.1, §8.2
**Non-goals** No projection. No Peak. No generation. `FlatLayout` is the reference implementation, not a fallback.

---

### SP-05 · Plan Generation & Fallback — **P0**

**Purpose** The provider seam, the five authored scenarios, `/api/plan`, schema validation, and every failure path.
**Dependencies** SP-03, SP-04
**Exit** All five failure modes (timeout, invalid schema, rate limit, spend cap, network error) resolve to a complete plan with no dead state. `StaticProvider` alone produces a compelling demo.
**PRD** §4, §5, §12
**Non-goals** No `LiveProvider`. No Baseline backend dependency. The LLM never gains authority over anything §4 marks deterministic.

---

### SP-06 · Tune — **P0**

**Purpose** The ownership moment: two controls that visibly alter the plan, deterministically, under 400ms.
**Dependencies** SP-04, SP-05
**Exit** Time and day changes regenerate occurrences client-side with zero network calls; contention vetoes fire from a fixed rule table.
**PRD** §3.6, §4, §8.2
**Non-goals** **Tuning must never call the LLM.** No re-generation, no round trip, no server involvement.

---

### SP-07 · Protect — **P0**

**Purpose** App selection and gate assembly, ending in a live Activate affordance.
**Dependencies** SP-06
**Exit** Selections assemble a real gate object at `explicit` tier with an Activate control that implies no browser capability.
**PRD** §3.7, §4, §11
**Non-goals** No blocking. No permissions prompts. No copy suggesting the browser can enforce anything.

---

### SP-08 · Activation + Conversion — **P0**

**Purpose** The honest wall, capture, and the three terminal-action branches.
**Dependencies** SP-07
**Exit** The wall fires only from an activation attempt, never fake-activates, preserves the plan visibly, dismisses to a fully tunable state, and writes capture to Supabase staging.
**PRD** §11, §2 DS-5, DS-8
**Non-goals** No time, scroll, section, exit-intent, or interaction-count triggers. No modal on mobile.

---

### SP-09 · Share + Instrumentation — **P0**

**Purpose** The share card and the full first-party analytics funnel.
**Dependencies** SP-08
**Exit** A visitor receives a downloadable card of their plan; all fifteen events fire with correct properties; the four conversion ratios are queryable and segmented by render tier.
**PRD** §10, §21
**Non-goals** No free-form goal text in analytics. No export formats or options. Emailed delivery is P2.

---

### SP-10 · Mobile + Reliability — **P0**

**Purpose** 375px as the primary target, plus the flat rendering path and a failure-state hardening sweep.
**Dependencies** SP-08
**Exit** Full loop completes at 320px with the keyboard open; Tiers C and D complete the full loop; every failure state verified on device.
**PRD** §9, §15, §2 DS-6, DS-7
**Non-goals** No desktop composition preserved at mobile's expense. No hover-dependent interaction anywhere.

---

### SP-11 · P0 Validation Gate — **P0**

**Purpose** The gate that decides whether Peak work may begin.
**Dependencies** SP-09, SP-10
**Exit** DS-1 through DS-10 individually verified, and the six-user study passes its thresholds.
**PRD** §2, §18.1, §18.3
**Non-goals** No implementation. This project produces evidence, not code. **A failure here revises the builder; it does not lower the bar.**

---

### SP-12 · Peak Geometry + Lighting — **P1**

**Purpose** The mesh, the light rig, cursor authority, and the material that makes it read machined rather than photographed.
**Dependencies** **SP-11 must pass.**
**Exit** Silhouette recognizable as the Baseline icon by someone not told to look; light sweeps and responds to cursor with the tuned spring; three-band posterized diffuse.
**PRD** §7.1–7.4
**Non-goals** No aberration, no edge catch, no hidden B, no camera choreography.

---

### SP-13 · Plan → Peak Projection — **P1**

**Purpose** Anchoring plan objects to the mesh without introducing parallel plan logic.
**Dependencies** SP-12
**Exit** `ProjectedPeakLayout` satisfies `PlanLayout`; swapping adapters changes zero builder code; overlays track camera motion without jitter.
**PRD** §6, §7
**Non-goals** **No second plan model.** If projection needs data the semantic model lacks, extend the model — never fork it.

---

### SP-14 · Camera, Scroll + Sections — **P1**

**Purpose** Native-scroll camera movement, three stations, and the marketing sections below the fold.
**Dependencies** SP-13
**Exit** Three stations lerp on native scroll; sections 2/4/5/6 build and read correctly with the Peak at reduced opacity behind them.
**PRD** §7.5, §13
**Non-goals** No scroll hijacking of any kind. Seven-station choreography is P2.

---

### SP-15 · P1 Performance + Degradation — **P1**

**Purpose** Tier detection, lazy scene loading, and budget enforcement.
**Dependencies** SP-12
**Exit** Core bundle ≤120KB gzip; scene lazy and uncounted; all four tiers force-testable by flag; Lighthouse mobile ≥90 with the Peak live.
**PRD** §15, §16
**Non-goals** Live mid-session demotion is P2.

---

### SP-16 · Signature Polish — **P2**

**Purpose** Everything that increases memorability and blocks nothing.
**Dependencies** SP-14, SP-15
**Exit** Shipped or cut. Never delays launch (K-7).
**PRD** §7.4, §7.6, §15, §21
**Non-goals** **No P2 item may enter the P0 or P1 critical path under any circumstance.**

---

## ISSUES

---

## SP-01 · Website Foundation

**SITE-001 · Next.js scaffold, static export, Cloudflare Pages pipeline**
Project SP-01 · P0 · Deps —
*Scope* Next.js 15 App Router, TypeScript strict, Tailwind v4, static export, Cloudflare Pages deploy on merge, preview deploys on PR.
*Accept* `main` deploys automatically; PR previews resolve; typecheck and lint gate the build.
*Tests* CI: typecheck, lint, build.
*Verify* Preview URL loads on desktop and mobile.
*PRD* §16, §20
*Non-goals* No routes beyond `/`. No content.

**SITE-002 · Design tokens and Tailwind theme**
Project SP-01 · P0 · Deps SITE-001
*Scope* All nine tokens from §14 as CSS custom properties and Tailwind theme values. `--veto` restricted by lint rule to refusal/veto component paths.
*Accept* Every token consumable from Tailwind classes; a token swatch route renders all nine.
*Tests* Unit: token values match §14 exactly.
*Verify* Swatch page at 1440px and 375px.
*PRD* §14
*Non-goals* No component styling yet.

**SITE-003 · Typography system and dual-typeface harness**
Project SP-01 · P0 · Deps SITE-002
*Scope* Fluid type scale per §14. Both PP Neue Montreal and Satoshi loadable behind a flag. Metadata style (11px, `+0.06em`, `--bone-38`) as a primitive.
*Accept* A comparison route renders the hero headline in both faces at display scale, side by side.
*Tests* Unit: clamp values match §14.
*Verify* **Screenshot both faces at 1440px and 375px. This issue's output is a decision, not just code** — record which face is chosen and why.
*PRD* §14, §23 item 3
*Non-goals* No body copy typesetting yet.

**SITE-004 · Contracts manifest, generated types, and drift guard**
Project SP-01 · P0 · Deps SITE-001
*Scope* Commit `contracts-manifest.json` to the site repo — the app's `CONTRACT_MANIFEST` verbatim, plus `captured_at` and the app repo commit SHA. Generate the site's plan-model types from it at build time. Add a CI drift check per PRD v7.3 §6.6: the primary mechanism fetches the manifest the app repo publishes to a stable path on `main` and fails the site build on any diff; the fallback uses staleness thresholds against `captured_at` — warn at 30 days, fail at 60.
*Accept* Types generate from the manifest. A deliberately altered manifest fails CI. Every `capability_type` in the manifest has a layout rule; a type without one fails the build.
*Tests* CI: type generation; one negative test proving the drift guard fires. Unit: layout-rule coverage across all `capability_type` values.
*Verify* —
*PRD* v7.3 §6.2, §6.6, §12 DS-15
*Non-goals* No `@baseline/contracts` package import. No cross-repo build of the app — explicitly rejected in §6.6. **Nothing generated may read `artifact_divergences`**, which records stale counts (33 and 72) against current counts (45 and 76) in the same object.

**SITE-005 · Base layout, nav, safe areas, overflow guards**
Project SP-01 · P0 · Deps SITE-002, SITE-003
*Scope* Root layout, nav (wordmark + terminal CTA slot), `env(safe-area-inset-*)` handling, `overflow-x: clip` on root.
*Accept* Zero horizontal scroll at 320px. Nav respects notch and home indicator.
*Tests* Automated: horizontal-overflow check at 320/375/390/768/1440/1920.
*Verify* Real iOS Safari, portrait and landscape.
*PRD* §9, §18.2
*Non-goals* No nav interactivity beyond the CTA slot.

**SITE-006 · Reduced-motion and render-tier primitives**
Project SP-01 · P0 · Deps SITE-001
*Scope* `useReducedMotion()` and `useRenderTier()` hooks. Tier detection per §15 (WebGL capability, core count, `save-data`). A URL flag forcing any tier for testing.
*Accept* `?tier=A|B|C|D` forces the tier; `prefers-reduced-motion` reflected in the hook.
*Tests* Unit: detection logic against mocked capability matrices.
*Verify* —
*PRD* §8.3, §15
*Non-goals* No consumers yet. No 3D.

---

## SP-02 · Ask Baseline Hero

**SITE-007 · Fold layout and hero headline**
Project SP-02 · P0 · Deps SITE-005
*Scope* Fold composition, left-aligned, vertically centered. Headline is the LCP element and has no entrance animation.
*Accept* LCP is the headline, confirmed in Lighthouse trace. No scroll needed to see headline, input, and chips at 375px and 1440px.
*Tests* Automated: LCP element assertion.
*Verify* **Screenshot 1440px and 375px.** Visual hierarchy: headline dominant, input clearly primary action.
*PRD* §13, §2 DS-1, §16
*Non-goals* No background. No Peak.

**SITE-008 · Ask Baseline input component**
Project SP-02 · P0 · Deps SITE-007
*Scope* Input with `Ask Baseline` placeholder, lavender status dot, focus state (border + bloom), run button with enabled/disabled states, 300-char cap.
*Accept* Focus ring visible and keyboard-reachable. Run disabled below 2 chars.
*Tests* Unit: enable/disable thresholds.
*Verify* **Screenshot focus and blur at both widths.** Must not read as a generic chat box.
*PRD* §3.2, §14
*Non-goals* No submit handling.

**SITE-009 · Autotype demonstration**
Project SP-02 · P0 · Deps SITE-008
*Scope* After 800ms idle, self-type one example, then stop and wait. Cancels on any interaction. Disabled under reduced motion (input pre-filled instead).
*Accept* **Never auto-submits.** Any keypress, click, or focus cancels immediately and permanently.
*Tests* Unit: cancel-on-interaction; no submit path reachable from autotype.
*Verify* Reduced-motion on and off.
*PRD* §3.2, §8.3
*Non-goals* No generation trigger.

**SITE-010 · Suggestion chip pool and archetype tagging**
Project SP-02 · P0 · Deps SITE-008
*Scope* Twelve chips, each tagged with one of the five archetypes from §5. Chip click fills input, focuses, places caret at end.
*Accept* Every chip maps to a defined archetype. Caret lands at end so the user can extend.
*Tests* Unit: all twelve tagged; no untagged chip can be added (type-enforced).
*Verify* **Screenshot at 375px** — horizontal scroll, no wrap, 44px min height.
*PRD* §3.2, §5, §9
*Non-goals* No rotation logic.

**SITE-011 · Constrained rotation, shuffle, engagement lock**
Project SP-02 · P0 · Deps SITE-010
*Scope* Rotate three at a time every 6s with staggered crossfade. **Sampling constrained so every displayed set contains at least one of `back`, `thesis`, or `lsat`.** Manual shuffle. Pause on hover (desktop only). Any typing or chip selection stops rotation permanently.
*Accept* 1000 simulated rotations produce zero all-habit sets. Rotation never resumes after engagement.
*Tests* Unit: constraint satisfaction over 1000 draws; permanence of the engagement lock.
*Verify* Mobile — confirm no hover dependency.
*PRD* §3.2, §5, §9
*Non-goals* No archetype content authoring (SITE-028).

**SITE-012 · Hero → builder state machine**
Project SP-02 · P0 · Deps SITE-009, SITE-011
*Scope* Explicit states: `idle → engaged → submitted → building → plan_ready → tuning → protecting → walled`. Single source of truth for the whole demo.
*Accept* Every transition is explicit and testable; no state reachable by side effect.
*Tests* Unit: full transition matrix, including illegal transitions rejected.
*Verify* —
*PRD* §3.1, §11.1
*Non-goals* No rendering. **The `walled` state must be reachable only from an activation attempt** — enforce in the machine, not in the UI.

---

## SP-03 · Intent → Structure

**SITE-013 · Deterministic date-phrase parser**
Project SP-03 · P0 · Deps SITE-001
*Scope* Client-side parser for deadline phrases: "by May", "before March", "in 6 weeks", "by the end of the quarter", explicit dates. Returns a date or null. No network.
*Accept* Fixture suite of 60+ phrases passes. Ambiguous phrasing returns null rather than guessing.
*Tests* Unit: full fixture suite, including negative cases and DST boundaries.
*Verify* —
*PRD* §3.3, §4
*Non-goals* No LLM involvement, ever. No natural-language recurrence parsing.

**SITE-014 · Deterministic domain classifier**
Project SP-03 · P0 · Deps SITE-001
*Scope* Pattern list for five bounded domains: injury, medical, mental health, finance, legal. Returns a `DomainTier`. Mirrored server-side for `/api/plan`.
*Accept* Client and server classifiers produce identical output for every fixture. False negatives are the failure mode that matters — err toward bounded.
*Tests* Unit: 80+ fixtures; client/server parity test.
*Verify* —
*PRD* §3.4, §4
*Non-goals* **The LLM does not classify.** It may later escalate (SITE-033), never de-escalate.

**SITE-015 · Transformation block frame**
Project SP-03 · P0 · Deps SITE-003, SITE-012
*Scope* Three-column `YOU SAID` / `BASELINE BUILT` frame per §3.4. **Renders complete and empty at t=0.** Empty fields show `—`, never a shimmer.
*Accept* Frame is present in the DOM before any async work resolves. No skeleton, no spinner, anywhere.
*Tests* Automated: frame present at t=0 with network fully blocked.
*Verify* **Screenshot at 1440px and 375px with network throttled to offline.** This is the anti-spinner guarantee.
*PRD* §3.4, §2 DS-10
*Non-goals* No prose. No explanation. No chain-of-thought. No reasoning transcript.

**SITE-016 · Progressive field fill**
Project SP-03 · P0 · Deps SITE-015
*Scope* Rows fill as sources resolve, per-row opacity 200ms, no stagger schedule. Raw intent and deadline instant; commitment and window on generation arrival; protection at protect step.
*Accept* With generation stubbed to 3.5s, deadline and domain are visible within 100ms of submit.
*Tests* Automated: timing assertions per row against §3.1.
*Verify* **Throttled network at both widths.** Nothing should feel like waiting.
*PRD* §3.1, §3.4
*Non-goals* No stagger animation. Rows fill on data, not on a timeline.

**SITE-017 · Authored refusal copy set**
Project SP-03 · P0 · Deps SITE-014
*Scope* Five authored refusals, one per bounded domain, plus the "built instead" structure for each (commitment to get real help + relevant tracker).
*Accept* All five are authored constants. **No code path generates refusal text.**
*Tests* Unit: refusal text is a constant lookup; a test asserts no template interpolation from model output.
*Verify* Copy review against §19 bans.
*PRD* §3.4, §4, §5
*Non-goals* No generated refusals under any circumstance.

**SITE-018 · Refusal render path**
Project SP-03 · P0 · Deps SITE-016, SITE-017
*Scope* `BASELINE DECLINED` variant of the transformation block, `--veto` left rule, opacity-only 300ms, 400ms hold, no spring.
*Accept* Refusal path uses no settling spring. Built-instead objects still land normally afterward.
*Tests* Automated: assert no spring config on the refusal element.
*Verify* **Screenshot at both widths.** Must read as the system stopping, not producing.
*PRD* §3.4, §8.1, §8.2
*Non-goals* No apology tone. No hedging copy.

**SITE-019 · Live pre-submit parse binding**
Project SP-03 · P0 · Deps SITE-013, SITE-015
*Scope* Bind the parser to input changes so the deadline field materializes mid-typing, before submit.
*Accept* Typing "by May" surfaces the deadline with zero network requests, verified in devtools.
*Tests* Automated: no fetch calls during typing.
*Verify* **Record a clip at 1440px and 375px.** This detail carries disproportionate perceived quality.
*PRD* §3.3
*Non-goals* No generation trigger on keystroke.

---

## SP-04 · Execution Plan Renderer

**SITE-020 · Plan semantic model**
Project SP-04 · P0 · Deps SITE-004
*Scope* `Plan`, `PlanNode`, `Commitment`, `Occurrence`, `Timer`, `Gate`, `Tracker` per §6, typed against contracts.
*Accept* Every type traces to a contract type or is explicitly documented as presentation-only.
*Tests* Unit: model round-trips through contract validation.
*Verify* —
*PRD* §6, §4
*Non-goals* **No renderer coupling.** The model must not know a layout exists.

**SITE-021 · PlanLayout interface**
Project SP-04 · P0 · Deps SITE-020
*Scope* `PlanLayout` with `anchorFor(node)` per §6.
*Accept* Interface is renderer-agnostic; a stub adapter compiles.
*Tests* Unit: stub adapter satisfies the interface.
*Verify* —
*PRD* §6
*Non-goals* No concrete adapters.

**SITE-022 · FlatLayout adapter**
Project SP-04 · P0 · Deps SITE-021
*Scope* Deterministic 2D composition — ascending route with dated marks, protection band, timer segment.
*Accept* **Renders a coherent, compelling plan with zero 3D and zero LLM.** Reviewable as a standalone product demo.
*Tests* Unit: anchor determinism for a fixed plan.
*Verify* **Screenshot at 1440px and 375px.** Design review gate: is this compelling on its own? If not, the whole P0 is at risk.
*PRD* §6, §2 DS-6
*Non-goals* Not a degraded mode. This is the reference implementation.

**SITE-023 · Occurrence generator**
Project SP-04 · P0 · Deps SITE-020
*Scope* Expand a recurrence rule into dated occurrences over the rolling window. DST-safe, timezone-correct, real weekday math.
*Accept* Weekdays over 14 days yields exactly 10. DST transition fixtures pass in both directions.
*Tests* Unit: 40+ fixtures including DST, month boundaries, leap year, and all closed-set rules.
*Verify* —
*PRD* §4, §18.2
*Non-goals* **The LLM never computes or adjusts dates.**

**SITE-024 · Settling spring primitive**
Project SP-04 · P0 · Deps SITE-006
*Scope* The single signature spring from §8.1, exposed as one primitive. A lint rule restricts its import to structure-landing components.
*Accept* Spring config matches §8.1 exactly. Lint fails if imported outside the allowlist.
*Tests* Automated: lint rule negative test.
*Verify* —
*PRD* §8.1
*Non-goals* No other motion primitives here.

**SITE-025 · Route and occurrence mark rendering**
Project SP-04 · P0 · Deps SITE-022, SITE-023, SITE-024
*Scope* Route stroke-reveal 450ms; occurrence marks land with 45ms stagger, settling spring, ~600ms total. **Interruptible.** Each mark labeled with its real date at 11px.
*Accept* **Tune controls are interactive before the fan-out completes.** Interrupting mid-animation leaves no orphaned state.
*Tests* Automated: control enablement fires on data availability, not animation completion.
*Verify* **Screenshot and clip at both widths.** Motion timing review — does the fan-out read as ten real dated objects existing?
*PRD* §8.2, §3.1, §17 K-4
*Non-goals* Do not shorten the stagger. It carries product meaning.

**SITE-026 · Timer, gate, and tracker object rendering**
Project SP-04 · P0 · Deps SITE-025
*Scope* Timer as a thickened route segment with real duration; gate as a protection band with hard edges; tracker as an off-route node. Each carries type and authority tier as 11px metadata.
*Accept* Authority tiers are contract-derived, not passed in. Gate always renders `explicit`.
*Tests* Unit: tier derivation is a pure function of object type.
*Verify* **Screenshot at both widths.**
*PRD* §4, §5.2 (v4 lineage), §14
*Non-goals* No activation behavior.

---

## SP-05 · Plan Generation & Fallback

**SITE-027 · ScenarioProvider interface**
Project SP-05 · P0 · Deps SITE-004, SITE-020
*Scope* `ScenarioProvider` per §12, yielding `AgentEvent` from contracts.
*Accept* Interface compiles against contract types; a stub provider satisfies it.
*Tests* Unit: stub conformance.
*Verify* —
*PRD* §12
*Non-goals* No implementations.

**SITE-028 · Five authored scenarios**
Project SP-05 · P0 · Deps SITE-027
*Scope* `thesis`, `gym`, `lsat`, `mornings`, `back` per §5, authored against frozen contracts. Every verb drawn from the 45 action types in `contracts-manifest.json`; every enum value real; occurrence counts from the real generator. Scenarios use only the five `capability_type` values — `commitment · reminder · timer · gate · tracker` — and only the five resolvable outcomes (`complete · partial · missed · cancelled_intentionally · unknown`).
*Accept* All five validate against contract schema. Each demonstrates its stated distinct behavior.
*Tests* Automated: schema validation of all five; assertion that each contains its signature behavior (veto, refusal, timer, gate-first, long-horizon).
*Verify* **Play all five end to end and review.** These are demo scripts, not filler.
*PRD* §5
*Non-goals* No generic habits. No invented verbs.

**SITE-029 · StaticProvider**
Project SP-05 · P0 · Deps SITE-028
*Scope* Serves authored scenarios on a timing curve. Nearest-archetype matching for arbitrary input. **Raw intent stays the user's; only structure is substituted.**
*Accept* An arbitrary goal produces a complete plan with the user's own words retained in `YOU SAID`.
*Tests* Unit: matcher coverage; raw intent preserved verbatim.
*Verify* **Full loop with generation disabled entirely, at both widths.** Must feel complete, not degraded.
*PRD* §5, §12, §2 DS-7
*Non-goals* No network.

**SITE-030 · `/api/plan` route and prompt**
Project SP-05 · P0 · Deps SITE-028
*Scope* Edge route calling Claude. Constrained system prompt, few-shot on the five scenarios, action vocabulary restricted to the 45 types in `contracts-manifest.json`, JSON only, `max_tokens: 1000`, 300-char input cap.
*Accept* **Total generated surface is one commitment title (≤48 chars) and one window selection from a closed set.** Nothing else.
*Tests* Automated: prompt-output contract test over 30 varied inputs; assertion that no other field originates from the model.
*Verify* —
*PRD* §4, §12
*Non-goals* The model never returns dates, counts, tiers, refusals, or copy.

**SITE-031 · Schema validation layer**
Project SP-05 · P0 · Deps SITE-030
*Scope* Validate every model response against contract schema before it reaches the client. Reject on any deviation.
*Accept* Malformed, truncated, extra-field, and wrong-enum responses all reject.
*Tests* Unit: 20+ malformed fixtures, all rejected. One test proving a rejected response never reaches client state.
*Verify* —
*PRD* §4, §12
*Non-goals* No lenient parsing. No coercion. No repair attempts.

**SITE-032 · GeneratedProvider with hard timeout**
Project SP-05 · P0 · Deps SITE-031
*Scope* Provider wrapping `/api/plan`. **Hard 4000ms timeout with abort.** Emits validated events only.
*Accept* At 4001ms the request aborts and fallback engages. No orphaned request mutates state after abort.
*Tests* Automated: timeout boundary; post-abort state immutability.
*Verify* Throttled to 3G at both widths.
*PRD* §12, §3.1
*Non-goals* No retry. No streaming raw model text to the client.

**SITE-033 · Fallback orchestration**
Project SP-05 · P0 · Deps SITE-029, SITE-032
*Scope* All five failure modes route to `StaticProvider`: timeout, invalid schema, rate limit, spend cap, network error. Each fires `plan_generation_fallback` with its reason. **Model-flagged escalation to bounded domain is honored; de-escalation is discarded.**
*Accept* **Each of the five force-tested end to end with no dead state.** The deterministic read-back is already on screen in every case.
*Tests* Automated: all five failure modes as integration tests; escalation-only assertion.
*Verify* **Force each mode manually at both widths.** DS-7 and DS-10 depend on this issue.
*PRD* §12, §4, §2 DS-7, DS-10
*Non-goals* No user-visible error message. Fallback is silent.

**SITE-034 · Rate limit, spend cap, kill switch**
Project SP-05 · P0 · Deps SITE-032
*Scope* 5/hr/IP, 2/min burst, daily spend cap, and a kill switch flipping all traffic to `StaticProvider`.
*Accept* Kill switch takes effect without redeploy. Limits enforced at the edge.
*Tests* Automated: limit enforcement; kill-switch path.
*Verify* —
*PRD* §12
*Non-goals* No CAPTCHA.

---

## SP-06 · Tune

**SITE-035 · Time-of-day control**
Project SP-06 · P0 · Deps SITE-025
*Scope* Segmented control, desktop and mobile ergonomics, 44px targets.
*Accept* Keyboard-operable; visible focus.
*Tests* Unit: state binding.
*Verify* **Screenshot at both widths.**
*PRD* §3.6, §9
*Non-goals* No regeneration logic.

**SITE-036 · Days-of-week control**
Project SP-06 · P0 · Deps SITE-025
*Scope* Seven pills, 40×40 minimum, wrapping to two rows below 375px.
*Accept* Keyboard-operable; no hover dependency.
*Tests* Unit: state binding.
*Verify* **Screenshot at 320px and 375px.**
*PRD* §3.6, §9
*Non-goals* No regeneration logic.

**SITE-037 · Live regeneration pipeline**
Project SP-06 · P0 · Deps SITE-035, SITE-036, SITE-023
*Scope* Control change → recurrence rule update → occurrence re-expansion → re-render. Exit 120ms, re-enter 30ms stagger. **Fully client-side.**
*Accept* **Under 400ms end to end, measured, every time (DS-4). Zero network requests, asserted.**
*Tests* Automated: latency assertion over 50 tune operations; network-call count assertion equals zero.
*Verify* **Clip at both widths.** Must feel instant.
*PRD* §3.6, §4, §8.2, §2 DS-4
*Non-goals* **Tuning must never call the LLM.** This is the single most important boundary in SP-06.

**SITE-038 · Contention veto rule table**
Project SP-06 · P0 · Deps SITE-037
*Scope* Fixed deterministic rule table detecting collisions. Renders the veto with refusal treatment (no spring, `--veto` rule).
*Accept* Same input always produces the same veto. Veto copy is authored, not generated.
*Tests* Unit: rule table determinism over fixtures.
*Verify* **Screenshot at both widths.**
*PRD* §3.6, §4
*Non-goals* No model involvement.

---

## SP-07 · Protect

**SITE-039 · App selection control**
Project SP-07 · P0 · Deps SITE-037
*Scope* Six app chips, multi-select, 44px targets, horizontal scroll at mobile.
*Accept* Keyboard-operable; selection state visible without color alone.
*Tests* Unit: selection state.
*Verify* **Screenshot at both widths.**
*PRD* §3.7, §9
*Non-goals* No permissions API calls of any kind.

**SITE-040 · Gate assembly**
Project SP-07 · P0 · Deps SITE-039, SITE-026
*Scope* Selections assemble a real `Gate` object at `explicit` tier, rendering as the protection band with app names and window.
*Accept* Tier is contract-derived and always `explicit`.
*Tests* Unit: tier derivation.
*Verify* **Screenshot at both widths.**
*PRD* §3.7, §4
*Non-goals* No activation.

**SITE-041 · Activate affordance**
Project SP-07 · P0 · Deps SITE-040
*Scope* Dimmed gate card with a live Activate control. Copy audit ensuring **no implication that the browser can block anything.**
*Accept* No copy anywhere states or implies active protection (DS-8).
*Tests* Automated: copy-string audit against a banned-implication list.
*Verify* Copy review, both widths.
*PRD* §3.7, §11, §2 DS-8
*Non-goals* No wall behavior.

---

## SP-08 · Activation + Conversion

**SITE-042 · Activation trigger wiring**
Project SP-08 · P0 · Deps SITE-041, SITE-012
*Scope* The **only** path into the `walled` state, from Activate on a gate, timer, or reminder.
*Accept* **No time, scroll depth, section entry, exit intent, or interaction count can reach `walled`.** Enforced in the state machine.
*Tests* Automated: exhaustive negative test — attempt to reach `walled` by every other means and assert failure.
*Verify* Manual: scroll the entire page, idle 5 minutes, move to exit — wall never appears.
*PRD* §11.1
*Non-goals* No wall UI.

**SITE-043 · Wall — desktop**
Project SP-08 · P0 · Deps SITE-042
*Scope* Non-modal overlay, plan visible behind 40% dim, 240ms dim, content fades up, no scale or bounce.
*Accept* **Never fake-activates.** Plan remains visible and legible behind.
*Tests* Automated: assert no "activated" state string reachable.
*Verify* **Screenshot at 1440px.** Must read as a boundary, not an event.
*PRD* §11.2, §11.3, §8.2
*Non-goals* No mobile behavior.

**SITE-044 · Wall — mobile bottom sheet**
Project SP-08 · P0 · Deps SITE-043
*Scope* Bottom sheet, keyboard-aware via `visualViewport`, safe-area padding, plan visible above.
*Accept* With the keyboard open, the email field and submit are both visible at 375px and 320px.
*Tests* Automated: viewport assertions.
*Verify* **Real iOS Safari and Android Chrome, keyboard open and dismissed.**
*PRD* §9, §11.3
*Non-goals* No centered modal on mobile, ever.

**SITE-045 · Terminal action configuration**
Project SP-08 · P0 · Deps SITE-043
*Scope* `TerminalAction = 'waitlist' | 'testflight' | 'appstore'` with **all three UI branches fully built**, selected by config.
*Accept* Switching config changes the branch with no code change and no redeploy of components.
*Tests* Unit: all three branches render and submit correctly.
*Verify* **Screenshot all three at both widths.**
*PRD* §11.4, §23 item 1
*Non-goals* No hardcoded form.

**SITE-046 · Capture schema and write**
Project SP-08 · P0 · Deps SITE-045
*Scope* Supabase **staging** table with all eleven fields from §11.5. Honeypot, rate limit, no CAPTCHA.
*Accept* Row lands with `generated_plan` and `raw_goal` intact. Honeypot submissions rejected silently.
*Tests* Automated: write integration test; honeypot rejection test.
*Verify* Inspect a real row.
*PRD* §11.5
*Non-goals* **Never the production project.**

**SITE-047 · Dismissal, continued tuning, pinned save bar**
Project SP-08 · P0 · Deps SITE-044
*Scope* Dismiss returns to a fully tunable plan; a single pinned `save my plan` bar persists; wall re-reachable by another activation attempt.
*Accept* After dismissal, tune and protect both still work fully.
*Tests* Automated: post-dismissal interactivity assertions.
*Verify* **Both widths.** No trapping, no re-prompting on scroll.
*PRD* §11.3
*Non-goals* No exit-intent re-trigger.

---

## SP-09 · Share + Instrumentation

**SITE-048 · Share card renderer**
Project SP-09 · P0 · Deps SITE-046
*Scope* 1200×630 canvas card with all seven elements from §21. Client-side generation. Download and clipboard copy.
*Accept* Card contains the goal in the user's words, commitment, frequency and count, window, deadline where present, protected apps where selected, mark and URL.
*Tests* Unit: element presence for plans with and without deadline/protection.
*Verify* **Inspect output at 1200×630.** Renders after the wall so it rewards conversion.
*PRD* §21
*Non-goals* No formats, no options, no export system. Email delivery is P2.

**SITE-049 · Analytics client and event schema**
Project SP-09 · P0 · Deps SITE-001
*Scope* First-party client, typed event schema for all fifteen events in §10 with their exact properties.
*Accept* Event names and properties match §10 exactly. Adding an untyped property fails typecheck.
*Tests* Unit: schema conformance.
*Verify* —
*PRD* §10
*Non-goals* No third-party SDK.

**SITE-050 · Builder event instrumentation**
Project SP-09 · P0 · Deps SITE-049, SITE-047
*Scope* Fire all fifteen events at correct points with correct properties, including `plan_generation_fallback` reasons.
*Accept* A full manual loop produces the complete expected event sequence in order.
*Tests* Automated: end-to-end event sequence assertion for a happy path and a fallback path.
*Verify* Inspect the live event stream through one full loop.
*PRD* §10
*Non-goals* No dashboards.

**SITE-051 · PII guard**
Project SP-09 · P0 · Deps SITE-050
*Scope* A guard preventing any free-form user text from entering an analytics payload. Structural metadata only.
*Accept* **Attempting to attach `raw_goal` or a commitment title to any analytics event fails at compile time.**
*Tests* Automated: negative typecheck test; runtime payload scan asserting no field exceeds a structural-value allowlist.
*Verify* Inspect payloads for a goal containing a name and a place.
*PRD* §10, §18.2
*Non-goals* Capture (SITE-046) is the sanctioned path for goal text and is unaffected.

**SITE-052 · Conversion funnel and tier segmentation**
Project SP-09 · P0 · Deps SITE-050
*Scope* The four ratios from §10.1, queryable and **segmented by render tier** per §10.2.
*Accept* `hero_view → builder_engaged` is comparable across tiers A/B/C/D.
*Tests* Automated: query correctness against seeded events.
*Verify* Dashboard review.
*PRD* §10.1, §10.2, §17 K-1
*Non-goals* No attribution or acquisition analytics.

---

## SP-10 · Mobile + Reliability

**SITE-053 · 375px builder layout pass**
Project SP-10 · P0 · Deps SITE-047
*Scope* Full builder composition at 375px. Plan renders via `FlatLayout` in-flow; Peak (when it exists) sits behind at reduced opacity.
*Accept* **Full loop completes at 375px without scrolling below the fold to reach the plan (DS-1).**
*Tests* Automated: viewport assertions per step.
*Verify* **Real device, iOS Safari and Android Chrome. Screenshot every builder step.**
*PRD* §9, §2 DS-1
*Non-goals* No desktop composition preserved at mobile's cost.

**SITE-054 · Keyboard handling via visualViewport**
Project SP-10 · P0 · Deps SITE-053
*Scope* Keep the input **and** the transformation block above the keyboard. Never scroll the input off-screen.
*Accept* At 375px with keyboard open, input and at least three transformation rows remain visible.
*Tests* Automated where possible; primarily manual.
*Verify* **Real iOS Safari — this cannot be validated in responsive mode.**
*PRD* §9
*Non-goals* No custom keyboard behavior.

**SITE-055 · Mobile tune and protect ergonomics**
Project SP-10 · P0 · Deps SITE-053
*Scope* Time scroller and day pills at 44px/40px minimums; app chips horizontal scroll with momentum.
*Accept* All targets ≥44×44. No hover dependency anywhere.
*Tests* Automated: touch-target size audit across all interactive elements.
*Verify* **Real device, one-handed use.**
*PRD* §9
*Non-goals* —

**SITE-056 · Plan density collapse**
Project SP-10 · P0 · Deps SITE-053
*Scope* Below 700px viewport height, occurrences collapse to next 5 + "and 5 more", expanding on tap.
*Accept* Plan remains understandable in limited vertical space.
*Tests* Unit: collapse threshold.
*Verify* **Screenshot at 375×667 and 375×812.**
*PRD* §9
*Non-goals* No horizontal scrolling of the plan.

**SITE-057 · Overflow and touch-target audit**
Project SP-10 · P0 · Deps SITE-055
*Scope* Automated sweep for horizontal overflow and undersized targets across all breakpoints and all builder states.
*Accept* **Zero horizontal scroll at 320px in every state.** Zero targets below 44×44.
*Tests* Automated: full-state sweep in CI.
*Verify* —
*PRD* §9, §18.2
*Non-goals* —

**SITE-058 · Tier C/D flat rendering path**
Project SP-10 · P0 · Deps SITE-022, SITE-006
*Scope* Wire `FlatLayout` as the plan adapter for Tiers C and D. Static or CSS-gradient background.
*Accept* **Full loop completes with WebGL fully disabled (DS-6).**
*Tests* Automated: full loop in a WebGL-disabled browser context.
*Verify* **Force Tier D and complete the loop at both widths.**
*PRD* §15, §2 DS-6
*Non-goals* No Peak.

**SITE-059 · Failure-state hardening sweep**
Project SP-10 · P0 · Deps SITE-033, SITE-058
*Scope* Cross-product sweep: each of five generation failures × each of four tiers × both widths.
*Accept* **Forty combinations, zero dead states, zero spinners, zero broken layouts.**
*Tests* Automated matrix where feasible.
*Verify* Manual spot-check of at least twelve combinations, documented.
*PRD* §2 DS-6, DS-7, DS-10, §12, §15
*Non-goals* —

---

## SP-11 · P0 Validation Gate

**SITE-060 · Demo success criteria verification**
Project SP-11 · P0 · Deps SITE-059, SITE-052
*Scope* Verify DS-1 through DS-10 individually, each with documented evidence.
*Accept* All ten pass. DS-3 and DS-4 verified from instrumented data, not estimates.
*Tests* Automated where the criterion allows.
*Verify* **Written evidence per criterion, screenshots attached.**
*PRD* §2, §18.1
*Non-goals* No code changes — this issue produces evidence. Failures open new issues.

**SITE-061 · First-time user study**
Project SP-11 · P0 · Deps SITE-060
*Scope* Execute §2.1 with six users (two mobile, four desktop), score against the §18.3 rubric.
*Accept* **5/6 reach the wall unprompted · 4/6 tune without being told · 5/6 give a passing comprehension answer.**
*Tests* n/a
*Verify* Recordings, timings, and scored transcripts archived.
*PRD* §2.1, §18.3
*Non-goals* **No P1 work begins until this passes. A failure revises the builder; it does not lower the bar (K-5).**

---

## SP-12 · Peak Geometry + Lighting — **gated on SITE-061**

**SITE-062 · Peak mesh and silhouette match**
Project SP-12 · P1 · Deps SITE-061
*Scope* 300–450 triangle flat-shaded ridge from the mark. Vertex AO baked at build.
*Accept* **Three people who know the app icon but weren't told to look identify the silhouette in under a second.**
*Tests* Automated: triangle count, flat-normal assertion.
*Verify* **Screenshot at 1440px.** If geometry fidelity blocks plan readability later, K-3 applies and readability wins.
*PRD* §7.1, §17 K-3
*Non-goals* No lighting, no material.

**SITE-063 · Light rig and autonomous sweep**
Project SP-12 · P1 · Deps SITE-062
*Scope* Key, fill, and shader rim per §7.2. Coprime sweep periods.
*Accept* Sweep does not visibly loop over five minutes of observation.
*Tests* Unit: sweep function periodicity.
*Verify* **Five-minute observation at 1440px.**
*PRD* §7.2
*Non-goals* No cursor input.

**SITE-064 · Cursor authority and spring tuning**
Project SP-12 · P1 · Deps SITE-063
*Scope* Authority 0.75 active, decaying over 2000ms after leave. Spring `0.055`, clamped so the light cannot black out the peak.
*Accept* Light visibly trails the cursor. **This issue's real output is a tuned constant** — record the final value and why.
*Tests* Unit: clamping bounds; decay curve.
*Verify* **Interaction review at 1440px.** Sticky reads cheap; slow reads broken.
*PRD* §7.2, §23 item 4
*Non-goals* No mobile input.

**SITE-065 · Posterized diffuse and rim material**
Project SP-12 · P1 · Deps SITE-063
*Scope* Albedo `#0E0C18`, three-band Lambert with 0.04 transition, Fresnel rim.
*Accept* **Reads machined, not photographed.** No smooth photoreal gradient anywhere on the surface.
*Tests* —
*Verify* **Screenshot at three light angles, 1440px.** Design review against §19 scene bans.
*PRD* §7.3, §19
*Non-goals* No aberration, no edge catch (both P2).

**SITE-066 · Bloom, grain, vignette**
Project SP-12 · P1 · Deps SITE-065
*Scope* Post chain items 1–3 from §7.4, in order.
*Accept* **Bloom affects the rim only** — broad-area bloom means the threshold is wrong. Grain covers UI as well as scene.
*Tests* Automated: frame-time delta per pass.
*Verify* **Screenshot at both widths.** K-2 applies if any pass hurts mobile frame budget.
*PRD* §7.4, §17 K-2
*Non-goals* Aberration is P2.

---

## SP-13 · Plan → Peak Projection

**SITE-067 · Named anchor set**
Project SP-13 · P1 · Deps SITE-062
*Scope* Author named vertices: `summit`, `route[0..n]`, `band_l/r`, `timer_start/end`.
*Accept* Anchors are stable across mesh edits or the build fails.
*Tests* Automated: anchor presence assertion.
*Verify* —
*PRD* §6, §7.1
*Non-goals* No projection math.

**SITE-068 · ProjectedPeakLayout adapter**
Project SP-13 · P1 · Deps SITE-067, SITE-021
*Scope* Satisfy `PlanLayout` by projecting anchors to screen space each frame.
*Accept* **Swapping from `FlatLayout` changes zero builder code**, asserted by test. Overlays track camera motion without jitter.
*Tests* Automated: adapter-swap test proving builder module graph is unchanged.
*Verify* **Clip at 1440px through camera movement.**
*PRD* §6
*Non-goals* **No parallel plan model.** If projection needs missing data, extend the semantic model.

**SITE-069 · StaticPeakLayout adapter**
Project SP-13 · P1 · Deps SITE-068
*Scope* Pre-computed anchors against a static peak image for Tier C.
*Accept* Satisfies the same interface; plan remains coherent.
*Tests* Unit: interface conformance.
*Verify* **Force Tier C, screenshot at both widths.**
*PRD* §6, §15
*Non-goals* No live 3D.

---

## SP-14 · Camera, Scroll + Sections

**SITE-070 · Native scroll progress and camera spline**
Project SP-14 · P1 · Deps SITE-068
*Scope* Read `scrollY`, normalize, lerp camera along an authored spline.
*Accept* **Zero wheel interception. No Lenis, no locomotive, no `scroll-behavior` override, asserted by an import ban in CI.**
*Tests* Automated: import ban; no `preventDefault` on wheel or touchmove.
*Verify* **Real iOS Safari — momentum scroll must feel native.**
*PRD* §7.5, §18.2
*Non-goals* No stations yet.

**SITE-071 · Three camera stations**
Project SP-14 · P1 · Deps SITE-070
*Scope* Base, Mid, Wide. Snap rather than lerp under reduced motion.
*Accept* Transitions are smooth on scrub in both directions.
*Tests* —
*Verify* **Clip at 1440px, and reduced-motion on.**
*PRD* §7.5, §8.3
*Non-goals* Seven-station choreography is P2.

**SITE-072 · Sections 2, 4, 5, 6**
Project SP-14 · P1 · Deps SITE-071
*Scope* "What you didn't see", "What it won't do", "Method" with progressive disclosure, "Join". Copy per §13, audited against §19 bans.
*Accept* **Zero banned words. Zero ALL-CAPS eyebrows. No identical rounded cards in a row.**
*Tests* Automated: copy audit against the §19 word list.
*Verify* **Screenshot each at both widths.**
*PRD* §13, §19
*Non-goals* No ADHD-specific positioning. Wide funnel preserved.

**SITE-073 · Day 1 → Day 30**
Project SP-14 · P1 · Deps SITE-072
*Scope* Scroll-scrubbed transition of the same plan across 30 days: window shifts, a day drops, a gate appears, two occurrences resolve `unknown` without penalty.
*Accept* Scrubs cleanly in both directions. Becomes a two-position toggle under reduced motion.
*Tests* —
*Verify* **Clip at both widths, and reduced-motion on.**
*PRD* §13, §8.3
*Non-goals* —

**SITE-074 · Metadata, OG card, legal pages**
Project SP-14 · P1 · Deps SITE-072
*Scope* Rewritten title/description matching current positioning, generated 1200×630 OG card, favicon set, `theme-color`, `/privacy`, `/terms`.
*Accept* **`og:image` no longer points at a `lovable.app` URL.** No copy references pre-pivot environment/blocker positioning.
*Tests* Automated: metadata assertions; URL-domain check.
*Verify* Preview cards in a social debugger.
*PRD* §13, §18.2
*Non-goals* No blog, no `/pricing`.

---

## SP-15 · P1 Performance + Degradation

**SITE-075 · Tier detection and assignment**
Project SP-15 · P1 · Deps SITE-066, SITE-006
*Scope* Wire real detection to real tier behavior per §15. Detection at load only.
*Accept* All four tiers force-testable by URL flag and correctly auto-assigned.
*Tests* Unit: assignment against mocked capability matrices.
*Verify* Real low-end Android.
*PRD* §15
*Non-goals* Live demotion is P2.

**SITE-076 · Scene lazy load and budget enforcement**
Project SP-15 · P1 · Deps SITE-075
*Scope* Scene bundle loads on `requestIdleCallback` after LCP, split from core.
*Accept* **Core ≤120KB gzip, scene ≤140KB gzip and excluded from first load. Enforced in CI.**
*Tests* Automated: bundle-size CI gate on both budgets separately.
*Verify* Lighthouse trace confirming the headline is LCP with the Peak live.
*PRD* §16
*Non-goals* —

**SITE-077 · Half-res mobile render path**
Project SP-15 · P1 · Deps SITE-075
*Scope* Tier B renders to a half-res target and upscales; grain retained (it hides the upscale); aberration absent.
*Accept* Frame budget ≤12ms on a mid-range device.
*Tests* Automated: frame-time measurement.
*Verify* **Real mid-range Android.** K-2 applies on failure.
*PRD* §15, §16, §17 K-2
*Non-goals* —

**SITE-078 · Performance CI gate**
Project SP-15 · P1 · Deps SITE-076
*Scope* Lighthouse mobile in CI, all §16 budgets asserted.
*Accept* **Lighthouse mobile perf ≥90 with the Peak live. Build fails below budget.**
*Tests* Automated: full budget suite.
*Verify* Reported number recorded per release.
*PRD* §16, §18.2
*Non-goals* —

---

## SP-16 · Signature Polish — **P2, never launch-blocking**

**SITE-079 · Chromatic aberration** — P2 · Deps SITE-066 · Radial, 1.4px at corners, lavender-biased. Dropped at Tier B and below. *Verify* 1440px. *PRD* §7.4. **K-2 removes it on any mobile budget impact.**

**SITE-080 · Facet edge catch** — P2 · Deps SITE-065 · 1px brightened line on facet boundaries within 20° of key. *Verify* three light angles. *PRD* §7.4.

**SITE-081 · The hidden B** — P2 · Deps SITE-064 · Geometry genuinely resolves the counters at azimuth ≈34°, elevation ≈18°; hairline trace after 600ms hold within 6°. **No copy, no hint, no tooltip.** *Verify* the angle exists and is findable by sweep. *PRD* §7.6. **Explicitly not a launch blocker.**

**SITE-082 · Full seven-station choreography** — P2 · Deps SITE-071 · Expand three stations to seven including return-to-base. *Verify* clip at both widths. *PRD* §7.5.

**SITE-083 · Live tier demotion** — P2 · Deps SITE-075 · One demotion on two frame-budget breaches within 10s; never promote back. *Tests* automated breach simulation. *PRD* §15.

**SITE-084 · Emailed plan delivery** — P2 · Deps SITE-048, SITE-046 · Plain-text email containing the plan. *PRD* §21.

---

## SUMMARY

### Project table

| ID | Project | Pri | Issues | Depends on |
|---|---|---|---|---|
| SP-01 | Website Foundation | P0 | 6 | — |
| SP-02 | Ask Baseline Hero | P0 | 6 | SP-01 |
| SP-03 | Intent → Structure | P0 | 7 | SP-02 |
| SP-04 | Execution Plan Renderer | P0 | 7 | SP-01 |
| SP-05 | Plan Generation & Fallback | P0 | 8 | SP-03, SP-04 |
| SP-06 | Tune | P0 | 4 | SP-04, SP-05 |
| SP-07 | Protect | P0 | 3 | SP-06 |
| SP-08 | Activation + Conversion | P0 | 6 | SP-07 |
| SP-09 | Share + Instrumentation | P0 | 5 | SP-08 |
| SP-10 | Mobile + Reliability | P0 | 7 | SP-08 |
| SP-11 | P0 Validation Gate | P0 | 2 | SP-09, SP-10 |
| SP-12 | Peak Geometry + Lighting | P1 | 5 | **SP-11 passing** |
| SP-13 | Plan → Peak Projection | P1 | 3 | SP-12 |
| SP-14 | Camera, Scroll + Sections | P1 | 5 | SP-13 |
| SP-15 | P1 Performance + Degradation | P1 | 4 | SP-12 |
| SP-16 | Signature Polish | P2 | 6 | SP-14, SP-15 |

### Issue count

| Priority | Issues |
|---|---|
| P0 | 61 (SITE-001 – SITE-061) |
| P1 | 17 (SITE-062 – SITE-078) |
| P2 | 6 (SITE-079 – SITE-084) |
| **Total** | **84** |

### Critical path

```
SITE-001 scaffold
  → SITE-002 tokens → SITE-003 type
  → SITE-005 layout → SITE-007 fold → SITE-008 input
  → SITE-012 state machine
  → SITE-015 transformation frame → SITE-016 progressive fill
  → SITE-020 plan model → SITE-021 PlanLayout → SITE-022 FlatLayout
  → SITE-023 occurrence generator → SITE-025 route + marks
  → SITE-026 objects → SITE-085 flat demo design review
  → SITE-027 provider interface → SITE-028 scenarios → SITE-029 StaticProvider
  → SITE-030 /api/plan → SITE-031 validation → SITE-032 timeout
  → SITE-033 fallback orchestration
  → SITE-037 live regeneration
  → SITE-040 gate assembly → SITE-042 activation trigger
  → SITE-043 wall → SITE-046 capture
  → SITE-050 instrumentation → SITE-052 funnel
  → SITE-086 builder loop review
  → SITE-053 mobile pass → SITE-059 failure sweep
  → SITE-060 DS verification → SITE-087 pre-gate composition review
  → SITE-061 user study
  ══════════ P1 GATE ══════════
  → SITE-062 mesh → SITE-063 light → SITE-068 projection → SITE-071 stations
```

> **Longest chain: 29 issues — walked, not read. A floor, not a final figure.**
>
> **Do not recount this from the block above.** That block is a narrative
> presentation of the critical path, not the dependency graph, and counting it
> gives the wrong answer. This figure comes from walking every `Deps` edge across
> all 88 issues. Two previous figures were derived by counting a presentation:
> the "27" this line replaced, and a "36" proposed during the PRE-1 pass. Both
> were wrong. **Re-derive from the `Deps` lines or not at all.**
>
> True longest path: SITE-001 → 004 → 020 → 021 → 022 → 025 → 035 → 037 → 039 →
> 040 → 041 → 042 → 043 → 044 → 047 → 050 → 052 → 060 → **087** → 061 → 062 →
> 067 → 068 → 070 → 071 → 072 → 073 → **088** → 074.
>
> Pre-gate the walked figure is 26. Of the four review gates only SITE-087 and
> SITE-088 fall on the longest path; SITE-085 and SITE-086 add real edges that do
> not lengthen it, because the path does not run through SITE-027 or SITE-053.
> Depth to the P0 gate (SITE-061) is 20, up from 19.
>
> **29 is a floor.** It is the walked length of the graph as it stands — the
> original 84 plus the four review gates. PRE-1 Part B (item 4) adds issues for
> PRD v7.3 §2's three blocks, §3, §7, §8, §9, §11, the legal routes, input
> classification, the clarification beat, held content, and the DS-15 through
> DS-18 evals. Those carry their own edges. **Re-walk after Part B lands**, by
> the same method — from the `Deps` lines, not from the block above — and replace
> this figure rather than adjusting it.

Everything not on the longest chain can parallelize.

### Dependency rules, encoded

- **Builder before Peak** — SP-12 lists SITE-061 as a hard dependency. No P1 issue is reachable otherwise.
- **Semantic model before any layout** — SITE-020 → SITE-021 → {SITE-022, SITE-068, SITE-069}.
- **GeneratedProvider never blocking** — SITE-029 (StaticProvider) precedes SITE-030; SITE-033 depends on both; SITE-032 has a hard timeout.
- **Static/failure before Generated is production-ready** — SITE-033 gates SITE-059, which gates SITE-060.
- **Tune on canonical state** — SITE-037 asserts zero network calls; the LLM is structurally excluded.
- **Protect implies nothing** — SITE-041 includes a copy audit against implied capability.
- **Wall only after activation attempt** — SITE-042 enforces it in the state machine (SITE-012), not the UI, with an exhaustive negative test.
- **Analytics free of sensitive text** — SITE-051 fails at compile time.
- **Flat rendering first-class** — SITE-022 is the reference implementation and is reviewed as a standalone demo; SITE-058 proves the full loop with WebGL off.
- **Projection reuses the model** — SITE-068 asserts the builder module graph is unchanged on adapter swap.
- **P2 never blocks** — SP-16 depends on SP-14 and SP-15 and gates nothing.
- **Design review gates add four edges not present in the original 84** (addendum §3):
  SITE-085 depends on SITE-026 and blocks SITE-027 ·
  SITE-086 depends on SITE-052 and blocks SITE-053 ·
  SITE-087 depends on SITE-060 and blocks SITE-061 ·
  SITE-088 depends on SITE-073 and blocks SITE-074.
  These must be created in Linear. The decomposition's original "unchanged graph"
  language predates them and is corrected in item 6.

### Recommended implementation order

1. SITE-001 → 006 (foundation; 003 produces the typeface decision)
2. SITE-020 → 024 **in parallel with** SITE-007 → 012
3. SITE-013, 014 (parsers — parallelizable early)
4. SITE-015 → 019 (transformation block)
5. SITE-022, 025, 026 (flat plan rendering) — **design review checkpoint**
6. SITE-027 → 029 (StaticProvider path complete and demoable **before** any LLM work)
7. SITE-030 → 034 (generation, validation, fallback)
8. SITE-035 → 038 (tune)
9. SITE-039 → 041 (protect)
10. SITE-042 → 047 (wall and capture)
11. SITE-048 → 052 (share and analytics)
12. SITE-053 → 059 (mobile and failure sweep)
13. SITE-060 → 061 (**gate**)
14. SITE-062 → 078 (P1)
15. SITE-079 → 084 (P2, or cut)

Step 6 is deliberate: the site is demoable end to end with no LLM before `/api/plan` exists.

### P0 launch-blocking issues

**All 61.** SITE-001 through SITE-061 inclusive. No P0 issue is optional; §2's DS criteria are gates, not aspirations.

### P1 gate

SP-12 through SP-15 may not begin until **SITE-061 passes** at 5/6 wall · 4/6 tune · 5/6 comprehension. A failed gate opens builder revision issues; it does not lower thresholds (K-5).

### P2 scope

SITE-079 through SITE-084. Ships or gets cut when P0 and P1 pass (K-7). Explicitly excluded from both critical paths: aberration, edge catch, the hidden B, seven-station choreography, live demotion, emailed delivery.

### Unresolved decomposition questions

1. **`@baseline/contracts` packaging — resolved, no longer blocking.** The site consumes `contracts-manifest.json` rather than importing the package (PRD v7.3 §6.6). Four packaging blockers exist in the app repo (`private: true`, `dist/` gitignored and untracked, no `files` field, `tsconfig` extends outside the package) with **zero code coupling** — the package has no workspace-relative runtime imports. Publishing properly remains worth doing and remains Kian's decision; it is informational for this tree, not gating. **One app-repo change is still required for the drift check's primary mechanism** — the app publishing its manifest to a stable path on `main`. See §6.6 for the fallback if that change isn't made.
2. **Six users for SITE-061 within a reasonable window** — the gate is only as good as recruitment. Sourcing is unspecified.
3. **`raw_goal` retention policy** — §11.5 captures it and §10 excludes it from analytics, but the PRD sets no retention period. Likely needs a privacy-page line, which touches SITE-074.
4. **Whether Tier B mobile gets the Peak at all** is PRD open decision 5, resolved by post-launch data — so SITE-077 may become obsolete. Built anyway; cheap to remove.
