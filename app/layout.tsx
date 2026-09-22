import type { Metadata, Viewport } from 'next'
import './globals.css'
import SiteNav from '@/components/site-nav'

/*
 * Placeholder-free by construction: SITE-001's scope is the pipeline, not content.
 * Real metadata and the OG card are SITE-100. The hero headline is SITE-007.
 *
 * SITE-005 adds the nav, the safe-area handling and the overflow guards.
 */

export const metadata: Metadata = {
  title: 'Baseline',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 375px is the primary target and the viewport must not block zoom (PRD §9).
  maximumScale: 5,

  /*
   * SITE-005 · Required for safe areas to exist at all.
   *
   * `env(safe-area-inset-*)` resolves to 0 on iOS unless the viewport covers
   * the whole display. Without this line globals.css's safe-area tokens are
   * all zero, the nav still renders, nothing looks wrong on a simulator — and
   * the notch handling silently does nothing on the device it was written for.
   */
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  )
}
