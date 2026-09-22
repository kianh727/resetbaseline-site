/*
 * SITE-107 · The ban lists — §19's terms and the app names.
 *
 * **Hand-maintained here, and deliberately not a fetched source.** No
 * authoritative list of app names exists to fetch, and inventing a mechanism to
 * fetch one is a thing nobody asked for. **Adding a name is a copy decision,
 * not a lint tweak** — which is why the list lives beside the copy it polices
 * rather than inside the script that reads it.
 *
 * **It lives outside `lib/copy/` for the same reason `gates.ts` does**: every
 * module in there is copy and declares a `PROVENANCE`, and this is a list that
 * polices copy rather than being any.
 *
 * **It ships non-empty, seeded with the apps a writer reaches for.** An empty
 * list fails nothing, and a check that passes on absence is §0.3 turned on
 * itself — the one place that shape would be most embarrassing is the check
 * written to catch it.
 */

/**
 * §19's copy bans, verbatim.
 *
 * *"The visual carries the metaphor; copy naming it is what makes it
 * embarrassing."* Matched as whole words — `peak` must not catch `speaking`,
 * and a checker that did would be argued down the first time it fired.
 */
export const BANNED_TERMS: readonly string[] = [
  'journey',
  'climb',
  'summit',
  'peak',
  'ascent',
  'reach new heights',
]

/**
 * **§10's cut features are deliberately not in that list, and the first version
 * of this file had them.**
 *
 * `streaks`, `leaderboard`, `XP`, `life score`, `habit scorecard` are things
 * the app cut, so the site may not *promise* them — but §3's whole job is to
 * say **"No streaks."**, and §2's status line says *"no streaks, no scores, and
 * no completeness meters."* A word filter cannot tell a promise from a refusal,
 * and this one flagged the site's most differentiating section for containing
 * the word it exists to refuse.
 *
 * So the feature bans are **not checkable by a word filter** and are not
 * pretended to be. What catches a section promising a cut feature is the
 * manual pre-launch review and DS-18's verdict rows, both of which read the
 * sentence rather than scanning it.
 */
/**
 * App names no depicted Baseline UI may carry — **§6.3a, a MUST, site-wide.**
 *
 * Screen Time returns opaque tokens: the app knows a count and nothing else, so
 * a rendered `Instagram, TikTok blocked` depicts a state the product is
 * structurally incapable of producing. v5 through v7.2 specified exactly that,
 * and it would have shipped a screenshot of something that cannot exist.
 *
 * **When this list was last reviewed.** The staleness treatment buys
 * visibility, not freshness — a list nobody has looked at in six months is
 * still a list, and the warning says so rather than pretending otherwise.
 */
export const APP_NAMES_CAPTURED_AT = '2026-09-22'

/**
 * Where app names may legitimately appear, named explicitly rather than by
 * pattern.
 *
 * **One entry: the Protect step's chips.** §6.3a and SITE-039's non-goal both
 * say it — the chips are *the site's own input affordance* and the visitor
 * picks recognisable names. What §6.3a forbids is a **depicted Baseline UI**
 * naming an app, and `SITE-EVAL-074` states the real rule precisely: *"no chip
 * name survives into the object."*
 *
 * **That rule is enforced better than a scan can**, by
 * `scripts/check-app-names.mjs`, which drives the real flow in a browser and
 * asserts the assembled gate object carries a count and no name. A source scan
 * would pass on a component that interpolated a chip label at runtime, and what
 * §6.3a forbids is what a visitor sees.
 *
 * A path rather than a pattern, for the reason every allowlist in this
 * repository is: `lib/copy/**` would let any future copy module claim the
 * exemption by being in the right directory.
 */
export const APP_NAME_ALLOWED_IN: readonly string[] = ['lib/copy/builder-controls.ts']

export const APP_NAMES: readonly string[] = [
  'Instagram',
  'TikTok',
  'Snapchat',
  'Facebook',
  'Messenger',
  'WhatsApp',
  'YouTube',
  'Netflix',
  'Twitch',
  'Reddit',
  'Twitter',
  'Threads',
  'Discord',
  'Pinterest',
  'LinkedIn',
  'Tumblr',
  'Telegram',
  'Spotify',
  'Hulu',
  'Disney+',
  'BeReal',
  'Steam',
  'Roblox',
  'Candy Crush',
]

/**
 * Platform names that are legitimate and are **exceptions in the list, never
 * suppressions at the call site.**
 *
 * SITE-107 is explicit about that distinction, and it is the allowlist lesson
 * again: an exception granted where the violation happens is invisible to
 * everyone except whoever granted it, and it stops being reviewable. These are
 * the names the site may legitimately use — it runs on the web and describes an
 * iOS app, so it has to be able to say so.
 */
export const PLATFORM_EXCEPTIONS: readonly string[] = [
  'App Store',
  'TestFlight',
  'iOS',
  'Apple',
  'Safari',
  'Screen Time',
  'Sign in with Apple',
]
