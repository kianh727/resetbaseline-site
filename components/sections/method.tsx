/*
 * §6 Method — four principles, collapsed. SITE-072, P1.
 *
 * **`<details>`, not a JavaScript disclosure**, for the reason SITE-095's FAQ
 * records: a `hidden` div toggled by state is closed only after React hydrates,
 * which on a slow connection is exactly when someone is reading. This is a
 * server component and costs the bundle nothing.
 *
 * **§19's layout bans decide the composition.** No identical rounded cards in a
 * row — the four are a list with rules between them, which is also what makes
 * the collapsed state readable as one thing rather than four objects. No
 * fade-and-slide-up on the section (SITE-072's non-goal). No eyebrow: §14 says
 * metadata is always real, and a label restating the heading below it is
 * decoration wearing the primitive (ruled 2026-09-21).
 *
 * **The collapsed state carries the meaning and the expansion carries detail.**
 * A principle whose summary is missing renders as visibly unwritten rather than
 * collapsing to its title — a section that quietly drops a line is one nobody
 * notices is missing, which is the same call the FAQ's four unwritten answers
 * made.
 */

import { PRINCIPLES, SECTION_HEADING } from '@/lib/copy/method'

export default function Method() {
  return (
    <section id="method" className="page-x py-24">
      <h2 className="text-section text-bone">
        {SECTION_HEADING ?? <span className="text-bone-38">[ §6 heading — SITE-072 ]</span>}
      </h2>

      <div className="mt-8">
        {PRINCIPLES.map((principle, i) => (
          <details
            key={i}
            className={`group py-5 ${i === 0 ? '' : 'border-t border-edge'}`}
          >
            <summary className="cursor-pointer list-none">
              <span className="text-lead text-bone">
                {principle.title ?? (
                  <span className="text-bone-38">[ principle {i + 1} — SITE-072 ]</span>
                )}
              </span>
              <span className="mt-2 block text-body text-bone-60">
                {principle.summary ?? (
                  <span className="text-bone-38">[ one line, readable collapsed — SITE-072 ]</span>
                )}
              </span>
            </summary>

            <p className="mt-4 max-w-measure text-body text-bone-60">
              {principle.detail ?? (
                <span className="text-bone-38">[ detail, not meaning — SITE-072 ]</span>
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
