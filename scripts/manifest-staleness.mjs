/*
 * SITE-004 · §6.6's staleness fallback.
 *
 * The drift check has two mechanisms. The primary one fetches the manifest the
 * app repo publishes to a stable path on `main` and fails on any diff; it needs
 * an app-repo change that has not landed, and is wanted rather than required.
 * This is the fallback, and it is what SITE-004 ships on: the manifest carries
 * a `captured_at`, and age alone decides. **Warn at 30 days, fail at 60.**
 *
 * It reads the envelope only — `captured_at`, `app_commit_sha`, and whether
 * `manifest` is present and non-empty. It does not read contract vocabulary,
 * which is why it could be written before the manifest itself exists.
 *
 * The decision logic is a pure function so the thresholds can be tested at
 * exact boundaries rather than against whatever today happens to be.
 */

export const WARN_DAYS = 30
export const FAIL_DAYS = 60

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * @param {unknown} parsed  the parsed contents of contracts-manifest.json, or null if absent
 * @param {Date} now
 * @returns {{ status: 'fail'|'warn'|'ok', message: string, ageDays?: number }}
 */
export function evaluate(parsed, now) {
  /*
   * Absence is a failure, not a pass. A staleness check that returns "ok"
   * when there is no manifest is measuring the container (§0.3, §12.4) — it
   * would go green on exactly the state it exists to catch.
   */
  if (parsed === null || parsed === undefined) {
    return {
      status: 'fail',
      message:
        'contracts-manifest.json is missing. SITE-004 cannot ship without it, and a ' +
        'staleness check that passes on an absent manifest measures nothing.',
    }
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { status: 'fail', message: 'contracts-manifest.json is not a JSON object.' }
  }

  const { captured_at: capturedAt, app_commit_sha: sha, manifest } = /** @type {Record<string, unknown>} */ (parsed)

  if (typeof capturedAt !== 'string') {
    return { status: 'fail', message: 'contracts-manifest.json has no string `captured_at`.' }
  }
  if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) {
    return {
      status: 'fail',
      message:
        '`app_commit_sha` must be a 40-character hex SHA. Without it a future diff can ' +
        'say that the manifest differs but not which app state the site was built against.',
    }
  }
  if (typeof manifest !== 'object' || manifest === null || Array.isArray(manifest)) {
    return { status: 'fail', message: '`manifest` must be the CONTRACT_MANIFEST object, verbatim.' }
  }
  if (Object.keys(manifest).length === 0) {
    return {
      status: 'fail',
      message:
        '`manifest` is empty. An empty contract satisfies every check written against it, ' +
        'which is the failure §12.4 exists to catch.',
    }
  }

  const captured = new Date(capturedAt)
  if (Number.isNaN(captured.getTime())) {
    return { status: 'fail', message: `\`captured_at\` is not a parseable date: ${capturedAt}` }
  }

  const ageMs = now.getTime() - captured.getTime()
  if (ageMs < 0) {
    return {
      status: 'fail',
      message:
        `\`captured_at\` is in the future (${capturedAt}). A clock that runs ahead would ` +
        'hold the check at "fresh" indefinitely.',
    }
  }

  const ageDays = ageMs / DAY_MS

  if (ageDays >= FAIL_DAYS) {
    return {
      status: 'fail',
      ageDays,
      message:
        `The contracts manifest is ${ageDays.toFixed(1)} days old (fails at ${FAIL_DAYS}). ` +
        'Re-capture CONTRACT_MANIFEST from the app repo and update `captured_at` and ' +
        '`app_commit_sha` together — see docs/contracts-manifest-delivery.md.',
    }
  }
  if (ageDays >= WARN_DAYS) {
    return {
      status: 'warn',
      ageDays,
      message:
        `The contracts manifest is ${ageDays.toFixed(1)} days old (warns at ${WARN_DAYS}, ` +
        `fails at ${FAIL_DAYS}). Re-capture it before it fails the build.`,
    }
  }
  return { status: 'ok', ageDays, message: `Contracts manifest is ${ageDays.toFixed(1)} days old.` }
}
