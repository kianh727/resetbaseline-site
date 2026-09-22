/*
 * Date-sensitive suites run under real DST zones — not only under CI's UTC.
 *
 * **Found 2026-09-19, by planting the defect the fixtures exist to catch.**
 * Replacing the occurrence generator's calendar stepping with a
 * `+ 86_400_000` millisecond stride — the classic date bug, and the one
 * SITE-023's spec names by asking for DST-safe math — produces:
 *
 *   TZ=UTC                 → 0 failures, suite green
 *   TZ=America/New_York    → 8 failures
 *   TZ=Europe/London       → 8 failures
 *   TZ=Australia/Lord_Howe → 8 failures
 *
 * **CI containers default to UTC**, so a suite of DST fixtures run only there is
 * a suite that cannot fail on the defect it was written for. The fixtures were
 * correct and thorough; the *environment* made them inert.
 *
 * That is §0.3's family with the container as the missing thing: the criterion
 * was satisfiable by the absence of a timezone. It is also why this is a
 * separate check rather than an `env` line on the existing job — naming the
 * zones here, with the measurement above, means the next person to ask "why
 * three zones?" finds the answer instead of deleting two of them.
 *
 * **Why these four:**
 *
 * - `UTC` — the control. It must pass, and it is the one that hid the defect.
 * - `America/New_York` — one-hour DST, transitions on different dates to the EU.
 * - `Europe/London` — one-hour DST, and its year boundary sits in GMT.
 * - `Australia/Lord_Howe` — **a thirty-minute DST shift.** Any arithmetic that
 *   assumes a transition is a whole hour is wrong here and nowhere else, and
 *   "round to the nearest hour" is a plausible thing for someone to add.
 */

import { execFileSync } from 'node:child_process'

/** The suites whose correctness depends on the local calendar. */
const SUITES = ['tests/occurrences.test.ts', 'tests/deadline.test.ts']

const ZONES = ['UTC', 'America/New_York', 'Europe/London', 'Australia/Lord_Howe']

let failed = false

for (const zone of ZONES) {
  for (const suite of SUITES) {
    try {
      execFileSync('node', ['--test', suite], {
        env: { ...process.env, TZ: zone },
        stdio: 'pipe',
        encoding: 'utf8',
      })
      console.log(`  ok    ${zone.padEnd(22)} ${suite}`)
    } catch (e) {
      failed = true
      const err = e
      const names = [...(err.stdout ?? '').matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1])
      console.error(`  FAIL  ${zone.padEnd(22)} ${suite}`)
      for (const n of names) console.error(`          ${n}`)
    }
  }
}

if (failed) {
  console.error(
    '\ntimezones: a date-sensitive suite failed outside UTC.\n' +
      'A calendar day is not 86,400,000 milliseconds on the two days a year an\n' +
      'offset moves. Step the calendar (setDate) rather than adding milliseconds.',
  )
  process.exit(1)
}

console.log(`\ntimezones: ${SUITES.length} date-sensitive suites green in ${ZONES.length} zones.`)
