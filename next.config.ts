import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
