/*
 * SITE-095 · §8 FAQ.
 *
 * **Twelve questions, all answers in the DOM with the accordion closed.** That
 * is SITE-095's accept, and it is why this is `<details>` rather than a
 * JavaScript disclosure: `<details>` keeps its content in the document and in
 * the accessibility tree when collapsed, it is findable by in-page search, and
 * it works with scripting disabled. A `hidden` div toggled by state satisfies
 * the letter of "in the DOM" only while React has hydrated, which on a slow
 * connection is exactly when someone is reading.
 *
 * **Eleven render.** Question 10 is held with §4 (§8) and is filtered out in
 * `lib/copy/faq.ts` rather than here, so a second consumer cannot reintroduce
 * it by iterating the full list.
 *
 * **Four questions render without an answer.** §8 gives no text for them and no
 * session writes one — FAQ 1 in particular is the site's single most
 * load-bearing sentence and §8 is explicit that it comes from the primitives'
 * Problem lines rather than from marketing language. An unanswered row renders
 * the question with its metadata marker and no body. **That is deliberately
 * visible**: a question quietly dropped is one nobody notices is missing, and
 * SITE-109 needs to see what it owns.
 *
 * **No eyebrow, and the heading is "Questions" rather than "Answers"** (ruled
 * 2026-09-21, Kian). The eyebrow said "Questions" above a heading saying
 * "Answers", which is decoration in the metadata primitive §14 reserves for
 * real measurements. Removing it left "Answers" alone as the name of a section
 * that is a list of questions, so the heading took the true word.
 *
 * **No marker rotation, no chevron, no animation.** §19 bans `→` on buttons and
 * §12.4a asks about generator tells; a disclosure that animates open is the
 * one motion on this page that carries no product meaning (K-4).
 */

import { VISIBLE_FAQ } from '@/lib/copy/faq'

export default function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="page-x"
      style={{
        borderTop: '1px solid var(--edge)',
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <h2
        id="faq-heading"
        className="text-section"
        style={{ margin: 0, color: 'var(--bone)', maxWidth: '14ch' }}
      >
        Questions
      </h2>

      <div style={{ paddingTop: 48 }}>
        {VISIBLE_FAQ.map((entry) => (
          <details
            key={entry.question}
            style={{ borderTop: '1px solid var(--edge)' }}
          >
            <summary
              className="text-body"
              style={{
                /*
                 * 44px minimum touch target (§9). Padding rather than a fixed
                 * height, so a question wrapping to two lines at 375px grows
                 * instead of clipping.
                 */
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                paddingTop: 14,
                paddingBottom: 14,
                color: 'var(--bone)',
                cursor: 'pointer',
                // The default triangle is a browser glyph nobody chose.
                listStyle: 'none',
              }}
            >
              {entry.question}
            </summary>

            {entry.answer === null ? (
              <p className="metadata" style={{ margin: 0, paddingBottom: 18 }}>
                Answer not yet written — SITE-109
              </p>
            ) : (
              <p
                className="text-body max-w-measure"
                style={{ margin: 0, paddingBottom: 18, color: 'var(--bone-60)' }}
              >
                {entry.answer}
              </p>
            )}
          </details>
        ))}
      </div>
    </section>
  )
}
