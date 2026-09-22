/*
 * SITE-008 · The Ask Baseline input's rules, separated from its rendering.
 *
 * Pure, so the enable/disable thresholds are unit-testable without mounting a
 * component or driving a browser — which is what the issue's Tests line asks
 * for, and which keeps the boundary conditions honest at exactly 1, 2 and 300
 * characters rather than approximately.
 */

/** §3.2 / SITE-030: the input is capped at 300 characters. */
export const MAX_CHARS = 300

/** SITE-008 accept: run is disabled below 2 characters. */
export const MIN_CHARS_TO_RUN = 2

/**
 * Whether Run is enabled.
 *
 * Trimmed first: a field holding only spaces is empty as far as the visitor is
 * concerned, and enabling Run on `"  "` would submit nothing and look broken.
 */
export function canRun(value: string): boolean {
  return value.trim().length >= MIN_CHARS_TO_RUN
}

/**
 * Enforces the cap.
 *
 * Applied on change rather than by the `maxLength` attribute alone, so paste
 * and IME input are capped by the same rule as typing instead of by whatever
 * the platform decides.
 */
export function clamp(value: string): string {
  return value.length <= MAX_CHARS ? value : value.slice(0, MAX_CHARS)
}

/** Characters remaining, never negative. */
export function remaining(value: string): number {
  return Math.max(0, MAX_CHARS - value.length)
}
