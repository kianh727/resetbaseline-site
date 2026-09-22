/*
 * SITE-100 · Turning one route entry into Next `Metadata`.
 *
 * **One derivation, three consumers.** The page title, the OpenGraph card and
 * the Twitter card all describe the same page, and three hand-written copies of
 * the same sentence drift — usually the OG one, because nobody looks at it
 * except when sharing. Here the two cards are computed from the route entry, so
 * there is exactly one place a description can be wrong.
 *
 * `metadataBase` is set so relative image paths resolve to absolute URLs in the
 * emitted tags. Without it Next emits a relative `og:image`, which most
 * crawlers will not follow and none will render — the card would be built,
 * correct, referenced, and invisible.
 */

import type { Metadata } from 'next'

import {
  canonicalFor,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  routeFor,
  SITE_NAME,
  SITE_ORIGIN,
} from '../copy/metadata.ts'

export function metadataForRoute(path: string): Metadata {
  const route = routeFor(path)
  if (!route) {
    throw new Error(
      `No metadata entry for "${path}". Every shipped route has one in ` +
        'lib/copy/metadata.ts — a route without a description ships with the ' +
        "site's name and nothing else, which is how a page gets indexed blank.",
    )
  }

  const image = {
    url: OG_IMAGE_PATH,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: `${SITE_NAME} — a plan rendered as a schedule`,
  }

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: route.title,
    description: route.description,
    alternates: { canonical: canonicalFor(route.path) },
    robots: route.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: route.title,
      description: route.description,
      url: canonicalFor(route.path),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: route.title,
      description: route.description,
      images: [image],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/site.webmanifest',
  }
}
