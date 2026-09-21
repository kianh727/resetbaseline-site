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

#### 0.3e A fifth shape — the predicate defined by what a value is not

**Recorded 2026-09-19 (Kian).**

`isBounded` read `return tier !== 'open'`. That was **correct** while `DomainTier` had exactly two kinds of member, and it became **wrong the instant a third existed** — `isBounded('unknown')` returned `true`, so input the classifier never read would have rendered a refusal.

**No line changed to cause it.** The defect was written into the predicate months before the value that triggered it, and it would have shipped as a behaviour nobody chose, in the path that decides whether a visitor is told the site refuses to help them.

Generalised: **a predicate defined by what a value is *not* inherits every value added after it.** The negative form quietly asserts a closed set that the author had in mind and the type did not record, and every later addition joins the accepting branch by default.

**The rule: any predicate over a closed set enumerates the members it accepts, never the one it rejects.** `BOUNDED_DOMAINS.includes(tier)` cannot acquire a member by accident; `tier !== 'open'` acquires every one.

This is the sibling of §0.3b. There, a check could not fail because it agreed with itself by construction. Here, a check cannot *start* failing, because its accepting branch grows silently with the type.

**Where it can be a scan, it should be** — a comparison against a single member of one of §6.3's closed vocabularies, used as a test for membership in the rest, is exactly this shape and is findable in source.

#### 0.3d A fourth shape — the check that measures the last build

**Recorded 2026-09-19 (Kian).** Distinct from §0.3, and hit independently in both repositories on the same day.

**A check that reads a build artifact is measuring the last build, not the current source.**

The app session hit it with a stale `dist/` in a mutation run and **credited unrelated breakage to its own assertion** — the assertion was reporting on code that no longer existed. This repository hit it with `check-builder.mjs`, which reads `out/`: a change to the deadline parser went **green** against an export built before the change existed.

**Neither was found by a failing run. Both were found by a pass that should not have happened**, which is what earns this its own entry. §0.3 is caught by asking *does this pass against nothing?* — this one passes against something, just not the thing under test.

**CI is usually safe by accident, and that is not a guarantee.** A build step running immediately before the check is job ordering. It holds until someone reorders the job, it says nothing about a run started by hand, and a hand run is when a wrong green is most expensive: it is the run somebody is using to decide their change is finished.

**The habit: any check reading built output asserts the output is newer than its sources, and says so in its own failure message.** Not in a comment and not in the CI config — in the failure text the person reads, because the person reading it is about to conclude the work is done.

#### 0.3c Parsing, and the two rules it owes the visitor

**Recorded 2026-09-19 (Kian), from SITE-013 and SITE-019.** Both are about the same moment: the site parsing what a person typed and showing them what it understood. That moment is the site's differentiation, and both failures invert it.

**A parse distinguishes *"did not match"* from *"matched something impossible"*, and an impossible input is never resolved to a nearby valid one.**

SITE-013's parser rejected `by February 30` at its explicit-date rule and then fell through to its bare-month rule, which matched `by February` and returned **28 February**. The visitor typed a date that does not exist and was shown a date that does, presented as understanding. Nothing signalled a correction.

**A parser that silently corrects the user and presents the correction as understanding is the site's differentiation inverted at the one moment it is demonstrated.** The whole claim of §3.3 is *it read what you actually wrote*. A correction is the system substituting its own guess for the visitor's words while wearing the face of comprehension — worse than returning nothing, because nothing is honest and a plausible wrong date is not.

So an impossible value aborts the parse. It does not fall through to a looser rule, and it does not round to the nearest real date.

**Nothing re-derives what a parser already determined.**

SITE-019 needed §3.4's qualifier — `from "by May"` — to name the phrase the parse had matched. The first implementation used a **second matcher** that re-read the text to work out what the first one had found. The two disagreed on a sentence with no trailing punctuation, and the qualifier silently rendered nothing.

Two matchers describing one match can disagree, and **the disagreement is silent** because neither is wrong on its own terms. **The parser reports its own match**; the phrase is a by-product of the parse rather than a re-reading of the input. This is §0.3b's sibling — there, a check derived its input from its own reference and could not fail; here, two derivations of one fact could differ with nothing to catch it.

#### 0.3b A third shape — the check that derives its input from its own reference

**Recorded 2026-09-19 (Kian).**

SITE-004 was nearly resolved by deriving the five `capability_type` values from the action verbs (`create_commitment`, `create_reminder`, …), guarded by a CI assertion that *"the derivation still matches the verb list."*

**That assertion cannot fail.** It derives its input from the verb list and compares the result to the verb list. It is a pure function of its own reference, so it agrees with itself by construction and reports agreement as if it were verification.

Generalised: **a check whose input is derived from its own reference cannot fail.** It is not a weak check; it is not a check. It will pass on a correct system, on a broken one, and on a system where the reference itself is wrong.

The tell is that the check has only one source. A real check needs **two independent sources that must agree** — the thing and a statement about the thing, arrived at separately. What would actually have caught a sixth primitive is the layout-rule coverage check, which compares the manifest's declared types against the site's own rules: two sources, written by different people, for different reasons.

The habit: **before writing an assertion, name its two sources.** If naming the second one means restating the first, the check is this shape and the work is to find a real second source, not to word the assertion better.

#### 0.3a A second shape — the guard that hides what it guards

**Recorded 2026-09-19 (Kian). Distinct from the above, and it will recur.**

§9 requires `overflow-x: clip` on the root, as a safety net against a stray horizontal overflow. SITE-005's overflow check read `scrollWidth` on the shipped page — and passed a deliberate 1200px-wide element at a 320px viewport. **`clip` removes the overflow from `scrollWidth`.** The guard the PRD requires was hiding the defect from the test written to find that defect.

Generalised: **anything that suppresses a symptom also suppresses its detection.** A measurement taken downstream of a guard measures the guard.

This is not the absence shape. There, the thing being measured does not exist. Here it exists, is wrong, and is invisible — which is worse, because the check is green and specific and pointed straight at it.

The consequence is a habit, not a rule that can be written once: **a check that runs downstream of a mitigation must neutralise the mitigation before measuring, and say in its own output that it did.** SITE-005's check now lifts the clip, reports both numbers — unclipped is the layout truth and fails the build, as-shipped says whether a scrollbar is actually visible — and names the widest offending element. The same question applies to every retry, fallback, catch block, default value and CSS guard this site adds: *if this were broken, would the thing that protects it also hide it?*

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

### 6.1a Object metadata — the Problem lines

Every plan object carries its type, its authority tier, and **the app PRD's own Problem line** as 11px metadata beneath it:

```
commitment · provisional
Thesis block · weekdays 08:00–09:30
an intention with no occasion
```

| Primitive | Problem line |
|---|---|
| Commitment | an intention with no occasion |
| Reminder | the cue arrives too late, or not at all |
| Timer | starting is expensive; sessions run unbounded |
| Gate | cue-driven distraction survives intention |
| Tracker | a direction with no feedback |

Verbatim from the app PRD §22–26, which is the point — this is the product's own framing of why each primitive exists, and it is sharper than anything the site had.

**Placement is deliberate.** These sit inside the builder, at the moment of highest attention, where an object appearing and one line explaining what it is for does the work a feature list would do badly. A section listing five primitives would imply five *working* primitives and walk straight back into what got "What's underneath" cut.

**No DS-18 exposure.** A problem statement cannot be false about build state — *"an intention with no occasion"* is true whether or not occurrence generation works. This is the only explanatory content on the site immune to the launch-state principle, which is why it carries weight the sections can't.

### 6.1b The onboarding handoff

R-2 established that the app PRD §25 forbids Gate being **proposed** during onboarding: the agent may only suggest one after lighter rungs have failed, which is impossible on day one.

The builder ends in protection and the wall fires on Activate of a gate, so a visitor completes a four-beat flow — goal, structure, tuning, protection — and the first app run walks them through three.

**Ruling: keep the fourth beat, fix the handoff.** §25 constrains *proposal*, not *possibility*; `create_gate` sits on `NEVER_AUTO_FOR_AGENT` precisely because gates are user-authorized, and the builder's fourth beat is the user naming apps — an explicit directive, not an agent suggestion. The gap is discoverability, not capability.

Cutting protection would remove the demo of the thing that most demonstrably works. "The apps you named go quiet" is §2 Block 1's strongest line, and it is the one V1 capability the capture report confirmed working end to end.

**The wall gains one line, shown after submit:**

> Your plan is saved. When you get in, you'll set the blocking up yourself — Baseline won't do it for you on day one.

Honest, sets the expectation before first launch, and turns a divergence into an instruction. It is also the only place on the page where the handoff actually happens.

**This ruling is conditional on one read:** that a user can create a gate on day one at all, by directive to the agent or through the `+` sheet. If gates are unreachable for a new account entirely, the fourth beat promises something impossible, protection is cut from the builder, and the wall moves to a timer or reminder. **Tracked in §15.2.**

### 6.1c The workspace transition

**The problem this fixes.** The plan currently appears underneath a hero that does not change. Everything is correct and nothing transforms, so the fold reads as a landing page with a form on it rather than as a tool. This is the single largest gap between the build and its ceiling, and it costs no new generated surface and makes no new claims.

**On submit, the fold reconfigures into a workspace.** Same page, same scroll position, no route change, no modal, no overlay. The page below the fold is untouched and scrolls normally.

| t | What moves |
|---|---|
| 0ms | Run pressed. Scroll position locked — **the transition must never move the page.** |
| 0–240ms | Headline and subhead fade out translating up 24px. Nav wordmark stays — it is the identity anchor and must not move. |
| 60–300ms | Input translates to the top of the fold and becomes a persistent bar, slightly reduced in scale. It remains editable. |
| 120ms | Transformation frame renders **complete and empty** in its new full-width position. The t=0 rule holds — the frame is never absent, it simply renders in the new layout. |
| 240–600ms | Mountain camera eases in roughly 8%. The band region becomes the focal area of the frame. |
| on arrival | Plan objects land per §11.1. |

**Rules:**

- **Controls enable on data, never on animation.** Tune is live the moment recurrence exists, whether or not the 600ms has elapsed.
- **The transition never changes scroll position.** This is the one place layout and scroll could fight; they must not.
- **Reversible.** A reset returns the hero in the same sequence played backward. Dismissing the wall does not reset — it returns to the workspace.
- **Mobile:** the headline is removed rather than reduced, and the input pins beneath the safe-area inset. Vertical space is the constraint and the headline is what yields.
- **Reduced motion:** no transition. The workspace layout renders directly, in its final state.
- **The workspace fills the viewport. It is not a modal and not full-screen chrome** — no escape key, no close button, no scroll lock, no `position: fixed` takeover. The page below remains reachable by scrolling at all times.

**What this deliberately does not do:** add agent turns, conversation, or any additional generated content. Impressiveness comes from presentation — the reconfiguration, the mountain responding, the objects landing — never from the model saying more. More conversation means more generated surface, which walks back into §6.5.

**Two notes added on application, 2026-09-19, because this section arrives after the work it touches:**

- **The band is present when the workspace opens.** §6.3b: a band has no entrance animation and no draw-on. The 240–600ms camera ease moves the *view*; it does not bring the band into existence. What lands on arrival is the marks.
- **`walled` is still reachable only by an activation attempt.** *"Dismissing the wall returns to the workspace"* is an exit edge, not a second entrance. The state machine's exhaustive test (SITE-012) governs, and a `workspace` state is added to its table by its own issue rather than by hand — the test proving `walled` unreachable by side effect is exactly what a hand-added state puts at risk.

### 6.2 Plan model — derived, not hand-listed

Handles every `capability_type` the contracts define — exactly five: `commitment · reminder · timer · gate · tracker`. Generated from `contracts-manifest.json` (§6.6) with a layout rule per type. **A type without a layout rule fails the build.**

### 6.3 Vocabulary the site renders — closed list

| Axis | Values |
|---|---|
| `capability_type` | `commitment · reminder · timer · gate · tracker` |
| `authority_tier` | `auto · provisional · explicit` |
| Outcome (recorded) | `complete · partial · missed · cancelled_intentionally · unknown` |
| `belief_tier` | `hypothesis · pattern · observed_fact` |
| `recurrence_rule` | `daily · weekdays · weekends · weekly_on_days · every_n_days` |

**`rescheduled`** is a **derived display value**, not a stored outcome and not an action outcome. Nothing writes it; `displayOutcome` derives it when an occurrence is `pending` and was moved, and a resolution always wins — moved then completed is `complete`. The site **may** describe it as a state a user sees. It **must not** list it alongside the five resolvable values as something the system records.

**Banned entirely:** `AuthorityDecision` values (`execute · confirm · forbidden`) — rendering them alongside `provisional` puts two meanings of one word on the page · `pending` · `sensitivity_class` values and anything keyed by them · reason codes, validation errors, internal event names · user-visible confidence numbers.

#### 6.3c Recurrence rules — the closed set

**Ruled 2026-09-19 (Kian), closing the defect SITE-113 recorded.** §6.4 and §6.5 specified a deterministic recurrence choice over a set no artifact enumerated. This is that set.

| Rule | Meaning |
|---|---|
| `daily` | every day |
| `weekdays` | Monday through Friday |
| `weekends` | Saturday and Sunday |
| `weekly_on_days` | an explicit set of weekdays |
| `every_n_days` | `n` between 2 and 14 |

**Five. Nothing outside this list is selectable, and the site renders no recurrence value that is not one of them.**

**Selection is deterministic, from the parse (§6.5). The model never sees this list and never chooses from it.**

#### The selection function is total

**Every input either maps to exactly one rule, or produces no recurrence at all.** There is **no default rule**, and **nothing falls through to `daily`** — a fallthrough default is how a parser starts asserting a schedule the visitor never described.

Two edges, stated because they are where a parser invents things:

- **Named days that do not form a shorthand set are `weekly_on_days` with those days — never the nearest shorthand.** *"Monday, Wednesday, Friday"* is **not** `weekdays`. Rounding a three-day set up to a five-day one adds two commitments the visitor did not make, and it does it while appearing to understand them, which is §0.3c's failure applied to frequency instead of dates.
- **An unparseable frequency produces no recurrence.** A commitment with no recurrence is a **valid object** — it is the untimed case the app already models — so nothing is forced. §6.1a's Problem line for a commitment is *"an intention with no occasion"*, which describes exactly this object; inventing an occasion to avoid returning nothing would be the site answering a question the visitor did not answer.

#### Weekdays are named, not numbered

**The internal representation is the string `Monday`, never an integer**, and this is a deliberate refusal rather than a style preference.

The app's `byweekday` convention is **disputed between its own layers and unresolved**. The site has no reason to inherit that dispute, and an integer representation would mean the site is silently taking a position on it — a position that is invisible in the type, wrong half the time, and produces a plan off by one day with nothing to indicate why.

**A named representation cannot be wrong about a convention the site never adopted.**

If SITE-004's manifest later carries a weekday vocabulary, **adapt at the boundary** — one conversion in one place — and leave the internal representation named. That the internal form is deliberately not numeric is recorded here so it is not "tidied" into an enum by someone who finds strings inelegant.

### 6.3a Gate copy — app selections are opaque · **MUST**

**Baseline cannot read which apps a user selects.** Screen Time returns opaque tokens. The app knows a count and nothing else, and its own copy says *"3 apps blocked"* and never names an app.

**This binds every present and future revision of this document:**

- **No Baseline UI depicted on this site may name a specific app.** Not in the builder's gate object, not in the share card, not in a screenshot, not in §2, not in the FAQ, not in a future section.
- **The builder's gate object renders `3 apps · 6:00–7:30am`**, matching the app. The Protect step's named chips are the *site's own input affordance* and stay — the user picks recognisable names, and the object that lands shows what the app would show.
- §2 Block 1's *"the apps you named go quiet"* is correct and stays. The user named them; Baseline didn't read them.

**This was a live defect.** v5 through v7.2 specified the gate object rendering *"Instagram, TikTok blocked · 6:00–7:30am"* — a UI state the app is structurally incapable of producing. It would have shipped a screenshot of something that cannot exist.

**And the constraint is a selling point, not a limitation.** Baseline cannot see which apps you chose. That belongs in FAQ 3's expanded copy and is stronger than any privacy assurance the site could otherwise make, because it's architectural rather than promised.

### 6.3b Band grammar — closed visual vocabulary · **MUST**

**Ruled 2026-09-19 (Kian).** This is the visual vocabulary §6 has been missing. It has the same status as §6.3's closed value lists: a closed set, not a style note.

**It supersedes any description of a route, path, summit or ascent anywhere in this repository.** Any prompt-set or visualisation document is mood reference only and is **not authoritative on structure, copy or behaviour.**

#### The grammar

> A **horizontal band** across the mountain face always means a **recurring time window**.
> **Marks inside the band** always mean **the days it occupies**.
> A **second, denser band below** always means **protection**.
> **Nothing else ever gets a band.**

The band is **charcoal and translucent, geometrically level, and bleeds off both frame edges** — no left end, no right end. **Lavender appears only as a thin lit line on its upper boundary and on active marks. Never as fill.**

**Lit marks are scheduled days. Dark marks are unscheduled days** — dark and neutral, **never crossed out, never rust, never styled as disabled.** An unscheduled day means nothing was placed there, not that something was missed.

#### A primitive with no recurrence has no band

**Amended 2026-09-19 (Kian).** *"Nothing else ever gets a band"* is the operative clause and it is stated positively here, because **an unstated exclusion reads as an oversight and the next author fills it.**

**A band is emitted only for a recurring window and for protection.** By name:

- **A timer gets no band.** It is a duration with no recurrence — §6.1a's Problem line is *"starting is expensive; sessions run unbounded."* No window, no band.
- **A tracker gets no band.** It is a direction with no occasion — *"a direction with no feedback."* No window, no band.

**This is the grammar working, not a hole in it.** A band means *a recurring time window*; a primitive that has no recurring window has nothing for a band to mean. **Do not invent a band variant for either.** What a timer and a tracker look like instead is a real open question and is **not a band**; it is tracked on SITE-026 and is Kian's to rule.

#### The band does not animate in

**Amended 2026-09-19 (Kian).** **A band has no entrance animation and no draw-on.** It is present from the first paint of the plan.

A route stroke drawing itself was a thing **coming into existence over time**, which is what made it a completeness meter in motion as well as in composition. **A recurring window is not a thing that happens; it is a thing that is the case.** Nothing about it arrives.

**Marks may appear as their occurrences resolve** — that is where SITE-025's beat lives, and it survives intact. The band is the frame those marks land in, and it is already there when they do.

#### Why the last rule is a MUST and not a preference

It is **§4 rendered in visual grammar.** §4 promises no completeness meters and **cannot regress and cannot be wrong**. A dark mark styled as a gap regresses that promise **in pixels while the copy still reads correctly** — the section says the right thing and the most dominant element on the page contradicts it. That failure is invisible to every copy check the site has.

#### Enforcement — construction, not convention

**A band must be derivable only from a recurrence. It is not a prop a component may pass.**

If any component can render a band from anything other than the recurrence model, the grammar is a convention, and a convention decays at the first author who has not read this section. **Build it so the failure mode does not exist rather than banning it in prose.**

#### Gate

**Six** questions, added to §12.4a's checklist under the same reviewer constraint — **not the implementer, has not watched the build.** Each is a yes/no; **any single yes rejects the work.**

**The review set MUST include at least one frame where most marks are dark**, and the gate's output **MUST state which frame carried the sparse case.** A set of frames showing full or near-full weeks **cannot fail the dark-mark rule, because the condition it measures never occurs** — §12.4 applied to a design gate rather than to an eval.

### 6.4 Input handling

Seven deterministic classes, pre-generation, so garbage never reaches `/api/plan`: `empty · unreadable · out_of_scope · vague · multi_goal · bounded · actionable`.

**The clarification beat** — `vague` input gets one question, three tap answers plus free text, then builds. Never more than one per session; never blocks past 8s. This is the site's only demonstration of *it asks once*.

**Ruled 2026-09-19 (Kian): the question is generated, not authored.** It is a third field on the existing `/api/plan` call — no second round trip, no separate model call.

The earlier line read *"all response copy authored."* That cannot survive contact with what this beat is for. An authored question is a keyword-selected question: the input is matched against a small set of stock questions and the closest one is shown. A visitor who writes something the set did not anticipate gets a question that is visibly about something else, which demonstrates the opposite of *it asks once* — it demonstrates a form. The beat exists to show the system reading **this** goal, and a bank of prewritten questions cannot do that no matter how large the bank is.

**Five validation constraints. All five are checked; any failure discards the generated field.**

1. The question is under 90 characters.
2. Exactly three options, each under 24 characters.
3. Every option is answerable by tapping — no option requires the visitor to type.
4. No preamble. The field is the question, not a sentence leading into one.
5. It ends in a question mark.

**Fallback is silent and authored.** On any validation failure, on timeout, or on the spend cap, the beat renders from the authored question set with no user-visible error and no dead state. Free text remains available regardless of which path produced the question.

**What does not move.** Classification stays deterministic, client and server (§6.5). All other copy on the site stays authored — this widens the model's surface by exactly one field, for exactly one input class, and nothing else.

#### A classifier's unmatched case returns a distinct value, never the permissive one

**Ruled 2026-09-19 (Kian). A standing rule, not a note about one function.**

`classifyDomain` returned `open` for input it could not assess. **`open` is a positive verdict** — *not bounded, safe to plan normally* — so empty, whitespace or non-string input was receiving a clean bill of health nobody issued. It now returns **`unknown`**: a third value that is neither a verdict nor a refusal.

The argument is the asymmetry that already makes this classifier err toward bounded: **a false positive is an odd demo; a false negative builds a plan around an injury.** A permissive default on the un-assessable path is the shape that produces the second, and it produces it **silently**, because a permissive default is indistinguishable from a considered verdict at every call site.

**The rule generalises past this function and is meant to outlive it.** Any classifier, parser or resolver on this site returns a distinct value for *did not, or could not, decide* — never the safest-looking member of its own output set. The permissive value is the one a caller forgets to handle, and it is the one whose mishandling is invisible.

**Two constraints on the new value:**

- **No caller may treat it as the permissive one**, enforced by a scan rather than by convention. *"Handle it explicitly"* is the instruction that decays: it is followed by whoever read it and by nobody afterwards, and collapsing the two type-checks and passes every behavioural test.
- **It is not escalable.** The model may not turn input the classifier could not read into a verdict of any kind — that is the model deciding what a refusal applies to, which is refusal authority by another route (§6.5).

**Open, and not decided here: what the *assessed but unmatched* case returns, and where `unknown` routes.** See the note at the end of this subsection.

### 6.5 Determinism

**Ruled 2026-09-19 (Kian). The surface is three fields, not two** — widened by §6.4's clarification-beat ruling and by nothing else.

The LLM's entire output surface is:

1. **One commitment title**, ≤48 characters.
2. **One execution window**, from a closed set.
3. **For `vague` input only — one clarification question and its three options**, under §6.4's five constraints.

**Each of the three validates and falls back independently.** A title that fails its constraint does not discard a valid window; a clarification question that fails validation does not discard a valid title. There is no all-or-nothing response.

**Three fields is the whole surface. There is no fourth.** Anything the site renders that is not one of the three above is deterministic, and this list is the boundary itself rather than a pointer to one:

parsed deadlines · **domain and input classification** · the refusal decision · refusal copy · **recurrence-rule selection** · recurrence expansion · occurrence dates or counts · tuning · contention vetoes · route layout · authority tiers · product capabilities · **every other line of copy on the site.**

**Amended 2026-09-19 (Kian) — the citation, and what it was hiding.** This paragraph previously read *"non-exhaustive only in the sense that §4's table governs."* **§4 of this document is "What it won't do" and contains no table.** The table it meant is v5 §4, and §1 declares v5 superseded entirely. A citation pointing at a superseded document is worse than no citation: the reader follows it, finds nothing, and cannot tell whether the boundary is unjustified or the definition is missing. The boundary is therefore **stated inline here, with no cross-reference**, because it already survived in this list.

**Amended 2026-09-19 (Kian) — recurrence-rule selection is deterministic, from the parse.** It was previously described as the LLM selecting a rule from a closed set while code computed the dates. **That would be a fourth generated field**, and the determinism claim the entire site rests on would be false while reading true — the surface would say three and behave as four. The parse chooses the rule; the model never sees it. The old wording survived because the may-never-touch list named *recurrence expansion*, which is the **computation** and not the **choice**, so the gap read as covered.

> **Open defect, not resolvable here.** §6.4 and §6.5 now specify a deterministic rule choice **over a closed set that no artifact enumerates.** It is a copy-and-spec gap of the same shape as §6.4's fallback question set, and it is Kian's. It bites at SITE-023. **No session may enumerate it** — inventing the set would be §9's *"inventing an enum not in the frozen contracts"* wearing a different hat.

The third field is a widening of one beat's copy, not a softening of the boundary. Classification decides *whether* the clarification beat runs; the model only writes the sentence once that decision is already made.

### 6.6 Contracts manifest and drift detection

`CONTRACT_MANIFEST` committed as JSON with `captured_at` and the app commit SHA; types generated from it at build time.

**Primary mechanism:** app repo CI writes the manifest to a stable path on `main`; site CI fetches and diffs; any divergence fails the site build. This is an app-repo change of roughly five lines.

**Fallback:** staleness against `captured_at` — warn at 30 days, fail at 60.

**Rejected:** cross-repo build. Needs an app-repo token, couples build times, breaks on app dependency changes.

**Nothing generated may read `artifact_divergences`** — it records stale counts (33, 72) against current counts (45, 76) in the same object. **Enforced by `scripts/check-divergences.mjs` in CI, not left as prose**: the ban was a sentence with nothing behind it until the manifest was about to enter the repository. Construction, not convention.

**Ruled 2026-09-19 (Kian): the app adds the object vocabulary to `CONTRACT_MANIFEST`.** The delivered manifest is an action and event vocabulary — 45 action types, 76 event types — and carries **no `capability_type`, no `authority_tier` and no `belief_tier`**. §6.2 requires the five capability types derived rather than hand-listed, and §6.1a renders `authority_tier` in every object's metadata at P0.

**Verb-derivation was rejected**, not deferred. It yields `capability_type` and nothing else: `authority_tier` has no verb to derive from, so that option leaves a P0 render with no contract source. Its proposed CI guard was also §0.3b's shape — *"the derivation still matches the verb list"* derives from the verb list and compares to the verb list.

**PR #3 is held unmerged rather than merged and superseded** — one complete delivery, so there is no window in which the vocabulary-free file sits in the repository for someone to write a green check against.

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
3. What does it need access to? — *Two OS permissions. Notifications, asked once during onboarding. Screen Time, asked only when you create your first Gate — not before. Sign in with Apple to make an account. Nothing else: no camera, location, contacts, health data, or microphone.*
4. Does it read my calendar, email, or health data? — **No. No connectors at launch.**
5. What does it cost? — *Nothing during beta. Paid when it ships — trial, no free tier.*
6. Is there a free version? — *The beta is free. The shipping product isn't.*
7. What happens to what I type on this page?
8. Can it actually block apps? — *On the phone, yes. In a browser, no — which is why this site stops where it does.*
9. What if I miss days? — *Nothing. No streaks, no score, no catch-up.*
10. What does it know about me, and can I see it? — **Held with §4.** Restore when §4 promotes.
11. How is this different from asking ChatGPT to plan my week?
12. Can I get my data out? — **Answer changed. DS-18 failure.** Export and delete are **unbuilt**, not unproven: no export endpoint, no deletion route, `requestAccountDeletion`'s only callers are its own tests, and `SettingsView` renders both as rows with no action closure — inert labels. The V1 inventory specifies both; BAS-125 is the work. *"Export and delete, both at launch"* cannot ship. The supportable answer is a roadmap one: *"Not yet. The deletion cascade is specified and every foreign key to your account is `ON DELETE CASCADE`; the routes are being built."* **"Export and delete" also becomes a §2 Block 2 entry, owning issue `BAS-125`** — **but that identifier is unverified and the entry does not ship until it is confirmed.** In Linear, `BAS-125` resolves to a picker/app-group token-storage issue, not export and delete; either this number is wrong or the app issue was renumbered. Kian is confirming it from the app side. **DS-18a requires a real owning issue, and a wrong one fails it**, so until the confirmation lands the entry is held and the reference is inert text.

**Every answer describing app behavior carries a DS-18 verdict.** Questions 3 and 8 are verified true today. Question 12 is a verified **false**, which is why it was rewritten rather than held — a held answer implies a pending read, and there is nothing left to read.

**Two things from the permission read worth using elsewhere.** The app PRD's own line — *"Maximum OS prompts during onboarding: one. No permission carousel exists because there is nothing to stack"* — belongs in §2 Block 1 or FAQ 3's expanded copy; it is a design stance, true by absence, and cannot regress. And **the microphone is a permanent no, not a deferral** — worth stating that way rather than as an omission.

Question 4 must be an unqualified no. HealthKit and Calendar are V1.1 and therefore banned from the site entirely (§10), including Block 2.

**Question 1 is written from the primitives' Problem lines (§6.1a), not from marketing language.** The app's own framing — an intention with no occasion, a cue that arrives too late, starting being expensive — is sharper than anything the site has, and it describes what Baseline is *for* without claiming what it currently does.

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

**Gate copy — MUST (§6.3a):** no Baseline UI depicted anywhere on this site may name a specific app. Screen Time returns opaque tokens; the app knows a count. `3 apps blocked`, never `Instagram, TikTok blocked`. Binds every future revision.

**Site-specific:** no connector logos or integration strip · the site must not read as a web version of the app · nothing generated may read `artifact_divergences` · **no screenshot of iOS's default system shield, or any other Apple-supplied UI, presented as Baseline's.**

---

## 11. Carried forward unchanged

**The Peak** (v5 §7, P1) · **Motion** (**inlined at §11.1**) · **Type and tokens** (**inlined at §11.4**) · **Mobile** (v5 §9) · **Degradation** (v5 §15, the builder never degrades) · **Providers** (v5 §12) · **The wall** (v5 §11) · **Scope-kill rules** **K-1…K-7**.

**Corrected 2026-09-19: the range was written K-1…K-8, and there is no K-8.** v5 §17 defines K-1 through K-7 and stops. This is the DS-11…DS-17 shape at a smaller scale — a range citing a rule that was never written, which cannot be failed and therefore reads as passed. `CLAUDE.md` §4 had it right at K-1…K-7 throughout.

**Everything else on this line is still carried by reference to a document that is not in the working tree**, which is the problem §11.1 fixes for Motion. The remaining seven, and three more cited outside this list, are audited and awaiting a ruling before they are inlined.

### 11.1 Motion — v5 §8, carried forward and now inlined

**Amended 2026-09-19 (Kian).** §11 carried this forward *by reference* to a document §1 removes from the working tree. **A requirement readable only from git history is the same failure as §6.5's citation to a superseded table** — the reader follows the pointer, finds nothing, and cannot tell whether the requirement is missing or they are. SITE-024 had to recover the spring constants from `9568a9a:docs/site-prd-v5.md` to build against them.

**The text below is v5 §8 verbatim. It is a requirement of this document, not provenance.**

#### Motion — v5 §8, inlined verbatim

##### 8.1 The signature: settling

One spring, used **only** when structure lands into place.

```
spring: { stiffness: 260, damping: 24, mass: 0.9 }
from:   { opacity: 0, scale: 0.94, y: 8 }
```

Match the app's sheet spring if it differs. **Banned everywhere else** — if a section header uses it, the signature is gone. This is the rule most likely to erode across a long build.

##### 8.2 Timing

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

##### 8.3 Reduced motion

Light sweep stops at the hero angle, cursor authority off. Grain renders statically. Camera snaps between stations. Builder renders final states; no autoplay, no self-typing. **The site must be fully comprehensible with every animation disabled.**

**Two lines above are superseded by §6.3b, and are kept struck rather than deleted so the supersession is visible at the point of the old requirement:**

- ~~*Route draw · 450ms stroke-reveal*~~ — **§6.3b: a band has no entrance animation and no draw-on.** The 450ms belongs to the marks resolving inside a band that is already there. A stroke drawing itself is a thing coming into existence over time, which is the completeness meter in motion.
- The **occurrence fan-out** row stands unchanged — 45ms stagger, settling spring, ~600ms, interruptible, controls enabling before it finishes. That is the beat §6.3b preserves.

**One line above is now stricter than it reads.** *"Section reveals — opacity 0→1, 400ms, ease-out, 20% entry, once. No slide, no stagger, no hover lift"* is compatible with §10's ban list and with §12.4a tell 6 (*fade-and-slide-up on every section*) **only because it forbids the slide.** Read it as the ban, not as a licence to animate every section.


### 11.2 Budgets

| Metric | Ceiling |
|---|---|
| LCP, mobile 4G | 1.8s |
| CLS | 0.05 |
| INP | 200ms |
| Core bundle, gzip | **120 kB** — decimal, 120,000 bytes |
| Scene bundle, gzip, lazy | 140 KB, excluded |
| `/api/plan` timeout | 4000ms hard |
| Lighthouse mobile | ≥ 90 |

**The core bundle ceiling is 120 kB, and it is a dependency ban rather than a coding-discipline target.** The decomposition and SP-15's exit already said 120; this table said 145. **120 wins** — it is stricter, so it satisfies both, and the two artifacts now agree rather than one deferring to the other.

**The unit is decimal kB, ruled 2026-09-19 (Kian).** `scripts/check-bundle.mjs` divided by 1024 and labelled the result `KB` while Next's build output divides by 1000, so the same five chunks read 102.5 in one place and 105 in the other — **one artifact, two divisors, and no way to compare the gate against the 103 kB framework floor this table records**, which is Next's number. A dependency ban whose ceiling and floor are in different units is not a ban anybody can reason about. The gate is **120,000 bytes**, which **tightens it by 2,880** from the accidental `120 * 1024`: those bytes were a property of the tool, not a grant.

What that number actually costs, **measured on the SITE-001 scaffold, all gzip, all marginal over the framework floor**:

| | Cost | Running total |
|---|---|---|
| **Framework floor** — React 19 + Next 15 App Router, before one line of product code | **103 KB** | 103 KB |
| A hand-written interactive client component (state, callbacks, memo, 30-day date math, list rendering) | **0.4 KB** | — |
| `date-fns`, four functions, tree-shaken | 6.5 KB | 109 KB |
| `zod` | 24.1 KB | 127 KB |
| `framer-motion` | 40.5 KB | 143 KB |

**The framework floor is 103 KB and is not reducible without leaving React.** That leaves roughly 17 KB. At 0.4 KB per component the builder's own code fits — twenty-five to thirty-five client modules land around 10–20 KB. **What does not fit is a runtime dependency.** Any one of the three above spends a quarter to the whole of the remaining budget.

Three consequences, binding:

- **No animation library.** The settling spring (§8.1, SITE-024) is one signature spring, hand-rolled on the Web Animations API or CSS. `framer-motion` costs a third of the entire budget for it.
- **No client-side schema validator.** Model-response validation (SITE-031) happens on the `/api/plan` edge route, server-side, where bundle size does not count. `zod` in the client spends 24 KB to validate something the client never receives unvalidated.
- **No date library.** SITE-023 already specifies hand-rolled DST-safe recurrence math with a 40+ fixture suite, so a library would be redundant with the issue's own spec as well as expensive.

**Ruled, and in effect: the budget gate exists before the builder is built, not after it.** SITE-078 enforces the full performance budgets in CI at P1 — after every builder issue has landed. A ceiling first checked at the end is a criterion satisfiable by the absence of the thing it measures (§0.3), and a dependency that breaks the budget would be discovered at SITE-076 rather than in the PR that added it. **The bundle-size check is therefore in the CI sweep from the first product commit, at 120 kB, failing the build.** It measures the exported chunks each document actually references — every route, not only `/`, because a check that watches one page can be walked around by putting the import on another — and excludes the `noModule` polyfill chunk, which no browser supporting ES modules fetches. SITE-078 still owns the remaining budgets; this is the bundle ceiling arriving early, not SITE-078 moving.


### 11.3 Section handoffs — one property carries across

**Applied 2026-09-19.** Three camera stations move the view. What was never specified is what happens to **content** at each boundary, and without it every section fades in independently and the page reads as stacked blocks rather than one surface.

**The rule: at every section boundary, one continuous property carries across the seam.** Not each element fading on its own schedule — one shared variable that the outgoing and incoming sections both ride.

**Ruled on application (Kian): the carriers resolve toward P0, and the mountain is not the mechanism.**

Three of the four carriers as first drafted rode the mountain, which is **P1**, while §2 and §3 — the sections they join — are **P0**. That makes P0 sections depend on P1 work. Worse, **§2 is the section where the mountain deliberately recedes and carries no band**, so the seam most in need of a carrier had the least mountain to carry it.

**Every seam has a non-mountain carrier at P0. A mountain carrier, where it is better, is a P1 enhancement of a seam that already works without it.**

| Seam | P0 carrier | P1 enhancement |
|---|---|---|
| Workspace → §2 status | **The band, thinning.** Its marks fade and the band thins to nothing as §2's first line rises. One linked motion, not two — and the band is builder surface, not scene, so it exists at P0. | The mountain receding in step with the thinning. |
| §2 → §3 refusals | **Light level, as page luminance.** The surface drops toward near-black and §3's display type comes up as the light leaves. **Type gains exactly what the surface loses** — a background and a type colour on one variable, no WebGL. | The mountain's own light dropping on the same variable. |
| §3 → pricing / FAQ | **Type scale.** Display collapses to body scale across the seam while luminance returns slightly. **The drop in scale is the transition.** No scene involvement at either phase. | — |
| FAQ → join | **Luminance returning to its hero value** as the reading surface empties. | The mountain returning at the same time, on the same variable. |

**The P1 enhancements ride the carrier the P0 seam already defines.** They do not introduce a second property, which would break the one-carrier rule below; they give the existing variable something more to drive.

**Constraints:**

- **Native scroll throughout.** Scroll-position-driven, not scroll-jacked. No wheel interception, no Lenis. Unchanged and non-negotiable (§6, SITE-070).
- **One carrier per seam.** If two properties animate across a boundary, pick one and let the other snap. Two carriers read as busy; one reads as deliberate.
- **Each seam is legible at any scroll speed**, including an instant jump. A carrier that only works when scrolled slowly is a carrier that doesn't work — and a jump-to-anchor is the case that proves it.
- **Reduced motion:** carriers do not animate. Sections render at their end states.


### 11.4 Type and tokens — v5 §14, carried forward and now inlined

**Inlined 2026-09-19 (Kian)**, for the reason §11.1 was: §11 carried this forward *by reference* to a document §1 removes from the working tree, and a requirement readable only from git history is the same failure as a citation to a superseded section. SITE-002 and SITE-003 were both built against a table nobody in this repository could open.

**The text below is v5 §14 verbatim, with one amended row. It is a requirement of this document, not provenance.**

#### Type and tokens — v5 §14, inlined verbatim

**Technical drawing:** enormous display type against very small, very precise metadata, hairline rules, real measurements. Density against scale, not scale alone.

| Role | Size | Treatment |
|---|---|---|
| Display | ~~`clamp(40px, 8vw, 140px)`~~ → **`clamp(40px, 9.72vw, 140px)`** — amended 2026-09-19, see below | 500, `-0.04em` |
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

#### The display slope — amended 2026-09-19 (Kian)

**`8vw` → `9.72vw`. The 40px floor and the 140px ceiling are unchanged.**

**8vw reaches 140px only at a 1750px viewport.** Measured on the build: **375px → 40px · 1440px → 115.2px · 1750px → 140px.** So at 1440px — the primary verification width — display rendered at **82% of its ceiling**, and §12.3a's requirement that display sit *at its specified clamp ceiling, not a comfortable middle* could not be met at any width anybody verifies.

**This was an oversight, not a decision, and SITE-003's own reasoning is the proof.** That issue set the lead and body interpolations deliberately:

> both are `intercept + slope·vw`, landing on the range minimum at exactly 375px and the maximum at exactly 1440px, **so the scale is settled at both verification widths rather than caught mid-interpolation at either**.

Display was carried over verbatim and left at 8vw — **producing the exact case that reasoning exists to prevent**, in the largest element on the page, while the two smaller roles beside it were corrected.

`9.72vw` lands 140px at 1440px. The floor is unaffected: 40px still governs below 411px, so **375px renders at 40px exactly as before.**

#### Cap height is measured against width — amended 2026-09-19 (Kian)

§12.3a's comparison condition was written as *cap height at 12% of frame*. **Measured against frame *height*, that cannot be satisfied by this clamp**, and the reason is structural rather than a matter of choosing a bigger number.

At a typical grotesque cap-height ratio of **0.72** (measured range 0.651–0.738 across four faces):

| Frame height | Cap for 12% | Font size required | Against the 140px ceiling |
|---|---|---|---|
| 900px | 108px | **150px** | 10px over |
| 1080px | 130px | **180px** | 40px over |

**The clamp is driven by viewport width; 12% was measured against viewport height. One clamp can satisfy that at exactly one aspect ratio** — the same 1440px-wide viewport needs 150px at 900 tall and 180px at 1080.

**Ruled: the height framing is dropped, and 12% is restated against width.** A type scale that changes with viewport *height* is wrong on its own terms: **the same page in a shorter window would render a different headline size, for no reason a reader can perceive.** Nothing else in §11.4 is height-aware, and making display alone so would make the type scale the one element that moves when nothing about the reading changed.

**Restated: cap height reaches approximately 7% of viewport width at 1440px** — 140px at a 0.72 ratio gives 100.8px of cap, which is 7.0% of 1440. That is the same measurement the 12% figure was reaching for, expressed against the axis the clamp actually uses, and it is satisfied by `9.72vw` as amended above rather than requiring a ceiling the budget and the fold cannot hold.

**It never fought the 0.92 line box.** Whether a face collides at 0.92 is a ratio of its own vertical metrics to the line box and is **scale-invariant** — no ceiling changes it. Nor does the ceiling change the line count, because `max-w-[18ch]` is measured in the font's own units. The two constraints were never in tension; the figure was measured against the wrong axis.

---

## 12. Quality gates

### 12.1 Demo success criteria

**The demo success criteria are DS-1 through DS-10, plus DS-18, DS-18a and DS-18b. There are no others.**

| Range | Status |
|---|---|
| **DS-1 … DS-10** | **Real.** Defined in **v5 §2** — see the correction below. Each is a gate, verified individually with documented evidence. |
| **DS-11 … DS-17** | **A reference to nothing.** No artifact in this repository, and no superseded PRD in git history, ever states them. |
| **DS-18 · DS-18a · DS-18b** | **Real.** Defined below. |

Earlier revisions of this document opened this section with *"DS-1…DS-17 stand."* **That line was provenance, not authority, and it is withdrawn here** — it cited eleven gates of which seven were never written. DS-15 and DS-16 appeared only as citations (DS-15 at §6.6 and §12.3 for the contracts drift guard; DS-16 in v7.2 as forbidding unbacked claims) and DS-17 only as the endpoint of the range, but **a citation is not a definition** and none is recoverable. **Ruled 2026-09-19 (Kian): every one of those citations is struck.** A citation to a withdrawn gate is worse than no citation — a reader follows it, finds nothing, and cannot tell whether the check is unjustified or the definition is merely missing. The checks they pointed at are real and keep their own justification; what is removed is the pointer to a gate that was never written.

**Corrected 2026-09-19: this table previously read *"Defined in v5 §18 and carried forward by §11."* Both halves were wrong.**

They are defined in **v5 §2**, not §18 — v5 §18.1 says only *"All of §2 (DS-1 through DS-10), verified individually"*, which is a pointer, not the definitions. And **§11 carries forward neither v5 §2 nor v5 §18**, so the ten gates this document calls real are carried forward by nothing and are in the working tree nowhere.

**That is sharper than the phantom range it was written to close.** DS-11…DS-17 read as passed because they had no definition to fail. DS-1…DS-10 have definitions, and they are one `git show` away from anyone who thinks to look — and a citation pointing at the wrong section of a removed document is what stops them looking. **Flagged for the inlining ruling; the definitions are not inlined here** because §11's carry-forward list is being audited as a whole rather than one section at a time.

**Consequences, stated so this is not rediscovered:**

- **Nothing may be gated on DS-11 through DS-17.** A gate with no definition cannot be failed, which makes it worse than absent — it reads as passed.
- **No eval was written for DS-15, DS-16 or DS-17, and none should be until they are defined.** Inferring a gate's definition from a citation would produce a gate verified against nothing, which is §0.3 in its purest form.
- **If the intent behind DS-15 or DS-16 matters, they are re-authored here as new criteria.** They are not reconstructed from the places that cite them.
- Where another document still writes *"DS-1…DS-17"*, read it as **DS-1…DS-10** and correct it on sight (§1's propagation rule).

The three that are new, and real:

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

### 12.3a Surface quality — pulled into P0

**Applied 2026-09-19.** Three items previously sat in P1's post chain or nowhere at all. Each is cheap, none depends on the Peak, and together they are most of the distance between a dark page and a designed one.

**Grain — P0.** A fine animated grain overlay across the entire page including UI, at roughly **0.03 strength, 1:1 pixel scale**. This is a CSS or small-canvas overlay, **not** the shader pass in v5 §7.4 — it does not wait for WebGL and **it renders in every tier including D**. It belongs with tokens, not with the P1 post chain. It is the single highest return per line of code on this site: it is what makes a dark surface read as photographed rather than rendered, and its absence is the most visible difference between the build and its reference frames.

**Metadata contrast — P0.** The technical-drawing system is **extreme** scale contrast, and the build is currently delivering mild contrast, which reads as small grey text rather than as a designed layer. Enforce:

- Display type at its specified clamp **ceiling**, not a comfortable middle
- Metadata at **11px** with **`letter-spacing: 0.06em`** — tracking is not optional, it is what makes the layer read as a layer
- Hairline rules at **`rgba(242,240,236,0.08)`** and **visible at that value**
- **Nothing between the two scales.** A 24px label defeats the entire idea.

**Typeface decision recorded — P0.** SITE-003 is supposed to produce a *choice* between PP Neue Montreal and Satoshi, compared at display scale. **A default system sans shipping by omission is a decision nobody made.** The comparison runs and the outcome is written down with a reason.

**This section is retroactive.** It binds SITE-015 and SITE-019, which have shipped, and SITE-002 and SITE-003, which have shipped. Bringing merged work to a specification written after it is the intended behaviour here, not scope creep.

**One note recorded on application.** The metadata primitive `@utility metadata` already carries 11px / 0.06em / `--bone-38` and resolves correctly where it is used; SITE-003 built it. What §12.3a adds is that it must be **used**, that display type must reach its ceiling rather than sit below it, and that hairlines must be visible at 0.08 — none of which a token definition can enforce by existing.

### 12.3b The comparison gate

**Applied 2026-09-19. Blocked on its own inputs — see below.**

**"Is this good?" currently gets answered by whoever has been looking at it longest**, which is the person least able to see it. §12.4a catches *generic*. §6.3b catches *wrong grammar*. **Nothing catches *flat*.**

**Three reference frames live in `docs/site-design/target-frames/`** — the strongest generated stills, labelled **mood only, copy and structure per PRD**. They are a quality target for **light, density, grain and type contrast**. **They are not a content reference, and their copy, fields and layout are all wrong.**

SITE-085, SITE-087 and SITE-088 each compare the build against those frames and answer:

> **Does this hold up next to the target frames on light, density, grain and type contrast?**

A no names which of the four is short and opens an issue.

**This is not asking whether the build matches the images.** A still of a lit scene and a working page are different artifacts, and the build wins on motion, cursor-responsive light and state change that a still cannot carry. It asks whether the *surface quality* is in the same class.

**BLOCKED — `docs/site-design/target-frames/` does not exist, and the gate is not written against it.** Ruled 2026-09-19 (Kian): blocked on Kian, who supplies the frames.

**A gate whose inputs do not exist passes by having nothing to check** — it would iterate an empty directory, find no frame falling short, and report success. That is §0.3 exactly, and it is the reason this section is applied with the gate deliberately unbuilt rather than scaffolded against an absent path. When the frames land, the gate is written **and its first assertion is that the directory is non-empty**, failing by naming the directory rather than the build, because the fault would be in the input.

### 12.4a The generator tell — SITE-085's actual criterion

**Ruled 2026-09-19 (Kian).** SITE-085's criterion was *"is this compelling?"* That is not a question a reviewer can fail the work on, because every answer to it is defensible. It is replaced by one that has a wrong answer:

> **Does any part of this look like it came out of a generator?**

Ten tells. **Each is a yes/no. Any single yes rejects the work** — the reviewer does not weigh them, count them, or trade one against the rest.

| | Tell |
|---|---|
| 1 | Identical rounded cards in a row |
| 2 | An italic or coloured accent on one word of a headline |
| 3 | Tracked-out ALL-CAPS eyebrows |
| 4 | `01 / 02 / 03` numbering |
| 5 | Arrows appended to buttons |
| 6 | Fade-and-slide-up on every section |
| 7 | Hover lift |
| 8 | Centered body type |
| 9 | Decorative monospace |
| 10 | Evenly-weighted type with no metadata layer |

**The reviewer must not be the implementer, and must not have watched the build.** Someone who watched a decision get made cannot see the result the way a first-time visitor does; they see the reasoning instead of the page. This is a staffing constraint on the gate, not a suggestion.

**The reviewer is Kian (ruled 2026-09-19).** He is not the implementer, and he does not watch the build — he sees reports, not the work. That satisfies both clauses as written. **If a gate ever requires someone who has not been in the conversation at all, that is a real staffing problem and it is hit at SITE-085 rather than solved in advance.** It is named here so that when it is hit, it is recognised as the known limit rather than rediscovered as a surprise.

#### The band grammar questions — added 2026-09-19 (Kian)

**Six more, from §6.3b. Same rule: each a yes/no, any single yes rejects.** They are not a second gate and not weighed against the ten — the checklist is **sixteen** questions with one disqualifying answer each.

| | Question |
|---|---|
| 11 | Does any band appear where there is no recurring window behind it? |
| 12 | Does any band read as climbing, tilting, tapering, or having an end? |
| 13 | Does lavender appear as fill anywhere — a stripe, a block, a painted region? |
| 14 | Does any dark mark read as a gap, an absence, a miss, or a disabled control? |
| 15 | Does any element suggest the dark marks should be filled? |
| 16 | Does any band draw itself in, grow, extend, or arrive? |

**The review set MUST include at least one frame where most marks are dark, and the gate's output MUST state which frame carried the sparse case.**

That requirement is the gate's own §12.4. A set of frames showing full or near-full weeks **cannot fail question 14 or 15**, because the condition they measure never occurs — the reviewer answers no to both, honestly, and the gate reports a pass it never tested. **Naming the sparse frame in the output is what makes an untested pass visible at the time**, rather than a year later when a dark mark ships reading as a miss.

**Question 16 is the motion half of question 12.** A band that is level and endless in a screenshot, and draws itself in when the plan lands, is a completeness meter that a still frame cannot catch — the composition passes and the thing the visitor actually sees does not. It is asked separately because a review of screenshots answers 12 and cannot answer 16.

**Applies equally at SITE-087 and SITE-088.** The same sixteen questions, the same rule, the same staffing constraint.

**What this gate cannot catch.** It catches *tells*, not dullness. Work can pass all ten and still be inert — correctly composed, correctly restrained, and not worth looking at. §12.4a is a floor that removes the specific ways this work fails by default; clearing it is not evidence that the work is good.

### 12.4 No criterion satisfiable by absence — standing

Every automated eval must **fail on an empty implementation.** Before an eval is accepted, it is run against a stub that does nothing. If it passes, it is measuring the container and must be rewritten.

Known exposure to audit first: **SITE-EVAL-021** (*"all validate"* passes on zero requests) · **SITE-EVAL-027** (*"each demonstrates its assigned behavior"* passes if the assertion is presence-of-render) · **SITE-EVAL-037** (event sequence assertion passes if no events are expected).

**This audit runs before the eval suite is trusted for anything, including SITE-085's design review gate.**

**Ruled 2026-09-19 (Kian): SITE-106 is a standing gate, not a one-time audit.** It is **re-run at each design review and before the P0 gate** — the same trigger as `CLAUDE.md` §1's fourth-rule reconciliation, for the same reason.

The reason is that SITE-106 sat at SP-01 with one dependency, and its accept read *"every eval in the suite has a recorded stub result."* **At SP-01 almost no evals are implemented, so that criterion was satisfiable by there being nearly nothing to satisfy it.** The audit written to catch criteria satisfiable by absence had one at its own node. Running it once at SP-01 and closing it would have been §0.3 one level up.

**What the gate does and does not establish.** `scripts/check-eval-stubs.mjs` reads the eval *definitions* and fails CI when any eval lacks a `*Stub check*` line, or when an automated eval answers `n/a` — an answer that is correct only for a `VIS` or `FTU` eval, where the verdict is a human's. That makes the question unskippable. **It does not establish that any eval was actually run against a stub**, because it reads the document and not the code. A green gate is evidence the question was answered, never evidence the answer is true.

This rule exists because the same failure was found in the app's own acceptance criteria the same day it was written. It is not hypothetical.

#### A guarantee split between a type and a test — amended 2026-09-19 (Kian)

**When a guarantee rests on a type and a test together, the test is not the guarantee — and the part the type carries is the part nobody re-checks.** Any property asserted partly by a type is asserted explicitly, or it is not asserted.

The finding is SITE-EVAL-033's, from the §12.4 stub audit, and it is the only one in that audit that inverted on inspection.

`builder-machine.ts`'s transition table is the mechanism behind **Rejection 3** — *a wall triggered by anything other than an activation attempt*. Its test iterates every state × event pair exhaustively and asserts `walled` is produced by exactly one event. Planting a second route to `walled` under an **undeclared** key — `tuning: { scrolled_to_end: 'walled' }` — **left that test green.** For a minute that read as the most important guarantee on the site failing its own stub check.

It was not failing. **Typecheck caught it** (TS2353), because the table's value type is `Partial<Record<BuilderEvent, BuilderState>>` and `scrolled_to_end` is not a `BuilderEvent`. The guarantee is two-part, and **neither part covers the other's case**:

- the exhaustive test iterates the **declared** event list, so an undeclared key is invisible to it;
- the type closes the **key space**, so a wrongly-routed declared event — `tuning: { tune: 'walled' }` — is invisible to it.

**The table's closure was load-bearing and incidental.** It held because of how the type happened to be written, and was asserted nowhere. Widening it to `Record<string, BuilderState>` leaves the exhaustive test green while the wall becomes reachable by anything — a one-line edit that passes every check in the sweep and defeats a Rejection.

So the closure is now pinned by its own test, proven negatively: widening the key type exits 1, naming the reason.

**The habit.** When writing a check, ask which part of the property the *compiler* is carrying, and assert that part too. A stub audit run against the test alone cannot find this shape — the test is doing its job, and the half it does not cover looks exactly like a half that does not exist.

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

Part B (item 4) — new issues for §2's three blocks, §3, §7, §8, §9, §11, legal routes, input classification, the clarification beat, held content, DS-18 and §12.4 owning issues, evals for **DS-18 and DS-18a/DS-18b** (Part B was scoped as *"DS-15 through DS-18"*; DS-15 through DS-17 turned out to be a reference to nothing, so no eval was written for them and none should be), SITE-EVAL-070, and a critical-path re-walk. **No longer gated on the capture check, which is complete.** Gated only on Part A v2 being applied.

### PRE-2 · Ban-list copy audit
**Owner:** site session · Automated in CI from P0 onward, failing the build on any §10 banned term; plus a manual pre-launch review, because automation catches terms and not a section that *implies* a capability without naming it.

**Second check, same job: no copy string names an app.** App selections are opaque tokens the app cannot read (§6.3a). Copy says *"3 apps blocked"* and never names one, because naming one is a claim the product cannot make true. The build fails on any match of a committed app-name list against any authored copy string, site-wide.

Four things this check must get right, each of them a way the constraint fails in practice:

- **It is site-wide, not Gate-scoped.** The failure mode is a later rewrite of a line that reads correctly today. A check that only looks at strings currently near Gate copy does not catch it, and a recorded note catches it even less — which is why this is a CI check rather than a paragraph.
- **The list is committed and versioned**, and adding to it is a copy decision, not a lint tweak. It covers the apps a Gate is plausibly created against and their common short forms and rebrands; a name that becomes checkable only after it appears in copy is a check that already failed once.
- **A match is a failure, never a warning.** The §10 term check fails the build; so does this. An allowlist entry for a legitimate use — the App Store, iOS, Apple as the platform — is written into the list as an explicit exception, not granted by suppressing the check at the call site.
- **The list ships non-empty**, seeded with the apps most likely to appear in a draft: the social and video ones a writer reaches for. **An empty list fails nothing, and a check that passes on absence is §0.3's own rule turned on itself.** A first commit of the list that catches nothing is not a starting point; it is the defect this check exists to prevent, shipped as infrastructure.

**Decided: hand-maintained in the site repo, with the staleness treatment.** Same shape as the contracts manifest (§6.6) and the same answer. The list carries a `captured_at`; CI **warns at 90 days and fails at 180**; the failure message says what to do. The thresholds are longer than §6.6's 30/60 deliberately — app names move slower than a contract does.

**Not a fetched source.** There is no authoritative list of app names to fetch, and inventing one would be a mechanism nobody asked for. The honest version is the one stated plainly: this list is maintained by hand, it will go stale, and **the staleness is visible rather than silent.** That is the whole of what the treatment buys, and it is enough.

Implemented by **SITE-107**.

---

## 15. Open items

### 15.1 Gates on held content

- **§4 promotes to P0** when belief accumulation is demonstrably working on a real account — `belief.created` firing in production, the surface rendering non-empty for someone who isn't Kian. Depends on BAS-215, BAS-240.
- **FAQ 10** restores with §4.
- **"It won't let goals eat each other"** becomes a fifth Block 1 line if the contention veto is verified creation-time.
- **§5 Day 1 → Day 30 needs its own DS-18 verdict at P1.** It describes a plan adapting over thirty days, which needs the same accumulated history §4 needs. Flagged now rather than discovered at P1.
- **Block 2 entries** move to Block 1 individually as each passes DS-18.

### 15.2 Read tasks

- **R-2 — COMPLETE.** Reported in full, including the permission list and the export/delete specification. Its findings are built into this document: §6.1b's onboarding-handoff ruling, FAQ 3's permission answer, and FAQ 12's rewrite. Nothing is gated on it. *(Kept here as the record that it ran and what it was for — onboarding mattered most, because a builder and an onboarding that diverge in shape make the handoff from wall to first launch feel like two products.)*
- **Weekly review — LOCATED.** App PRD §48, filed jointly with the nightly check-in, which is why it read as missing. *"On by default. The trust engine and the batching valve… 'leave it inconclusive' offered as a first-class, guilt-free option."* The nightly check-in is **off** by default and the app PRD marks that settled. **Still needs a DS-18 verdict before appearing anywhere** — located is not verified.
- **Day-one gate reachability** — can a new account create a gate at all, by directive or through the `+` sheet? **The §6.1b ruling is conditional on this.** If no, the builder's fourth beat is cut and the wall moves to a timer or reminder.

### 15.3 Decisions

1. Contracts publication route — registry, committed build output, or submodule. Not blocking (§6.6).
2. `dist/` gitignore — deliberate or incidental? Bears on 1.
3. Terminal action at launch — waitlist, TestFlight, or App Store. All branches built.
4. Typeface — decided at build item 1 on real display-scale type. **Still open, and blocked rather than pending.** Neither candidate's files are obtainable: PP Neue Montreal is a commercial per-domain licence, and Satoshi is free but its distributor is denied by the build environment's network policy and it is on no npm registry. So the comparison §14 specifies could not be run, and no verdict was recorded from description. Everything around the decision is built — the scale, the `/type` harness, and `--font-candidate` as the single seam. `docs/typeface-decision.md` is the record.
5. Cursor spring `0.055` — decided during P1 by feel.
6. Tier B mobile Peak — decided post-launch by conversion data.

### 15.4 Copy pass — Kian

§2's three blocks, §3's four refusals, twelve FAQ answers, §7, §9, and `docs/site-copy/roadmap-source.md`. Specified structure with example text; not final prose.

**Ruled 2026-09-19 (Kian): this is the largest unmitigated risk in the project, and no gate catches it.**

Every gate that exists checks something adjacent to the sentences and not the sentences:

- **Design review** (§12.4a) checks composition and format tells.
- **The six-user study** (SITE-060, SITE-061) checks comprehension — whether a visitor understood, not whether the writing was any good.
- **§12.4** checks that evals fail against a stub.

None of them asks whether the prose is worth reading. A site can clear all three with copy that is accurate, comprehensible, correctly formatted and completely flat, and nothing in the process would say so.

It is also **the only P0 work with no owning issue and no schedule** — the one item in this document that was specified as a person's name rather than as work. **It carries a date.**

### 15.5 Findings for the app, not the site

Surfaced by the capture check and the FAQ reads. None is a website problem:

- **The own-words gate coach has no target and was unfiled until the capture report.** The app PRD specifies it in V1.
- **`SettingsView` renders "export data" and "delete account" as rows with no action closure.** Inert labels that do nothing when tapped. Worse than absent — a user believes the control exists. `BAS-125` — **identifier unverified; see FAQ 12.**
- **Occurrence generation returns 200 while producing zero occurrences.** The user is told it worked. A commitment with no occurrences has no resolution cascade, no resolution card, and no adherence record — that reaches considerably further than this website.

---

## 16. What this costs, stated plainly

The site launches describing a product that blocks apps on a schedule, builds structure from a sentence, and refuses to shame you — and says clearly that the rest is being built.

That is less than v7 promised. It is also the only version that is true, and it is aimed at an audience that will check.
