import type { Metadata, Viewport } from 'next'
import './globals.css'
import SiteNav from '@/components/site-nav'
import { metadataForRoute } from '@/lib/seo/metadata'

/*
 * SITE-005 adds the nav, the safe-area handling and the overflow guards.
 *
 * **SITE-100's metadata is derived, not written here.** The root layout carries
 * `/`'s entry, and `/privacy` and `/terms` override it with their own. Every
 * one comes from the single list in `lib/copy/metadata.ts`, so the OpenGraph
 * and Twitter cards cannot describe a different page from the `<title>` — three
 * hand-written copies of one description drift, and the OG one drifts first
 * because nobody looks at it except when sharing.
 */

export const metadata: Metadata = metadataForRoute('/')

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
