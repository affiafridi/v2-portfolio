// Next.js 14 uses next.config.js — this file is the active config.
// When you upgrade to Next.js 15+, delete this file and rename
// next.config.ts to take over (it has the same settings with full TS types).

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // sharp is installed for optimised image processing
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        /* Uploaded media is written with a millisecond timestamp prefix
           (1786797195871-reach-out.mp4) and never rewritten in place —
           editing an image in admin uploads a new file under a new name.
           That makes these effectively content-addressed, so they can be
           cached permanently; repeat visitors re-download none of it.
           Next.js already sends this for /_next/static, which is hashed
           the same way, but /uploads is served straight from disk and
           gets no caching headers by default. */
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
