# Cloudflare Pages — deployment

**Everything in this repository is ready. What remains is the Pages project,
which needs an account and is Kian's.** This is the exact sequence, with the
values to enter, and what to check afterwards.

SP-01's **Entry** criterion is the Pages project existing, and `SITE-001`'s
acceptance — *"`main` deploys automatically; PR previews resolve"* — is met by
step 2 finishing. It is not verifiable from a session, and **no deploy has been
fabricated**.

---

## 1. Create the project

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect
to Git** → `kianh727/resetbaseline-site`.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | *(leave empty)* |

**Node version** is set by an environment variable rather than a dropdown. Under
**Settings → Environment variables**, add to **both** Production and Preview:

```
NODE_VERSION = 22
```

Node 22 is not optional: the build scripts are TypeScript run directly through
native type stripping, which is the standing mechanism for this repository
(`CLAUDE.md` §7). On Node 20 the build fails at `scripts/build-assets.ts`.

**Framework preset must be None.** The Next.js preset runs `@cloudflare/next-on-pages`,
which builds for the Workers runtime and expects a server. This site is
`output: 'export'` — a static export plus Pages Functions — and the preset would
replace that with something else.

## 2. First deploy

Push to `main`, or hit **Retry deployment**. The build log should end with
roughly:

```
assets: og.png, favicon.svg, favicon-32.png, apple-touch-icon.png, robots.txt, sitemap.xml, site.webmanifest (4 routes)
headers: _headers written with 37 inline-script hashes.
```

If the hash line is missing, `_headers` was not written and **the site will ship
without a Content-Security-Policy**. That is a failed deploy, not a warning.

PR previews resolve automatically once the project exists; nothing else is
needed for them.

## 3. Secrets, when generation is switched on

**The site works without any of these.** With no API key the plan is built
deterministically client-side and `/api/plan` serves the static path — which is
DS-7's requirement rather than a degraded mode, and is the state every preview
deploy runs in.

Under **Settings → Environment variables**, Production only:

| Name | Type | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Secret** (encrypted) | Never a plaintext variable. Nothing in this repository holds a value. |
| `GENERATION_ENABLED` | Plaintext | `false` is the kill switch. Any other value, or absent, means on. |
| `DAILY_CAP_CENTS` | Plaintext | Defaults to `500`. |

`GENERATION_ENABLED` is read **per request**, so flipping it in the dashboard
takes effect without a redeploy — which is `SITE-034`'s accept criterion.

**Leave the key off Preview.** A preview URL is world-readable and a key on it
is a key on the internet.

## 4. Functions

`functions/api/plan.ts` is picked up automatically: Pages routes `functions/**`
by path, so it serves `/api/plan` with no configuration. Nothing to enable.

**One limitation, stated because it is real and not obvious.** A Pages Function
runs in isolates that do not share memory, so the in-memory rate-limit log and
spend ledger bound *one isolate* rather than the site. `RequestLog` and
`SpendLedger` are interfaces for exactly this reason — KV-backed implementations
drop in without touching the handler. **Until they do, the daily cap is the
load-bearing control**, since it is checked against the same store the spend is
recorded in.

To close it properly: create a KV namespace, bind it as `RATE_LIMIT`, and
implement the two interfaces against it in `functions/api/plan.ts`. That is one
file and no change to `lib/`.

## 5. Custom domain

**Settings → Custom domains** → `resetbaseline.com` and `www.resetbaseline.com`.

The canonical origin is `https://resetbaseline.com` (no `www`), hardcoded in
`lib/copy/metadata.ts` and emitted in every canonical, OG URL and the sitemap.
So `www` should be a redirect to the apex, not a second origin — otherwise both
are indexable and the canonicals point at one of them.

## 6. What to check once it is live

- `https://resetbaseline.com/robots.txt` and `/sitemap.xml` resolve.
- `/og.png` resolves and renders (paste the URL into any chat app).
- **Response headers on `/` carry `Content-Security-Policy` with `sha256-`
  entries.** If it is present but hash-free, hydration is blocked and the page
  will render while doing nothing — this exact defect was caught locally by
  `npm run check:csp` and is the one worth re-checking on the real origin.
- The builder runs: type a goal, press Run, a plan renders.
- `/api/plan` with `{"goal":"finish my thesis"}` returns 200 and a window.
- **`SITE-005`'s device verdict** — real iOS Safari, portrait and landscape,
  checking the nav clears the notch. Headless Chromium reports every safe-area
  inset as 0 because it has no notch, so this cannot be done from a session and
  is yours to record.

## 7. Not configured here, deliberately

- **No analytics destination.** The PRD names no provider; the sink defaults to
  `NULL_SINK`, which measures nothing. Choosing one is one argument to
  `createAnalytics`.
- **No capture destination.** `SITE-046` owns the Supabase write, and §6 is
  explicit that it targets the **staging** project, never production. The seam
  takes a provider and does not know what a project is; no URL, key or project
  name appears anywhere in this repository.
