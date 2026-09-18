# resetbaseline.com — Site Evals v1

Verification truth, derived from `docs/site-prd-v7.2.md` and `docs/site-linear-decomposition-v1.md`. Where artifacts conflict, the PRD wins, then the decomposition, then this document.

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
*PRD* §18.3 · *Issues* SITE-061

**SITE-EVAL-002 · Differentiation from a recording tool** · `FTU`
*Risk* Users read Baseline as another place to write goals down.
*Pre* As 001.
*Steps* Ask: *"How is this different from writing your goal in a notes app?"*
*Expected* Some articulation that Baseline produced the structure rather than storing the text.
*Pass* Participant references the plan, schedule, dates, or protection as something the system made — not something they made.
*Fail* "It looks nicer" · "It's the same but with AI" · inability to distinguish.
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
*PRD* §2 DS-3, §3.1 · *Issues* SITE-032, SITE-050, SITE-060

**SITE-EVAL-004 · Zero-scroll path to plan** · `VIS`
*Risk* The plan lands below the fold and mobile visitors never see it.
*Pre* Fresh load, no scroll input.
*Steps* At 375×667, 375×812, and 1440×900: submit a goal, observe.
*Expected* Plan visible without any scroll gesture.
*Pass* All three viewports.
*Fail* Any viewport requiring scroll to see the first occurrence mark.
*PRD* §2 DS-1, §9 · *Issues* SITE-053, SITE-056

**SITE-EVAL-005 · Definition of a meaningful plan** · `AUTO`
*Risk* "Plan generated" fires on something that isn't a plan.
*Pre* —
*Steps* Assert the plan object at `plan_ready`.
*Expected* A meaningful plan contains: a commitment with a title, a recurrence rule, **at least 3 dated occurrences**, and either a timer or a gate. A deadline is optional.
*Pass* Every `plan_generated` event corresponds to a plan meeting that definition.
*Fail* Any empty, occurrence-less, or commitment-less plan reaching `plan_ready`.
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
*PRD* §3.4 · *Issues* SITE-015, SITE-016, SITE-061

**SITE-EVAL-007 · Frame renders complete and empty at t=0** · `AUTO`
*Risk* A spinner or skeleton appears, breaking DS-10.
*Pre* Network blocked entirely.
*Steps* Submit. Snapshot the DOM at 0ms and 50ms.
*Expected* Full `YOU SAID` / `BASELINE BUILT` frame present, unfilled rows showing `—`.
*Pass* Frame present at both snapshots. **Zero elements matching spinner/skeleton/shimmer selectors anywhere in the builder.**
*Fail* Any loading indicator, any empty container, any layout shift on fill.
*PRD* §2 DS-10, §3.4 · *Issues* SITE-015

**SITE-EVAL-008 · Pre-submit deadline materialization** · `AUTO` `VIS`
*Risk* The highest-perceived-quality detail silently regresses.
*Pre* —
*Steps* Type "finish my thesis by May" character by character. Monitor network.
*Expected* Deadline field fills before submit.
*Pass* Field populated with zero network requests during typing.
*Fail* Any fetch during typing, or deadline appearing only post-submit.
*PRD* §3.3 · *Issues* SITE-013, SITE-019

---

## D. Builder interaction quality

**SITE-EVAL-009 · Goal entry** · `VIS`
*Risk* The input reads as a generic chat box, undermining differentiation.
*Steps* Load at 1440px and 375px. Observe idle, focus, filled, and disabled states.
*Pass* Reviewer confirms: primary action is unambiguous · focus state clearly visible · **does not read as a ChatGPT-style centered text box**.
*Fail* Centered composition · send-arrow iconography · placeholder implying open-ended conversation.
*PRD* §3.2, §14 · *Issues* SITE-008

**SITE-EVAL-010 · Chip breadth constraint** · `AUTO`
*Risk* Rotation shows three habit chips and the demo looks like a habit tracker.
*Steps* Simulate 1000 rotations.
*Expected* Every displayed set contains at least one of `back`, `thesis`, `lsat`.
*Pass* Zero violations in 1000 draws.
*Fail* Any all-habit set.
*PRD* §3.2, §5 · *Issues* SITE-011

**SITE-EVAL-011 · Chip interaction** · `AUTO` `VIS`
*Risk* Chips fill the input but obstruct extension.
*Steps* Click a chip. Inspect focus and caret. Then type.
*Pass* Input focused, caret at end, typed characters append. Rotation permanently stopped.
*Fail* Caret at start · input unfocused · rotation resumes.
*PRD* §3.2 · *Issues* SITE-010, SITE-011

**SITE-EVAL-012 · Autotype never submits** · `AUTO`
*Risk* The demo runs itself and the visitor never acts.
*Steps* Load and wait 60s untouched.
*Pass* Input typed once, then idle. **No submit occurs. No plan appears.**
*Fail* Any automatic submission or auto-generated plan.
*PRD* §3.2 · *Issues* SITE-009

**SITE-EVAL-013 · Tune discoverability and effect** · `FTU` `AUTO`
*Risk* Users never tune, and the ownership moment is lost.
*Steps* FTU: observe whether the participant tunes unprompted within 60s of plan appearing. AUTO: measure 50 tune operations.
*Pass* **4 of 6 participants tune unprompted.** Every operation completes in **< 400ms with zero network requests**.
*Fail* Tune requiring instruction · any network call · any operation > 400ms.
*PRD* §2 DS-4, §3.6, §4 · *Issues* SITE-037, SITE-061

**SITE-EVAL-014 · Protect implies no browser capability** · `AUTO` `VIS`
*Risk* The site implies it can block apps, violating DS-8.
*Steps* Audit all copy in the protect step and gate card against a banned-implication list ("blocked", "now active", "protection on", "enabled").
*Pass* Zero implications of active enforcement anywhere before the wall.
*Fail* Any copy or state suggesting protection is running.
*PRD* §2 DS-8, §3.7 · *Issues* SITE-041

**SITE-EVAL-015 · Activate is deliberate** · `VIS`
*Risk* Users hit the wall accidentally and it reads as a trap.
*Steps* Observe six sessions to the wall.
*Pass* Every participant reached the wall by pressing Activate, and can say what they pressed.
*Fail* Any participant surprised by the wall's appearance.
*PRD* §11.1 · *Issues* SITE-042, SITE-061

---

## E. Motion quality

**SITE-EVAL-016 · Controls enable before animation completes** · `AUTO`
*Risk* Cinematic sequencing delays interaction.
*Steps* Submit, then attempt a tune interaction at 200ms after occurrence data exists.
*Pass* Interaction accepted and processed. Fan-out interruptible with no orphaned state.
*Fail* Controls disabled until animation finishes.
*PRD* §3.1, §8.2, §17 K-4 · *Issues* SITE-025

**SITE-EVAL-017 · Settling spring is exclusive** · `AUTO`
*Risk* The signature erodes across the build until nothing is signature.
*Steps* Static analysis of every consumer of the spring primitive.
*Pass* **Only structure-landing components import it.** Lint rule fires on any other import.
*Fail* Section headers, the wall, chips, or refusals using it.
*PRD* §8.1 · *Issues* SITE-024

**SITE-EVAL-018 · Refusals read as stopping** · `VIS` `AUTO`
*Risk* A refusal animated like a product beat reads as output, not judgment.
*Steps* Trigger the `back` scenario. Inspect motion config.
*Pass* Opacity-only, 300ms, no spring, `--veto` rule, 400ms hold. Reviewer confirms it reads as the system declining.
*Fail* Any spring or scale on the refusal element.
*PRD* §8.2, §3.4 · *Issues* SITE-018

**SITE-EVAL-019 · Motion does not read as decorative AI-site animation** · `VIS`
*Risk* The site pattern-matches to generated landing pages.
*Steps* Full-page review at 1440px and 375px.
*Pass* Reviewer confirms: no fade-and-slide-up on every section · no stagger on non-sequential content · no hover lift · every animation either communicates state change or carries product meaning.
*Fail* Any decorative motion that survives the question "what does this tell the user?"
*PRD* §8.2, §19, §17 K-4 · *Issues* SITE-025, SITE-072

**SITE-EVAL-020 · Reduced motion comprehension** · `VIS` `FTU`
*Risk* The demo is only legible in motion.
*Steps* Enable `prefers-reduced-motion`. Complete the full loop at both widths.
*Pass* **Full loop completable and fully comprehensible with zero animation.** No autotype, no sweep, static grain, camera snaps.
*Fail* Any state only reachable or only understandable through animation.
*PRD* §8.3, §18.2 · *Issues* SITE-006, SITE-009, SITE-071

---

## F. GeneratedProvider

**SITE-EVAL-021 · Valid response path** · `AUTO`
*Steps* 30 varied inputs through `/api/plan`.
*Pass* All validate; commitment title ≤48 chars; window from the closed set; **no other field originates from the model**.
*Fail* Any model-authored date, count, tier, refusal, or copy string.
*PRD* §4, §12 · *Issues* SITE-030, SITE-031

**SITE-EVAL-022 · Malformed response** · `AUTO`
*Steps* Inject 20 malformed fixtures — truncated JSON, extra fields, wrong enums, missing required, wrong types.
*Pass* All rejected at validation; `plan_generation_fallback` fires with `invalid_schema`; a complete plan still appears.
*Fail* Any coercion, repair, or partial acceptance.
*PRD* §12 · *Issues* SITE-031, SITE-033

**SITE-EVAL-023 · Timeout** · `AUTO` `VIS`
*Steps* Stub the route to 4001ms.
*Pass* Request aborts at 4000ms · fallback engages · **no dead spinner** · post-abort response cannot mutate state.
*Fail* Any wait beyond 4s, or late response overwriting fallback state.
*PRD* §12, §2 DS-7, DS-10 · *Issues* SITE-032, SITE-033

**SITE-EVAL-024 · Network failure** · `AUTO` `VIS`
*Steps* Block `/api/plan` at the network layer.
*Pass* Full loop completes via `StaticProvider`. Visitor sees a complete plan with their own words in `YOU SAID`.
*Fail* Any error message, any blocked step.
*PRD* §2 DS-7, §12 · *Issues* SITE-029, SITE-033

**SITE-EVAL-025 · Bounded-domain request** · `AUTO` `VIS`
*Steps* Submit each of five bounded-domain inputs.
*Pass* Deterministic classifier fires; authored refusal renders; built-instead structure appears. **Model output cannot suppress the refusal.**
*Fail* Any generated refusal text · any de-escalation from bounded to ordinary.
*PRD* §3.4, §4 · *Issues* SITE-014, SITE-017, SITE-018, SITE-033

**SITE-EVAL-026 · Rate limit and spend cap** · `AUTO`
*Steps* Exceed 5/hr/IP, then trip the daily cap, then flip the kill switch.
*Pass* Each routes to `StaticProvider` with the correct `plan_generation_fallback` reason. Kill switch effective without redeploy.
*Fail* Any user-visible error, any blocked demo.
*PRD* §12 · *Issues* SITE-034, SITE-033

---

## G. StaticProvider

**SITE-EVAL-027 · Authored scenarios demonstrate distinct behaviors** · `VIS` `AUTO`
*Risk* Five scenarios that all look like the same habit demo.
*Steps* Run all five end to end.
*Pass* Each visibly demonstrates its assigned behavior — `thesis` grounded-only refusal and long horizon · `gym` contention veto and anti-streak · `lsat` timer and explicit gate · `mornings` gate-first · `back` bounded refusal then process. All five validate against contracts.
*Fail* Two scenarios indistinguishable in output shape.
*PRD* §5 · *Issues* SITE-028

**SITE-EVAL-028 · Compelling without an LLM** · `VIS` `FTU`
*Risk* The fallback is technically functional and experientially dead.
*Steps* Disable generation entirely. Run 001 and 006 against the static-only build.
*Pass* **Comprehension results are statistically indistinguishable from the generated build.** Raw intent preserved verbatim in `YOU SAID`.
*Fail* Participants noticing the plan doesn't match what they typed.
*PRD* §5, §12, §2 DS-7 · *Issues* SITE-029

---

## H. Determinism

**SITE-EVAL-029 · Recurrence and occurrence math** · `AUTO`
*Steps* 40+ fixtures: weekday counts, DST both directions, month boundaries, leap year, every closed-set rule.
*Pass* Weekdays over 14 days = exactly 10. All fixtures exact.
*Fail* Any off-by-one, any DST drift.
*PRD* §4 · *Issues* SITE-023

**SITE-EVAL-030 · LLM wording does not move dates** · `AUTO`
*Steps* Feed 20 semantically identical inputs with varied phrasing. Compare resulting occurrence sets.
*Pass* **Identical dates and counts across all 20.** Only commitment title varies.
*Fail* Any variance in dates, counts, tiers, or recurrence.
*PRD* §4 · *Issues* SITE-023, SITE-030

**SITE-EVAL-031 · Authority tiers are contract-derived** · `AUTO`
*Steps* Assert tier for every object type across all scenarios.
*Pass* Tier is a pure function of object type. **Gate always `explicit`.** No model input reaches tier assignment.
*Fail* Any tier passed through from generation.
*PRD* §4 · *Issues* SITE-026, SITE-040

**SITE-EVAL-032 · Tuning is fully local** · `AUTO`
*Steps* Perform 50 tune operations with network monitoring.
*Pass* **Zero network requests. Zero LLM calls.** Same input always produces the same occurrence set.
*Fail* Any request, any nondeterminism.
*PRD* §4, §3.6 · *Issues* SITE-037

---

## I. Activation wall

**SITE-EVAL-033 · Wall is unreachable except by activation** · `AUTO`
*Steps* Exhaustively attempt: 10-minute idle, full page scroll, section entry, exit-intent gesture, 50 interactions, direct state manipulation.
*Pass* **`walled` unreachable by every path except an Activate press.**
*Fail* Any alternate path.
*PRD* §11.1 · *Issues* SITE-012, SITE-042

**SITE-EVAL-034 · Wall is honest** · `AUTO` `VIS` `FTU`
*Steps* Press Activate. Inspect all rendered copy and state. Then ask: *"What would you have expected to happen?"*
*Pass* No "activated" state exists anywhere. Participant understands **why** the site stops — gates need the phone.
*Fail* Any fake success · participant describing it as "a signup wall" or "they want my email."
*PRD* §11.2, §11.3, §2 DS-8 · *Issues* SITE-043, SITE-061

**SITE-EVAL-035 · Plan preserved and dismissible** · `AUTO` `VIS`
*Steps* Reach the wall, inspect, dismiss, then tune and protect again.
*Pass* Plan visible behind 40% dim · dismissal returns full interactivity · pinned save bar persists · wall re-reachable only by another Activate.
*Fail* Plan hidden · trapped state · re-prompt on scroll or exit intent.
*PRD* §11.3 · *Issues* SITE-043, SITE-047

**SITE-EVAL-036 · Terminal action branches** · `AUTO` `VIS`
*Steps* Set config to each of `waitlist`, `testflight`, `appstore`.
*Pass* All three render and submit correctly with no code change. Capture records `terminal_action`.
*Fail* Any branch unbuilt or hardcoded.
*PRD* §11.4 · *Issues* SITE-045, SITE-046

---

## J. Conversion funnel

**SITE-EVAL-037 · Full event sequence** · `ANLY` `AUTO`
*Steps* One complete manual loop; assert the event stream.
*Expected* `hero_view → builder_engaged → goal_input_started → goal_submitted → plan_generated → plan_tuned → protect_started → protect_selected → activation_attempted → wall_reached → email_submitted → share_card_created`, plus `suggestion_selected` where applicable.
*Pass* Sequence complete and ordered, all properties per §10.
*Fail* Missing event, wrong property, out-of-order emission.
*PRD* §10 · *Issues* SITE-050

**SITE-EVAL-038 · Branch and fallback events** · `ANLY` `AUTO`
*Steps* Force each of five generation failures; dismiss the wall.
*Pass* `plan_generation_fallback` fires with the correct reason each time; `wall_dismissed` fires with `dwell_ms`.
*Fail* Silent fallback with no event.
*PRD* §10 · *Issues* SITE-033, SITE-050

**SITE-EVAL-039 · No sensitive free-form text in analytics** · `AUTO`
*Steps* Submit a goal containing a person's name, a place, and a health term. Capture all analytics payloads.
*Pass* **No payload contains any substring of the user's input.** Attaching `raw_goal` fails at compile time.
*Fail* Any free-form text in any event.
*PRD* §10, §18.2 · *Issues* SITE-051

**SITE-EVAL-040 · Peak does not suppress engagement** · `ANLY`
*Risk* The Peak becomes a vanity interaction that costs conversion.
*Pre* P1 shipped, ≥1000 sessions per tier.
*Steps* Compare `hero_view → builder_engaged` and `plan_generated → wall_reached` across Tiers A/B and C/D.
*Pass* Tier A/B engagement **within 5% of, or above,** Tier C/D.
*Fail* Tier A/B materially lower — **K-1 fires and the Peak gets simplified.**
*PRD* §10.2, §17 K-1 · *Issues* SITE-052

---

## K. Mobile

**SITE-EVAL-041 · Full loop at 375px** · `VIS`
*Steps* Complete goal → plan → tune → protect → activate → wall → share on a real device.
*Pass* Every step completable. Screenshots captured at each.
*Fail* Any step requiring rotation, zoom, or desktop.
*PRD* §9 · *Issues* SITE-053

**SITE-EVAL-042 · Keyboard behavior** · `VIS`
*Steps* Focus the input on real iOS Safari. Type. Observe.
*Pass* Input **and at least three transformation rows** remain visible above the keyboard. Input never scrolls off-screen.
*Fail* Input obscured · content jumping · viewport not tracked.
*PRD* §9 · *Issues* SITE-054

**SITE-EVAL-043 · Chips and tune ergonomics** · `VIS` `AUTO`
*Steps* One-handed use at 375px. Automated target-size audit.
*Pass* Chips scroll horizontally with momentum, no wrap. All targets ≥44×44 (day pills ≥40×40). **No hover dependency anywhere.**
*Fail* Any undersized target · any hover-only affordance.
*PRD* §9 · *Issues* SITE-055, SITE-057

**SITE-EVAL-044 · Plan readability in limited height** · `VIS`
*Steps* 375×667 with keyboard closed and open.
*Pass* Occurrences collapse to next-5 + "and 5 more"; plan remains understandable; expansion works on tap.
*Fail* Plan illegible · horizontal scrolling of the plan.
*PRD* §9 · *Issues* SITE-056

**SITE-EVAL-045 · Wall on mobile** · `VIS`
*Steps* Reach the wall at 375px, keyboard open and dismissed.
*Pass* Bottom sheet, not centered modal · email field and submit visible with keyboard open · plan visible above · safe areas respected.
*Fail* Centered modal · obscured submit · content under the home indicator.
*PRD* §9, §11.3 · *Issues* SITE-044

**SITE-EVAL-046 · Overflow sweep** · `AUTO`
*Steps* Every builder state at 320/375/390/768/1440/1920.
*Pass* **Zero horizontal scroll in every state at every width.**
*Fail* Any overflow.
*PRD* §9, §18.2 · *Issues* SITE-005, SITE-057

---

## L. Accessibility and reduced motion

**SITE-EVAL-047 · Keyboard operability** · `AUTO` `VIS`
*Steps* Complete the full loop using keyboard only.
*Pass* Every control reachable and operable; visible focus throughout; **wall dismissible by keyboard**; logical tab order.
*Fail* Any keyboard trap · any unreachable control.
*PRD* §18.2 · *Issues* SITE-008, SITE-035, SITE-036, SITE-039, SITE-043

**SITE-EVAL-048 · Semantic controls and labels** · `AUTO`
*Steps* Automated a11y audit across all builder states.
*Pass* Native or correctly-roled controls · all inputs labeled · state changes announced.
*Fail* Div-buttons · unlabeled inputs · silent state changes.
*PRD* §18.2 · *Issues* SITE-035, SITE-036, SITE-039

**SITE-EVAL-049 · Contrast and non-color signaling** · `AUTO` `VIS`
*Steps* Contrast audit on `--bone-38` metadata, `--veto`, and lavender-on-void. Verify selection states.
*Pass* Body and interactive text meet AA. **No state conveyed by color alone** — selection, veto, and authority tier all carry a non-color signal.
*Fail* Metadata below AA · color-only selection state.
*PRD* §14, §18.2 · *Issues* SITE-002, SITE-003, SITE-039

**SITE-EVAL-050 · Reduced motion completeness** · `AUTO` `VIS`
*Steps* With reduced motion enabled, verify each §8.3 requirement individually.
*Pass* Sweep stopped · cursor authority off · grain static · camera snaps · no autotype · builder shows final states · Day 1→30 is a toggle.
*Fail* Any animation surviving the preference.
*PRD* §8.3 · *Issues* SITE-006, SITE-009, SITE-071, SITE-073

---

## M. Performance

**SITE-EVAL-051 · Load budgets** · `PERF` `AUTO`
*Steps* Lighthouse mobile in CI, throttled 4G.
*Pass* LCP ≤1.8s · CLS ≤0.05 · INP ≤200ms · **core ≤120KB gzip · scene ≤140KB gzip and excluded from first load** · Lighthouse mobile perf ≥90.
*Fail* Any budget exceeded — build fails.
*PRD* §16 · *Issues* SITE-076, SITE-078

**SITE-EVAL-052 · Headline is LCP** · `PERF` `AUTO`
*Steps* Inspect the LCP element with the Peak live.
*Pass* **LCP is the hero headline. The Peak is never in the LCP path** and initializes after on idle callback.
*Fail* Canvas or scene asset as LCP.
*PRD* §16 · *Issues* SITE-007, SITE-076

**SITE-EVAL-053 · Interaction latency** · `PERF` `AUTO`
*Steps* Measure tune, chip select, protect select, activate over 50 operations each.
*Pass* Tune < 400ms end to end. All others < 100ms to visible feedback.
*Fail* Any operation exceeding budget.
*PRD* §2 DS-4, §16 · *Issues* SITE-037

**SITE-EVAL-054 · Frame budgets** · `PERF`
*Steps* Measure on target hardware per tier during scroll and cursor movement.
*Pass* Tier A ≤8ms · Tier B ≤12ms on a real mid-range Android.
*Fail* Sustained breach — **K-2 fires and the offending post pass is removed.**
*PRD* §16, §17 K-2 · *Issues* SITE-077, SITE-079

---

## N. Degradation ladder

**SITE-EVAL-055 · Tier A full loop** · `VIS` — Desktop, WebGL2. Full Peak, cursor authority, full post chain. Loop completes; plan legible over the geometry. *PRD* §15 · *Issues* SITE-075

**SITE-EVAL-056 · Tier B full loop** · `VIS` `PERF` — Modern mobile. Half-res upscale, grain and bloom retained, aberration absent, auto-sweep only, plan via `FlatLayout`. Loop completes within frame budget. *PRD* §15 · *Issues* SITE-077

**SITE-EVAL-057 · Tier C full loop** · `VIS` — Static peak + CSS gradient. Loop completes; plan renders via `FlatLayout` or `StaticPeakLayout`. *PRD* §15 · *Issues* SITE-069, SITE-058

**SITE-EVAL-058 · Tier D full loop, WebGL disabled** · `AUTO` `VIS`
*Risk* The demo depends on the atmosphere it was explicitly designed to survive without.
*Steps* Disable WebGL entirely. Complete the loop at 375px and 1440px.
*Pass* **Full loop completes. Every builder function works. Plan is coherent and compelling.**
*Fail* Any degraded function, any broken layout, any missing step.
*PRD* §2 DS-6, §15 · *Issues* SITE-058, SITE-022

**SITE-EVAL-059 · Failure × tier matrix** · `AUTO` `VIS`
*Steps* Five generation failures × four tiers × two widths = 40 combinations.
*Pass* **Zero dead states, zero spinners, zero broken layouts.** Minimum twelve manually spot-checked and documented.
*Fail* Any combination producing an unrecoverable or empty state.
*PRD* §2 DS-6, DS-7, DS-10 · *Issues* SITE-059

---

## O. Peak evaluation — **runs only after the P0 gate passes**

**SITE-EVAL-060 · Silhouette recognition** · `FTU`
*Steps* Show the fold to three people who know the app icon, without telling them what to look for. Ask what they see.
*Pass* All three identify the Baseline mark within one second.
*Fail* Generic mountain · no recognition — **geometry is wrong (SITE-062).**
*PRD* §7.1 · *Issues* SITE-062

**SITE-EVAL-061 · Peak does not steal from Ask Baseline** · `FTU` `VIS`
*Risk* A visually impressive Peak that reduces product comprehension is a failed Peak.
*Steps* Run SITE-EVAL-001 against the Peak build and the flat build. Compare.
*Pass* **Comprehension scores on the Peak build are equal to or better than the flat build.** Participants engage the input first, not the background.
*Fail* Any comprehension drop, or participants describing the site as "a mountain website" — **K-1 fires.**
*PRD* §7, §10.2, §17 K-1, §18.3 · *Issues* SITE-062, SITE-068

**SITE-EVAL-062 · Plan legibility over geometry** · `VIS`
*Steps* Render all five scenarios with `ProjectedPeakLayout` at 1440px.
*Pass* Every occurrence date, label, and tier remains readable over every facet at every light angle.
*Fail* Any label lost against the surface — **K-3 fires and readability wins over geometric fidelity.**
*PRD* §6, §17 K-3 · *Issues* SITE-068, SITE-062

**SITE-EVAL-063 · Adapter swap changes no builder logic** · `AUTO`
*Steps* Static analysis of the builder module graph under `FlatLayout` and `ProjectedPeakLayout`.
*Pass* **Identical builder module graph.** Zero parallel plan logic.
*Fail* Any builder branch on layout type · any duplicated plan model.
*PRD* §6 · *Issues* SITE-068

**SITE-EVAL-064 · Scroll remains native** · `AUTO` `VIS`
*Steps* Import-ban check; scroll the full page on real iOS Safari.
*Pass* No Lenis or locomotive imports · no `preventDefault` on wheel or touchmove · momentum scroll feels native.
*Fail* Any interception.
*PRD* §7.5 · *Issues* SITE-070

---

## P. End-to-end canonical scenarios

Each runs the complete demo — goal → transformation → plan → tune → protect → activate → wall → share — at 1440px and 375px, on both the generated and the static path.

**SITE-EVAL-065 · `gym` — recurring physical goal** · `VIS` `AUTO`
*Pass* Contention veto fires on a colliding time · **no streak object is ever created** · upstream intervention proposed.
*PRD* §5 · *Issues* SITE-028, SITE-038

**SITE-EVAL-066 · `thesis` — project deadline** · `VIS` `AUTO`
*Pass* Deadline inferred from "by May" pre-submit · grounded-only refusal to outline unseen content · long-horizon occurrences with correct dates.
*PRD* §5 · *Issues* SITE-013, SITE-028

**SITE-EVAL-067 · `lsat` — studying / procrastination** · `VIS` `AUTO`
*Pass* Timer created with a real duration · gate at `explicit` · high-frequency recurrence expands correctly.
*PRD* §5 · *Issues* SITE-028, SITE-026

**SITE-EVAL-068 · `mornings` — routine / time-of-day failure** · `VIS` `AUTO`
*Pass* Gate is the primary object · protection precedes scheduling in the transformation block.
*PRD* §5 · *Issues* SITE-028, SITE-040

**SITE-EVAL-069 · `back` — bounded domain** · `VIS` `AUTO` `FTU`
*Pass* Authored refusal on the participant's own text · **zero programming or exercise advice generated** · process structure built instead. FTU: participant describes the refusal as trustworthy rather than unhelpful.
*Fail* Any generated medical or training guidance.
*PRD* §3.4, §4, §5 · *Issues* SITE-014, SITE-017, SITE-018, SITE-028

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

### Issues with no meaningful verification

None. Every issue carries acceptance criteria, and every experiential issue carries `VIS` verification at 1440px and 375px per its purpose.
