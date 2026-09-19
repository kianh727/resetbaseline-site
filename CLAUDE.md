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

Four standing rules:

- Where a lower tier is precise and a higher tier was general, the lower tier
  governs implementation detail — it may refine, never contradict.
- **If an issue conflicts with the PRD, the issue is wrong.**
- **A ruling in a tier-one artifact does not propagate downward by itself.** Amending
  the PRD leaves every derived document still saying the old thing, and a stale issue
  is indistinguishable from a current one to whoever picks it up. **Sweep the lower
  tiers in the same pass as the ruling** — decomposition, evals, and this file — and
  say which you checked.

  Worked example, and the reason this is a rule: v7.3 §6.3a established that no
  depicted Baseline UI may name an app, because Screen Time returns opaque tokens.
  SITE-040's scope still read *"rendering as the protection band with app names and
  window"* — the exact UI the app cannot produce — and it survived the ruling because
  nobody swept. It was caught in the next pass, by grep, not by the amendment.

- **A sweep is stated, and a ruling that moves an issue is swept by reconciliation, not
  by grep.** The rule above is a *forward* obligation on the ruling being applied, and it
  assumes the pass that applies it is complete. Nothing checks that assumption. An
  incomplete sweep leaves no residue — afterwards it is indistinguishable from a complete
  one, because the tier that was missed simply still says the old thing, which is exactly
  what a tier that was never in scope would say.

  So: **name every tier you checked, in the commit**, which makes an incomplete pass
  visible at the time rather than a year later. And note which kind of ruling you are
  sweeping, because the two kinds fail differently:

  - **A ruling that changes a string** — a banned word, a withdrawn criterion, a corrected
    number — is swept by grep, and grep is reliable. Where it can also become a CI check,
    it should, in the same pass (SITE-107 is where those live).
  - **A ruling that changes an issue's identity** — its scope, title, milestone, priority,
    or dependencies — **is invisible to grep**, because the stale text contains no phrase
    the ruling withdrew. It reads as a perfectly ordinary issue. These are swept by
    **reconciling the decomposition against Linear**, which are meant to mirror each other
    and therefore can be diffed.

  Worked example, and the reason this clause exists: `SITE-72` and `SITE-74` were
  re-scoped, and the ruling reached Linear and this file but **not the decomposition**,
  which kept "Sections 2, 4, 5, 6" and "Metadata, OG card, legal pages" at SP-14/P1 for
  two days. No grep could have found it — there was no withdrawn string to search for,
  only an issue quietly describing work that no longer existed. It surfaced because a
  later sweep happened to read the entry for another reason.

  **The reconciliation runs at each design review gate and before the P0 gate**, over
  every issue, comparing title, milestone, priority and dependencies. Anything a ruling
  moved and a document did not is found there rather than by luck.

**The working tree is the authoritative PRD. A pasted document is a section source,
never a replacement** (ruled 2026-09-19, Kian).

Full-document pastes are applied **section by section onto the tree**, or refused. **If a
paste would remove a section that exists on disk, that is a §9 stop** — regardless of what
the accompanying message says about what changed.

The reason is structural rather than cautious. A paste is written against whatever copy its
author was holding, and an author working outside this repository **cannot see the working
tree**. So *"nothing else changed"* is a true statement about the copy it was written from
and says nothing about the file. The two claims are indistinguishable in the message and
opposite in effect.

Worked example, 2026-09-19: a v7.3 paste arrived naming four new sections and stating that
nothing else had changed. It was a faithful description of its own source, which had
branched earlier that evening — and replacing the file with it would have silently reverted
**§0.3a, §0.3b, §0.3c, the whole of §6.3b, §6.5's two amendments, the 120 kB decimal ruling,
the K-8 and DS-1…DS-10 citation corrections, and §12.4a's six band questions**, every one of
them ruled the same day. The four new sections were applied onto the tree instead and the
numbering was ruled rather than guessed.

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
(PRD v7.3 §6.6, §12.3, SITE-004).

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

This is the product, and it is never softened for convenience. **PRD v7.3 §6.5 is the
authoritative statement of the boundary, and it carries it inline.**

**Corrected 2026-09-19 (Kian).** This section previously cited *"PRD §4's table"*. **v7.3 §4 is
"What it won't do" and contains no table** — the table was v5 §4, and §1 declares v5 superseded
entirely. A citation pointing at a superseded document is worse than none: the reader follows
it, finds nothing, and cannot tell whether the boundary is unjustified or the definition is
missing. §6.5 now states the boundary with no cross-reference, and this file defers to it.

**Ruled 2026-09-19 (Kian): the output surface is three fields, not two** (PRD v7.3
§6.4, §6.5). **The LLM's entire output surface is one commitment title (≤48 chars),
one window selection from a closed set, and — for `vague` input only — one
clarification question with its three options.** That is all.

The third field is the clarification beat. An authored question is a keyword-selected
question, and a visitor whose phrasing the set did not anticipate gets a question
visibly about something else — which demonstrates a form, not *it asks once*. It is a
third field on the existing `/api/plan` call, never a second round trip, and it carries
**five validation constraints**: under 90 chars · exactly three options, each under 24 ·
every option tappable without typing · no preamble · ends in a question mark. **Any
failure, timeout, or spend cap falls back silently to the authored question set** — no
user-visible error, no dead state. **Each of the three fields validates and falls back
independently**; one invalid field never discards the other two. Enforced by
SITE-EVAL-079, which asserts counts before properties so it cannot pass on a beat that
never rendered.

**The model may never gain authority over:** parsed deadlines · domain classification ·
**input classification, which decides whether the clarification beat runs at all** · the
refusal decision · refusal copy · recurrence expansion · occurrence dates or counts ·
tuning · contention vetoes · route layout · authority tiers · product capabilities ·
**every other line of copy on the site.**

Consequences that follow, each with its own eval:

- **Deterministic client parsing, no network.** The deadline materializes mid-typing
  (SITE-013, SITE-019, EVAL-008).
- **Domain classification is deterministic**, mirrored client and server. The model
  may **escalate** to bounded; it can never de-escalate (SITE-014, EVAL-025).
- **Refusal copy is authored, per domain. Five variants. No code path generates
  refusal text** (SITE-017). The §6.4 widening is the clarification question and
  nothing else — it does not reach refusals, and a refusal is never generated.
- **The clarification question is generated and validated** (SITE-030, SITE-103,
  SITE-EVAL-079). Classification still decides *whether* the beat runs; the model only
  writes the sentence once that decision is already made.
- **Recurrence-rule selection is deterministic, from the parse. The model never sees it**
  (PRD v7.3 §6.5, amended 2026-09-19). This file previously said the LLM selected the rule
  while code computed the dates. **That would be a fourth generated field**, and the
  determinism claim the whole site rests on would be false while reading true — the surface
  says three and would behave as four. The old wording survived because §6.5's may-never-touch
  list named *recurrence expansion*, which is the **computation** and not the **choice**, so
  the gap read as covered. Identical dates and counts across semantically identical phrasings
  (SITE-023, EVAL-030). **The closed set of rules is enumerated in no artifact** — an open PRD
  defect, Kian's, biting at SITE-023. **No session may enumerate it.**
- **Authority tiers are contract-derived** — a pure function of object type. Gate is
  always `explicit`. No model input reaches tier assignment (EVAL-031).
- **Tuning is fully local.** Zero network requests, asserted. This is the single most
  important boundary in SP-06 (SITE-037, EVAL-032).
- **Generation is never blocking.** Hard 4000ms timeout with abort; every failure
  mode resolves to `StaticProvider` silently, with no user-visible error and no dead
  state (SITE-032, SITE-033).

- **The band grammar is a closed visual vocabulary** (PRD v7.3 §6.3b, ruled 2026-09-19,
  a MUST). A horizontal band always means a recurring time window; marks inside it are the days
  it occupies; a second denser band below is protection; **nothing else ever gets a band.**
  Charcoal, translucent, geometrically level, bleeding off both frame edges. **Lavender only as
  a thin lit line on the upper boundary and on active marks — never as fill.** Lit marks are
  scheduled days, **dark marks are unscheduled days — never crossed out, never rust, never
  styled as disabled.** The last rule is §4 rendered in visual grammar: a dark mark styled as a
  gap regresses *"no completeness meters"* **in pixels while the copy still reads correctly**,
  which no copy check on this site can see. **It supersedes any description of a route, path,
  summit or ascent anywhere in this repository**, and any prompt-set or visualisation document
  is mood reference only — not authoritative on structure, copy or behaviour.

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

**Three failure shapes are catalogued, and all are habits rather than one-time checks.**

1. **A criterion satisfiable by the absence of the thing it measures is measuring the
   container** (PRD §0.3). Ask of every check: *does this pass against a stub that does
   nothing?*
2. **A guard that suppresses a symptom also suppresses its detection** (PRD §0.3a, recorded
   2026-09-19). `overflow-x: clip` is required by §9 as a safety net, and it removed the
   overflow from `scrollWidth` — so SITE-005's overflow check passed a deliberate 1200px
   element at a 320px viewport. The guard the PRD requires was hiding the defect from the test
   written to find it. **A check downstream of a mitigation must neutralise the mitigation
   before measuring, and say in its output that it did.** Ask of every retry, fallback, catch
   block, default value and CSS guard: *if this were broken, would the thing protecting it
   also hide it?*

3. **A check whose input is derived from its own reference cannot fail** (PRD §0.3a's sibling
   at §0.3b, recorded 2026-09-19). SITE-004 was nearly resolved by deriving the five
   `capability_type` values from the action verbs, guarded by an assertion that *"the
   derivation still matches the verb list"* — which derives from the verb list and compares
   to the verb list. It agrees with itself by construction and reports that as verification.
   **Before writing an assertion, name its two sources.** If naming the second means
   restating the first, it is this shape, and the work is to find a real second source rather
   than to word the assertion better.

**Two parsing rules, PRD §0.3c**, both about the moment the site shows a visitor what it
understood — the moment its differentiation is demonstrated, and so the moment both failures
invert it.

- **A parse distinguishes *"did not match"* from *"matched something impossible"*, and an
  impossible input is never resolved to a nearby valid one.** `by February 30` became 28
  February by falling through to a looser rule. A parser that silently corrects the user and
  presents the correction as understanding is the site's claim turned inside out.
- **Nothing re-derives what a parser already determined.** A second matcher re-reading the text
  to find what the first one matched can disagree with it, **silently**, because neither is
  wrong on its own terms. The parser reports its own match.

**Subjective design quality is not pretended to be automatable.** `VIS` and `FTU`
verdicts are judged by a human and **recorded, not inferred.** A session may prepare
the evidence for one; it may never mark one passed on its own reasoning.

**DS-1 through DS-10 (PRD §2) are gates, not aspirations**, and each is verified
individually with documented evidence. DS-3 and DS-4 are verified from instrumented
data, never estimates. **DS-18, DS-18a and DS-18b are gates too** (PRD v7.3 §12.1,
SITE-108). **DS-11 through DS-17 do not exist** — nothing may be gated on them.

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

**Logic tests are TypeScript, run directly by `node --test`.** Node 22's native type stripping
runs `.ts` test files with no ts-node, no build step and no test dependency; `tsconfig` carries
`allowImportingTsExtensions` because stripping requires the explicit `.ts` specifier. **This is
the standing mechanism, not a detail of the issue that discovered it** (SITE-006). It is
recorded here so the next suite that needs it — SITE-023's DST-safe occurrence math with its
40+ fixtures above all — finds a decision already made, rather than making a test-tooling
choice under deadline pressure with a fixture suite half-written. Type stripping means no
enums, no namespaces, no parameter properties in code a test imports.

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

**`SITE-1` is done. The repository builds, exports statically, and has CI.** Next.js
15.5.25 App Router, React 19, TypeScript strict, Tailwind v4, `output: 'export'`.
Pinned to the 15 line because the issue specifies Next 15; 16.x is out of scope.

**`.github/workflows/ci.yml` is the sweep** §7 refers to — typecheck, lint, test, build,
each run bare, plus three assertions on the export: that `out/index.html` exists, so a
build that silently stops being an export fails rather than serving the previous deploy;
that `out/tokens` does **not**, so a development-only route cannot ship; and the core
bundle budget. Adding a check there adds it to the sweep; nothing else does.

Three decisions recorded rather than left implicit:

- **tsconfig goes past `strict`** to `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`. The plan model, occurrence math and event schema all
  depend on index access and optional fields being honest; adopting these later is
  expensive.
- **`next.config.ts` states `ignoreBuildErrors: false` and `ignoreDuringBuilds: false`
  explicitly**, though both already default that way, so a future change has to be
  deliberate rather than a default drifting.
- **The scroll-library import ban is already in the eslint config.** SITE-070 owns the
  full ban and its negative test; this was the earliest point it could exist.

**`SITE-1`'s deploy acceptance is not met.** *"`main` deploys automatically; PR
previews resolve"* needs the Cloudflare Pages project, which is SP-01's **Entry**
criterion — a precondition assumed done before the issue starts, and not verifiable
from a session. Build command `npm run build`, output directory `out`, Node 22. **No
deploy was fabricated and no secret was hardcoded.**

**The bundle budget is 120 kB gzip, and it is a dependency ban rather than a
coding-discipline target.** v7.3 §11 said 145 kB while SITE-76 and SP-15's exit said 120;
ruled 120, and §11 is amended so the artifacts agree rather than one deferring to the other.

**The unit is decimal kB, ruled 2026-09-19 (Kian), and the gate is 120,000 bytes.**
`scripts/check-bundle.mjs` divided by 1024 and labelled the result `KB`, while Next's build
output divides by 1000 — one artifact, two divisors, so the same five chunks read **102.5**
here and **105** there. Neither number was wrong and they were never commensurable, which
meant the gate could not be compared against the 103 kB framework floor §11 records, and a
dependency ban whose ceiling and floor are in different units is not a ban anybody can reason
about. **The ruling tightens by 2,880 bytes rather than loosening**: `120 * 1024` was 122,880,
and the extra was a property of the tool, not a grant. Proven negatively at the new threshold —
the budget set to 104,000 exits 1 naming the route and the 1.0 kB overage.

Measured on this scaffold, gzip, marginal over the framework floor: **the floor is 103 KB**
(React 19 + Next 15 App Router, before any product code, not reducible without leaving
React). A hand-written interactive component costs **0.4 KB**. `date-fns` tree-shaken to four
functions costs **6.5 KB**, `zod` **24.1 KB**, `framer-motion` **40.5 KB**.

So roughly 17 KB remains, the builder's own modules fit inside it at that per-component cost,
and **a single runtime dependency does not.** Binding, per §11: no animation library (the
settling spring is hand-rolled on WAAPI/CSS), no client-side schema validator (validation is
server-side on `/api/plan`), no date library (SITE-023 already specifies hand-rolled DST-safe
math with its own fixture suite).

**Ruled and in effect: the bundle check is in the sweep now, at 120 kB decimal, failing the build.**
SITE-078 would have enforced it at P1, after every builder issue had landed — a ceiling first
checked at the end is a criterion satisfiable by the absence of the thing it measures (§0.3),
and a dependency that breaks the budget would surface at SITE-076 rather than in the PR that
added it. `scripts/check-bundle.mjs` runs after the build and measures **every exported
route**, not only `/`: a check that watches one page can be walked around by putting the
import on another. It gzips the chunks each document actually references rather than reading
Next's summary line, and excludes the `noModule` polyfill chunk, which no browser supporting
ES modules fetches — counting it would measure 38.6 KB nobody downloads. **Now measured at
105.0 kB, 15.0 kB remaining** — the same bytes the earlier entries in this file call 100.2 and 102.5. SITE-078 still owns the remaining §16 budgets; its non-goals
now say so.

**`/tokens` and `/type` are development-only routes.** `page.dev.tsx`, with `dev.tsx` in
`pageExtensions` only outside production — so they exist under `npm run dev` and are never
built into the export. Absent rather than built-and-pruned: a prune step is a thing to
forget, and forgetting it ships a URL nobody designed on the marketing site.
`scripts/check-dev-routes.mjs` derives the list from the source tree rather than naming
paths, because the first version named `out/tokens` alone and `/type` would have arrived
unguarded one commit later.

**Both gates were proven negatively.** Forcing `dev.tsx` into the production extensions put
`/tokens` back in `out/` and the assertion exited 1. Installing `zod` and `framer-motion`
behind a probe route put that route at 147.3 KB and the budget check exited 1, naming the
route and the 27.3 KB overage. Probe and both dependencies removed; `package-lock.json` is
unchanged.

**`SITE-2` is done** — the nine §14 tokens, declared once as Tailwind theme values and
aliased under the bare names, with the `--veto` confinement policed by both a lint rule and
a file scan.

**`SITE-3` is done in code and open on its decision.** The §14 type scale, the metadata
primitive, and `/type` — the side-by-side comparison harness — are built and tested;
`docs/typeface-decision.md` is the record §23 item 3 asks for.

Display and section-head carry §14's clamps verbatim. §14 gives lead and body as ranges
(18–22px, 16–17px) rather than clamps, so the interpolation was this issue's to choose:
both are `intercept + slope·vw`, landing on the range minimum at exactly 375px and the
maximum at exactly 1440px, so the scale is settled at both verification widths rather than
caught mid-interpolation at either. A bare `1.5vw` would have left lead at 21.6px at 1440
and never reached §14's 22. **Line heights are not in §14 and were set here** — 0.92
display, 0.96 section, 1.45 lead, 1.6 body — because the browser's 1.5 on a 140px headline
contradicts "density against scale" outright. Recorded as decisions, not defaults.

**The typeface decision could not be made, and was not faked.** §14 and §23 item 3 both
require it *compared at display scale on real type*. Neither candidate's files are
obtainable from a session: PP Neue Montreal is a commercial per-domain licence, and Satoshi
is free but Fontshare is denied by this environment's network proxy (`403` on `CONNECT`,
confirmed against the proxy's own status endpoint) and is on no npm registry. **No
substitute face was rendered in their place and no verdict was recorded from description**
— a face judged from memory is §0.1's failure mode exactly. The one axis decidable without
seeing them is licence cost, which is not the axis §14 names.

Everything around the decision is built, so landing it is four `.woff2` files in
`public/fonts/`, a look at `/type` at both widths, and one line: `--font-candidate`. Until
then the site renders in the system stack — not a third candidate and not a default anybody
chose, but the absence of a decision, visible as such. A test enforces that nothing outside
`/type` names either family, so the decision cannot be made by accident in a component.

`/type` verified at 1440px, 375px and 320px: zero horizontal overflow at all three, columns
stacking below `lg`. The harness reports which families the browser actually loaded, because
two identical columns otherwise read as "these faces are alike" when the truth is "neither
file is present".

**Four amendments to v7.3, ruled 2026-09-19 (Kian), and swept in the same pass.**

1. **§6.4 — the clarification question is generated, not authored.** A third field on the
   existing `/api/plan` call, with five validation constraints and a silent fallback to the
   authored set. An authored question is a keyword-selected question, which demonstrates a
   form rather than *it asks once*.
2. **§6.5 — the model's surface widened from two fields to three**, and each validates and
   falls back independently.
3. **§12.4a — new subsection.** SITE-085's criterion changed from *"is this compelling?"*,
   which has no wrong answer, to *"does any part of this look like it came out of a
   generator?"* — ten yes/no tells, any single yes rejects, reviewer neither the implementer
   nor someone who watched the build. Applies at SITE-087 and SITE-088 too.
4. **§15.4 — the copy pass is the largest unmitigated risk and no gate catches it.** Design
   review checks composition, the study checks comprehension, §12.4 checks evals against
   stubs; none asks whether the prose is worth reading.

**Swept, and which tiers were checked.** Addendum: SITE-085, SITE-087, SITE-088 accept lines.
Decomposition: SITE-030, SITE-102, SITE-103, SITE-061, and — caught by grep rather than by the
ruling — SITE-022's *Verify*, which restated the withdrawn "is this compelling" criterion.
Evals: SITE-EVAL-021 rewritten (it was a named §12.4 exposure and now asserts counts before
properties), **SITE-EVAL-079 added** for the generated question. This file: §5's determinism
boundary and §13's counts. Linear: the same seven issues amended in place, with the superseded
lines struck through rather than deleted so nobody reads the old scope and stops.

**`SITE-109 · Copy pass — every rendered sentence` created** — P0, SP-17, deps SITE-101,
**blocks SITE-061**, assigned to Kian, no date. A study run on example text measures the
structure and nothing else.

**A propagation failure of my own, found in this pass and fixed.** `SITE-72` and `SITE-74`
were re-scoped in Linear and recorded in this file, but **the decomposition was never swept** —
it still carried "Sections 2, 4, 5, 6" and "Metadata, OG card, legal pages" at SP-14/P1. That
is the §1 worked example repeating: the ruling landed in two places and the third kept saying
the old thing. Both entries now match Linear, and SITE-074's P1 → P0 move is why the counts
read P0 = 86, P1 = 17.

**The longest chain is unchanged at 29.** SITE-109's only edge into the graph is
SITE-101 → SITE-109 → SITE-061, and SITE-101 has no dependencies — a three-node path into a
node already reached by a 29-long one.

**Retro-sweep of every ruling, 2026-09-19.** Ruled: sweeping on the ruling being applied and
auditing whether earlier rulings landed are **different jobs**, and §1 only ever required the
first. Every ruling issued to date was re-checked against all four tiers plus Linear. **Five
were stale; one had already been caught.**

1. **`SITE-72` / `SITE-74`** — reached Linear and this file, not the decomposition. Caught and
   fixed in the previous commit. It is the worked example for §1's new fourth rule.
2. **`BAS-125` unverified** — reached this file and `SITE-91` only. The PRD's FAQ 12 and §15.5,
   and the decomposition's `SITE-108` and `SITE-95`, all still named it as the settled owning
   issue. Four places instructed someone to ship a Block 2 entry that DS-18a holds.
3. **SP-17's non-goal *"no copy is written before R-2 reports"*** — R-2 has reported in full,
   and the **same block's entry criteria said so seventeen lines above**. A live contradiction
   inside one milestone description, in both the decomposition and Linear.
4. **PRD §15.2 listed R-2 as an open read task** — while the findings from it were already
   built into §6.1b, FAQ 3 and FAQ 12 of that same document.
5. **PRD §15.2's *"weekly review — section not located"*** — it is app PRD §48, filed jointly
   with the nightly check-in, recorded in this file with a quotation. Located is not verified,
   so its DS-18 requirement stands; the "not located" status does not.

Also swept clean, with nothing found: the §6.3a gate-copy MUST · the 120 KB budget · the DS
phantom range · "What's underneath" is cut · SP-17's phase and milestone numbering · §10 Join's
SP-08 dependency · the team key · the longest chain at 29 · the app-name list's 90/180 and
ships-non-empty properties.

**Every DS-15 citation is struck** (ruled 2026-09-19) — PRD §12.3, `SITE-004`'s `*PRD*` line,
this file's §2, and Linear `SITE-4`. A citation to a withdrawn gate is worse than none: a
reader follows it, finds nothing, and cannot tell whether the check is unjustified or the
definition is missing. **The drift check is unaffected** — §6.6 and §12.3 justify it and it
needs no DS number.

**§12.4a's reviewer is Kian** (ruled 2026-09-19). Not the implementer, and does not watch the
build — reports, not the work. Both clauses satisfied as written. If a gate ever needs someone
who has not been in the conversation at all, that is a real staffing problem, and it is hit at
`SITE-085` rather than solved in advance.

**`SITE-4` is started and blocked on one input, by design rather than by surprise.** Its scope
opens *"commit `contracts-manifest.json` — the app's `CONTRACT_MANIFEST` verbatim, plus
`captured_at` and the app repo commit SHA."* That content has never been in this repo or its
history and exists only in `kianh727/baselinev1`. Everything else in the issue — the type
generator, the layout-rule coverage check, the drift guard's negative test — operates **on**
that file, so none of it can be built first. **No manifest was fabricated to build against**:
inventing the action-type vocabulary is a §9 stop, a drift guard tested against an invented
manifest verifies nothing (§0.1), and `placeholder` is a §11 rejection outright.

**Two rulings, 2026-09-19 (Kian).**

- **The app session commits `contracts-manifest.json` directly into this repo**, with
  `captured_at` and the SHA already filled in. **This site does not read the app tree** —
  the boundary holds in both directions. `docs/contracts-manifest-delivery.md` is the
  delivery spec: path, envelope, the `artifact_divergences` exclusion, and what the site does
  with it.
- **Kian raises the manifest-publication request app-side himself.** No cross-team write was
  made from here. **§6.6's primary mechanism is pending his action, not unclaimed** — and
  SITE-004 ships on the staleness fallback regardless, which is already ruled wanted rather
  than required.

**What of SITE-4 is built.** §6.6's staleness fallback, which reads the envelope only and
therefore did not need the contract vocabulary to exist: `scripts/manifest-staleness.mjs` is a
pure `evaluate(parsed, now)` with **warn at 30 days, fail at 60**, and `scripts/check-manifest.mjs`
wraps it. **Absence is a failure, not a pass** — a staleness check that returns ok with no
manifest goes green on exactly the state it exists to catch. Thresholds are tested at their
exact boundaries against a fixed `now`, because a test whose verdict depends on the day it runs
will one day change its answer without the code changing.

**It is deliberately not in the CI sweep yet.** Wiring it in before the manifest lands would
paint CI red for a pending dependency everyone already knows about, which is noise rather than
signal. **It joins the sweep in the same commit as the manifest**, and its logic is exercised
now by `tests/manifest-staleness.test.mjs` (7 tests). Confirmed failing correctly against the
current absent state: exit 1.

**The manifest arrived, and SITE-4 is still blocked — on a different thing.** The app session
delivered it in PR **`resetbaseline-site#3`**, one file at the repository root, targeting `main`.
It matches `docs/contracts-manifest-delivery.md` **exactly**: the three envelope fields, a
capture time that is not the commit time, a 40-hex `app_commit_sha`
(`a776dd7e14745ef900ecbf377c641f66bff830e2`), `CONTRACT_MANIFEST` nested verbatim under its own
key, and `artifact_divergences` left in — which the spec explicitly asked for rather than
excluded, because the site's generator refusing to read it is the safer place for that rule.
Every declared count agrees with the array it describes: **45 actions, 76 events**, plus reason
codes 38, validation errors 21, analytics events 17, gap fills 8. **Nothing is wrong with the
delivery.**

**What is wrong is an assumption three of our own artifacts make about it.** The manifest is an
**action and event vocabulary**. It does not contain:

- **`capability_type`** — the string does not appear, and the five are not enumerated anywhere.
  They exist only *inside* action verb names (`create_commitment`, `create_reminder`, …).
- **`authority_tier`**, or `auto` / `provisional` / `explicit`.
- **`belief_tier`**, or the five resolvable outcome values as a set.

So three requirements cannot be met from this file as written:

1. **SITE-004's accept** — *"every `capability_type` in the manifest has a layout rule; a type
   without one fails the build."* There are none in the manifest, so that check would iterate an
   empty set and **pass**. **This is §0.3 exactly: a criterion satisfiable by the absence of the
   thing it measures**, and it would have gone green on the first run.
2. **PRD §6.2** — *"handles every `capability_type` the contracts define — exactly five …
   generated from `contracts-manifest.json`"*, and **"derived, not hand-listed."** It cannot be
   derived from this file. The tempting fix — hand-listing the five in the site — is the one
   thing §6.2 forbids by name, and it would silently decouple the site from the contract.
3. **§5 of this file and EVAL-031** — *authority tiers are contract-derived, a pure function of
   object type.* There are no tiers in the manifest to derive from.

**My spec is where this should have been caught.** It stated the envelope precisely and said
what the site does with the file — but it never stated, as a checkable precondition, **what the
file must contain** for the site to do it. The app session delivered `CONTRACT_MANIFEST`
verbatim, which is exactly what was asked. A spec that fully constrains the container and not
the contents is the same shape as a check that passes on an empty one.

**Ruled 2026-09-19 (Kian): the app adds the object vocabulary. Not verb-derivation.**

**Verb-derivation was rejected on its merits, not deferred.** It yields `capability_type` and
nothing else — **`authority_tier` has no verb to derive from**, and §6.1a renders it in every
object's metadata at P0, so that option leaves a P0 render with no contract source. The size of
the app change could not choose between the options, because one of them does not do the job.
And its proposed CI guard **could not fail**: *"the derivation still matches the verb list"*
derives from the verb list and compares to the verb list. That is now catalogued as §0.3b, the
third failure shape (§7).

**PR #3 is held unmerged rather than merged and superseded** — one complete delivery, so there
is no window in which the vocabulary-free file sits in the repository for someone else to write
a green check against. The manifest is **not** copied to this branch and the layout-rule check
is **not** written.

**SITE-004's accept criterion is rewritten now, before the file lands, so the vacuous shape is
deleted rather than guarded.** Three parts: the manifest declares a **non-empty**
`capability_type` list, and an absent or empty one fails **naming the manifest** rather than the
layout rules, because the fault is in the input; every declared type has a rule and **the counts
match in both directions**, since a rule with no type is as much a failure as a type with no
rule; and a **positive control in CI** — a fixture manifest carrying a sixth unknown type must
fail the build, without which the first two parts are untested assertions about an input that
has never varied.

**`artifact_divergences` is banned by construction now, not prose.** `scripts/check-divergences.mjs`
is in the sweep and fails on any source file referencing the key; proven negatively with a probe
in `lib/`. The manifest itself is exempt — holding the key is not reading it — and the docs are
out of scope because a check that failed on the sentence banning the key is the veto rule
catching its own definition, a shape this repo has hit twice.

**One instruction not carried out, and why.** The ruling asked for the §0.3b principle to be
filed in `BAS-190`. **That is a write to the app's Linear team, which §13 forbids without
exception** — the one sanctioned cross-team action is the manifest-publication issue, and even
that requires asking first. The principle is recorded here and in PRD §0.3b; **filing it
app-side needs the app session or Kian.**

**`SITE-5` is done in code; its device verification is not, and cannot be from a session.**
Root layout, nav, safe areas, overflow guards.

- **The nav is the wordmark and an empty terminal-CTA slot.** The non-goal is explicit — no
  nav interactivity beyond the slot — so the wordmark is text, not a link: there is nowhere
  else to go yet and a link to `/` from `/` is an affordance that does nothing. The slot
  stays empty because the terminal action is a three-branch config value decided at launch
  (§11.4, §15.3 item 3) and building it is SP-08's. SP-01's exit criterion is *"a deployed
  empty shell"*, and this is what that means.
- **`viewport-fit=cover` is set, and it is the load-bearing line.** `env(safe-area-inset-*)`
  resolves to 0 on iOS without it. Omitting it would leave the tokens declared, the nav
  rendering, nothing looking wrong on a simulator — and the notch handling doing nothing on
  the only device it exists for.
- **`overflow-x: clip` is on the root element as well as body.** Body alone is not enough: a
  child can still extend the initial containing block. `clip` not `hidden`, because `hidden`
  on the root turns the document into a scroll container and breaks sticky positioning.
- **Gutter is 16px, 32px from 768px**, and horizontal padding always adds that side's
  safe-area inset, so one rule covers portrait and landscape-on-a-notched-device.

**A defect in my own check, found by proving it negatively.** The six-width overflow check
first read `scrollWidth` on the shipped page — and passed a deliberate 1200px-wide probe at
320px. **`overflow-x: clip` removes the overflow from `scrollWidth`**, so the guard §9
requires was hiding the defect from the test written to find it: §0.3 in miniature, and the
third time today that "does this pass against nothing?" caught something real. The check now
**lifts the clip before measuring** and reports both numbers — unclipped is the layout truth
and fails the build, as-shipped says whether a scrollbar is actually visible. It names the
widest offending element, because a report that says only "8px" sends the next person hunting
the whole page.

**`playwright-core` is a dev dependency.** An overflow is a layout outcome — a long
unbreakable string, a fixed-width child, a negative margin — and none of those are visible in
the CSS that caused them, so the check needs a real browser. **Dev dependencies do not count
against the 120 KB ceiling**, which is runtime JavaScript; the bundle is unchanged at 100.2 KB
because the nav is a server component. `scripts/serve-out.mjs` is a hand-written static server
rather than another dependency, because the export references `/_next/...` absolutely and
`file://` would 404 on every chunk.

**Not done, and not fakeable from here: `SITE-5`'s `Verify` line is *"real iOS Safari, portrait
and landscape."*** Headless Chromium reports every safe-area inset as 0 because it has no
notch, so what was verified is that the tokens resolve, the calc holds, and the gutter is
correct at every width — not that the nav clears a notch. **That verdict needs a device and
is Kian's to record** (§7: `VIS` verdicts are judged by a human and recorded, never inferred).
**Ruled 2026-09-19: he records it. `SITE-5` is not marked done until he does** — its code is
complete and its acceptance is not.

**`SITE-6` is done.** `useReducedMotion()` and `useRenderTier()`, with §15's ladder as a pure
function.

- **Detection is split from measurement.** `detectTier(caps)` is pure, so the ladder is tested
  against a capability matrix rather than against whatever browser runs the suite — which
  would assert one row of the table, and not the interesting one. `readCapabilities()` is the
  only part that touches the DOM.
- **The ladder is evaluated worst-first**, because every rung is a reason to be *lower*. That
  also makes `save-data` unconditional: a user who asked for less data gets D whatever their
  hardware could manage. Reading it as one input among several would let a fast desktop
  override an explicit request.
- **The pre-detection tier is D, the floor.** Upgrading after paint can only add atmosphere;
  starting at A and demoting would render the most expensive thing first on the weakest
  device. Nothing visual depends on it — the Peak is never in the LCP path.
- **Unreported `hardwareConcurrency` is treated as 2**, which lands on C. Guessing high would
  promote an unknown device into A's full post chain; guessing low costs it some atmosphere.
  Only one of those is recoverable.
- **The WebGL probe releases its context** via `WEBGL_lose_context`. A probe that leaves a live
  context behind costs a GPU allocation for the session on exactly the low-end devices it
  exists to identify.
- **One row §15 does not name, decided and recorded rather than decided silently:** a *desktop*
  with WebGL2 and three cores. Not A (under four cores), not C (over two cores, WebGL2). It
  lands on B, and there is a test named after the gap so the next reader comparing this to
  §15's table finds the answer instead of the hole.
- **Deliberately not built: the mid-session demotion.** §15 permits one, on two frame-budget
  breaches within 10s, never promoting back. It needs a frame-budget monitor, which needs the
  scene, and this issue's non-goals are "no consumers yet, no 3D". It belongs with the Peak's
  performance work.

**Both accept criteria verified end to end in a browser, not just as unit tests.** A temporary
dev-only probe route consumed both hooks: `?tier=A|B|C|D` forced all four, lowercase `c`
resolved to C, an invalid `?tier=E` fell through to detection rather than pinning a tier nobody
chose, and `prefers-reduced-motion` tracked the preference in both directions. Probe removed.
The suite was also proven negatively — moving the C threshold from `<= 2` to `<= 1` fails test
10 by name.

**`node --test` now runs TypeScript directly**, via Node 22's native type stripping. No
ts-node, no build step, no dependency, and `tsconfig` gains `allowImportingTsExtensions` because
type stripping needs the explicit `.ts` specifier. This is the mechanism every later logic
suite uses — SITE-023's DST-safe occurrence math above all.

**The bundle is unchanged at 100.2 KB.** The hooks are client code but have no consumers yet,
so nothing imports them into a route.

**`SITE-106` is done, and it found something about itself.**

**The mechanism.** `scripts/check-eval-stubs.mjs` is in the sweep and runs first, before the
build, because a missing stub check needs no artifacts and should be the first thing anyone
hears about. Every eval in `docs/site-evals-v1.md` now carries a `*Stub check*` line saying how
it fails against a stub that does nothing — **68 were written in this pass; 11 already had
one.** An eval added without one fails CI rather than review, and **an automated eval may not
answer `n/a`**: that is the right answer for a `VIS` or `FTU` eval, whose verdict is a human's,
but an eval with code behind it has a stub to run against and "not applicable" there is the
question dismissed rather than answered. Both failure modes proven negatively — a new eval with
no stub check exits 1 naming it; an `AUTO` eval answering `n/a` exits 1 naming it.

**All three named exposures are rewritten, not waved through as non-exposures.**

- **SITE-EVAL-021** — *"all validate"* passed on zero requests. Now asserts 30 responses and ≥8
  clarification fields **before** any property. (Done in an earlier pass.)
- **SITE-EVAL-027** — *"each demonstrates its assigned behavior"* passed on presence-of-render:
  five scenarios each rendering *something* satisfied it. Now asserts each scenario's specific
  object set, and that **no two scenarios share an object-type multiset** — which is what
  *"indistinguishable in output shape"* actually means, and was previously eyeballed.
- **SITE-EVAL-037** — the sequence assertion passed on an empty stream, which is trivially
  "complete and ordered". Now asserts the **expected event count first**, then ordering and
  properties.

Per SITE-106's non-goal, the **eval definitions** are rewritten here; the **implementations**
stay with their owning issues — SITE-030/031, SITE-028, SITE-050.

**The finding, and it needs a ruling.** SITE-106 sits at SP-01 with one dependency, and its
accept reads *"every eval in the suite has a recorded stub result."* At SP-01 almost no evals
are implemented, so that criterion is satisfiable by there being nearly nothing to satisfy it —
**the audit written to catch criteria satisfiable by absence has one, at its own position in the
graph.** Running it here and calling it done would have been the §0.3 shape one level up.

What was built instead is a **standing gate over the eval definitions**, all 79 of which exist
today, rather than a one-time audit over implementations that mostly do not. That is the half
which holds. **The half that does not: actually running each eval against a stub can only
happen as each eval is implemented, and no mechanism enforces that** — the gate checks the
document, not the code. It makes the question unskippable; it cannot check that the answer is
true.

**Recommended, not ruled:** SITE-106 stops being a one-time SP-01 issue and becomes a standing
gate re-run at each design review and before the P0 gate — the same trigger as §1's fourth-rule
reconciliation, for the same reason. Awaiting a ruling; the CI gate is in effect either way.

**SP-01 is complete except `SITE-4`** (blocked on the manifest) and **`SITE-5`'s device
verdict**, which is Kian's to record.

**SP-02 is started. `SITE-7`, `SITE-8` and `SITE-12` are done** — structure, input, state
machine. `SITE-9`, `SITE-10` and `SITE-11` are not, and are flagged below.

- **`SITE-12` · the state machine.** A pure reducer with an explicit table; `next()` returns
  `null` for a transition that is not in it, so **no state is reachable by side effect**.
  `walled` is produced by exactly one event, and the test asserts that **exhaustively over
  every state × event pair** rather than checking the one transition that is meant to reach it
  — testing the intended path would confirm activation works while saying nothing about
  whether anything else gets there, which is the half §11.1 and Rejection 3 care about. A
  second test asserts the wall *is* reachable, because "only by activation" is satisfied
  perfectly by a wall that never opens.
- **`SITE-7` · the fold.** LCP asserted to be the `H1` at both widths, measured through a
  `PerformanceObserver` registered before navigation. Headline and input both sit above the
  fold with no page scroll at 1440px and 375px.
- **`SITE-8` · the input.** Rules live in `lib/ask-input.ts` as pure functions, so the
  thresholds are tested at exactly 1, 2 and 300 characters. Whitespace is not input — a field
  of spaces enables nothing. The cap applies on change rather than by `maxLength` alone, so a
  5000-character paste is capped by the same rule as typing. `Run` is a labelled button, not an
  arrow (§19), and is 44px tall.

**The H1 is one string in one place** — `lib/copy/hero.ts`. All three of Kian's candidates live
there; `CURRENT` selects one and `HEADLINE` exports it. No component names a candidate and no
test asserts the text, so swapping costs one identifier. **`'You already decided. This is the
part after.'` is rendered, and that is a rendering choice rather than the decision** — it is the
only candidate that answers *"how is this different from writing my goal down?"* in the headline
itself, which is SITE-EVAL-002's question. The decision is Kian's and is open.

**Not built, and why.** `SITE-9` (autotype), `SITE-10` (twelve chips) and `SITE-11` (rotation)
all need **chip content that does not exist**. `SITE-10` needs twelve strings tagged to the five
§5 archetypes; `SITE-11`'s constraint is defined over `back`, `thesis` and `lsat`. `SITE-109`'s
scope does not cover them — it lists §2, §3, the FAQ, §7, §9 and the roadmap source. **The chips
and the hero headline are copy with no owning issue**, which is the same gap §15.4's ruling
closed one item over. Flagged, not decided.

**`SITE-103` is blocked twice over, and the second one is the same gap as the refusals.** The
beat's question is generated on `/api/plan`, which is SP-05 and does not exist — expected, and
not the interesting half. **§6.4 says every failure "falls back silently to the authored
question set", and that set is written nowhere.** It is not in v7.3, not in v5, not in the
decomposition. So the beat has neither of its two sources: no route to generate from, and
nothing to fall back to. The fallback is the half that matters for honesty — it is what runs
on timeout and on the spend cap — and a beat with an empty fallback fails silently into a dead
state, which is the one outcome §6.4 forbids by name.

**SP-03 is therefore complete to its boundary.** `SITE-13`, `SITE-14`, `SITE-15`, `SITE-19` and
`SITE-102` are done. `SITE-16` needs SP-05's provider seam for its timing assertion, `SITE-17`
needs four of five refusals, `SITE-18` follows `SITE-17`, and `SITE-103` needs both a route and
an authored question set. **Three of the four remaining are waiting on authored copy that no
issue owns** — the same shape as the hero H1 and the chip strings, and the third time it has
surfaced.

**Where the mountain decision actually bites.** The route-up-the-mountain reading as a progress
bar with a summit date is not only a visual problem: §10 bans *"progress or completeness
meters"* outright, and §3's own copy promises *"no streaks, no scores, and no completeness
meters"* — the section v7.3 §4 calls the most differentiating content on the site and says
**cannot regress and cannot be wrong**. The most dominant element on the page was contradicting
the site's strongest claim.

- **It does not bite SP-02 or SP-03 at all.** Structure, input, state machine, classification,
  the transformation block and the refusal path are logic and copy. None of them names a
  visual.
- **It bites first and hardest at `SITE-22` (`FlatLayout`)**, which *is* the ascending route
  with dated occurrence marks. `SITE-22` is the reference implementation and §3 of this file
  says a great builder with a simplified Peak is launchable — so this is the P0 critical path,
  not decoration.
- **`SITE-20` and `SITE-21` are the insulation, and they land before the decision is needed.**
  §6's invariant — one semantic plan model, never coupled to a renderer, layout an adapter
  behind `PlanLayout`, swapping adapters changes zero builder code (EVAL-063) — means a changed
  visual language costs one adapter **provided the model never learns the metaphor.** The
  danger is `SITE-20` acquiring elevation, summit or progress concepts; if the model is shaped
  by the route, the change stops being an adapter swap.
- **So the runway is SP-03 plus `SITE-20` and `SITE-21`.** The decision is not blocking until
  `SITE-22`. **Recommendation: prioritise it to land before `SITE-22` starts, and hold
  `SITE-20` strictly to semantics** — occurrences, recurrence, windows, authority tiers, never
  position or completion.

**SP-03 is started. `SITE-13`, `SITE-14` and `SITE-102` are done** — the three deterministic
pieces §4's table names, all pure functions with fixture suites and no consumers yet, so the
bundle is unchanged at 101.0 KB.

- **`SITE-13` · the date-phrase parser.** Every date is **noon-anchored local**, because a date
  at midnight can shift a day across a DST transition and the calendar day the visitor sees
  must be the one stored. Four phrase families, extended to their obvious members — all twelve
  months, `days|weeks|months`, `month|quarter|year` — which refines what the issue names rather
  than adding a fifth family. Month arithmetic clamps: "in 1 month" from 31 Jan is 28 Feb, not
  3 March, so the deadline never lands in a month the visitor did not name.
- **The fixture suite found a real bug.** *"by February 30"* failed the explicit-date rule and
  then **fell through to the bare-month rule, returning 28 February** — the parser silently
  correcting an impossible date into a plausible one and showing it as understanding, which is
  precisely what *"ambiguous phrasing returns null rather than guessing"* forbids. Rules now
  distinguish *did not match* from *matched something impossible*, and the second aborts the
  whole parse.
- **`SITE-14` · the domain classifier**, five bounded domains, erring toward bounded because the
  two errors are not symmetric: a false positive is an odd demo, a false negative builds a
  training plan around an injury. **Fixtures caught three gaps**, all false negatives — "hurt my
  back" matched nothing, "saving for retirement" needed a following noun, and eviction sat in
  finance when a landlord evicting you is legal.
- **The parity check is structural, not behavioural, and that is §0.3b applied the same day.**
  SITE-014 asks that client and server produce identical output. There is **one**
  implementation imported by both, so comparing it against itself could not fail. The test
  instead asserts that **nothing outside `lib/parse/domain.ts` names the tiers** — a second
  implementation is the only thing that can drift, so that is what it looks for.
- **`SITE-102` · input classification**, seven classes. **Evaluation order is not the declared
  order**: `bounded` is tested immediately after readability, ahead of `vague` and `multi_goal`,
  because *"I want to get healthy after my surgery"* is both — and if `vague` won, the site
  would ask a clarifying question about a medical situation it has already decided not to
  advise on. §6.4 lists the classes; it does not order the tests.

**`SITE-15` and `SITE-19` are done; `SITE-16`'s mechanics are in place and its timing assertion
waits on a provider.**

- **The frame is complete and empty at t=0, and that is structural.** All five §3.4 rows are in
  the DOM from first paint showing `—`; none is conditionally rendered, none is skeletonised,
  and the frame's shape does not depend on what has arrived. A frame assembled from available
  data would grow as data landed, which is the spinner problem with better manners.
- **`scripts/check-builder.mjs` asserts it in a browser with every post-document request
  aborted**, so a frame that depended on any fetch could not appear. It also counts requests
  while typing: **"finish my thesis by May" surfaces `May 31` with zero network requests**,
  which is SITE-019's *"verified in devtools"* automated.
- **Proven negatively, twice, bare.** Rendering one row conditionally fails naming the missing
  row; adding `animate-pulse` to an unfilled value fails with the element count — exit `1` in
  both cases.
- **The check writes §3.4's row list out rather than importing it** from
  `lib/builder/rows.ts`. Importing would make the assertion a pure function of its own
  reference (§0.3b) — comparing the rendered rows to the same constant the renderer used, and
  agreeing by construction. Written separately from the PRD's table, it is a second source.
- **The parse runs during render, synchronously — no effect, no debounce, no timer.** A debounce
  would make the deadline arrive *after* the keystroke that earned it, which is the one thing
  §3.3's detail exists to avoid. It costs a regex pass over at most 300 characters.
- **The parser reports the phrase it matched**, so §3.4's qualifier can say `from "by May"`
  without a second regex re-deriving it. The first version had that second regex; it disagreed
  with the parser on a sentence with no trailing punctuation and rendered nothing. Two matchers
  describing one match can disagree — now the phrase is a by-product of the parse.
- **`SITE-8`'s input is now controlled by the builder.** Two things read the text: the input
  renders it, the block parses it. Its pure rules and their tests are untouched.

**Bundle 102.5 KB of 120.** The builder is the first substantial client component.

**`SITE-17` is blocked, and the premise that it was not is worth recording.** The ruling said the
five refusals are "§3 verbatim and already authored in v7.3". They are two different artifacts.
**v7.3 §4 (the site's §3) carries four lines** — no streaks · no completeness meters · silence is
never failure · it refuses what it shouldn't guess at — which are the *website section*, and
§15.4 calls them *"specified structure with example text; not final prose"* and puts them inside
`SITE-109`. **SITE-17 needs five per-domain builder refusals**, one each for injury, medical,
mental health, finance and legal, and §4's determinism table says so explicitly: *"refusal copy —
authored, per domain. Never generated. Five variants, one per bounded domain."*

**Exactly one of the five exists**, the injury refusal, authored verbatim in v5 §3.4 and carried
forward — *"I'm not going to program around an injury I can't see. I'd be guessing, and you'd
follow it."* with its built-instead pair. **The other four are not in any artifact.** They were
not invented here: they are the site's most sensitive sentences, covering medical,
mental-health, legal and financial situations, and §5 puts refusal copy outside anything a
session generates.

**SP-04 is started. `SITE-20` and `SITE-21` are done to their boundary, and the boundary is
SITE-004.**

- **`SITE-20` · the plan semantic model.** `Plan`, `PlanNode`, `Occurrence`, `Window` and the
  five detail shapes, all pure structure with no consumers yet — the bundle is unchanged at
  102.5 KB.
- **The contract vocabulary is not in the file, and could not be.** §6.2 requires the five
  `capability_type` values *"generated from `contracts-manifest.json`… derived, not
  hand-listed"*, and SITE-004 is blocked because the delivered manifest carries no object
  vocabulary. Hand-listing them is the one thing §6.2 forbids by name, and it would decouple
  the site from the contract **silently** — the failure mode is a site that keeps building
  after the app's vocabulary moves. So `CapabilityType` and `AuthorityTier` are **opaque
  aliases**: the model is parameterised over them, every structure is complete and typed, and
  SITE-004 lands by narrowing two lines. Nothing downstream is written against a placeholder.
- **Two source scans, because two of the issue's constraints are about what the model does not
  contain**, and a constraint of that shape cannot be tested by calling anything.
  - **No spatial or completion vocabulary in `lib/plan/model.ts`** — twenty-one words across
    two families. Spatial, because §6's invariant holds only while the model has not learned
    the metaphor: a changed visual costs one adapter, or costs a rewrite, and which one depends
    entirely on this. Completion, because §10 bans progress and completeness meters and §4
    promises no scores and no completeness meters — a model field is where that leaks in.
  - **No file hand-lists a contract axis.** Two or more values from one axis is a hand-list;
    one is not. **The first version flagged `lib/builder/rows.ts`**, which names `'commitment'`
    as §3.4's transformation-block row key — a row label sharing a word with a capability, not
    an enumeration. §6.2 forbids restating a *closed set*, and a check that called one word a
    set would have been argued down the first time it fired.
  - **Both proven negatively against the real file**, not only against synthetic strings:
    an `elevation` field and a two-value `Cap` union each exit 1, naming the file and the words.
- **`Occurrence` carries no outcome and no ordinal**, and both omissions are the constraint
  doing its job rather than an oversight. No outcome: the builder's plan is prospective, §6.1
  forbids any copy claiming the app generates occurrences today, and §6.3 bans rendering
  `pending` outright. No ordinal: *"3 of 12"* is a completeness meter with better manners.
- **`Plan.nodes` asserts no order.** A stored order is the first half of a layout.
- **`Gate.appCount` is a number**, so naming an app is not a thing the type can express
  (§6.3a MUST).
- **`SITE-21` · `PlanLayout`.** `anchorFor(node)` returning `Anchor | null`, and nothing else.
  `null` is a real answer — a node outside a projected frustum, or a capability a composition
  does not draw — because throwing would make a routine case an exception and a default would
  put an object where nobody chose. The stub-satisfies-the-interface test passes against almost
  anything, so the suite also asserts that anchoring **does not mutate the node**, that two
  adapters answer differently about the same unchanged node, and that **the model does not
  import the layout** — the direction is what makes EVAL-063 hold and it breaks with one
  import that type-checks fine.

**Three things found in SP-04 that are reports, not decisions.**

1. **`SITE-21`'s scope is `anchorFor(node)`, and SITE-025 renders a mark per occurrence.**
   Occurrences are not nodes. Nothing in §6 or the decomposition says how one is anchored.
   Built exactly as scoped. **Ruled 2026-09-19 (Kian): correct call — do not extend the seam
   yet.** It is a SITE-25 question and is ruled with the rendering grammar in hand.
2. **RULED 2026-09-19 (Kian): §6.5's citation is fixed, the content is not moved.** §6.5 cited
   *"§4's table"* and v7.3 §4 has no table — it is *"What it won't do"*; the table was v5 §4,
   which §1 declares superseded. **§6.5 now carries its boundary statement inline with no
   cross-reference**, because the rule already survived in its own list. This file's §5 is
   corrected in the same pass and defers to §6.5. A citation to a superseded document is worse
   than none: the reader follows it, finds nothing, and cannot tell whether the boundary is
   unjustified or the definition is missing.
3. **RULED 2026-09-19 (Kian): recurrence-rule selection is deterministic, from the parse.**
   Corrected, not reconciled — **the LLM's output surface is three fields, full stop.** If the
   model also chose the rule there would be a fourth generated field, and **the determinism
   claim the whole site rests on would be false while reading true.** §6.5 now says so
   explicitly rather than leaving it to be inferred from the may-never-touch list, since that
   list named *recurrence expansion* — the computation, not the choice — which is exactly the
   gap. **The closed set is enumerated in no artifact; that is `SITE-113`, a PRD defect, Kian's,
   blocking `SITE-23`.** No session enumerates it.

**The band grammar arrived, and it is PRD v7.3 §6.3b** — amended 2026-09-19 (Kian), a MUST,
with the same status as §6.3's closed value lists. It is the visual vocabulary §6 had been
missing, and **it supersedes any description of a route, path, summit or ascent anywhere in
this repository.** Any prompt-set or visualisation document is **mood reference only** and is
not authoritative on structure, copy or behaviour.

The grammar is in §5 of this file. Three things about it that matter more than the vocabulary:

- **The dark-mark rule is §4 rendered in visual grammar, which is why it is a MUST.** §4
  promises no completeness meters and *cannot regress and cannot be wrong*. A dark mark styled
  as a gap regresses it **in pixels while the copy still reads correctly** — the section says
  the right thing and the most dominant element on the page contradicts it. **No copy check on
  this site can see that**, which is what makes it a gate rather than a preference.
- **The gate is fifteen questions now, not ten** (§12.4a, SITE-085, and equally at SITE-087 and
  SITE-088). **The review set MUST include at least one frame where most marks are dark, and
  the output MUST state which frame carried the sparse case.** That is §12.4 applied to a
  design gate: a set of full or near-full weeks cannot fail the dark-mark questions, because
  the condition they measure never occurs — the reviewer answers no honestly and the gate
  reports a pass it never tested.
- **Enforcement is construction, not convention.** A band must be derivable **only** from a
  recurrence and is **not a prop a component may pass**. The shape of that is being agreed
  before it is built, per the instruction.

**Both gaps §6.3b left are ruled (2026-09-19, Kian), and both are the grammar working.**

- **A timer and a tracker get no band.** A band means a recurring time window; a timer is a
  duration with no recurrence and a tracker is a direction with no occasion — §6.1a's own
  Problem lines. Neither has a window, so *"nothing else ever gets a band"* applies to both, and
  §6.3b now **states the exclusion positively and by name**, because an unstated exclusion reads
  as an oversight and the next author fills it. **Do not invent a band variant for either.**
  What they get instead is open, **not blocking**: SITE-26's gate half builds now and the rest
  waits on **a visual treatment that is not a band** — the distinction is the ruling.
- **The band does not animate in. It is already there.** A route stroke drawing itself was a
  thing **coming into existence over time**, which made it a completeness meter in motion as
  well as in composition. **A recurring window is not a thing that happens; it is a thing that
  is the case.** The band is present from first paint of the plan; what reveals is the marks
  inside it as occurrences land, so SITE-25's beat survives — it moved from the frame to the
  marks. **§12.4a gains question 16** — *does any band draw itself in, grow, extend, or
  arrive?* — asked separately from question 12 because **a review of screenshots answers 12 and
  cannot answer 16.** The checklist is sixteen.

**v5 §8 is inlined into v7.3 at §11.1, verbatim** (ruled 2026-09-19). §11 carried it forward by
reference to a document §1 removes from the working tree, which is the same failure as §6.5's
citation to a superseded table — SITE-024 had to recover the spring constants from
`9568a9a:docs/site-prd-v5.md` to build against them. The two lines §6.3b supersedes are struck
in place rather than deleted, so the supersession is visible at the point of the old requirement.

**The §11 audit found two more defects, and the second is worse than the phantom it sits next to.**

1. **There is no K-8.** §11's list read *"Scope-kill rules K-1…K-8"*; v5 §17 defines K-1 through
   K-7 and stops. **The DS-11…DS-17 shape at a smaller scale** — a range citing a rule never
   written, which cannot be failed and therefore reads as passed. Corrected in the PRD; this
   file's §4 had it right at K-1…K-7 throughout.
2. **§12.1 cited DS-1…DS-10 as *"Defined in v5 §18 and carried forward by §11"*, and both
   halves were wrong.** They are defined in **v5 §2** — §18.1 only points at §2 — and **§11
   carries forward neither v5 §2 nor v5 §18.** So **the ten gates this repository treats as
   binding are carried forward by nothing and are in the working tree nowhere.** That is sharper
   than the phantom range §12.1 was written to close: DS-11…DS-17 read as passed because they
   had no definition, while DS-1…DS-10 have definitions one `git show` away from anyone who
   thinks to look — and a citation pointing at the wrong section of a removed document is what
   stops them looking. Citation corrected; **the definitions are not inlined**, pending the
   ruling on the audit below.

**`SITE-24` is done — the settling spring, hand-rolled.**

- **§8.1 is not in the working tree.** v7.3 §11 carries *"Motion (v5 §8)"* forward unchanged,
  and §1 keeps superseded PRDs in git history only, so the config this issue's accept measures
  against — `{ stiffness: 260, damping: 24, mass: 0.9 }`, from `{ opacity: 0, scale: 0.94, y: 8 }` —
  had to be recovered from `9568a9a:docs/site-prd-v5.md`. **It is a requirement by explicit
  carry-forward, not by lineage**, so it governs. But a requirement readable only from git
  history is the third citation problem in two days, after DS-15 and §4's table. **Reported, not
  fixed** — inlining v5 §8 into v7.3 is a §10 amendment and Kian's call.
- **The spring is integrated, not approximated by an eased duration.** ζ ≈ 0.78, underdamped, so
  it overshoots and settles back — **and the overshoot is the signature.** A cubic-bezier fitted
  to the same duration looks close and never overshoots, which is the one property worth keeping:
  it is the difference between structure *landing* and structure *arriving*.
- **The curve is asserted on the numbers, not on an animation.** `settleProgress()` is pure and
  exported for that reason; a test that could only watch a browser play it would be asserting
  the browser. It asserts the overshoot exists, that the target is crossed **exactly once** —
  more crossings is a wobble, and "it landed" and "it is springy" are different products — and
  that the duration falls in a range a 260/24/0.9 spring must produce rather than against a
  literal the implementation also uses.
- **Keyframes for WAAPI, not a CSS `linear()` easing.** `linear()` expresses the curve in one
  declaration and is tidier, but needs Chrome 113 / Safari 17.2 / Firefox 112 — and **375px is
  the primary target, which means older iOS.** Same curve, wider delivery.
- **`reducedMotion` is a parameter, not a media query read here.** SITE-006 owns the detection;
  reading it again would be two derivations of one fact that can disagree silently (§0.3c).
  Under reduced motion the element is placed at its settled state immediately — not faded, not
  shortened — because the structure must still be there.
- **`settle()` returns the `Animation`.** Every builder animation is interruptible (EVAL-016),
  and an interruptible animation whose handle is discarded is not interruptible.
- **The lint rule is proven in both directions, by running eslint rather than by reading the
  config.** A probe importing the spring from `components/` exits 1 naming SITE-024; a probe in
  the allowlisted `components/plan/**` exits 0. **The second half matters as much as the first** —
  a ban that also blocks its legitimate consumers passes the negative test perfectly and is
  discovered at SITE-025. Both probes removed.
- **The allowlist block restates the scroll-library ban**, because a flat-config block replaces
  `no-restricted-imports` wholesale for its files, and omitting it would open a hole in
  SITE-070's ban at exactly the paths that animate.

**Bundle 105.0 kB of 120** — decimal now, and the spring has no consumers yet.

**Four PRD sections applied onto the tree, 2026-09-19, never by replacement.** Numbering was
ruled rather than guessed, and the final numbers are **§6.1c · §11.3 · §12.3a · §12.3b**.
`§11.1` stays the inlined v5 §8 and `§11.2` stays the budget table — neither is renumbered,
because both are already committed and referenced. The section handoffs took **§11.3**.

- **§6.1c · the workspace transition.** On submit the fold reconfigures in place — same page,
  same scroll position, no modal. Two notes added on application, because the section arrives
  after the work it touches: **the band is present when the workspace opens** (§6.3b — the
  camera ease moves the view, it does not bring the band into existence), and **`walled` is
  still reachable only by an activation attempt** — *"dismissing the wall returns to the
  workspace"* is an exit edge, not a second entrance.
- **§11.3 · section handoffs, resolved toward P0** (ruled). Three of four carriers as drafted
  rode the mountain, which is P1, while §2 and §3 are P0 — and **§2 is the seam where the
  mountain deliberately recedes and carries no band**, so the seam most needing a carrier had
  the least mountain to carry it. Every seam now has a **non-mountain carrier at P0** (the
  band thinning; page luminance; type scale), with the mountain as a **P1 enhancement riding
  the carrier the P0 seam already defines** — not a second property, which would break the
  one-carrier rule.
- **§12.3a · surface quality, pulled into P0**, and **retroactive**: grain with tokens rather
  than the P1 post chain, metadata contrast, the typeface decision recorded. It binds SITE-002,
  SITE-003, SITE-015 and SITE-019, all merged.
- **§12.3b · the comparison gate. Applied and deliberately unbuilt.** It needs
  `docs/site-design/target-frames/`, which does not exist. **A gate whose inputs do not exist
  passes by having nothing to check** — it would iterate an empty directory and report success,
  which is §0.3 exactly. Blocked on Kian; when the frames land, the gate's first assertion is
  that the directory is non-empty, failing by naming the directory rather than the build.

**`SITE-13`'s bare month returns null** (ruled 2026-09-19, Kian). It resolved to the last day
of the month, and **that is a guess**: *"by May"* means sometime in May, and the 31st is one of
thirty-one defensible answers presented as the thing the visitor said. **It is the same defect
as `by February 30` with a plausible output instead of an impossible one — which makes it
worse, because nothing flags it.** February was caught by a fixture precisely because 28
February was visibly not what was typed; 31 May is invisible. It also contradicted SITE-013's
own *"ambiguous phrasing returns null rather than guessing"*, which the end-of-month reading had
quietly exempted itself from.

**`by the end of May` still resolves**, and that is the distinction the ruling turns on: a
visitor who writes *"end of"* has named the last day, so the parse reports what they wrote.

**The fixtures were reshaped, not just re-valued.** They read `assert.equal(parsed('by May'),
'2026-05-31')` — a record of what the code returned, which **would have passed identically
under any reading somebody picked**. The choice it encoded was invisible, so the next person to
change it would change a number without learning a decision was being reversed. The rule is now
one test asserting the triple — **a bare month returns null · an explicit date resolves · an
impossible date aborts** — deliberately together, because the rule is the distinction between
them: a suite asserting only the first passes on a parser that returns null for everything.

**A defect in `check-builder.mjs`, found by it passing when it should have failed.** It reads
`out/`, not `lib/`, so the deadline change went green locally against an export built before
the change existed. **CI is safe by accident** — `build` runs immediately before it — which is
the kind of safety that holds until the job order is edited and does nothing for a hand run,
which is when a wrong green is most expensive. It now **fails if `out/` is older than the
newest file in `app`, `components` or `lib`**. Proven: touch a source without rebuilding, exit 1.
It is the §0.3 family with a twist — not satisfiable by the *absence* of the thing it measures,
but by a **stale copy** of it.

**Lavender is light, never paint, and it is now a CI check.** `scripts/check-lavender.mjs` is in
the sweep, which is **twelve checks**. §6.3b's clause is written about the band and the rule it
states is about the token: a viewer cannot learn that lavender means *lit* from a page that also
uses it to colour things in.

**It existed because the rule was already broken in the most prominent place on the page.** The
`Run` button was a solid `--color-lavender` fill, and the input's status dot was a filled
lavender disc **with a lavender glow on it** — the same token used as paint and as light in one
element. Neither was caught by review, by types, or by the eleven existing checks, because
nothing was looking. Both are now lit edges: a lavender border and label with the glow, over
the surface, so enabled and disabled differ by **light** rather than by presence of fill.

The scan matches `background`, `background-color`, `fill` and the `bg-`/`fill-` utilities, and
**deliberately does not match** `color`, `border-color`, `box-shadow`, `outline` or `stroke` —
a lit edge and a glow are the sanctioned form, and a check that flagged them would ban the rule
along with its violation. **One allowlist entry, named explicitly rather than by pattern**:
`app/tokens/page.dev.tsx`, whose job is to render each token as a filled block and which never
ships. A pattern would let any future dev route paint with lavender. **Proven three ways** — the
Tailwind utility exits 1, the CSS property exits 1, and a lit edge exits 0.

**§12.3a's four retroactive items, 2026-09-19. Two built, one reported as a contradiction,
one stopped on purpose.**

**Grain is built, and it is CSS with zero JavaScript.** `body::after`, a fixed overlay at
`opacity: 0.03`, an inline `feTurbulence` data URI at a **160px tile with `background-size` set
to that same 160px** — never `cover`, because scaling the tile is what turns grain into mottling.
It **steps rather than slides**: `steps(1, end)` across four offsets, because sliding reads as
something moving across the page and stepping reads as the surface being re-exposed, which is
what grain is. `pointer-events: none`, verified by `elementFromPoint` on the `Run` button rather
than by inspection. **Static under reduced motion**, which is v5 §8.3 verbatim — *"grain renders
statically"* — now readable at §11.1. It costs **nothing** against the 120 kB ceiling and cannot
be in the LCP path, and it renders in **every tier including D**, which is why §12.3a moved it
out of the P1 post chain: gating the cheapest quality win on WebGL withholds it from exactly the
devices that get least of everything else.

**Hairlines were already correct.** Measured in a browser: every rule on the page is
`rgba(242, 240, 236, 0.08)` at 1px. Whether 0.08 reads as *visible* is a `VIS` verdict and not
one a session records.

**Metadata contrast was already correct too** — the `@utility metadata` carries 11px / 0.06em /
`--bone-38` and resolves at those values. **One real bug found and fixed while checking**:
`components/plan/flat-plan.tsx` and the `/plan` route used `className="meta"`, which is not the
utility's name, so those labels rendered at 16px with normal tracking. Mine, from the previous
commit, caught by measuring rather than by reading.

**Display type is a contradiction between two tier-one sections, and it is reported rather than
resolved.** §12.3a requires *"display type at its specified clamp ceiling, not a comfortable
middle."* §14 specifies `clamp(40px, 8vw, 140px)`, and **8vw reaches 140px only at a 1750px
viewport.** Measured: **375px → 40px · 1440px → 115.2px · 1750px → 140px.** So at the primary
verification width the build renders **82% of the ceiling** — and it is not a comfortable middle
anybody chose, it is §14's clamp evaluated correctly.

**SITE-003's own precedent is the argument for changing it**, which is why this is a real
question rather than a nitpick: lead and body were deliberately interpolated to reach their
maxima at *exactly* 1440px, *"so the scale is settled at both verification widths rather than
caught mid-interpolation at either."* **Display was left verbatim and is caught mid-interpolation
at 1440px** — the one case that reasoning was written to avoid. Landing the ceiling at 1440
means a slope of about **9.72vw**, which changes a number §14 states verbatim. **That is a §10
amendment and Kian's.**

**The typeface comparison ran, and produced criteria rather than a verdict** — which is what was
asked for. `docs/typeface-decision.md` carries the table. Four stand-ins measured at display
scale; none is in the candidates' register, and **the point was to find which properties
discriminate, not to pick.**

**The decisive criterion is one nobody would reach from description: ink height against the 0.92
line box.** Line height 0.92 is below 1.0, so a face whose ascender-plus-descender exceeds the
line box **collides between lines** — and **three of four measured faces exceed it**, by up to
5.7%. The H1 sets on two lines, so a collision lands in the most prominent element on the site.
SITE-003 chose 0.92 for a good reason and chose it **without either candidate's vertical
metrics**, which are the thing that decides whether 0.92 is tight or broken.

The others, by how much they separate faces: **cap-height ratio** spreads 13% (two faces at the
same px are not the same optical size) · **set width** spreads 25% for the same headline, which
decides the line count inside `max-w-[18ch]` and is a **layout** outcome rather than a taste one ·
**x-height over cap-height** · **tracking response at −0.04em**, which depends on sidebearings and
so cannot be predicted from the other four.

**A finding that is not about the typeface: no measured face reaches 12% cap height at §14's
rendered size, or at the clamp ceiling.** The required size is **146–166px** against a **140px**
ceiling; at the ceiling, cap height lands at **10.8–11.5%** of a 900px frame. Reported, not
resolved — it is the same §14 question as the clamp slope.

**`classifyDomain` has three answers now** (ruled 2026-09-19, Kian). `open` is a **positive
verdict** — *not bounded, safe to plan normally* — and input the classifier could not assess was
receiving a clean bill of health nobody issued. Empty, whitespace and non-string input return
**`unknown`**.

- **`isBounded` was a latent bug and is fixed.** It read `tier !== 'open'`, correct with two
  answers and **silently wrong the moment a third arrived**: `isBounded('unknown')` would have
  returned `true` and `unknown` would have rendered a refusal, with **no line changed to cause
  it.** A predicate defined by what a value is *not* inherits every value added after it. It is
  now membership in the declared set.
- **`unknown` is not escalable.** The model may not turn input the classifier could not read into
  a verdict of any kind — that is the model deciding what a refusal applies to.
- **A scan, not a convention.** *"Handle it explicitly"* is the instruction that decays, and
  collapsing `unknown` into `open` type-checks and passes every behavioural test. The scan fails
  on any file outside `lib/parse/domain.ts` comparing a tier to `'open'` or defaulting to it.
- **The rule is generalised into PRD §6.4**, because it should outlive this function: **a
  classifier's unmatched case returns a distinct value and never the permissive one.** The
  permissive value is the one a caller forgets to handle and the one whose mishandling is
  invisible.

**Two things stopped short of the ruling's literal wording, and both need Kian.**

1. **The *assessed but unmatched* case still returns `open`.** The ruling says *unmatched input
   returns unknown*. Measured before changing it: **ten of ten ordinary goals exit through that
   line** — *"finish my thesis"*, *"run a marathon"*, *"learn spanish"*. Returning `unknown`
   there makes `open` **unreachable from the function**, and combined with *"unknown routes to
   the clarification beat"* it sends **every visitor with a perfectly clear goal** to a clarifying
   question. The two clauses of the ruling are incoherent together, so the un-assessable half is
   built and the unmatched half is held.
2. **`unknown` does not overlap with §6.4's `unreadable`, so there is nothing to collapse.**
   `classifyInput` tests readability **before** domain, so degenerate input never reaches the
   classifier — which means `unknown` is currently **unreachable through the only production call
   site**. It earns its keep at SITE-033's server mirror and at any caller that does not
   readability-gate first; the scan is what makes that safe. Flagged because a value that cannot
   occur is itself a §0.3 shape.

**Also: the false-negative path is `open`, not `unknown`, and this change does not close it.**
*"my back and my finances"* is readable and was assessed, so a classifier with complete patterns
returns `injury` there. **Pattern coverage is the fix for false negatives**; the return-value
change is about the path where nothing was read at all.

**PRD §0.3d — a fourth failure shape, and it was hit in both repositories on the same day.**
**A check that reads a build artifact is measuring the last build, not the current source.** The
app session credited unrelated breakage to its own assertion against a stale `dist/`; this repo's
`check-builder.mjs` went green on a parser change against an export built before the change
existed. **Neither was found by a failing run — both by a pass that should not have happened**,
which is what earns it a separate entry from §0.3: that one is caught by *does this pass against
nothing?*, and this one passes against something, just not the thing under test. **CI is safe by
accident**, because a build step running immediately before is job ordering, not a guarantee, and
it protects nothing on a hand run — which is when a wrong green is most expensive. The habit:
**any check reading built output asserts the output is newer than its sources, and says so in its
own failure message.**

**The classifier ruling was corrected the same day it was made, and the correction is the
interesting half** (2026-09-19, Kian). **Unmatched-but-assessed returns `open`, and that stands.**

The first ruling **named the fallback after the verdict**. A classifier that ran and matched no
bounded domain **has said something** — *not bounded* — and ten of ten ordinary goals landing
there is what a working classifier looks like, not a gap in one. A classifier that never ran has
said nothing. **Collapsing those two was the error; returning `open` was not.**

So **`unknown` means classification did not occur** — never called, could not complete, or handed
input it cannot assess. That sentence is now in the type's own docstring, because without it the
next reader either deletes the value as dead code or routes something to it. Its **unreachability
through `input-class.ts:84` is correct rather than a defect**: `classifyInput` gates readability
first, and `unknown` exists for callers that do not, SITE-033's server mirror above all.

**It carries a positive control**, because a value that cannot occur and is handled by code
nobody has run is worse than one that simply cannot occur. The test drives every branch that can
see a tier — predicates, the escalation seam, the bounded set — against a constructed `unknown`,
before SITE-033 makes it reachable in production.

**The correction that matters most: the false-negative path is `open`, so the original ruling
would not have fixed the thing it was ruled for.** *"my back and my finances"* is readable, was
assessed, and got a clean verdict. Renaming that exit would have relabelled every **correct**
verdict in order to catch the incorrect ones, and caught none of them, because a missed pattern
is missed either way. **That is `SITE-116`**, filed to characterise the gap and **not** to widen
the patterns.

**And the filing hypothesis was wrong, which the measurement showed.** It was filed as *"patterns
miss compound inputs"*. **Three of six compound inputs classify correctly**, and the two that
miss — *"my back and my finances"*, *"study for the LSAT and stop panicking"* — miss for exactly
the reason they miss **alone**. Compounding is not the discriminator; **signal strength is**: a
bare possessive noun (*"my back"*, *"my finances"*), an inflected verb (*"hurting my knee"* where
*"hurt my back"* matches), or an affect word with no clinical framing (*"panicking"*). Compound
sentences are only where it gets noticed.

**PRD §0.3e — a fifth failure shape, and the scan for it is in the sweep, now thirteen checks.**

**A predicate defined by what a value is *not* inherits every value added after it.** `isBounded`
read `tier !== 'open'` — correct with two kinds of member, wrong the instant a third existed, and
**no line changed to cause it.** The defect was written months before the value that triggered it
and would have shipped as a refusal shown to input nobody read. **Any predicate over a closed set
enumerates the members it accepts, never the one it rejects.**

**`scripts/check-predicates.mjs` found a second instance in the same file** on its first run:
`applyEscalation`'s `deterministic !== 'open'` meant *"anything not open is bounded"*, an
assumption the type never recorded, and it stayed correct only because the `unknown` guard sat
above it. Now `isBounded(deterministic)`. **The scan's limits are stated in its own header rather
than left to be discovered**: it matches `!==` against a §6.3 closed-set member, which is where
the shape is both dangerous and findable, and it does not detect the shape in general — a switch
with a default is the same defect and is not text-matchable. Proven both ways: a planted
`!== 'legal'` exits 1, the enumerating form exits 0.

**§14's display slope is amended to `9.72vw`, and v5 §14 is inlined at §11.4.** The inlining is
the §11.1 problem again — SITE-002 and SITE-003 were both built against a table nobody in this
repository could open.

**The amendment fixes an oversight, not a decision.** 8vw reached the 140px ceiling only at a
1750px viewport, so at 1440px display rendered at **115.2px — 82% of its ceiling**, and §12.3a's
*"at its clamp ceiling, not a comfortable middle"* was unmeetable at any width anybody verifies.
**SITE-003's own reasoning is the proof**: lead and body were deliberately interpolated to land
their maxima at exactly 1440px *"so the scale is settled at both verification widths rather than
caught mid-interpolation at either"* — and display was carried over verbatim, producing **the
exact case that reasoning exists to prevent**, in the largest element on the page. Floor and
ceiling unchanged; 375px still renders 40px. Verified: **320/375/411 → 40px · 1440 → 139.97px ·
1920 → 140px**, two lines at 1440, overflow clean at all six widths.

**The clamp test was rewritten to assert the rule rather than the number.** It read
`assert.equal(themeValue('text-display'), 'clamp(40px, 8vw, 140px)')` — which **caught** the
change, correctly, and **said nothing about whether the new value was right**, which is the half
that matters. It now asserts §14's floor and ceiling verbatim and **computes** that the slope
reaches the ceiling at 1440px, so it disagrees with a wrong slope instead of recording whichever
one the stylesheet holds.

**The 12%-of-frame question does not fight the 0.92 line box — it fights the clamp's axis.**
Reported, not ruled. At a typical 0.72 cap ratio: **12% of a 900px frame needs a 150px font;
12% of 1080 needs 180px** — against a 140px ceiling. **§14's clamp is driven by viewport *width*
and 12% is measured against frame *height*, so one clamp can satisfy it at exactly one aspect
ratio.** The same 1440px-wide viewport needs 150px at 900 tall and 180px at 1080. The 0.92
collision is a ratio of a face's own metrics to the line box and is **scale-invariant**, so
raising the ceiling changes nothing about it; nor does it change line count, since `max-w-[18ch]`
is measured in the font's own units. Closing it needs a height-aware term, a restatement of 12%
against width, or accepting that 12% describes one reference frame.

**The typeface measurement procedure is in `docs/typeface-decision.md`**, ordered so the
collision check runs **before any judgement** — *"do not look at the page yet"*, because an
opinion formed first is one the numbers then have to argue with. If a candidate fails at 0.92,
**the line height moves, not the candidate**: 0.92 was a correction of the browser's 1.5, not a
measurement of these faces, and the two candidates may need different values — itself a finding,
since §11.4 gives one number for the role.

**Linear — populated 2026-09-18.** This section is load-bearing for a fresh session
and goes stale the moment either statement changes. **Update it in the same commit as
the change it describes.**

- **The population run is complete.** Team `SITE`
  (`58f71935-70d1-49c0-83ce-7535d8ece6de`) holds **108 issues, `SITE-1` … `SITE-108`,
  contiguous with no gaps and nothing else** — verified by listing all 108 after the
  run. The positional mapping held exactly: decomposition `SITE-001` → Linear
  `SITE-1`, `SITE-084` → `SITE-84`, `SITE-108` → `SITE-108`.
- **Three projects and seventeen milestones exist.** Website P0 — Interactive Builder
  (SP-01…SP-11, SP-17) · Website P1 — The Peak (SP-12…SP-15) · Website P2 — Signature
  Polish (SP-16). Each milestone's description is its SP block from the decomposition.
- **Seven labels created** — `builder` `peak` `mobile` `analytics` `reliability`
  `a11y` `design-review`. The orphan `site` label is **retired**
  (`9b479485-c776-476e-a0f1-322e0040a9c7`); the MCP server has no delete verb, so
  retired is as far as it goes and it stays visible on nothing.
- The thirteen orphan `SP-01`…`SP-13` projects on the app's `BAS` team are
  **trashed**. No `BAS-*` issue was touched at any point.

> **Two Linear behaviours worth knowing before the next write.**
>
> **A bare `#N` in an issue description auto-links to a pull request** — and in this
> workspace it resolved into the **app** repository. Writing "Rejection #3" produced a
> link to a `kianh727/baselinev1` PR. It was corrected on `SITE-42`. Never write a
> bare `#N`; spell the number out.
>
> **A bare `BAS-NNN` auto-links to that app issue.** On `SITE-91` the `BAS-125`
> identifier the PRD gives for export and delete resolved to a **picker/app-group
> token-storage issue**, not export and delete. Either the PRD's identifier is wrong
> or the app issue was renumbered. The reference is now inert text with a note to
> verify it, because **DS-18a requires a real owning issue** and a wrong one fails it.
> Wrap app identifiers in backticks.

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

**PRE-1 is complete.** Part A items 1, 3, 5, 6, 7, 8 and 9 are applied; item 2 was
verified a no-op. **Part B (item 4) is applied** — twenty issues, nine evals, the
critical path re-walked over all 108 and unchanged at 29.

**R-2 has reported in full**, answered by the app-repo session, including the two pieces
that were outstanding — the permission list and the export/delete specification. The
capture check is also complete. **SP-17's entry criteria are satisfiable**, and no read
now gates anything.

**Both R-2 findings are resolved in v7.3 and built into Part B:**

1. **The onboarding handoff — ruled, §6.1b.** App PRD §25 constrains agent *proposal* of a
   gate, not user creation, and the builder's fourth beat is the user naming apps. The
   fourth beat stays; the wall gains one handoff line (SITE-105). **Conditional on the
   §15.2 read** — if a new account cannot create a gate at all on day one, protection
   leaves the builder and the wall moves to a timer or reminder.
2. **FAQ 12 — rewritten, not held.** Export and delete are **unbuilt, not unproven**, so
   the answer became a roadmap one and "Export and delete" became a §2 Block 2 entry
   (`SITE-91`, `SITE-95`). **Its owning identifier is unverified.** v7.3 names `BAS-125`;
   in Linear that identifier resolves to a picker/app-group token-storage issue. Kian is
   confirming it from the app side. **Until he does, that Block 2 entry does not ship** —
   DS-18a requires a real owning issue, and a wrong one fails it. `SITE-91` carries the
   reference as inert text with the note; leave it that way.

**One live defect Part B corrected.** v5 through v7.2 specified the builder's gate object as
`Instagram, TikTok blocked · 6:00–7:30am` — a UI state the app is structurally incapable of
producing, because Screen Time returns opaque tokens. SITE-040 now renders `3 apps ·
6:00–7:30am`, SITE-EVAL-074 enforces it site-wide, and SITE-107 catches it in CI. **No
depicted Baseline UI may name an app** (v7.3 §6.3a, §10 MUST).

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

**The Linear population run is done.** PRE-1 is complete, the counts in §13 are final, the
team key is confirmed, and all 108 issues exist. **Implementation begins at `SITE-1`**, under
the §8 issue execution protocol.

**The two stale-scope issues are re-scoped, not closed.** `SITE-72` and `SITE-74` were
authored against the pre-v7.3 section map. Ruled: the work behind them still exists, only the
section map was stale.

- **`SITE-72` is now "§6 Method — four principles, collapsed."** §2 and §3 went to P0 in SP-17,
  §10 Join to `SITE-97`, "What's underneath" was cut outright, and §5 has its own issue
  (`SITE-73`). §6 is the one P1 section no other issue owned.
- **`SITE-74` is now "Favicon set and theme-color."** Metadata and the OG card went to
  `SITE-100`, the legal routes to `SITE-99`. The icon set is what no P0 issue claims.

Neither turned out empty, so neither was closed. Two open questions are flagged on `SITE-74`
rather than decided: the favicon is arguably P0 since it is visible on first load, and its
`SITE-88` gate is probably vestigial now that the issue is an icon set. Both are graph and
priority decisions, not a session's.

**The DS phantom range is closed, by withdrawal rather than by definition.** **The demo
success criteria are DS-1 … DS-10, plus DS-18, DS-18a and DS-18b. There are no others.**
DS-11 through DS-17 are a reference to nothing — no artifact here, and no superseded PRD in
git history, ever states them. v7.3 §12.1 previously opened with *"DS-1…DS-17 stand"*; that
line is **withdrawn in the PRD itself**, because it cited eleven gates of which seven were
never written.

**Nothing may be gated on DS-11 through DS-17.** A gate with no definition cannot be failed,
which makes it worse than absent — it reads as passed. No eval was written for DS-15, DS-16
or DS-17 and none should be until they are defined; if their intent matters they are
re-authored in the PRD as new criteria, never reconstructed from the places that cite them.
Where any document still writes *"DS-1…DS-17"*, read it as **DS-1…DS-10** and correct it on
sight.

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

**116 issues total: P0 = 92, P1 = 18, P2 = 6.** The original 84, plus four design
review gates (SITE-085…088) defined in addendum §3, plus PRE-1 Part B's twenty
(SITE-089…108), plus **SITE-109…116**, all created 2026-09-19. Creation order runs
001…084, then 085…088, then 089…108, then 109…116, in strict sequence throughout;
the mapping stays positional and append-only.

**SITE-114 and SITE-115 are §6.1c's, and they are two issues rather than one on purpose.**
`SITE-115` is the workspace transition; `SITE-114` is the `workspace` state in the machine's
table, and **115 is blocked on 114**. Hand-adding a state to *that* table is the risk:
SITE-12's test asserts `walled` is produced by exactly one event **exhaustively over every
state × event pair**, which is what proves Rejection 3. A new state multiplies the pair space,
and adding it as a side effect of building a transition is how a pair gets missed and the wall
becomes reachable by something that is not an activation attempt.

**Neither is folded into SITE-7 or SITE-8, which carry scope-change notes instead.** Both are
merged and both met their accept criteria as written; §6.1c gives each a second state those
criteria do not describe. **A merged issue that silently acquires a second state is how an
accept criterion stops describing the thing**, so the change is recorded on the issue rather
than absorbed by it.

**The five added 2026-09-19, and why they are five issues rather than one.** The copy
gap surfaced four separate times — the hero H1, the chip strings, the five refusals,
§6.4's fallback question set — and was flagged one item at a time each time, which is
how it stayed open. It is now owned, split by **gate** rather than by subject, because
a refusal and a chip string do not pass the same review:

- **SITE-109** · Copy pass — every rendered sentence. P0, SP-17, deps SITE-101,
  **blocks SITE-061**. PRD v7.3 §15.4. Owner Kian.
- **SITE-110** · Builder copy — the conditional copy the builder fires. **Blocks
  SITE-103.** Owner Kian.
- **SITE-111** · Builder refusals — five, one per bounded domain. **Blocks SITE-17 and
  SITE-18.** Owner Kian. Separate from SITE-110 because these are the site's most
  sensitive sentences and §5 puts refusal copy outside anything a session generates.
- **SITE-112** · PRD defect — §6.4 falls back to a source that was never written. The
  authored question set exists in no artifact, so the beat fails silently into the dead
  state §6.4 forbids by name. Owner Kian.
- **SITE-113** · PRD defect — §6.4/§6.5 specify a deterministic recurrence-rule choice
  **over a set no artifact enumerates.** SP-04, **blocks SITE-23.** Owner Kian. Sibling
  to SITE-112, same shape: a closed set named precisely and never written down.

**No session drafts any of that copy or that set**, not as a placeholder and not as
something for Kian to edit — a draft written to be corrected reads later as a draft that
was approved. Enumerating the recurrence set would additionally be §9's *"inventing an
enum not in the frozen contracts"* wearing a different hat.

**79 evals: SITE-EVAL-001…079.** Part B added section Q — SITE-EVAL-070…078;
SITE-EVAL-079 was added 2026-09-19 with the §6.4 generated-question ruling.

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
