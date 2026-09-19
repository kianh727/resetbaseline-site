# resetbaseline.com — Site Evals v1

Verification truth, derived from `docs/site-prd-v7.3.md` and `docs/site-linear-decomposition-v1.md`. Where artifacts conflict, the PRD wins, then the decomposition, then this document.

These are **website / product / interaction / conversion** evals. They do not recreate the app's agent eval infrastructure.

**Eval types**
`AUTO` automated regression · `VIS` visual/manual acceptance · `FTU` first-time-user comprehension · `PERF` performance measurement · `ANLY` analytics/conversion measurement

Subjective design quality is not pretended to be automatable. `VIS` and `FTU` evals are judged by a human and their verdicts are recorded, not inferred.

---

## A. Product comprehension

**SITE-EVAL-001 · Unprompted product understanding** · `FTU`
*Risk* The site is beautiful and nobody can say what Baseline does.
*Pre* Participant has never seen Baseline. No explanation given. No marketing sections shown.
*Steps* Participant uses the builder freely. Immediately after, ask: *"What do you think Baseline does?"*
*Expected* An answer approximately containing: I tell it what I'm trying to do · it turns that into a plan or system · it structures the actual execution · it can protect the work or adapt over time.
*Pass* **3 of 4 concepts present.** Baseline terminology not required. Paraphrase fully acceptable.
*Fail examples* "AI chatbot" · "AI habit tracker" · "goal tracker" · "AI planner" · "cool mountain website" · any answer where the dominant noun is the visual.
*Stub check* n/a — `FTU`, judged by a human and recorded, never inferred.
*PRD* §18.3 · *Issues* SITE-061

**SITE-EVAL-002 · Differentiation from a recording tool** · `FTU`
*Risk* Users read Baseline as another place to write goals down.
*Pre* As 001.
*Steps* Ask: *"How is this different from writing your goal in a notes app?"*
*Expected* Some articulation that Baseline produced the structure rather than storing the text.
*Pass* Participant references the plan, schedule, dates, or protection as something the system made — not something they made.
*Fail* "It looks nicer" · "It's the same but with AI" · inability to distinguish.
*Stub check* n/a — `FTU`, judged by a human and recorded, never inferred.
*PRD* §13, §18.3 · *Issues* SITE-061

---

## B. Time to value

**SITE-EVAL-003 · System time to tunable plan** · `PERF` `ANLY`
*Risk* The demo is slow enough that visitors leave before the payoff.
*Pre* Instrumentation live. Excludes user hesitation — measured from `goal_submitted` to tune-controls-enabled.
*Steps* 50 sessions across generated and fallback paths.
*Expected* Per §3.1.
*Pass* **p50 ≤ 2.5s, p95 ≤ 5s.**
*Fail* p95 > 5s, or any single session exceeding 8s.
*Stub check* Asserts **50 sessions were recorded** before computing any percentile. An uninstrumented funnel reports zero sessions, and the p95 of nothing is not a slow site — it is no measurement at all.
*PRD* §2 DS-3, §3.1 · *Issues* SITE-032, SITE-050, SITE-060

**SITE-EVAL-004 · Zero-scroll path to plan** · `VIS`
*Risk* The plan lands below the fold and mobile visitors never see it.
*Pre* Fresh load, no scroll input.
*Steps* At 375×667, 375×812, and 1440×900: submit a goal, observe.
*Expected* Plan visible without any scroll gesture.
*Pass* All three viewports.
*Fail* Any viewport requiring scroll to see the first occurrence mark.
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §2 DS-1, §9 · *Issues* SITE-053, SITE-056

**SITE-EVAL-005 · Definition of a meaningful plan** · `AUTO`
*Risk* "Plan generated" fires on something that isn't a plan.
*Pre* —
*Steps* Assert the plan object at `plan_ready`.
*Expected* A meaningful plan contains: a commitment with a title, a recurrence rule, **at least 3 dated occurrences**, and either a timer or a gate. A deadline is optional.
*Pass* Every `plan_generated` event corresponds to a plan meeting that definition.
*Fail* Any empty, occurrence-less, or commitment-less plan reaching `plan_ready`.
*Stub check* Asserts **at least one `plan_generated` event exists** before checking that every plan meets the definition. Zero plans satisfy *"every plan is meaningful"* vacuously.
*PRD* §3.1, §10 · *Issues* SITE-025, SITE-050

---

## C. Intent → Structure comprehension

**SITE-EVAL-006 · Transformation is legible** · `FTU`
*Risk* The block reads as "AI wrote me a schedule" rather than "it parsed my intent into machinery."
*Pre* As 001.
*Steps* After the plan appears, ask: *"What did it do with what you typed?"*
*Expected* Reference to structure — fields, a schedule, dates, blocks — derived from their sentence.
*Pass* Participant describes a transformation, not a response.
*Fail* "It answered me" · "It gave advice" · "It repeated my goal."
*Stub check* n/a — `FTU`, judged by a human and recorded, never inferred.
*PRD* §3.4 · *Issues* SITE-015, SITE-016, SITE-061

**SITE-EVAL-007 · Frame renders complete and empty at t=0** · `AUTO`
*Risk* A spinner or skeleton appears, breaking DS-10.
*Pre* Network blocked entirely.
*Steps* Submit. Snapshot the DOM at 0ms and 50ms.
*Expected* Full `YOU SAID` / `BASELINE BUILT` frame present, unfilled rows showing `—`.
*Pass* Frame present at both snapshots. **Zero elements matching spinner/skeleton/shimmer selectors anywhere in the builder.**
*Fail* Any loading indicator, any empty container, any layout shift on fill.
*Stub check* Asserts the frame's **rows are present at 0ms**, not merely that no spinner selector matched. A page that renders nothing contains no spinner either, and would pass the negative half alone.
*PRD* §2 DS-10, §3.4 · *Issues* SITE-015

**SITE-EVAL-008 · Pre-submit deadline materialization** · `AUTO` `VIS`
*Risk* The highest-perceived-quality detail silently regresses.
*Pre* —
*Steps* Type "finish my thesis by May" character by character. Monitor network.
*Expected* Deadline field fills before submit.
*Pass* Field populated with zero network requests during typing.
*Fail* Any fetch during typing, or deadline appearing only post-submit.
*Stub check* Asserts the **deadline field is populated**, not only that no request was made during typing. An input that parses nothing also issues no requests.
*PRD* §3.3 · *Issues* SITE-013, SITE-019

---

## D. Builder interaction quality

**SITE-EVAL-009 · Goal entry** · `VIS`
*Risk* The input reads as a generic chat box, undermining differentiation.
*Steps* Load at 1440px and 375px. Observe idle, focus, filled, and disabled states.
*Pass* Reviewer confirms: primary action is unambiguous · focus state clearly visible · **does not read as a ChatGPT-style centered text box**.
*Fail* Centered composition · send-arrow iconography · placeholder implying open-ended conversation.
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §3.2, §14 · *Issues* SITE-008

**SITE-EVAL-010 · Chip breadth constraint** · `AUTO`
*Risk* Rotation shows three habit chips and the demo looks like a habit tracker.
*Steps* Simulate 1000 rotations.
*Expected* Every displayed set contains at least one of `back`, `thesis`, `lsat`.
*Pass* Zero violations in 1000 draws.
*Fail* Any all-habit set.
*Stub check* Asserts **1000 draws were actually produced** before checking that every set contains a non-habit chip. A rotation that never runs yields zero sets and therefore zero violations.
*PRD* §3.2, §5 · *Issues* SITE-011

**SITE-EVAL-011 · Chip interaction** · `AUTO` `VIS`
*Risk* Chips fill the input but obstruct extension.
*Steps* Click a chip. Inspect focus and caret. Then type.
*Pass* Input focused, caret at end, typed characters append. Rotation permanently stopped.
*Fail* Caret at start · input unfocused · rotation resumes.
*Stub check* Asserts the **input's value changed** after the chip click before asserting caret position and focus. An inert chip moves no caret and fails no assertion about where the caret went.
*PRD* §3.2 · *Issues* SITE-010, SITE-011

**SITE-EVAL-012 · Autotype never submits** · `AUTO`
*Risk* The demo runs itself and the visitor never acts.
*Steps* Load and wait 60s untouched.
*Pass* Input typed once, then idle. **No submit occurs. No plan appears.**
*Fail* Any automatic submission or auto-generated plan.
*Stub check* Asserts autotype **actually typed** before asserting that no submit occurred. A component that does nothing also never submits, and would pass the headline assertion.
*PRD* §3.2 · *Issues* SITE-009

**SITE-EVAL-013 · Tune discoverability and effect** · `FTU` `AUTO`
*Risk* Users never tune, and the ownership moment is lost.
*Steps* FTU: observe whether the participant tunes unprompted within 60s of plan appearing. AUTO: measure 50 tune operations.
*Pass* **4 of 6 participants tune unprompted.** Every operation completes in **< 400ms with zero network requests**.
*Fail* Tune requiring instruction · any network call · any operation > 400ms.
*Stub check* Asserts **50 tune operations completed** before asserting latency and zero network calls. An inert control performs none, which makes both *< 400ms* and *zero requests* trivially true.
*PRD* §2 DS-4, §3.6, §4 · *Issues* SITE-037, SITE-061

**SITE-EVAL-014 · Protect implies no browser capability** · `AUTO` `VIS`
*Risk* The site implies it can block apps, violating DS-8.
*Steps* Audit all copy in the protect step and gate card against a banned-implication list ("blocked", "now active", "protection on", "enabled").
*Pass* Zero implications of active enforcement anywhere before the wall.
*Fail* Any copy or state suggesting protection is running.
*Stub check* Asserts the protect step and gate card **rendered copy** before scanning it against the banned-implication list. Empty copy contains no banned word.
*PRD* §2 DS-8, §3.7 · *Issues* SITE-041

**SITE-EVAL-015 · Activate is deliberate** · `VIS`
*Risk* Users hit the wall accidentally and it reads as a trap.
*Steps* Observe six sessions to the wall.
*Pass* Every participant reached the wall by pressing Activate, and can say what they pressed.
*Fail* Any participant surprised by the wall's appearance.
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §11.1 · *Issues* SITE-042, SITE-061

---

## E. Motion quality

**SITE-EVAL-016 · Controls enable before animation completes** · `AUTO`
*Risk* Cinematic sequencing delays interaction.
*Steps* Submit, then attempt a tune interaction at 200ms after occurrence data exists.
*Pass* Interaction accepted and processed. Fan-out interruptible with no orphaned state.
*Fail* Controls disabled until animation finishes.
*Stub check* Asserts the control **reached its enabled state** before asserting it did so before the animation ended. A control that never enables never enables late.
*PRD* §3.1, §8.2, §17 K-4 · *Issues* SITE-025

**SITE-EVAL-017 · Settling spring is exclusive** · `AUTO`
*Risk* The signature erodes across the build until nothing is signature.
*Steps* Static analysis of every consumer of the spring primitive.
*Pass* **Only structure-landing components import it.** Lint rule fires on any other import.
*Fail* Section headers, the wall, chips, or refusals using it.
*Stub check* Asserts **at least one settling-spring usage exists** before asserting that every usage is structure landing into place. Zero usages satisfies exclusivity vacuously — and the signature would be gone, which is the thing this eval exists to protect.
*PRD* §8.1 · *Issues* SITE-024

**SITE-EVAL-018 · Refusals read as stopping** · `VIS` `AUTO`
*Risk* A refusal animated like a product beat reads as output, not judgment.
*Steps* Trigger the `back` scenario. Inspect motion config.
*Pass* Opacity-only, 300ms, no spring, `--veto` rule, 400ms hold. Reviewer confirms it reads as the system declining.
*Fail* Any spring or scale on the refusal element.
*Stub check* Asserts a refusal **actually rendered** before asserting it uses no spring. An unrendered refusal animates nothing.
*PRD* §8.2, §3.4 · *Issues* SITE-018

**SITE-EVAL-019 · Motion does not read as decorative AI-site animation** · `VIS`
*Risk* The site pattern-matches to generated landing pages.
*Steps* Full-page review at 1440px and 375px.
*Pass* Reviewer confirms: no fade-and-slide-up on every section · no stagger on non-sequential content · no hover lift · every animation either communicates state change or carries product meaning.
*Fail* Any decorative motion that survives the question "what does this tell the user?"
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §8.2, §19, §17 K-4 · *Issues* SITE-025, SITE-072

**SITE-EVAL-020 · Reduced motion comprehension** · `VIS` `FTU`
*Risk* The demo is only legible in motion.
*Steps* Enable `prefers-reduced-motion`. Complete the full loop at both widths.
*Pass* **Full loop completable and fully comprehensible with zero animation.** No autotype, no sweep, static grain, camera snaps.
*Fail* Any state only reachable or only understandable through animation.
*Stub check* n/a — `VIS` and `FTU`, judged by a human and recorded, never inferred.
*PRD* §8.3, §18.2 · *Issues* SITE-006, SITE-009, SITE-071

---

## F. GeneratedProvider

**SITE-EVAL-021 · Valid response path** · `AUTO`
*Steps* 30 varied inputs through `/api/plan`, of which **at least 8 classify as `vague`** so the third field is exercised rather than merely permitted.
*Pass* **Amended 2026-09-19 by PRD v7.3 §6.5 — the model's surface is three fields, not two.** Every response validates; commitment title ≤48 chars; window from the closed set; action types restricted to the 45 in `contracts-manifest.json`; for `vague` inputs a clarification question meeting all five §6.4 constraints; **no fourth field originates from the model**. The non-`vague` inputs return **no** clarification field at all.
*Fail* Any model-authored date, count, tier, refusal, or copy string other than the title and the `vague`-path clarification question · a clarification field returned for a non-`vague` class · a fourth field of any kind.
*Stub check* **Was a known §12.4 exposure and is rewritten here.** *"All validate"* passed on zero requests: an empty implementation issues no calls, so nothing fails to validate. It now asserts **counts before properties** — 30 responses received, ≥8 carrying a clarification field — so a stub that returns nothing fails on the count rather than passing on the vacuum.
*PRD* v7.3 §6.4, §6.5, §4, §12 · *Issues* SITE-030, SITE-031, SITE-103

**SITE-EVAL-022 · Malformed response** · `AUTO`
*Steps* Inject 20 malformed fixtures — truncated JSON, extra fields, wrong enums, missing required, wrong types.
*Pass* All rejected at validation; `plan_generation_fallback` fires with `invalid_schema`; a complete plan still appears.
*Fail* Any coercion, repair, or partial acceptance.
*Stub check* Asserts **all 20 malformed fixtures were injected and 20 rejections observed**. A provider that never runs rejects nothing, coerces nothing, and repairs nothing.
*PRD* §12 · *Issues* SITE-031, SITE-033

**SITE-EVAL-023 · Timeout** · `AUTO` `VIS`
*Steps* Stub the route to 4001ms.
*Pass* Request aborts at 4000ms · fallback engages · **no dead spinner** · post-abort response cannot mutate state.
*Fail* Any wait beyond 4s, or late response overwriting fallback state.
*Stub check* Asserts the **timeout actually fired and a fallback plan rendered**. A generation path that never starts never exceeds 4000ms, so the bound holds for the wrong reason.
*PRD* §12, §2 DS-7, DS-10 · *Issues* SITE-032, SITE-033

**SITE-EVAL-024 · Network failure** · `AUTO` `VIS`
*Steps* Block `/api/plan` at the network layer.
*Pass* Full loop completes via `StaticProvider`. Visitor sees a complete plan with their own words in `YOU SAID`.
*Fail* Any error message, any blocked step.
*Stub check* Asserts the **failure was injected and a complete plan still appeared**. No request means no network error to survive.
*PRD* §2 DS-7, §12 · *Issues* SITE-029, SITE-033

**SITE-EVAL-025 · Bounded-domain request** · `AUTO` `VIS`
*Steps* Submit each of five bounded-domain inputs.
*Pass* Deterministic classifier fires; authored refusal renders; built-instead structure appears. **Model output cannot suppress the refusal.**
*Fail* Any generated refusal text · any de-escalation from bounded to ordinary.
*Stub check* Asserts the **bounded classification fired and refusal copy rendered**. An input that is never classified produces no refusal to check, and no escalation to catch.
*PRD* §3.4, §4 · *Issues* SITE-014, SITE-017, SITE-018, SITE-033

**SITE-EVAL-026 · Rate limit and spend cap** · `AUTO`
*Steps* Exceed 5/hr/IP, then trip the daily cap, then flip the kill switch.
*Pass* Each routes to `StaticProvider` with the correct `plan_generation_fallback` reason. Kill switch effective without redeploy.
*Fail* Any user-visible error, any blocked demo.
*Stub check* Asserts **both the rate-limit and spend-cap paths were entered**. A provider that is never called hits neither, and every assertion about how they resolve is vacuous.
*PRD* §12 · *Issues* SITE-034, SITE-033

---

## G. StaticProvider

**SITE-EVAL-027 · Authored scenarios demonstrate distinct behaviors** · `VIS` `AUTO`
*Risk* Five scenarios that all look like the same habit demo.
*Steps* Run all five end to end.
*Pass* **Rewritten 2026-09-19 by SITE-106's audit; the previous wording passed on presence-of-render.** Per scenario, the **specific object set that scenario exists to demonstrate** is asserted — `thesis` a grounded-only refusal with a long horizon · `gym` a contention veto and anti-streak · `lsat` a timer plus an `explicit` gate · `mornings` a gate as the first object · `back` a bounded refusal followed by process. **No two scenarios produce the same object-type multiset** — that is what *"indistinguishable in output shape"* means, and it is now asserted rather than eyeballed. All five validate against contracts. Every action verb is one of the 45 in `contracts-manifest.json`; every rendered outcome is one of the five resolvable values (`complete · partial · missed · cancelled_intentionally · unknown`) — `pending` must not appear, and `rescheduled` must not appear as a recorded outcome (PRD v7.3 §6.3 permits it only as a derived display state).
*Fail* Two scenarios indistinguishable in output shape.
*Stub check* **Was a named §12.4 exposure and is rewritten here.** *"Each demonstrates its assigned behavior"* passes if the assertion is presence-of-render: five scenarios that each render *something* would satisfy it. It now asserts, per scenario, the **specific object set that scenario exists to demonstrate** — `thesis` a grounded-only refusal with a long horizon, `gym` a contention veto, `lsat` a timer plus an `explicit` gate, `mornings` a gate as the first object, `back` a bounded refusal followed by process — and asserts that **no two scenarios produce the same object-type multiset**, which is what *"indistinguishable in output shape"* actually means. A stub rendering five identical empty plans fails on the first scenario and again on the distinctness check.
*PRD* §5 · *Issues* SITE-028

**SITE-EVAL-028 · Compelling without an LLM** · `VIS` `FTU`
*Risk* The fallback is technically functional and experientially dead.
*Steps* Disable generation entirely. Run 001 and 006 against the static-only build.
*Pass* **Comprehension results are statistically indistinguishable from the generated build.** Raw intent preserved verbatim in `YOU SAID`.
*Fail* Participants noticing the plan doesn't match what they typed.
*Stub check* n/a — `VIS` and `FTU`, judged by a human and recorded, never inferred.
*PRD* §5, §12, §2 DS-7 · *Issues* SITE-029

---

## H. Determinism

**SITE-EVAL-029 · Recurrence and occurrence math** · `AUTO`
*Steps* 40+ fixtures: weekday counts, DST both directions, month boundaries, leap year, every closed-set rule.
*Pass* Weekdays over 14 days = exactly 10. All fixtures exact.
*Fail* Any off-by-one, any DST drift.
*Stub check* Asserts the **fixture suite ran to its full declared count** before asserting that every date matches. Zero fixtures pass *"all dates correct"*, and a suite that silently stopped loading fixtures looks identical to one that passed.
*PRD* §4 · *Issues* SITE-023

**SITE-EVAL-030 · LLM wording does not move dates** · `AUTO`
*Steps* Feed 20 semantically identical inputs with varied phrasing. Compare resulting occurrence sets.
*Pass* **Identical dates and counts across all 20.** Only commitment title varies.
*Fail* Any variance in dates, counts, tiers, or recurrence.
*Stub check* Asserts **both phrasings produced a plan with a non-zero occurrence count** before comparing them. Two empty results are identical, which would read as perfect determinism.
*PRD* §4 · *Issues* SITE-023, SITE-030

**SITE-EVAL-031 · Authority tiers are contract-derived** · `AUTO`
*Steps* Assert tier for every object type across all scenarios.
*Pass* Tier is a pure function of object type. **Gate always `explicit`.** No model input reaches tier assignment.
*Fail* Any tier passed through from generation.
*Stub check* Asserts **every `capability_type` in the manifest produced an object with a tier** before asserting that gate is always `explicit`. No objects means no wrong tiers.
*PRD* §4 · *Issues* SITE-026, SITE-040

**SITE-EVAL-032 · Tuning is fully local** · `AUTO`
*Steps* Perform 50 tune operations with network monitoring.
*Pass* **Zero network requests. Zero LLM calls.** Same input always produces the same occurrence set.
*Fail* Any request, any nondeterminism.
*Stub check* Asserts **tune operations occurred and changed the plan** before asserting zero network requests. This is the single most important boundary in SP-06, and an inert control satisfies its headline assertion perfectly.
*PRD* §4, §3.6 · *Issues* SITE-037

---

## I. Activation wall

**SITE-EVAL-033 · Wall is unreachable except by activation** · `AUTO`
*Steps* Exhaustively attempt: 10-minute idle, full page scroll, section entry, exit-intent gesture, 50 interactions, direct state manipulation.
*Pass* **`walled` unreachable by every path except an Activate press.**
*Fail* Any alternate path.
*Stub check* Asserts the wall **was reached at least once by a genuine activation** before asserting that no other path reaches it. A wall that never opens is unreachable by everything, including activation.
*PRD* §11.1 · *Issues* SITE-012, SITE-042

**SITE-EVAL-034 · Wall is honest** · `AUTO` `VIS` `FTU`
*Steps* Press Activate. Inspect all rendered copy and state. Then ask: *"What would you have expected to happen?"*
*Pass* No "activated" state exists anywhere. Participant understands **why** the site stops — gates need the phone.
*Fail* Any fake success · participant describing it as "a signup wall" or "they want my email."
*Stub check* Asserts the wall **rendered its copy** before scanning it for fake-activation language. Unrendered copy implies no capability the browser lacks.
*PRD* §11.2, §11.3, §2 DS-8 · *Issues* SITE-043, SITE-061

**SITE-EVAL-035 · Plan preserved and dismissible** · `AUTO` `VIS`
*Steps* Reach the wall, inspect, dismiss, then tune and protect again.
*Pass* Plan visible behind 40% dim · dismissal returns full interactivity · pinned save bar persists · wall re-reachable only by another Activate.
*Fail* Plan hidden · trapped state · re-prompt on scroll or exit intent.
*Stub check* Asserts the plan **was present before dismissal** as well as after. Absent-then-absent passes *"the plan is preserved"*.
*PRD* §11.3 · *Issues* SITE-043, SITE-047

**SITE-EVAL-036 · Terminal action branches** · `AUTO` `VIS`
*Steps* Set config to each of `waitlist`, `testflight`, `appstore`.
*Pass* All three render and submit correctly with no code change. Capture records `terminal_action`.
*Fail* Any branch unbuilt or hardcoded.
*Stub check* Asserts **all three branches rendered** across the config values. A config that renders none passes *"each branch is correct"* without producing a branch.
*PRD* §11.4 · *Issues* SITE-045, SITE-046

---

## J. Conversion funnel

**SITE-EVAL-037 · Full event sequence** · `ANLY` `AUTO`
*Steps* One complete manual loop; assert the event stream.
*Expected* `hero_view → builder_engaged → goal_input_started → goal_submitted → plan_generated → plan_tuned → protect_started → protect_selected → activation_attempted → wall_reached → email_submitted → share_card_created`, plus `suggestion_selected` where applicable.
*Pass* **Rewritten 2026-09-19 by SITE-106's audit; the previous wording passed on an empty stream.** The **expected event count is asserted first** — the twelve named events, plus `suggestion_selected` where the loop used a chip — and only then the ordering and the per-event properties of §10. An empty stream is trivially *"complete and ordered"*, so the count is what makes the rest mean anything.
*Fail* Missing event, wrong property, out-of-order emission.
*Stub check* **Was a named §12.4 exposure and is rewritten here.** The sequence assertion passes if no events are expected: an empty stream is trivially *"complete and ordered"*. It now asserts the **exact expected event count first** — the twelve named events, plus `suggestion_selected` where the loop used a chip — and only then their order and properties. A stub emitting nothing fails on the count before ordering is ever considered.
*PRD* §10 · *Issues* SITE-050

**SITE-EVAL-038 · Branch and fallback events** · `ANLY` `AUTO`
*Steps* Force each of five generation failures; dismiss the wall.
*Pass* `plan_generation_fallback` fires with the correct reason each time; `wall_dismissed` fires with `dwell_ms`.
*Fail* Silent fallback with no event.
*Stub check* Asserts **each branch and fallback event fired at least once** across the injected failures. An empty stream contains no wrong events and no wrong properties.
*PRD* §10 · *Issues* SITE-033, SITE-050

**SITE-EVAL-039 · No sensitive free-form text in analytics** · `AUTO`
*Steps* Submit a goal containing a person's name, a place, and a health term. Capture all analytics payloads.
*Pass* **No payload contains any substring of the user's input.** Attaching `raw_goal` fails at compile time.
*Fail* Any free-form text in any event.
*Stub check* Asserts the **negative fixture genuinely fails to compile** — a file that attaches `raw_goal` to an event must be rejected by `tsc`. A compile-time rule with no failing case rejects nothing, and its absence is indistinguishable from its working.
*PRD* §10, §18.2 · *Issues* SITE-051

**SITE-EVAL-040 · Peak does not suppress engagement** · `ANLY`
*Risk* The Peak becomes a vanity interaction that costs conversion.
*Pre* P1 shipped, ≥1000 sessions per tier.
*Steps* Compare `hero_view → builder_engaged` and `plan_generated → wall_reached` across Tiers A/B and C/D.
*Pass* Tier A/B engagement **within 5% of, or above,** Tier C/D.
*Fail* Tier A/B materially lower — **K-1 fires and the Peak gets simplified.**
*Stub check* Asserts **both cohorts carry a non-zero sample** before comparing engagement rates. Two empty cohorts show no difference, which would read as the Peak costing nothing.
*PRD* §10.2, §17 K-1 · *Issues* SITE-052

---

## K. Mobile

**SITE-EVAL-041 · Full loop at 375px** · `VIS`
*Steps* Complete goal → plan → tune → protect → activate → wall → share on a real device.
*Pass* Every step completable. Screenshots captured at each.
*Fail* Any step requiring rotation, zoom, or desktop.
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §9 · *Issues* SITE-053

**SITE-EVAL-042 · Keyboard behavior** · `VIS`
*Steps* Focus the input on real iOS Safari. Type. Observe.
*Pass* Input **and at least three transformation rows** remain visible above the keyboard. Input never scrolls off-screen.
*Fail* Input obscured · content jumping · viewport not tracked.
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §9 · *Issues* SITE-054

**SITE-EVAL-043 · Chips and tune ergonomics** · `VIS` `AUTO`
*Steps* One-handed use at 375px. Automated target-size audit.
*Pass* Chips scroll horizontally with momentum, no wrap. All targets ≥44×44 (day pills ≥40×40). **No hover dependency anywhere.**
*Fail* Any undersized target · any hover-only affordance.
*Stub check* Asserts the **targets exist** before measuring them against 44×44. Zero elements are all at least 44px.
*PRD* §9 · *Issues* SITE-055, SITE-057

**SITE-EVAL-044 · Plan readability in limited height** · `VIS`
*Steps* 375×667 with keyboard closed and open.
*Pass* Occurrences collapse to next-5 + "and 5 more"; plan remains understandable; expansion works on tap.
*Fail* Plan illegible · horizontal scrolling of the plan.
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §9 · *Issues* SITE-056

**SITE-EVAL-045 · Wall on mobile** · `VIS`
*Steps* Reach the wall at 375px, keyboard open and dismissed.
*Pass* Bottom sheet, not centered modal · email field and submit visible with keyboard open · plan visible above · safe areas respected.
*Fail* Centered modal · obscured submit · content under the home indicator.
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §9, §11.3 · *Issues* SITE-044

**SITE-EVAL-046 · Overflow sweep** · `AUTO`
*Steps* Every builder state at 320/375/390/768/1440/1920.
*Pass* **Zero horizontal scroll in every state at every width.**
*Fail* Any overflow.
*Stub check* Asserts a **non-zero route and state count**, and measures **with `overflow-x: clip` lifted**. The clip §9 requires removes the overflow from `scrollWidth`, so a check reading the shipped page reports clean on a page that overflows by a thousand pixels. Found in SITE-005, where the first version of this check passed a deliberate 1200px probe at 320px wide.
*PRD* §9, §18.2 · *Issues* SITE-005, SITE-057

---

## L. Accessibility and reduced motion

**SITE-EVAL-047 · Keyboard operability** · `AUTO` `VIS`
*Steps* Complete the full loop using keyboard only.
*Pass* Every control reachable and operable; visible focus throughout; **wall dismissible by keyboard**; logical tab order.
*Fail* Any keyboard trap · any unreachable control.
*Stub check* Asserts a **non-zero count of focusable elements** before asserting that all are reachable and ordered. A page with no controls is perfectly keyboard-operable.
*PRD* §18.2 · *Issues* SITE-008, SITE-035, SITE-036, SITE-039, SITE-043

**SITE-EVAL-048 · Semantic controls and labels** · `AUTO`
*Steps* Automated a11y audit across all builder states.
*Pass* Native or correctly-roled controls · all inputs labeled · state changes announced.
*Fail* Div-buttons · unlabeled inputs · silent state changes.
*Stub check* Asserts **controls exist** before asserting each carries a name and role. Zero controls are all correctly labelled.
*PRD* §18.2 · *Issues* SITE-035, SITE-036, SITE-039

**SITE-EVAL-049 · Contrast and non-color signaling** · `AUTO` `VIS`
*Steps* Contrast audit on `--bone-38` metadata, `--veto`, and lavender-on-void. Verify selection states.
*Pass* Body and interactive text meet AA. **No state conveyed by color alone** — selection, veto, and authority tier all carry a non-color signal.
*Fail* Metadata below AA · color-only selection state.
*Stub check* Asserts **text and non-text targets were sampled** before asserting contrast ratios. Nothing rendered has no contrast failures.
*PRD* §14, §18.2 · *Issues* SITE-002, SITE-003, SITE-039

**SITE-EVAL-050 · Reduced motion completeness** · `AUTO` `VIS`
*Steps* With reduced motion enabled, verify each §8.3 requirement individually.
*Pass* Sweep stopped · cursor authority off · grain static · camera snaps · no autotype · builder shows final states · Day 1→30 is a toggle.
*Fail* Any animation surviving the preference.
*Stub check* Asserts animations **exist when motion is allowed**, then that they are absent under `reduce`. A site with no animation at all passes the reduced case perfectly while failing the product.
*PRD* §8.3 · *Issues* SITE-006, SITE-009, SITE-071, SITE-073

---

## M. Performance

**SITE-EVAL-051 · Load budgets** · `PERF` `AUTO`
*Steps* Lighthouse mobile in CI, throttled 4G.
*Pass* LCP ≤1.8s · CLS ≤0.05 · INP ≤200ms · **core ≤120KB gzip · scene ≤140KB gzip and excluded from first load** · Lighthouse mobile perf ≥90.
*Fail* Any budget exceeded — build fails.
*Stub check* Asserts the **built artifacts exist and are non-empty** before comparing them to the budgets. An empty bundle is under every ceiling — this is the §0.3 shape the 120 KB check was written against, and the same trap applies to every budget here.
*PRD* §16 · *Issues* SITE-076, SITE-078

**SITE-EVAL-052 · Headline is LCP** · `PERF` `AUTO`
*Steps* Inspect the LCP element with the Peak live.
*Pass* **LCP is the hero headline. The Peak is never in the LCP path** and initializes after on idle callback.
*Fail* Canvas or scene asset as LCP.
*Stub check* Asserts an **LCP element was identified at all** before asserting it is the headline. A blank page reports no LCP candidate.
*PRD* §16 · *Issues* SITE-007, SITE-076

**SITE-EVAL-053 · Interaction latency** · `PERF` `AUTO`
*Steps* Measure tune, chip select, protect select, activate over 50 operations each.
*Pass* Tune < 400ms end to end. All others < 100ms to visible feedback.
*Fail* Any operation exceeding budget.
*Stub check* Asserts **interactions actually occurred** before measuring INP. A page nobody can interact with has no interaction latency.
*PRD* §2 DS-4, §16 · *Issues* SITE-037

**SITE-EVAL-054 · Frame budgets** · `PERF`
*Steps* Measure on target hardware per tier during scroll and cursor movement.
*Pass* Tier A ≤8ms · Tier B ≤12ms on a real mid-range Android.
*Fail* Sustained breach — **K-2 fires and the offending post pass is removed.**
*Stub check* Asserts **frames were rendered** before asserting frame time. A scene that never initializes never breaches 8ms.
*PRD* §16, §17 K-2 · *Issues* SITE-077, SITE-079

---

## N. Degradation ladder

**SITE-EVAL-055 · Tier A full loop** · `VIS` — Desktop, WebGL2. Full Peak, cursor authority, full post chain. Loop completes; plan legible over the geometry. *PRD* §15 · *Issues* SITE-075 *Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.

**SITE-EVAL-056 · Tier B full loop** · `VIS` `PERF` — Modern mobile. Half-res upscale, grain and bloom retained, aberration absent, auto-sweep only, plan via `FlatLayout`. Loop completes within frame budget. *PRD* §15 · *Issues* SITE-077 *Stub check* The `VIS` half is n/a. The `PERF` half asserts **frames were rendered** before asserting frame time — a scene that never initializes never breaches its budget.

**SITE-EVAL-057 · Tier C full loop** · `VIS` — Static peak + CSS gradient. Loop completes; plan renders via `FlatLayout` or `StaticPeakLayout`. *PRD* §15 · *Issues* SITE-069, SITE-058 *Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.

**SITE-EVAL-058 · Tier D full loop, WebGL disabled** · `AUTO` `VIS`
*Risk* The demo depends on the atmosphere it was explicitly designed to survive without.
*Steps* Disable WebGL entirely. Complete the loop at 375px and 1440px.
*Pass* **Full loop completes. Every builder function works. Plan is coherent and compelling.**
*Fail* Any degraded function, any broken layout, any missing step.
*Stub check* Asserts the **loop completed to the wall** with WebGL disabled, not merely that nothing threw. A page that renders nothing also does not crash.
*PRD* §2 DS-6, §15 · *Issues* SITE-058, SITE-022

**SITE-EVAL-059 · Failure × tier matrix** · `AUTO` `VIS`
*Steps* Five generation failures × four tiers × two widths = 40 combinations.
*Pass* **Zero dead states, zero spinners, zero broken layouts.** Minimum twelve manually spot-checked and documented.
*Fail* Any combination producing an unrecoverable or empty state.
*Stub check* Asserts **every cell of the failure × tier matrix was exercised** before asserting each resolved. An unrun matrix contains no failures.
*PRD* §2 DS-6, DS-7, DS-10 · *Issues* SITE-059

---

## O. Peak evaluation — **runs only after the P0 gate passes**

**SITE-EVAL-060 · Silhouette recognition** · `FTU`
*Steps* Show the fold to three people who know the app icon, without telling them what to look for. Ask what they see.
*Pass* All three identify the Baseline mark within one second.
*Fail* Generic mountain · no recognition — **geometry is wrong (SITE-062).**
*Stub check* n/a — `FTU`, judged by a human and recorded, never inferred.
*PRD* §7.1 · *Issues* SITE-062

**SITE-EVAL-061 · Peak does not steal from Ask Baseline** · `FTU` `VIS`
*Risk* A visually impressive Peak that reduces product comprehension is a failed Peak.
*Steps* Run SITE-EVAL-001 against the Peak build and the flat build. Compare.
*Pass* **Comprehension scores on the Peak build are equal to or better than the flat build.** Participants engage the input first, not the background.
*Fail* Any comprehension drop, or participants describing the site as "a mountain website" — **K-1 fires.**
*Stub check* n/a — `FTU` and `VIS`, judged by a human and recorded, never inferred.
*PRD* §7, §10.2, §17 K-1, §18.3 · *Issues* SITE-062, SITE-068

**SITE-EVAL-062 · Plan legibility over geometry** · `VIS`
*Steps* Render all five scenarios with `ProjectedPeakLayout` at 1440px.
*Pass* Every occurrence date, label, and tier remains readable over every facet at every light angle.
*Fail* Any label lost against the surface — **K-3 fires and readability wins over geometric fidelity.**
*Stub check* n/a — `VIS`, judged by a human and recorded, never inferred.
*PRD* §6, §17 K-3 · *Issues* SITE-068, SITE-062

**SITE-EVAL-063 · Adapter swap changes no builder logic** · `AUTO`
*Steps* Static analysis of the builder module graph under `FlatLayout` and `ProjectedPeakLayout`.
*Pass* **Identical builder module graph.** Zero parallel plan logic.
*Fail* Any builder branch on layout type · any duplicated plan model.
*Stub check* Asserts **both adapters rendered a non-empty plan** before asserting the builder's code paths are identical. Two adapters that render nothing differ in nothing.
*PRD* §6 · *Issues* SITE-068

**SITE-EVAL-064 · Scroll remains native** · `AUTO` `VIS`
*Steps* Import-ban check; scroll the full page on real iOS Safari.
*Pass* No Lenis or locomotive imports · no `preventDefault` on wheel or touchmove · momentum scroll feels native.
*Fail* Any interception.
*Stub check* Asserts the page **actually scrolled** before asserting the scroll was native, and pairs it with the import ban's negative test — a page that cannot scroll intercepts nothing, and an import ban with no forbidden import to reject proves nothing.
*PRD* §7.5 · *Issues* SITE-070

---

## P. End-to-end canonical scenarios

Each runs the complete demo — goal → transformation → plan → tune → protect → activate → wall → share — at 1440px and 375px, on both the generated and the static path.

**SITE-EVAL-065 · `gym` — recurring physical goal** · `VIS` `AUTO`
*Pass* Contention veto fires on a colliding time · **no streak object is ever created** · upstream intervention proposed.
*Stub check* Asserts the scenario **rendered its objects** before asserting which. An empty plan demonstrates no behaviour, distinctly or otherwise.
*PRD* §5 · *Issues* SITE-028, SITE-038

**SITE-EVAL-066 · `thesis` — project deadline** · `VIS` `AUTO`
*Pass* Deadline inferred from "by May" pre-submit · grounded-only refusal to outline unseen content · long-horizon occurrences with correct dates.
*Stub check* Asserts the scenario **rendered its objects** before asserting which. An empty plan demonstrates no behaviour, distinctly or otherwise.
*PRD* §5 · *Issues* SITE-013, SITE-028

**SITE-EVAL-067 · `lsat` — studying / procrastination** · `VIS` `AUTO`
*Pass* Timer created with a real duration · gate at `explicit` · high-frequency recurrence expands correctly.
*Stub check* Asserts the scenario **rendered its objects** before asserting which. An empty plan demonstrates no behaviour, distinctly or otherwise.
*PRD* §5 · *Issues* SITE-028, SITE-026

**SITE-EVAL-068 · `mornings` — routine / time-of-day failure** · `VIS` `AUTO`
*Pass* Gate is the primary object · protection precedes scheduling in the transformation block.
*Stub check* Asserts the scenario **rendered its objects** before asserting which. An empty plan demonstrates no behaviour, distinctly or otherwise.
*PRD* §5 · *Issues* SITE-028, SITE-040

**SITE-EVAL-069 · `back` — bounded domain** · `VIS` `AUTO` `FTU`
*Pass* Authored refusal on the participant's own text · **zero programming or exercise advice generated** · process structure built instead. FTU: participant describes the refusal as trustworthy rather than unhelpful.
*Fail* Any generated medical or training guidance.
*Stub check* Asserts the scenario **rendered its objects and its refusal** before asserting which. An empty plan demonstrates no behaviour, and an absent refusal reads as a refusal that correctly did not fire.
*PRD* §3.4, §4, §5 · *Issues* SITE-014, SITE-017, SITE-018, SITE-028

---

## Q. Launch state, sections, and the determinism boundary

Added by PRE-1 Part B against PRD v7.3. **Every eval here must fail against a stub that does nothing** (§12.4) before it is accepted — SITE-106 records the verdict.

**SITE-EVAL-070 · `rescheduled` is displayed, never recorded** · `AUTO`
*Risk* A blanket ban reads as "the word is forbidden" and a blanket permission reads as "it is a sixth outcome." Both are wrong, and the previous wording was the first.
*Pass* No rendered **recorded** outcome is ever `rescheduled` — the recorded set is exactly `complete · partial · missed · cancelled_intentionally · unknown`. `rescheduled` may appear only as a **derived display state** for an occurrence that was moved and is unresolved, and a resolution always wins: moved then completed renders `complete`. **`pending` never appears at all.**
*Fail* `rescheduled` listed alongside the five as something the system records · any appearance of `pending` · a moved-then-completed occurrence rendering as `rescheduled`.
*Stub check* Passes trivially if no occurrence is rendered — the assertion must require a moved occurrence and a resolved one to exist.
*PRD* v7.3 §6.3 · *Issues* SITE-028, SITE-030, SITE-104

**SITE-EVAL-071 · No claim without a working capability — DS-18** · `AUTO` `VIS`
*Risk* The failure this whole PRD exists to stop: copy written from the app PRD's inventory rather than from a device.
*Pass* Every §2 Block 1 line, every §3 line, and every FAQ answer describing app behavior resolves a verdict row naming the capability, the date verified, and the verifying issue. **A PRD line is not evidence**, and a verdict citing one fails.
*Fail* Any such line with no verdict row, or with a verdict whose evidence is a specification.
*Stub check* Passes trivially against zero claims — the assertion must enumerate the rendered claims and require the count to be non-zero.
*PRD* v7.3 §12.1 DS-18, §0.1 · *Issues* SITE-090, SITE-093, SITE-095, SITE-108

**SITE-EVAL-072 · Roadmap entries are owned and undated — DS-18a** · `AUTO`
*Risk* Block 2 becomes a feature carousel with soft dates, which is the ban list arriving by the side door.
*Pass* Every Block 2 entry names a real owning issue, states **no date, quarter, or "soon"**, and appears only in Block 2 — never in the hero, FAQ, §3, share card, or metadata. Nothing post-V1 appears at all.
*Fail* An entry with no owning issue · any date form · a Block 2 capability named in present tense anywhere else.
*Stub check* Passes trivially on an empty Block 2 — the assertion must require the five specified entries to be present.
*PRD* v7.3 §12.1 DS-18a, §10 · *Issues* SITE-091

**SITE-EVAL-073 · The status section is dated and current — DS-18b** · `AUTO` `VIS`
*Risk* §2 goes stale silently, which is worse than having no §2 — a dated lie is more convincing than an undated one.
*Pass* §2 renders a visible date sourced from a **committed constant**, not a runtime clock. A change to what is true moves the line between blocks **in the same commit**.
*Fail* The date derived from `now()` · a Block 1 line whose verdict has gone false · a Block 2 entry that has landed and not moved.
*Stub check* A self-dating section always passes freshness; the assertion must prove the date is a build-time constant.
*PRD* v7.3 §12.1 DS-18b, §3.3 · *Issues* SITE-089, SITE-108

**SITE-EVAL-074 · No depicted Baseline UI names an app** · `AUTO`
*Risk* v5 through v7.2 specified the gate object as `Instagram, TikTok blocked · 6:00–7:30am` — a UI state the app is structurally incapable of producing, because Screen Time returns opaque tokens. It would have shipped a screenshot of something that cannot exist.
*Pass* The assembled gate object renders **a count and a window**, `3 apps · 6:00–7:30am`. No app name appears in any depicted Baseline UI — builder object, share card, §2, FAQ, metadata, or any future section. The Protect step's named chips are the site's own input affordance and legitimately carry names; **no chip name survives into the object**.
*Fail* Any app name in a rendered Baseline surface, at any width, in any state.
*Stub check* Passes trivially with no gate rendered and on an empty app-name list — the assertion must require an assembled gate, and the list must ship non-empty (SITE-107).
*PRD* v7.3 §6.3a, §10 MUST · *Issues* SITE-039, SITE-040, SITE-107

**SITE-EVAL-075 · Input classification is deterministic and pre-generation** · `AUTO`
*Risk* Garbage reaches `/api/plan`, or a class is assigned by the model.
*Pass* All seven classes — `empty · unreadable · out_of_scope · vague · multi_goal · bounded · actionable` — assigned identically client and server across the fixture suite. **Zero network requests** for `empty` and `unreadable`. No class originates from model output.
*Fail* Any client/server divergence · any fetch on unusable input · a class derived from a generated field.
*Stub check* A classifier returning one constant passes a weak parity test; the assertion must require every class to be exercised.
*PRD* v7.3 §6.4, §4 · *Issues* SITE-102

**SITE-EVAL-076 · The clarification beat asks once** · `AUTO` `VIS`
*Risk* One question becomes a form, or a blocked build behind an unanswered question.
*Pass* `vague` input raises **exactly one** question per session, enforced in the state machine rather than the UI. A second `vague` submission raises none. The build proceeds within **8s** with the answer withheld.
*Fail* A second question in one session · a build blocked past 8s · a question raised by anything other than the `vague` class.
*Stub check* Passes trivially if no question is ever raised — the assertion must require the first question to appear.
*PRD* v7.3 §6.4 · *Issues* SITE-103

**SITE-EVAL-077 · "Is this finished?" — Q4** · `FTU`
*Risk* §2 reads as a finished product's marketing and the participant expects something that does not exist yet.
*Pass* **5/6** recognise it as an early beta with things still being built.
*Fail* A participant who thinks the product is complete. This is a comprehension failure in the safer direction than the reverse, and still a failure — it means §2 failed.
*Stub check* n/a — `FTU`, judged by a human and recorded, never inferred.
*PRD* v7.3 §12.2 Q4 · *Issues* SITE-061, SITE-089, SITE-091

**SITE-EVAL-078 · Every eval fails against a stub — §12.4** · `AUTO`
*Risk* The standing rule stays a paragraph. An eval suite that has never been run against nothing is a suite of unknown value.
*Pass* Every eval carries a `*Stub check*` line stating how it fails against a stub that does nothing, enforced by `scripts/check-eval-stubs.mjs` in CI rather than at review. Every **implemented** automated eval additionally has a recorded stub result.

**All three named exposures are rewritten, not recorded as non-exposures.** SITE-EVAL-021 — *"all validate"* passed on zero requests; now asserts 30 responses and ≥8 clarification fields before any property. SITE-EVAL-027 — passed on presence-of-render; now asserts each scenario's specific object set and that no two scenarios share an object-type multiset. SITE-EVAL-037 — passed on an empty stream; now asserts the expected event count before ordering. **The eval definitions are rewritten here; the implementations belong to their owning issues** (SITE-030/031, SITE-028, SITE-050), per SITE-106's non-goal.
*Fail* Any eval accepted with no stub result · any eval that passes against the stub and is kept as written.
*Stub check* This eval is the stub check. Its own failure mode is passing when the suite is empty, so it asserts a non-zero eval count.
*PRD* v7.3 §12.4, §0.3 · *Issues* SITE-106

**SITE-EVAL-079 · The generated clarification question** · `AUTO`
*Risk* §6.4's ruling moved the clarification beat from authored copy to model output. Model output inherits every constraint model output carries, and a generated field with no eval is exactly what §0 exists to stop. The specific danger is not a bad question — it is a question that fails one of the five constraints and renders anyway, or a fallback that fires visibly and leaves the beat looking broken.
*Steps* Drive the beat with **at least 25 `vague` fixtures** spanning short, long, multi-clause and unanticipated phrasings. Then force each failure mode separately: each of the five constraints violated in turn, a timeout, and the spend cap.
*Pass* Every rendered question satisfies all five §6.4 constraints — **under 90 characters · exactly three options, each under 24 · every option answerable by tapping, none requiring typed input · no preamble · ends in a question mark**. Each of the seven forced failures lands on the **authored** question set, **silently**: no user-visible error, no dead state, no spinner, and free text still available. Classification is unchanged across every fixture — the model never moved an input into or out of `vague`. Never more than one question per session on any path.
*Fail* A question rendered while violating any constraint · a validation failure that reaches the user as an error or an empty beat · a fallback that discards a valid title or window alongside the question (§6.5: the three fields fall back independently) · any second clarification in one session · any copy other than the question and its options originating from the model.
*Stub check* An implementation that renders **no** clarification beat at all would pass a bare "every rendered question is valid" assertion vacuously. So this eval asserts **counts first**: ≥25 questions rendered across the fixture set, and exactly 7 fallbacks observed across the 7 forced failures. A stub that does nothing fails on both counts before any property is examined.
*PRD* v7.3 §6.4, §6.5, §12.4 · *Issues* SITE-030, SITE-031, SITE-102, SITE-103

---

## P0 VALIDATION GATE PROTOCOL

**Runs once, at SITE-060 and SITE-061. P1 does not begin until it passes.**

### Recruitment
At least **six** participants — the PRD requires five as a floor; six allows one dropout. None have seen Baseline or heard it described. **Two on mobile, four on desktop.** No product introduction beyond *"this is a website, use it."*

### Session protocol
1. **Silent observation**, screen recorded, until they reach the wall or stop. No prompting, no hints, no answering questions about what things do.
2. Record: time to first submit · time to first tune · whether they tuned unprompted · whether they selected protection unprompted · whether they pressed Activate · every hesitation over 5 seconds.
3. **Before showing any marketing section**, ask SITE-EVAL-001: *"What do you think Baseline does?"*
4. Ask SITE-EVAL-034: *"What would you have expected to happen when you pressed Activate?"*
5. Ask SITE-EVAL-002: *"How is this different from writing your goal in a notes app?"*
6. Ask: *"Was there anything you wanted to change that you couldn't?"*

### Comprehension rubric
Score each answer 0–4 on concepts present: (a) I tell it what I want · (b) it turns that into a plan or system · (c) it structures the actual execution · (d) it can protect or adapt.
**Pass = 3 or 4.**

### Objective thresholds

| Measure | Threshold |
|---|---|
| Reach the wall unprompted | **5 of 6** |
| Tune without being told | **4 of 6** |
| Comprehension score ≥3 | **5 of 6** |
| Understand why the site stops at the wall | **5 of 6** |
| System time to tunable plan, p95 | **≤5s** |
| Sessions with a dead or confusing state | **0 of 6** |

### Failure handling
A failed gate opens builder revision issues and the study reruns with new participants. **Thresholds are never lowered, and P1 never starts early.** Per K-5, a comprehension failure is fixed by redesigning the interaction, not by adding explanatory copy.

---

## CROSS-ARTIFACT RECONCILIATION

Every P0 PRD requirement was checked against the decomposition, and every meaningful acceptance criterion against these evals.

### Gaps found and closed

| Gap | Resolution |
|---|---|
| DS-9 ("understood without explanatory copy") had no owning issue | Covered by SITE-EVAL-006 and the gate; enforced by K-5 in SITE-061 |
| §21 share-card contents had no verification | SITE-EVAL — folded into SITE-048 acceptance; card element presence is unit-tested |
| §10.2 Peak guardrail had no eval | SITE-EVAL-040 added, with K-1 as the consequence |
| §6 "no parallel plan logic" was stated but unverifiable | SITE-EVAL-063 added as a static-analysis check |
| §4 "LLM wording must not move dates" had no test | SITE-EVAL-030 added |
| §17 K-2 and K-3 had no triggering measurement | Bound to SITE-EVAL-054 and SITE-EVAL-062 respectively |
| Contrast of 11px `--bone-38` metadata unaddressed anywhere | SITE-EVAL-049 added |

### Requirements that resist clean verification

1. **§7.3 "reads machined, not photographed"** — irreducibly subjective. Handled as a `VIS` review against the §19 scene bans rather than a metric. Recorded verdict, not inferred.
2. **§7.6 the hidden B** — "genuinely findable" cannot be quantified without an eye-tracking study that isn't worth its cost. P2, so it blocks nothing.
3. **§14 "technical drawing" typography concept** — verified only through visual review; no automatable proxy exists.
4. **§10.2 tier segmentation** requires ≥1000 sessions per tier and therefore cannot gate launch. It is a post-launch instrument.

### Evals with no implementation owner

None remaining. Every eval names at least one decomposition issue.

### DS criteria — the range is withdrawn, not pending

**The demo success criteria are DS-1 … DS-10, plus DS-18, DS-18a and DS-18b. There are no
others.** PRE-1 Part B was scoped to add *"evals for DS-15 through DS-18"*; DS-18, DS-18a and
DS-18b are defined in v7.3 §12.1 and their evals are written above (SITE-EVAL-071, 072, 073).

**DS-11 through DS-17 are a reference to nothing** — no artifact in this repository, and no
superseded PRD in git history, ever states them. v5 defines DS-1…DS-10 and stops. PRD v7.3
§12.1 previously opened with *"DS-1…DS-17 stand"*; **that line is withdrawn in the PRD
itself**, because it cited eleven gates of which seven were never written. DS-15 and DS-16
appeared only as citations (DS-15 at §6.6 and §12.3 for the contracts drift guard, DS-16 in v7.2
as forbidding unbacked claims) and DS-17 only as a range endpoint — **a citation is not a
definition.**

**Every citation of DS-15 is struck (ruled 2026-09-19, Kian)** — from PRD §12.3, from SITE-004's
`*PRD*` line, and from `CLAUDE.md` §2. A citation to a withdrawn gate is worse than none: a
reader follows it, finds nothing, and cannot tell whether the check is unjustified or the
definition is missing. The drift check itself is unaffected and keeps its own justification.

**No eval was written for DS-15, DS-16 or DS-17, and none should be until they are defined.**
Inferring a gate's definition from a citation would produce a gate verified against nothing —
the §0.3 failure in its purest form. **Nothing may be gated on DS-11 through DS-17**: a gate
with no definition cannot be failed, which makes it worse than absent, because it reads as
passed. If the intent behind DS-15 or DS-16 matters, they are re-authored as new criteria in
the PRD — never reconstructed here.

### Issues with no meaningful verification

None. Every issue carries acceptance criteria, and every experiential issue carries `VIS` verification at 1440px and 375px per its purpose.
