import type { Metadata, Viewport } from 'next'
import './globals.css'

/*
 * Placeholder-free by construction: SITE-001's scope is the pipeline, not content.
 * Real metadata and the OG card are SITE-100. The nav, safe areas and overflow
 * guards are SITE-005. The hero headline is SITE-007.
 */

export const metadata: Metadata = {
  title: 'Baseline',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 375px is the primary target and the viewport must not block zoom (PRD §9).
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
