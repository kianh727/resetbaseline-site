/*
 * The plan axis's labels — §8.2's "the real date on every mark", as the span
 * grows past what SITE-025 reasoned about.
 *
 * *Stub check* — a `markLabels` returning `[]` fails the count assertion in
 * every test below, which runs before any assertion about what the labels say.
 * "No labels overlap" and "no label is an ordinal" are both satisfied perfectly
 * by labelling nothing.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { labelStride, markLabels } from '../lib/plan/axis.ts'
import { planDate } from '../lib/plan/model.ts'

/** `planDate`'s month is 0-indexed — pinned, see `tests/plan-model.test.ts`. */
const may = (day: number) => planDate(2026, 4, day)

function run(dates: readonly Date[]) {
  const labels = markLabels(dates)
  return { labels, texts: labels.map((l) => l.text), indices: labels.map((l) => l.index) }
}

test('a short single-month span labels every mark', () => {
  const dates = [1, 2, 3, 4, 5].map(may)
  const { texts } = run(dates)

  assert.equal(texts.length, 5, 'every mark, because they all fit')
  assert.deepEqual(texts, ['1', '2', '3', '4', '5'])
})

test('a long single-month span thins the labels rather than shrinking them', () => {
  /*
   * §12.3a forbids anything between the two type scales, so 11px is the floor
   * and the count is what gives. Twenty marks at 375px is ~17px each, against
   * a two-digit day about 13px wide.
   */
  const dates = Array.from({ length: 20 }, (_, i) => may(i + 1))
  const { texts, indices } = run(dates)

  assert.ok(texts.length >= 4, `only ${texts.length} labels — the axis is unreadable`)
  assert.ok(
    texts.length <= 12,
    `${texts.length} labels over 20 marks is the collapse this exists to stop`,
  )
  assert.equal(indices[0], 0, 'the span starts labelled')
  assert.equal(indices[indices.length - 1], 19, 'and ends labelled')

  // Strictly increasing, and no index repeated — the `1120` collision.
  for (let i = 1; i < indices.length; i++) {
    assert.ok((indices[i] ?? 0) > (indices[i - 1] ?? 0), 'indices must be strictly increasing')
  }
})

test('the last label never lands on top of a strided one', () => {
  /*
   * **The `1120` defect.** The first version always labelled the last mark,
   * which for some counts put it one mark from a strided label — two numbers
   * rendered at overlapping positions and read as one four-digit number.
   */
  for (let count = 15; count <= 40; count++) {
    const dates = Array.from({ length: count }, (_, i) => may(i + 1))
    const { indices } = run(dates)
    const stride = labelStride(count)

    for (let i = 1; i < indices.length; i++) {
      const gap = (indices[i] ?? 0) - (indices[i - 1] ?? 0)
      assert.ok(
        gap >= Math.max(1, Math.floor(stride / 2)),
        `at ${count} marks two labels sit ${gap} apart with a stride of ${stride} — ` +
          'they overlap and read as one number',
      )
    }
  }
})

test('a span crossing months is labelled by month, not by day', () => {
  /*
   * A real deadline of "May 20" entered in September produces a 241-day span.
   * Every twentieth day then reads `22 13 3 24 15 5 26 …` — correct, in order,
   * and communicating nothing, because the month changes and only the day is
   * shown.
   */
  const dates: Date[] = []
  for (let month = 8; month <= 11; month++) {
    for (let day = 1; day <= 28; day += 1) dates.push(planDate(2026, month, day))
  }

  const { texts } = run(dates)

  assert.equal(texts.length, 4, 'one label per month, and there are four months')
  assert.deepEqual(texts, ['Sep', 'Oct', 'Nov', 'Dec'])
  assert.equal(
    new Set(texts).size,
    texts.length,
    'a month labelled twice means the boundary detection is wrong',
  )
})

test('a two-month span is still labelled by month, not half-and-half', () => {
  const dates = [
    ...Array.from({ length: 10 }, (_, i) => planDate(2026, 4, 20 + i)),
    ...Array.from({ length: 10 }, (_, i) => planDate(2026, 5, 1 + i)),
  ]
  const { texts } = run(dates)
  assert.deepEqual(texts, ['May', 'Jun'])
})

test('the same month in two years is two labels, not one', () => {
  const dates = [planDate(2026, 11, 20), planDate(2027, 0, 5), planDate(2027, 11, 3)]
  const { texts } = run(dates)
  assert.equal(texts.length, 3, 'December 2026 and December 2027 are different months')
  assert.deepEqual(texts, ['Dec', 'Jan', 'Dec'])
})

test('no label is an ordinal, a total, or a percentage', () => {
  /*
   * §10 bans progress and completeness meters and §4 promises no completeness
   * meters. The axis is where "3 of 12" gets added by somebody being helpful.
   */
  const spans = [
    Array.from({ length: 5 }, (_, i) => may(i + 1)),
    Array.from({ length: 40 }, (_, i) => planDate(2026, 4, 1 + (i % 28))),
    Array.from({ length: 120 }, (_, i) => planDate(2026, 4 + Math.floor(i / 28), 1 + (i % 28))),
  ]

  for (const dates of spans) {
    const { texts } = run(dates)
    assert.ok(texts.length > 0, 'nothing to check')
    for (const text of texts) {
      assert.doesNotMatch(text, /of|\/|%/, `"${text}" reads as a count rather than a date`)
      assert.match(text, /^(\d{1,2}|[A-Z][a-z]{2})$/, `"${text}" is neither a day nor a month`)
    }
  }
})

test('an empty span labels nothing and does not throw', () => {
  assert.deepEqual(markLabels([]), [])
})

test('month labels never overlap when a span starts mid-month', () => {
  /*
   * **The `SepOct` defect.** A deadline of "May 20" entered on 22 September
   * gives September six marks before October begins, and the two labels
   * rendered at 5–28px and 19–40px — overlapping, and read as one word.
   * Measured: a three-letter month at 11px is about 24px wide, which is 7% of
   * the 343px content box at 375px.
   */
  const dates: Date[] = []
  // Four leading days, then three whole months — the real 22-September shape.
  for (let day = 27; day <= 30; day++) dates.push(planDate(2026, 8, day))
  for (let month = 9; month <= 11; month++) {
    for (let day = 1; day <= 30; day++) dates.push(planDate(2026, month, day))
  }

  const { labels, texts } = run(dates)

  assert.ok(labels.length >= 3, `only ${labels.length} month labels`)

  const minGap = Math.ceil(dates.length * 0.07)
  for (let i = 1; i < labels.length; i++) {
    const gap = (labels[i]?.index ?? 0) - (labels[i - 1]?.index ?? 0)
    assert.ok(
      gap >= minGap,
      `"${labels[i - 1]?.text}" and "${labels[i]?.text}" sit ${gap} marks apart ` +
        `against a minimum of ${minGap} — they overlap and read as one word`,
    )
  }

  // The later month wins: the axis starts at the first whole month.
  assert.equal(texts[0], 'Oct', 'the partial leading month is the one dropped')
  assert.ok(!texts.includes('Sep'), 'four marks cannot carry their own label here')
  assert.equal(new Set(texts).size, texts.length, 'no month labelled twice')
})
