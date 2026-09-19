# Site Execution Addendum v1

**Authoritative over `docs/site-linear-decomposition-v1.md` for everything in this file. Silent on everything else — the decomposition stands unchanged.**

Precedence: `site-prd-v7.3.md` → this addendum → `site-linear-decomposition-v1.md` → `site-evals-v1.md`

**This is a tooling change. Nothing about the website changes** — same product story, same interactive builder, same motion spec, same conversion strategy, same performance budgets, same acceptance criteria, same evals, same gates, same quality bar.

---

## 1. Linear structure

Claude's Linear connector authenticates one workspace at a time, and both the app and the site are in active development. A separate site workspace would mean reconnecting on every context switch. So both live in `baselineagent`, separated by team.

| | |
|---|---|
| Workspace | `baselineagent` (existing) |
| App team | `Baseline` / `BAS` — untouched |
| **Site team** | **`ResetBaseline Site` / key `SITE`** — new |
| App repo | `kianh727/baselinev1` |
| Site repo | `kianh727/resetbaseline-site` |

### 1.1 Projects and milestones

The SP-01…SP-16 decomposition is **fully preserved**. It becomes three projects with milestones rather than sixteen projects, plus SP-17.

Reason: milestones are ordered and show progress; projects are not ordered. The SP structure has always been a sequence. Three projects also make the P0 gate a visible state — the P1 project stays in Backlog until the P0 project is Completed — instead of a convention someone has to remember.

| Project | Milestones | Issues |
|---|---|---|
| **Website P0 — Interactive Builder** | SP-01 … SP-11, **SP-17** | SITE-001 – SITE-061, SITE-085 – 087, SITE-089 – SITE-108 |
| **Website P1 — The Peak** | SP-12 … SP-15 | SITE-062 – SITE-078, plus SITE-088 |
| **Website P2 — Signature Polish** | SP-16 | SITE-079 – SITE-084 |

**SP-17 is P0 despite its number.** Milestone numbering is append-only; phase is set by
the project a milestone sits in, never by its number. SP-17 sits in Website P0.

**Counts are final. PRE-1 item 4 is applied.** v7.3 moved §4 "What Baseline knows" from P0
to P1 held content, replaced §2 with a status section, cut "What's underneath" entirely,
promoted §3 "What it won't do" from P1 to P0, and added SP-17. Part B added **SITE-089 …
SITE-108** — twenty P0 issues — giving DS-18 and §12.4 their owning issues (SITE-108,
SITE-106) and PRE-2 its CI job (SITE-107). **Populate Linear against these figures.**

Each milestone's description is the corresponding SP block from the decomposition verbatim — purpose, dependencies, entry, exit, PRD refs, non-goals.

### 1.2 Labels

`builder` · `peak` · `mobile` · `analytics` · `reliability` · `a11y` · `design-review`

Delete the orphan `site` label left by the failed session. Team membership scopes the work now.

---

## 2. Creation order — load-bearing

Linear auto-numbers issues on creation and does not zero-pad.

- **Create SITE-001 through SITE-084 in strict sequential order**, then SITE-085 through SITE-088, then **SITE-089 through SITE-108** (PRE-1 Part B). Strict sequence throughout — the positional mapping holds for all 108.
- **Create nothing else on the `SITE` team first.** A single scratch issue offsets every subsequent number by one.
- Decomposition `SITE-001` maps to Linear `SITE-1`. `SITE-084` maps to `SITE-84`. The mapping is positional, not literal.
- **Set the team key to `SITE` before creating anything.** Linear derives the key from the team name — "ResetBaseline Site" will likely produce `RES`. Renaming a key after issues exist renumbers all of them.

The four review issues are numbered last so the original 84 keep 1:1 alignment. Their **position in the dependency graph**, not their number, determines when they run — see §3.

---

## 3. Design review gates — new

The decomposition verifies 84 units individually and never verifies the composition. A website's quality is emergent: every issue can pass its own criteria while the whole thing reads as mediocre. The PRD states this project has unusually high sensitivity to implementation quality, and nothing in the existing issue set acts on that.

**Each of these can reject work that already passed its individual gates.** That is the point.

**SITE-085 · Flat demo design review**
Project P0 · Milestone SP-04 · Blocks SITE-027 · Depends SITE-026
*Scope* Full review of the flat plan renderer as a standalone product demo, before any provider work.
*Accept* **Amended 2026-09-19 by PRD v7.3 §12.4a.** The criterion is no longer *"is this compelling?"* — every answer to that is defensible, so it cannot fail work. It is now: **does any part of this look like it came out of a generator?** The ten tells in §12.4a are each a yes/no; **any single yes rejects the work**, without weighing or counting. **The reviewer must not be the implementer and must not have watched the build** — **that reviewer is Kian** (ruled 2026-09-19); he sees reports, not the work, which satisfies both clauses. Composition, hierarchy, and density reviewed at 1440px and 375px. Type scale verified against §14's technical-drawing intent. §12.4a catches tells, not dullness — clearing it is not evidence the work is good.
*Accept, added 2026-09-19 by PRD v7.3 §6.3b.* **Six more questions on the same checklist**, same rule — each a yes/no, any single yes rejects, not weighed against the ten: does any band appear where there is no recurring window behind it · does any band read as climbing, tilting, tapering, or having an end · does lavender appear as fill anywhere · does any dark mark read as a gap, an absence, a miss, or a disabled control · does any element suggest the dark marks should be filled · **does any band draw itself in, grow, extend, or arrive.** The last is the motion half of the second, and is asked separately because a review of screenshots answers one and cannot answer the other. **The review set MUST include at least one frame where most marks are dark, and the output MUST state which frame carried the sparse case** — a set of full or near-full weeks cannot fail the last two questions, because the condition they measure never occurs, and the gate would report a pass it never tested.
*Failure* Opens revision issues in SP-04 and blocks SP-05 until resolved. If the flat version isn't convincing, nothing downstream rescues it.
*PRD* §6, §6.3b, §12.4a, §14, §2 DS-6 · *Label* `design-review`

**SITE-086 · Builder loop holistic review**
Project P0 · Milestone SP-09 · Blocks SITE-053 · Depends SITE-052
*Scope* Uninterrupted walkthrough of the complete loop — goal → transformation → plan → tune → protect → activate → wall → share — reviewed as one experience rather than as steps.
*Accept* Pacing, motion coherence, and copy tone reviewed end to end at both widths. **No step feels like a different product than the others.** Motion audited against §8: settling spring exclusive, no decorative animation surviving "what does this tell the user?"
*Failure* Opens revision issues before mobile work begins.
*PRD* §3, §8, §19 · *Label* `design-review`

**SITE-087 · Pre-gate composition review**
Project P0 · Milestone SP-11 · Blocks SITE-061 · Depends SITE-060
*Scope* Full-page review immediately before the user study, so participants see the intended article.
*Accept* No unresolved visual defects. §19 ban list clean. Both widths screenshotted and signed off. **PRD v7.3 §12.4a applies here in full** — the same **sixteen** questions (the ten tells plus §6.3b's six band-grammar questions, added 2026-09-19), the same any-single-yes rejection, the same sparse-frame requirement, and the same constraint that the reviewer is neither the implementer nor someone who watched the build — **that reviewer is Kian** (ruled 2026-09-19).
*Failure* Blocks the user study. Running six participants against a half-finished build wastes the recruitment.
*PRD* §19, §2 · *Label* `design-review`

**SITE-088 · Peak integration review**
Project P1 · Milestone SP-14 · Blocks SITE-074 · Depends SITE-073
*Scope* Whole-site review with the Peak live.
*Accept* Reviewer answers yes to: **does this read as one designed thing, or as a builder sitting on top of a 3D scene?** **PRD v7.3 §12.4a applies here in full** — the same **sixteen** questions (the ten tells plus §6.3b's six band-grammar questions, added 2026-09-19), the same any-single-yes rejection, the same sparse-frame requirement, and the same constraint that the reviewer is neither the implementer nor someone who watched the build — **that reviewer is Kian** (ruled 2026-09-19). Plan legibility over every facet at every light angle. Peak does not compete with the input for first attention.
*Failure* K-1 or K-3 fires — simplify the Peak or adjust geometry; plan readability wins.
*PRD* §7, §17 K-1/K-3, SITE-EVAL-061, SITE-EVAL-062 · *Label* `design-review`

**Total issues: 113.** P0 = 90 · P1 = 17 · P2 = 6. The original 84, plus the four design review gates (SITE-085…088), plus PRE-1 Part B's twenty (SITE-089…108), plus **SITE-109…113**, created 2026-09-19. SITE-109 is the copy pass from §15.4's ruling, which had been the only P0 work in the document specified as a person's name rather than as work. SITE-110 and SITE-111 own the builder's conditional copy and its five per-domain refusals, split by gate rather than by subject. SITE-112 and SITE-113 are PRD defects: §6.4 falls back to an authored question set written nowhere, and §6.4/§6.5 specify a deterministic recurrence-rule choice over a closed set no artifact enumerates.

**SITE-074 also moved P1 → P0** (SP-14 → SP-17) when it was re-scoped to the favicon set, which is why P0 is 86 rather than 85 and P1 is 17 rather than 18. Creation order is unchanged and still append-only: SITE-109 is the hundred-and-ninth issue created.

---

## 4. PR policy

**Issues and PRs are decoupled.** One issue per PR is not required.

Claude Code may implement **2–4 adjacent issues in a single PR** when they form one coherent surface — for example SITE-035/036/037 (both tune controls plus regeneration), or SITE-002/003 (tokens plus type scale).

Conditions:
- Every issue's acceptance criteria are verified **individually** and each issue is closed **individually**
- Issues in one PR must share a milestone
- **No design review issue is ever bundled** — SITE-085 through SITE-088 each stand alone
- No issue on the critical path is bundled with one off it

This preserves verification granularity while removing ceremony from twenty-minute units.

---

## 5. Cross-team dependency — the thing consolidation buys

SITE-004 no longer imports `@baseline/contracts` — it consumes `contracts-manifest.json` (PRD v7.3 §6.6), so the packaging question is resolved and is not gating this tree (decomposition open question 1). What remains is the drift check's primary mechanism, which needs the app repo to publish its manifest to a stable path on `main`.

Because both teams now share a workspace, this becomes a real link rather than a note:

1. Open a `BAS` issue: *"Publish `CONTRACT_MANIFEST` to a stable path on `main` for external consumers"* — describe the requirement, don't propose a mechanism.
2. Mark it as **related to SITE-004**, cross-team. It does **not** block SITE-004: the issue ships with the staleness fallback in §6.6 if the app-repo change doesn't land.
3. Surface it to Kian. **Do not resolve it independently and make no write toward `kianh727/baselinev1`.**

---

## 6. Pre-flight — before any Linear write

- [ ] Connector resolves to `baselineagent`; report the reachable workspace and team before writing
- [ ] `resetbaselinesite` workspace deleted or confirmed unused
- [ ] Orphan `site` label deleted
- [ ] Team `ResetBaseline Site` exists with key **`SITE`**, and is **empty**
- [ ] No `BAS-*` issue or app project modified at any point

---

## 7. Explicitly unchanged

The PRD in full. All 84 original issue scopes, acceptance criteria, tests, and verification requirements. The dependency graph of the original 84 issues. The four review gates in §3 add four new edges; the critical path has been re-walked and the original "longest chain" figure was stale. The P0 gate thresholds (5/6 wall, 4/6 tune, 5/6 comprehension) — **a failed gate revises the builder and never lowers the bar.** All 69 evals. Performance budgets. Motion spec. Copy and scene bans. Scope-kill rules K-1 through K-7. P2 blocking nothing.

**The builder is the product demo. The Peak is atmosphere. When they conflict, the builder wins.**
