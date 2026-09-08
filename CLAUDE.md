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

## 1. Canonical artifacts

Three documents. They are the requirements. Nothing else is.

| Tier | Artifact | Path | Governs |
|---|---|---|---|
| 1 | **Site PRD v5** | `docs/site-prd-v5.md` | **Product truth** — behavior, UX, scope, copy, acceptance criteria |
| 2 | **Site Linear decomposition v1** | `docs/site-linear-decomposition-v1.md` | **Execution truth** — projects, issues, dependencies, sequencing |
| 3 | **Site evals v1** | `docs/site-evals-v1.md` | **Verification truth** — what "done" is proved against |

All three are stored verbatim as approved. They are amended deliberately, never
edited in passing during implementation.

**Where they conflict, the higher tier wins: PRD → decomposition → evals.** Each
document says this of itself, and they agree.

Two standing rules:

- Where a lower tier is precise and a higher tier was general, the lower tier
  governs implementation detail — it may refine, never contradict.
- **If an issue conflicts with the PRD, the issue is wrong.**

A material contradiction between artifacts is a STOP condition (§9). Report it.
Never resolve it in code.

The PRD is v5 and **replaces v4 entirely.** Nothing from v4 is a requirement. Where
the decomposition or evals cite "v4 lineage," that is provenance, not authority.

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

**There is exactly one seam, and it runs one way.** `@baseline/contracts` — the
app's frozen contract package — is the closed vocabulary this site validates
against. Every action verb, object type, enum, and authority tier in the provider
layer and the authored scenarios traces to it. The site **consumes** that
vocabulary; it never extends, amends, or works around it. A contract change should
break this build (PRD §12, SITE-004).

> **Known blocker, unresolved.** `@baseline/contracts` is a workspace package inside
> the app monorepo (`packages/contracts`), not published to any registry. SITE-004
> assumes a separate repository can import it and have CI fail on drift. **As things
> stand, it cannot.** This is the decomposition's own unresolved question #1, and it
> sits in front of the entire SITE tree. The mechanism — publish target, vendored
> generated types with a drift check, or a git dependency — is an unmade decision.
> Do not invent one. It is a §9 stop-and-report until it is decided.

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
- The work depends on the **`@baseline/contracts` packaging decision** (§2) or on any
  other unfinished dependency.
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

The repository is initialized: the three artifacts and this file. **No code, no
scaffold, no Linear project.** SITE-001 has not begun.

The first real question in front of this repository is not SITE-001 — it is the
`@baseline/contracts` packaging decision in §2, which SITE-004 depends on and which
the entire tree sits behind.
