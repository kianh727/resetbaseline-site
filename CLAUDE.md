# resetbaseline.com — Site Constitution

This is the canonical implementation repository for the Baseline marketing site.
This file governs every Claude Code session in this repository. Read it before
doing anything else.

The site's job is one thing: take a first-time visitor from a messy human goal to
a personalized, tunable execution plan in 20–30 seconds, with no account, no
documentation, no scrolling below the fold, and no dependency on the Baseline
production backend — and then stop honestly at the boundary of what a browser can
do.

---

## 1. Artifact precedence

1. `docs/site-prd-v7.3.md` — product truth
2. `docs/site-execution-addendum-v1.md` — execution structure, authoritative over
   the decomposition for Linear organization, issue numbering, PR policy, and the
   design review gates. Silent on everything else.
3. `docs/site-linear-decomposition-v1.md` — execution truth
4. `docs/site-evals-v1.md` — verification truth

A lower artifact never overrides a higher one. A material contradiction between
artifacts is a stop-and-report, never resolved in code.

The addendum is a tooling change only. It changes nothing about the website:
same product story, builder, motion spec, conversion strategy, performance
budgets, acceptance criteria, evals, gates, and quality bar.

All four are stored verbatim as approved. They are amended deliberately, never
edited in passing during implementation.

Two standing rules:

- Where a lower tier is precise and a higher tier was general, the lower tier
  governs implementation detail — it may refine, never contradict.
- **If an issue conflicts with the PRD, the issue is wrong.**

A material contradiction between artifacts is a STOP condition (§9). Report it.
Never resolve it in code.

The PRD is v7.3 and **replaces v5, v6, v7, v7.1, and v7.2 entirely.** Nothing from a
superseded PRD is a requirement. Where the decomposition or evals cite earlier
lineage, that is provenance, not authority. Superseded PRDs are not kept in the
working tree; they remain in git history.

---

## 2. Separation from the Baseline app repository

The app lives in `kianh727/baselinev1`. This repository is not that one, and the
boundary runs in both directions.

**Do not import, inherit, cite, or copy from the app repository's governance.** Its
`CLAUDE.md`, master PRD, TDD, physical schema, event taxonomy, agent action
contracts, eval harness, or Linear decomposition are not requirements here and must
never be used to resolve a question about this site. The app's V1 scope freeze does
not describe this site; the site's PRD scope does.

`SITE-###` identifiers are **provisional decomposition IDs, not Linear IDs**, and
they are not the app's `BAS-###` tree. Where the PRD references `BAS-217`–`BAS-225`
(StoreKit and paywall) it is naming an external dependency that decides a config
value (§11.4), not work that happens here.

**There is exactly one seam, and it runs one way.** The app's frozen contract
vocabulary — the 45 action types, object types, enums, and authority tiers — is what
this site validates against. Every verb in the provider layer and the authored
scenarios traces to it. The site **consumes** that vocabulary; it never extends,
amends, or works around it. A contract change should break this build
(PRD v7.3 §6.6, §12 DS-15, SITE-004).

> **Resolved — no longer blocking.** This was previously recorded as an unresolved
> blocker sitting in front of the entire SITE tree, on the assumption that SITE-004
> had to import `@baseline/contracts` as a package. It does not. The site consumes
> `contracts-manifest.json` — the app's `CONTRACT_MANIFEST` committed verbatim with
> `captured_at` and the app commit SHA — and generates its types from that
> (PRD v7.3 §6.6, decomposition open question 1).
>
> Four packaging blockers do exist in the app repo (`private: true`, `dist/`
> gitignored and untracked, no `files` field, `tsconfig` extends outside the
> package), with **zero code coupling**. Publishing properly is still worth doing
> and is still Kian's decision, but it is informational here, not gating.
>
> **One app-repo change remains wanted, not required:** the app publishing its
> manifest to a stable path on `main`, which the drift check's primary mechanism
> reads. Without it SITE-004 ships on the staleness fallback — warn at 30 days,
> fail at 60. Opening that `BAS` issue still requires asking first (§10, addendum §5).

---

## 3. The governing principle

Encoded in every priority, dependency, and gate in the decomposition:

> **The builder is the product demo. The Peak is atmosphere and memory device.**
> **When they conflict, the builder wins.**
>
> A beautiful Peak with a mediocre builder is a failed implementation.
> A great builder with a simplified Peak is a launchable implementation.

`FlatLayout` is **not a degraded mode.** It is the reference implementation, and it
must be reviewable as a complete, compelling product demo on its own, before any 3D
exists (PRD §6, SITE-022).

**No P1 work begins until the P0 gate passes** (§7). This is a hard dependency, not
a preference.

---

## 4. Scope freeze / anti-drift

The PRD's scope is the whole of it.

- Do not add, remove, or reinterpret product behavior.
- Do not build P2 work into the P0 or P1 critical path under any circumstance.
- The site has **zero dependency on the Baseline production backend.** Generation is
  a site-local `/api/plan` route. There is no `LiveProvider` in this scope.
- Anything the issue does not specify is undefined behavior. STOP; do not decide it
  yourself.

**Scope-kill rules (PRD §17). Binding. Any of these firing is a decision already
made, not a discussion.**

- **K-1** — If Peak work threatens P0 completion, stop Peak work. If Tier A
  conversion underperforms Tier C/D, simplify the Peak.
- **K-2** — If a post effect materially hurts mobile performance, remove the effect.
  Not negotiable against the frame budget.
- **K-3** — If exact logo geometry prevents a readable plan overlay, plan
  readability wins.
- **K-4** — If an animation makes interaction feel slower, shorten or remove it —
  unless it carries product meaning.
- **K-5** — If an interaction can't be understood without explanatory copy,
  **redesign the interaction rather than adding the copy.**
- **K-6** — If a feature doesn't improve comprehension, differentiation, conversion,
  trust, or memorability, it needs a written reason to exist.
- **K-7** — Any P2 item still open when P0 and P1 pass ships as-is or gets cut. P2
  never delays launch.

---

## 5. The determinism boundary

This is the product, and it is never softened for convenience. **PRD §4 is the
authoritative table; where anything else appears to contradict it, the table wins.**

**The LLM's entire output surface is one commitment title (≤48 chars) and one
window selection from a closed set.** That is all.

**The model may never gain authority over:** parsed deadlines · domain
classification · the refusal decision · refusal copy · recurrence expansion ·
occurrence dates or counts · tuning · contention vetoes · route layout · authority
tiers · product capabilities · any other copy on the site.

Consequences that follow, each with its own eval:

- **Deterministic client parsing, no network.** The deadline materializes mid-typing
  (SITE-013, SITE-019, EVAL-008).
- **Domain classification is deterministic**, mirrored client and server. The model
  may **escalate** to bounded; it can never de-escalate (SITE-014, EVAL-025).
- **Refusal copy is authored, per domain. Five variants. No code path generates
  refusal text** (SITE-017).
- **The LLM selects a recurrence rule from the closed set; code computes every
  date.** Identical dates and counts across semantically identical phrasings
  (SITE-023, EVAL-030).
- **Authority tiers are contract-derived** — a pure function of object type. Gate is
  always `explicit`. No model input reaches tier assignment (EVAL-031).
- **Tuning is fully local.** Zero network requests, asserted. This is the single most
  important boundary in SP-06 (SITE-037, EVAL-032).
- **Generation is never blocking.** Hard 4000ms timeout with abort; every failure
  mode resolves to `StaticProvider` silently, with no user-visible error and no dead
  state (SITE-032, SITE-033).

**Honesty is a hard constraint, not a tone.** The site never implies a capability a
browser cannot activate (DS-8). It never fake-activates. The wall is reachable
**only** by pressing Activate on a gate, timer, or reminder — never by elapsed time,
scroll depth, section entry, exit intent, or interaction count, and that is enforced
in the state machine rather than the UI (SITE-012, SITE-042, EVAL-033).

---

## 6. Engineering invariants

- **One semantic plan model, never coupled to a renderer.** Layout is an adapter
  behind `PlanLayout`. Swapping adapters changes zero builder code, asserted by test
  (EVAL-063). If projection needs data the model lacks, **extend the model — never
  fork it.**
- **No spinner, skeleton, or shimmer exists anywhere in the builder.** The
  transformation block renders complete and empty at t=0 and fills as sources
  resolve. This is structural, not cosmetic (DS-10, EVAL-007).
- **Controls enable when their data exists, not when their animation completes.**
  Every builder animation is interruptible (EVAL-016).
- **The settling spring is used only when structure lands into place.** A lint rule
  restricts its import; if a section header uses it, the signature is gone
  (SITE-024, EVAL-017). Refusals use **no spring** — the system stopping must not
  look like the system producing.
- **Scroll is native. No wheel interception, no Lenis, no locomotive, no
  `scroll-behavior` override, anywhere, ever** — enforced by an import ban in CI
  (SITE-070, EVAL-064).
- **The site is fully comprehensible with every animation disabled**, and the full
  loop completes with WebGL disabled (DS-6, EVAL-020, EVAL-058).
- **375px is the primary target.** No interaction depends on hover. 44×44 minimum
  touch targets. Zero horizontal scroll at 320px in every state.
- **The Peak is never in the LCP path.** The headline is the LCP element; the scene
  is lazy, initializes on `requestIdleCallback`, and is excluded from first load.

**Privacy:**

- **No free-form user content in analytics** — attaching `raw_goal` or a commitment
  title to an analytics event must fail at **compile time** (SITE-051, EVAL-039).
- The capture system (PRD §11.5) is the one sanctioned path for goal text, and it
  writes to the **Supabase staging project. Never production.**
- Never hardcode secrets. Reference environment variable names only.

---

## 7. Verification and gates

Eval types: `AUTO` automated regression · `VIS` visual/manual acceptance · `FTU`
first-time-user comprehension · `PERF` performance measurement · `ANLY`
analytics/conversion measurement.

**Subjective design quality is not pretended to be automatable.** `VIS` and `FTU`
verdicts are judged by a human and **recorded, not inferred.** A session may prepare
the evidence for one; it may never mark one passed on its own reasoning.

**DS-1 through DS-10 (PRD §2) are gates, not aspirations**, and each is verified
individually with documented evidence. DS-3 and DS-4 are verified from instrumented
data, never estimates.

**The P0 validation gate (SITE-060, SITE-061) decides whether Peak work may begin.**
Six participants, thresholds: **5/6 reach the wall unprompted · 4/6 tune without
being told · 5/6 score ≥3 on comprehension · 5/6 understand why the site stops · p95
time-to-tunable-plan ≤5s · 0/6 sessions with a dead or confusing state.**

**A failed gate revises the builder. It never lowers the bar, and P1 never starts
early** (K-5).

Per-issue definition of done:

- Implementation complete within the issue's stated scope; nothing adjacent, nothing
  opportunistic
- Every verb, object type, enum, and authority tier traced to the frozen contracts
- Its named evals green, and the issue's `VIS` verification captured at **both 1440px
  and 375px** where the issue calls for it
- No regression in any previously passing eval
- **Never weaken an eval to make an implementation pass.** A failing release-blocking
  eval means the implementation is wrong.
- No `TODO` representing an undecided product question

**Run every check bare, and read its exit status.** Never pipe a check through
`head`, `tail`, `grep`, or anything that replaces its exit code with the filter's,
and never chain several behind `;` where only the last result is visible. A pipeline
reports whether the *filter* succeeded — a failing check whose output happens not to
match looks exactly like a passing one. Filter the output afterwards if it is long;
do not filter the thing whose answer you are reporting.

**The sweep is the CI job list, not a number** — whatever `.github/workflows` runs.
Read it when in doubt; an enumeration in this file would drift from CI silently.
Reporting a subset is the same failure as filtering. Name the exit codes you saw, or
say which ones you did not.

---

## 8. Issue execution protocol

Implementation is driven by the decomposition. For every issue, in order:

1. **Read the issue** in full, including its non-goals — the non-goals carry as much
   of the specification as the scope does.
2. **Read its referenced PRD sections.** Do not work from memory or from this file's
   summary — read the source.
3. **Verify dependencies** are actually complete, not merely marked done.
4. **Inspect the existing implementation** before writing anything.
5. **State a short implementation plan.**
6. **Implement only the defined scope.**
7. **Run the named evals** and the repo's checks.
8. **Report** what changed, what ran, what passed — and for a `VIS` issue, produce
   the screenshots at both widths and **wait for the human verdict.**

Several issues produce a **decision, not just code** — SITE-003 (typeface), SITE-064
(cursor spring constant). Record the value chosen and why.

---

## 9. Stop-and-report conditions

STOP and report. Do not improvise, do not decide, do not silently resolve in code.

- The issue requires **undefined product behavior**.
- The work **contradicts an artifact**, or two artifacts contradict each other on a
  material point.
- The work depends on an **unfinished dependency**. The `@baseline/contracts`
  packaging decision is no longer one of these — it was resolved by consuming
  `contracts-manifest.json` (§2, PRD v7.3 §6.6).
- The work would require **inventing a verb, object type, enum, or authority tier**
  not in the frozen contracts.
- The work would **soften the determinism boundary** (§5) or a privacy invariant
  (§6).
- The work requires **out-of-scope functionality** under §4.
- A **canonical artifact is missing** from this repository (§1).

**Reporting a blocker is a successful outcome. Guessing is not.**

---

## 10. Actions that require asking first

§9 is about work that cannot proceed. This is about work that can, and should not
without a word first.

- **Any `rm -rf`.**
- **Any force push to a branch that is not yours.**
- **Any merge that overrides a failing gate.** The gates exist; overriding one is a
  decision about release policy, not about the change in hand.
- **Any write to the `kianh727/baselinev1` repository.** That is the app's tree and
  another session's work. This site never edits it — not its contracts, not its
  docs, not its `CLAUDE.md`. If this site needs something from the app, that is a §9
  report, not an edit.
- **Any amendment to the three artifacts in `docs/`.**

"Ask" means stop and say what you were about to do, not narrate it while doing it.

---

## 11. Rejections

Seven, from PRD §22. Any of these in a diff is a defect, not a tradeoff.

1. Any action verb, object type, or enum not in the frozen contracts.
2. The LLM given authority over anything §4 of the PRD marks deterministic.
3. A wall triggered by anything other than an activation attempt, or one that
   fake-activates, traps, or hides the plan.
4. Any spinner or empty waiting state in the builder.
5. The settling spring used anywhere other than structure landing.
6. Scroll hijacking of any kind.
7. Anything in the PRD §19 ban list, or `placeholder`/lorem anywhere.

**PRD §19 bans, in brief** — read the source before writing copy or scene code:

- **Copy:** *journey · climb · summit · peak · ascent · reach new heights.* The
  visual carries the metaphor; copy naming it is what makes it embarrassing.
- **Scene:** sunrise or warm color · photographic terrain · smooth photoreal diffuse
  gradients · fog · god rays · clouds · stars · reflections · a rotating, drifting,
  or pulsing peak · climbing imagery.
- **Type:** italic or colored accent on one headline word · tracked-out ALL-CAPS
  eyebrows · `01 / 02 / 03` numbering · `→` appended to buttons · monospace anywhere.
- **Layout:** identical rounded cards in a row · fade-and-slide-up on every section ·
  hover lift · centered body type.

---

## 12. Current state

The repository is initialized: the four artifacts and this file. **No code, no
scaffold.** SITE-001 has not begun.

**Linear — verified 2026-09-18.** This section is load-bearing for a fresh session
and goes stale the moment either statement changes. **Update it in the same commit as
the change it describes.**

- A site team **exists**, named `SITE` (`58f71935-70d1-49c0-83ce-7535d8ece6de`),
  created by hand. It holds **zero issues**.
- The thirteen orphan `SP-01`…`SP-13` projects on the app's `BAS` team are
  **trashed** — gone from the working views, recoverable from Linear's trash until
  it purges. No `BAS-*` issue was touched.
- The orphan `site` label **still exists** (`9b479485-c776-476e-a0f1-322e0040a9c7`).
  Addendum §1.2 says delete it.
- The addendum's three projects and its seventeen milestones **do not exist yet**.

**Team key confirmed: `SITE`.** Corrected in the Linear UI on 2026-09-18 and confirmed
by Kian. It had been derived as `SIT` from the team name; the correction was not
confirmable from a session because no Linear MCP verb returns a team's key — `get_team`,
`list_teams`, `list_issue_statuses` and `list_cycles` all omit it, and `list_projects`
exposes it only via a project's `teams[]`, which an empty team has none of. **That gap
still exists**, so a future key question is again a read-in-the-UI, not a query.

The `@baseline/contracts` packaging question is **resolved and no longer gating**
(§2). The capture and reachability check is **complete**, and its findings are what
produced v7.3 — §2 rebuilt as a dated status section, "What's underneath" cut, "What
it won't do" promoted to P0.

**PRE-1 Part A is complete.** Items 1, 3, 5, 6, 7, 8 and 9 are applied; item 2 was
verified a no-op.

**R-2 has reported in full**, answered by the app-repo session, including the two pieces
that were outstanding — the permission list and the export/delete specification. The
capture check is also complete. **SP-17's entry criteria are satisfiable**, and no read
now gates anything.

**Part B / item 4 is gated on one thing: Site Author's amendment.** It is not a session's
to write. Two findings from R-2 require a product decision before item 4 can be scoped
against v7.3:

1. **The onboarding handoff.** App PRD §25 says Gate is **"never proposed during
   onboarding,"** and the agent may only propose one after lighter rungs have already
   failed for that user — impossible on day one. A builder whose loop ends in *protection*
   therefore promises a beat the first run does not deliver. The builder's shape may have
   to change.
2. **FAQ 12 — export and delete.** They are **unbuilt, not unproven.** No export endpoint,
   no deletion route in the API; `requestAccountDeletion`'s only callers are its own tests;
   `SettingsView` renders "export data" and "delete account" as rows with no action
   closure — inert labels. The app PRD requires both in V1 and scopes them as BAS-125, and
   nothing implements them. **"Export and delete, both at launch" cannot ship** under
   DS-18. A roadmap claim is supportable; the current answer is not. FAQ 12 is now blocked
   on copy, not on a read.

R-2 findings bearing on site copy, recorded so they are not re-derived:

- **FAQ 3 — permissions, answerable.** App PRD §50: two OS permissions in V1.
  **Notifications**, requested during onboarding at the Intensity screen, merged with the
  accountability level. **FamilyControls / Screen Time**, requested only when the user
  creates or accepts a Gate — *"not before and not on a poll."* Sign in with Apple on the
  Account screen is the only auth method in beta. HealthKit and Calendar are V1.1.
  **Microphone is never** — a permanent no, not a deferral. No camera, location, contacts,
  health. The only entitlement is `com.apple.developer.family-controls`. The line worth
  quoting: *"Maximum OS prompts during onboarding: one. No permission carousel exists
  because there is nothing to stack."*
- **Hard constraint on all Gate copy — an app-PRD MUST.** App selections are **opaque
  tokens the app cannot read.** Copy says *"3 apps blocked"* and **never names an app.**
  This binds every version of every Gate line, not just the current one. §2 Block 1's
  *"the apps you named go quiet"* is fine as written; no revision of it may name one.
- **Only §14 carries a literal Purpose line;** §15–26 open with their defining frame. The
  five primitives each open with a `Problem:` line, which is the most usable copy in the
  document — commitment *"an intention with no occasion"* · reminder *"the cue arrives too
  late, or not at all"* · timer *"starting is expensive; sessions run unbounded"* · gate
  *"cue-driven distraction survives intention"* · tracker *"a direction with no feedback"*.
- **§18 You, block 2** — *"What Baseline has noticed — cross-goal patterns only, max 3,
  person-level tier only. Rare by design; the most differentiated thing the product can
  show."*
- **§19 Settings** — *"Six groups, deliberately thin. Design intent: users configure
  Baseline by talking to it; Settings holds only what you shouldn't have to ask for."*
- **Weekly review is §48**, filed jointly with the nightly check-in, which is why v7.3
  §15.2 records it as not located. *"On by default. The trust engine and the batching
  valve… 'leave it inconclusive' offered as a first-class, guilt-free option."* The nightly
  check-in is **off** by default and the app PRD marks that settled.

The Linear population run stays halted: item 4 adds issues, so the counts in §13 are not
final and nothing should be populated against them.

---

## 13. Linear

Both the app and the site live in the `baselineagent` workspace, separated by
team. Claude's Linear connector authenticates one workspace at a time and both
are in active development, so a separate site workspace would mean reconnecting
on every context switch.

| | |
|---|---|
| Workspace | `baselineagent` |
| App team | `Baseline` / `BAS` — out of bounds, see below |
| Site team | name `SITE`, key `SITE` — **confirmed** 2026-09-18 |
| App repo | `kianh727/baselinev1` — out of bounds |
| Site repo | `kianh727/resetbaseline-site` |

Structure: three projects (Website P0 — Interactive Builder, Website P1 — The
Peak, Website P2 — Signature Polish) containing seventeen milestones SP-01…SP-17.
SP-17 · Website Sections is P0 and sits in Website P0 — Interactive Builder alongside
SP-01…SP-11. Milestone numbering is append-only and does not indicate phase — a
milestone's phase is the project it sits in.
The SP decomposition is fully preserved; milestones are ordered and show
progress, which projects do not.

**Issue counts are pending.** The graph as it stands is 88 — the original 84 plus
four design review gates (SITE-085…088) defined in addendum §3, split P0 = 64,
P1 = 18, P2 = 6. That is a floor, not a total: **PRE-1 Part B (item 4) adds issues**
for PRD v7.3 §2's three blocks, §3, §7, §8, §9, §11, the legal routes, input
classification, the clarification beat, held content, and the DS-15 through DS-18
evals, and SP-17 · Website Sections carries its own. **P2 = 6 is firm**; the P0 and P1
figures are not. Do not quote 88 as final, and do not begin the population run against
it — recount after Part B.

Creation order is load-bearing. See addendum §2 before any Linear write:
the team key is `SITE` and the team must be empty before the first issue,
issues are created in strict sequential order, and decomposition `SITE-001`
maps to Linear `SITE-1` positionally — Linear does not zero-pad.

Never create, modify, move, close, reopen, or delete a `BAS-*` issue or an app
project. The one sanctioned cross-team action is opening the manifest-publication
issue described in addendum §5 — related to SITE-004, not blocking it — which
requires asking first.

**Exception, already incurred.** The thirteen `SP-01`…`SP-13` projects on `BAS`
are site artifacts created there in error (§12). Deleting them is sanctioned
cleanup, not app work; no `BAS-*` issue is touched by it.
