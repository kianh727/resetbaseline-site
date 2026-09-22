# `contracts-manifest.json` — delivery spec

**For the `kianh727/baselinev1` session.** This is what the site needs in order to
start SITE-004, and where to put it. It is a request, not an instruction about how
the app should be built: nothing here asks the app to change anything it does.

> **Decided 2026-09-19 (Kian): the app session commits this file directly into
> `kianh727/resetbaseline-site`.** The site does not read the app tree. That keeps
> §2's boundary intact in both directions — the site consumes the contract
> vocabulary and never reaches into the repository that owns it.

## Path

```
contracts-manifest.json     ← repository root of kianh727/resetbaseline-site
```

## Shape

```json
{
  "captured_at": "2026-09-19T00:00:00Z",
  "app_commit_sha": "40-character SHA of the baselinev1 commit this was read from",
  "manifest": { }
}
```

Three fields, and the nesting is deliberate.

- **`manifest`** is `CONTRACT_MANIFEST` **verbatim** — the object exactly as the app
  defines it, unflattened, unreordered, nothing removed and nothing added. It is
  nested under its own key rather than spread across the top level so that
  *"verbatim"* stays literally checkable: the site can diff `manifest` against the
  app's object without the envelope's own keys colliding with the contract's.
- **`captured_at`** is an ISO-8601 UTC timestamp of when the manifest was read. The
  site's staleness check reads only this. **It is the capture time, not the commit
  time and not the file's mtime** — a re-commit that does not re-read the manifest
  must not refresh it, or the check silently measures the wrong thing.
- **`app_commit_sha`** is the commit the manifest was read from, so a future diff can
  say *which* app state the site was built against rather than only that it differs.

## One exclusion

**`artifact_divergences` must not be included** (PRD v7.3 §6.6). It records stale
counts (33, 72) against current counts (45, 76) **in the same object**, so anything
generated from it would be generated from two contradictory numbers. If it is part
of `CONTRACT_MANIFEST` upstream, leave it in — the site's generator refuses to read
it, which is the safer place for that rule to live. Just do not let it become the
source of any count the site renders.

## What the site does with it

- Generates its plan-model types at build time. Every `capability_type` needs a
  layout rule; **a type without one fails the site build** (PRD §6.2).
- Runs a staleness check on `captured_at` — **warns at 30 days, fails at 60** (§6.6).
- Eventually diffs against the manifest published to a stable path on `main`, once
  that exists. **That is wanted, not required**, and SITE-004 ships without it.

## What is not being asked for

No package, no `@baseline/contracts` import, no cross-repo build — all three are
rejected in §6.6. No app-repo change of any kind is required by this file. The
stable-path publication is a separate, non-blocking request that Kian is raising
app-side.
