/*
 * The share card — 1200×630, built from the plan model.
 *
 * **Same grammar as the page, enforced the same way.** §6.3b's band rules are
 * not page-specific: a card is where a screenshot of this site travels without
 * the site around it, so it is the one surface where a dark mark read as a gap
 * would be seen by people who never saw the section promising there are no
 * completeness meters. Everything the card draws comes from `bandsFor`, which is
 * the only producer of a `Band` and cannot be handed one.
 *
 * | §6.3b / §6.3a | Here |
 * |---|---|
 * | A band means a recurring window | `bandsFor(plan)`, never a literal |
 * | Bleeds off both frame edges | the rect starts left of 0 and ends right of 1200 |
 * | Lavender is light, never fill | the lit line and lit marks only |
 * | Dark marks are unscheduled, not missed | same shape, lower opacity, no rule through |
 * | Protection is a second, denser band | two-thirds height, hard rules on both edges |
 * | Never an app name | `appCount` is a number; the card renders "N apps" |
 * | No completeness | no ordinal, no total, no percentage — asserted by test |
 *
 * ---
 *
 * **SVG, and no image dependency.** The card is markup, so it is a pure
 * function of the plan, diffable, and assertable by reading it rather than by
 * pixel comparison. Rasterising for the `og:image` happens once at build time
 * through `playwright-core`, which is already a dev dependency for the overflow
 * and LCP checks — nothing new ships and nothing runs at request time.
 *
 * **The type scale is the card's own, and that is deliberate.** §14's clamps are
 * viewport-relative and a card has no viewport; copying the numbers would freeze
 * one width's rendering into a fixed frame and read as a coincidence. The
 * relationship §14 actually specifies — enormous display type against very
 * small, very precise metadata — is what is reproduced.
 */

import { bandsFor, type Band } from '../render/bands.ts'
import { occurrences, type Plan, type PlanDate } from '../plan/model.ts'

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630

/** The tokens, resolved. A card cannot read a stylesheet. */
const VOID = '#0a0a0a'
const BONE = '#f2f0ec'
const BONE_60 = 'rgba(242, 240, 236, 0.6)'
const BONE_38 = 'rgba(242, 240, 236, 0.38)'
const EDGE = 'rgba(242, 240, 236, 0.08)'
const LAVENDER_LIT = '#c9c0ff'
const CHARCOAL = 'rgba(242, 240, 236, 0.06)'
const CHARCOAL_DENSE = 'rgba(242, 240, 236, 0.11)'

/**
 * Every colour the card may contain.
 *
 * **Exported so a test can assert the rendered SVG uses nothing else**, which
 * is a stronger claim than banning any particular colour and needs no list of
 * forbidden ones. The refusal accent is absent from this palette, so a card
 * that drew an unscheduled day in it fails — and so does a card that
 * introduces any other colour, including one nobody has thought of yet. A test
 * enumerating what it rejects inherits every value added after it (§0.3e); this
 * enumerates what it accepts.
 */
export const CARD_PALETTE: readonly string[] = [
  VOID,
  BONE,
  BONE_60,
  BONE_38,
  EDGE,
  LAVENDER_LIT,
  CHARCOAL,
  CHARCOAL_DENSE,
]

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

/** How far the band runs past each frame edge. §6.3b: it bleeds off both. */
const BLEED = 80

/* The vertical stops. Named because the collision they prevent is invisible in markup. */
const GOAL_TOP = 158
const GOAL_LEADING = 76
const MAX_GOAL_LINES = 3
const METADATA_TOP = 336
const METADATA_LEADING = 24
const MAX_METADATA_ROWS = 3
const WINDOW_BAND_HEIGHT = 64
const PROTECTION_BAND_HEIGHT = 42
const BAND_GAP = 18
/** The sigil and URL sit here. Bands must clear it — see `bandStackBottom`. */
export const FOOTER_TOP = CARD_HEIGHT - 58
/** One expression, because two copies of a layout stop are two stops. */
const BAND_TOP = METADATA_TOP + MAX_METADATA_ROWS * METADATA_LEADING + 24

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Break a string into at most `maxLines` lines of at most `perLine` characters.
 *
 * **Truncation ends in an ellipsis and never mid-word**, because a goal cut at
 * a character boundary reads as a rendering bug rather than as a quotation, and
 * the one thing this card must get right is that the words are the visitor's.
 */
export function wrap(text: string, perLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= perLine) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    current = word
    if (lines.length === maxLines) break
  }
  if (current && lines.length < maxLines) lines.push(current)

  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    const last = lines[maxLines - 1] ?? ''
    lines[maxLines - 1] = `${last.replace(/[.,;:]$/, '')}…`
  }
  return lines
}

function formatDate(d: PlanDate): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function formatWindow(startMinute: number, endMinute: number): string {
  const hhmm = (m: number): string => {
    const h24 = Math.floor(m / 60) % 24
    const h = h24 % 12 === 0 ? 12 : h24 % 12
    const mm = String(m % 60).padStart(2, '0')
    return `${h}:${mm}${h24 < 12 ? 'am' : 'pm'}`
  }
  return `${hhmm(startMinute)}–${hhmm(endMinute)}`
}

/**
 * The band, its marks, and nothing else.
 *
 * Marks are positioned as a fraction of the band's own day list, so a twelve-day
 * plan and a thirty-day plan both fill the frame — the card never shows how much
 * of something is left, which is what a fixed day width would leak.
 */
function bandHeight(kind: 'window' | 'protection'): number {
  return kind === 'protection' ? PROTECTION_BAND_HEIGHT : WINDOW_BAND_HEIGHT
}

/**
 * Where the band stack ends, given how many bands render.
 *
 * Exported because a test asserts it clears `FOOTER_TOP`. **Two collisions got
 * into this card before that assertion existed** — a metadata row inside the
 * window band, and the protection band under the URL — and neither was visible
 * in the markup or catchable by any grammar rule. Both were found by looking at
 * the picture, which is not a thing CI does.
 */
export function bandStackBottom(bandCount: number): number {
  const kinds: ('window' | 'protection')[] = bandCount > 1 ? ['window', 'protection'] : ['window']
  const shown = kinds.slice(0, Math.max(bandCount, 0))
  return shown.reduce((y, kind) => y + bandHeight(kind) + BAND_GAP, BAND_TOP) - BAND_GAP
}

function renderBand(band: Band, top: number): string {
  const height = bandHeight(band.kind)
  const left = -BLEED
  const width = CARD_WIDTH + BLEED * 2
  const fill = band.kind === 'protection' ? CHARCOAL_DENSE : CHARCOAL

  const parts = [`<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="${fill}"/>`]

  if (band.kind === 'window') {
    // §6.3b: lavender only as a thin lit line on the upper boundary.
    parts.push(
      `<rect x="${left}" y="${top}" width="${width}" height="1" fill="${LAVENDER_LIT}" opacity="0.5"/>`,
    )
  } else {
    // Protection is denser: a hard rule on both boundaries rather than a lit one.
    parts.push(
      `<rect x="${left}" y="${top}" width="${width}" height="1" fill="${EDGE}"/>`,
      `<rect x="${left}" y="${top + height - 1}" width="${width}" height="1" fill="${EDGE}"/>`,
    )
  }

  const days = band.days
  if (days.length > 0) {
    const inset = 96
    const usable = CARD_WIDTH - inset * 2
    const step = days.length > 1 ? usable / (days.length - 1) : 0
    days.forEach((day, i) => {
      const x = inset + step * i
      const markHeight = height - 28
      /*
       * **A dark mark is the same mark, unlit.** Same width, same height, same
       * position, lower opacity — never crossed out, never rust, never dashed.
       * §6.3b calls that rule §4 rendered in visual grammar, and this is the one
       * surface where the copy saying so does not travel with the picture.
       */
      parts.push(
        `<rect class="mark" x="${x.toFixed(1)}" y="${top + 14}" width="3" height="${markHeight}" ` +
          `fill="${day.lit ? LAVENDER_LIT : BONE}" opacity="${day.lit ? '0.95' : '0.18'}"/>`,
      )
    })
  }

  return parts.join('\n    ')
}

/**
 * The metadata rows — §6.1a's object lines.
 *
 * **Counts, never names** (§6.3a). A gate contributes `N apps`, which is what
 * the app can actually say about an opaque token set.
 */
export function metadataRows(plan: Plan): readonly string[] {
  const rows: string[] = []
  const all = occurrences(plan)

  if (all.length > 0) {
    const first = all[0]
    const last = all[all.length - 1]
    if (first && last) rows.push(`${formatDate(first.date)} – ${formatDate(last.date)}`)
  }
  if (plan.deadline) rows.push(`Deadline ${formatDate(plan.deadline)}`)

  for (const node of plan.nodes) {
    const detail = node.detail as { appCount?: number; window?: { startMinute: number; endMinute: number } }
    if (typeof detail.appCount === 'number' && detail.window) {
      rows.push(`${detail.appCount} apps · ${formatWindow(detail.window.startMinute, detail.window.endMinute)}`)
    }
  }

  return rows
}

/**
 * Render a plan as a 1200×630 card.
 *
 * @param url the site's own address, set small in the corner.
 *
 * **The band marks carry `class="mark"` and the corner sigil carries
 * `class="sigil"`**, which is not styling — an SVG with no stylesheet has no use
 * for either. It is there because a reader of the markup, including a test,
 * otherwise has to identify a mark by its geometry, and the corner sigil is a
 * 3×14 lavender rect exactly like a band mark. The first version of the grammar
 * test matched on geometry and correctly reported two mark heights where there
 * should be one; what it had actually found was the sigil. A check forced to
 * infer what an element *is* from what it *looks like* will keep finding that,
 * and the fix is for the markup to say.
 */
export function shareCardSvg(plan: Plan, url: string): string {
  const bands = bandsFor(plan)
  const goalLines = wrap(plan.title, 30, MAX_GOAL_LINES)
  const rows = metadataRows(plan).slice(0, MAX_METADATA_ROWS)

  /*
   * **The vertical rhythm is fixed, not flowed.** An earlier version placed the
   * metadata rows at a fixed offset and the bands at another, and a plan with
   * three rows put the third one *inside* the window band — legible in the
   * markup, obviously wrong in the picture, and invisible to every assertion in
   * the suite because nothing was overlapping in the DOM sense. The blocks are
   * now laid out against named stops with the gap stated, so a fourth row
   * pushes into a stop rather than into a band.
   */
  let cursor = BAND_TOP
  const bandMarkup = bands
    .slice(0, 2)
    .map((band) => {
      const markup = renderBand(band, cursor)
      cursor += bandHeight(band.kind) + BAND_GAP
      return markup
    })
    .join('\n    ')

  const goalMarkup = goalLines
    .map(
      (line, i) =>
        `<text x="96" y="${GOAL_TOP + i * GOAL_LEADING}" font-family="${FONT}" font-size="68" ` +
        `font-weight="500" letter-spacing="-2" fill="${BONE}">${escapeText(line)}</text>`,
    )
    .join('\n    ')

  const rowsMarkup = rows
    .map(
      (row, i) =>
        `<text x="96" y="${METADATA_TOP + i * METADATA_LEADING}" font-family="${FONT}" font-size="15" ` +
        `letter-spacing="0.9" fill="${BONE_60}">${escapeText(row)}</text>`,
    )
    .join('\n    ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${VOID}"/>
    <text x="96" y="72" font-family="${FONT}" font-size="15" letter-spacing="1.2" fill="${BONE_38}">Baseline</text>
    ${goalMarkup}
    ${rowsMarkup}
    ${bandMarkup}
    <rect class="sigil" x="96" y="${CARD_HEIGHT - 58}" width="3" height="14" fill="${LAVENDER_LIT}" opacity="0.95"/>
    <text x="112" y="${CARD_HEIGHT - 46}" font-family="${FONT}" font-size="15" letter-spacing="0.9" fill="${BONE_38}">${escapeText(url)}</text>
  </svg>`
}
