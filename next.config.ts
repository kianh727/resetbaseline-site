import type { NextConfig } from 'next'

/*
 * Development-only routes.
 *
 * A file named `page.dev.tsx` is a page only while `dev.tsx` is an accepted
 * page extension, which is only outside production. `/tokens` is the swatch
 * route SITE-002 needs in order to be looked at; it is not part of the
 * marketing site, and a URL nobody designed should not be reachable on it.
 *
 * The route is therefore never built rather than built and then pruned — a
 * prune step is a thing to forget, and forgetting it ships the page.
 */
const pageExtensions = ['tsx', 'ts', 'jsx', 'js']
if (process.env.NODE_ENV !== 'production') {
  pageExtensions.push('dev.tsx')
}

const nextConfig: NextConfig = {
  pageExtensions,

  // Static export. SITE-001 scope; Cloudflare Pages serves the `out/` directory.
  output: 'export',

  // Static export has no Next image optimizer at runtime.
  images: { unoptimized: true },

  // Trailing slashes keep static hosts from redirecting on directory routes.
  trailingSlash: true,

  // A type or lint error must fail the build, not be stepped over.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
}

export default nextConfig
