/*
 * SITE-002 · Token swatch route.
 *
 * Renders all nine tokens of PRD §14 with their names and exact values, so
 * the acceptance criterion — "a token swatch route renders all nine" — is
 * checkable by looking rather than by reading the stylesheet.
 *
 * Every swatch is driven by a Tailwind utility class, which is the other
 * half of the criterion: a token that renders here is a token that is
 * consumable from Tailwind.
 *
 * Deliberately not a client component. Nothing here is interactive, so this
 * page adds nothing to the core bundle (§11, 120 KB).
 */

type Swatch = {
  /** The name as PRD §14 writes it. */
  token: string
  /** The Tailwind utility that proves the token is consumable. */
  utility: string
  value: string
  note?: string
}

const SWATCHES: readonly Swatch[] = [
  { token: '--void', utility: 'bg-void', value: '#0A0A0A' },
  { token: '--surface', utility: 'bg-surface', value: '#0E0C18' },
  { token: '--lavender', utility: 'bg-lavender', value: '#8B7DFF' },
  { token: '--lavender-lit', utility: 'bg-lavender-lit', value: '#C9C0FF' },
  { token: '--bone', utility: 'bg-bone', value: '#F2F0EC' },
  { token: '--bone-60', utility: 'bg-bone-60', value: 'rgba(242,240,236,.6)' },
  { token: '--bone-38', utility: 'bg-bone-38', value: 'rgba(242,240,236,.38)' },
  { token: '--edge', utility: 'bg-edge', value: 'rgba(242,240,236,.08)' },
  {
    token: '--veto',
    utility: 'bg-veto',
    value: '#C4614F',
    note: 'refusal and veto states only',
  },
]

/*
 * Tailwind scans source text for class names, so every utility above has to
 * appear as a literal somewhere it can see. This map is that literal.
 */
const BG: Record<string, string> = {
  'bg-void': 'bg-void',
  'bg-surface': 'bg-surface',
  'bg-lavender': 'bg-lavender',
  'bg-lavender-lit': 'bg-lavender-lit',
  'bg-bone': 'bg-bone',
  'bg-bone-60': 'bg-bone-60',
  'bg-bone-38': 'bg-bone-38',
  'bg-edge': 'bg-edge',
  'bg-veto': 'bg-veto',
}

export default function Tokens() {
  return (
    <main className="p-6">
      <h1 className="text-bone">Design tokens</h1>
      <p className="text-bone-60">PRD §14, carried forward by v7.3 §11. Nine tokens.</p>

      <ul className="mt-6 list-none p-0">
        {SWATCHES.map((s) => (
          <li key={s.token} className="flex items-center gap-4 border-b border-edge py-3">
            <span
              className={`${BG[s.utility]} block h-10 w-10 shrink-0 border border-edge`}
              aria-hidden="true"
            />
            <span className="flex-1">
              <code className="text-bone">{s.token}</code>
              <span className="text-bone-38"> · {s.utility}</span>
              {s.note ? <span className="text-bone-38"> · {s.note}</span> : null}
            </span>
            <code className="text-bone-60">{s.value}</code>
          </li>
        ))}
      </ul>
    </main>
  )
}
