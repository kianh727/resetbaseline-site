import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

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
        },
      ],
    },
  },
]

export default eslintConfig
