/*
 * The 404.
 *
 * Next exports one whether or not we write it, so the choice is between a page
 * that says what happened and one that inherits the home page's description and
 * claims to be it. This is the former.
 *
 * **No copy beyond the title.** There is nothing to say here that is not
 * already true of the title, and a 404 is not a place to write marketing at
 * somebody who is lost. The nav is in the root layout and gets them back.
 */

import type { Metadata } from 'next'

import { metadataForRoute } from '@/lib/seo/metadata'
import { routeFor } from '@/lib/copy/metadata'

export const metadata: Metadata = metadataForRoute('/404/')

export default function NotFound() {
  const route = routeFor('/404/')

  return (
    <main className="page-x flex min-h-[60svh] flex-col justify-center">
      <h1 className="text-section">{route?.description}</h1>
    </main>
  )
}
