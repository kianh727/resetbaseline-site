import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

/*
 * SITE-024 · Where the settling spring may be imported.
 *
 * v5 §8.1, carried forward unchanged by v7.3 §11: one spring, used **only when
 * structure lands into place**, and "banned everywhere else — if a section
 * header uses it, the signature is gone. This is the rule most likely to erode
 * across a long build."
 *
 * A rule most likely to erode is exactly the one that needs a machine rather
 * than a reviewer, so the ban is the default and this is the exception list.
 * Adding a path here is a decision about the site's one signature motion; it is
 * not a way to make a lint error go away.
 *
 * The list is deliberately narrow and names the issues that own each entry.
 * SITE-025 lands occurrence marks; SITE-026 lands the plan objects. Nothing
 * else lands structure today.
 *
 * @implements SITE-EVAL-064
 */
const SETTLE_ALLOWLIST = [
  'lib/motion/settle.ts', // the primitive itself
  'components/plan/**', // SITE-025, SITE-026 — structure landing into place
  'tests/**', // the suite that polices the rule necessarily names it
]

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      /*
       * Scroll is native. No wheel interception, no Lenis, no locomotive,
       * no `scroll-behavior` override, anywhere, ever (PRD §7.5, SITE-070).
       * SITE-070 owns the full import ban and its negative test; this is the
       * earliest point the ban can exist, so it exists here.
       */
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'lenis', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
            { name: '@studio-freight/lenis', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
            { name: 'locomotive-scroll', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
            { name: 'smooth-scrollbar', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
          ],
          patterns: [
            {
              group: ['**/lib/motion/settle', '**/lib/motion/settle.ts', '@/lib/motion/settle'],
              message:
                'The settling spring is used only when structure lands into place ' +
                '(v5 §8.1 via PRD v7.3 §11, SITE-024). If a section header uses it, ' +
                'the signature is gone. Add the path to SETTLE_ALLOWLIST only if it ' +
                'is structure landing.',
            },
          ],
        },
      ],

      /*
       * SITE-002 · `--veto` is refusal and veto states only (PRD §14).
       *
       * This catches the utility class and the CSS variable in TS and TSX.
       * It cannot see a stylesheet, so tests/tokens.test.mjs scans every
       * file type as well — the lint rule is the fast feedback, the test is
       * the one that cannot be routed around by changing file extension.
       */
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/(^|[^a-z-])(bg|text|border|fill|stroke|ring|outline|decoration|shadow|accent|caret)-veto([^a-z-]|$)|--veto/]",
          message:
            'The --veto token is for refusal and veto states only (PRD §14). See SITE-017, SITE-018, SITE-038.',
        },
        {
          selector: "TemplateElement[value.raw=/(^|[^a-z-])(bg|text|border|fill|stroke|ring|outline|decoration|shadow|accent|caret)-veto([^a-z-]|$)|--veto/]",
          message:
            'The --veto token is for refusal and veto states only (PRD §14). See SITE-017, SITE-018, SITE-038.',
        },
      ],
    },
  },
  {
    /*
     * The paths where a veto colour is the correct thing to reach for.
     * SITE-017 and SITE-018 own the authored refusals and their render path;
     * SITE-038 owns the contention veto. The token swatch route must render
     * all nine tokens, so it is listed too.
     */
    files: [
      'app/tokens/page.dev.tsx',
      'app/**/refusal/**',
      'app/**/veto/**',
      'components/**/refusal/**',
      'components/**/veto/**',
      // The two files that police the token necessarily name it.
      'eslint.config.mjs',
      'tests/**',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    /*
     * SITE-024 · The settling spring's allowlist. The scroll-library ban is
     * restated because this block replaces `no-restricted-imports` wholesale
     * for these files, and dropping it here would open a hole in SITE-070's
     * ban at exactly the paths that animate.
     */
    files: SETTLE_ALLOWLIST,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'lenis', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
            { name: '@studio-freight/lenis', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
            { name: 'locomotive-scroll', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
            { name: 'smooth-scrollbar', message: 'Scroll is native (PRD §7.5). See SITE-070.' },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
