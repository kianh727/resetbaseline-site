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
| **Website P0 — Interactive Builder** | SP-01 … SP-11, **SP-17** | pending item 4 |
| **Website P1 — The Peak** | SP-12 … SP-15 | pending item 4 |
| **Website P2 — Signature Polish** | SP-16 | SITE-079 – SITE-084 |

**SP-17 is P0 despite its number.** Milestone numbering is append-only; phase is set by
the project a milestone sits in, never by its number. SP-17 sits in Website P0.

**Counts are pending PRE-1 item 4.** v7.3 moved §4 "What Baseline knows" from P0 to P1
held content, replaced §2 with a status section, cut "What's underneath" entirely,
promoted §3 "What it won't do" from P1 to P0, and added SP-17. DS-18 and §12.4 each need
an owning issue. P2 = 6 is firm. Do not populate Linear against any other figure.

Each milestone's description is the corresponding SP block from the decomposition verbatim — purpose, dependencies, entry, exit, PRD refs, non-goals.

### 1.2 Labels

`builder` · `peak` · `mobile` · `analytics` · `reliability` · `a11y` · `design-review`

Delete the orphan `site` label left by the failed session. Team membership scopes the work now.

---

## 2. Creation order — load-bearing

Linear auto-numbers issues on creation and does not zero-pad.

- **Create SITE-001 through SITE-084 in strict sequential order**, then SITE-085 through SITE-088 last.
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
*Accept* Reviewer answers yes to: **is this compelling with no LLM and no 3D?** Composition, hierarchy, and density reviewed at 1440px and 375px. Type scale verified against §14's technical-drawing intent.
*Failure* Opens revision issues in SP-04 and blocks SP-05 until resolved. If the flat version isn't convincing, nothing downstream rescues it.
*PRD* §6, §14, §2 DS-6 · *Label* `design-review`

**SITE-086 · Builder loop holistic review**
Project P0 · Milestone SP-09 · Blocks SITE-053 · Depends SITE-052
*Scope* Uninterrupted walkthrough of the complete loop — goal → transformation → plan → tune → protect → activate → wall → share — reviewed as one experience rather than as steps.
*Accept* Pacing, motion coherence, and copy tone reviewed end to end at both widths. **No step feels like a different product than the others.** Motion audited against §8: settling spring exclusive, no decorative animation surviving "what does this tell the user?"
*Failure* Opens revision issues before mobile work begins.
*PRD* §3, §8, §19 · *Label* `design-review`

**SITE-087 · Pre-gate composition review**
Project P0 · Milestone SP-11 · Blocks SITE-061 · Depends SITE-060
*Scope* Full-page review immediately before the user study, so participants see the intended article.
*Accept* No unresolved visual defects. §19 ban list clean. Both widths screenshotted and signed off.
*Failure* Blocks the user study. Running six participants against a half-finished build wastes the recruitment.
*PRD* §19, §2 · *Label* `design-review`

**SITE-088 · Peak integration review**
Project P1 · Milestone SP-14 · Blocks SITE-074 · Depends SITE-073
*Scope* Whole-site review with the Peak live.
*Accept* Reviewer answers yes to: **does this read as one designed thing, or as a builder sitting on top of a 3D scene?** Plan legibility over every facet at every light angle. Peak does not compete with the input for first attention.
*Failure* K-1 or K-3 fires — simplify the Peak or adjust geometry; plan readability wins.
*PRD* §7, §17 K-1/K-3, SITE-EVAL-061, SITE-EVAL-062 · *Label* `design-review`

**Total issues: 88 as the graph stands** — P0 = 64 · P1 = 18 · P2 = 6. **Pending, not final:** PRE-1 Part B adds issues and SP-17 carries its own (§1.1). Recount before the population run.

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
