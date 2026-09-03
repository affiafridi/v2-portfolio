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
      /* /uploads/:path* used to get its Cache-Control here — moved to
         being set directly in src/app/uploads/[...path]/route.ts once
         uploads moved off Next's static public/ serving (see that
         route's own comment for why), since this config-level rule
         only ever applied to files Next resolved as static assets. */
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          /* Deliberately a PARTIAL policy — there is no default-src here,
             and that is the point. A CSP only restricts the directives it
             actually names, so this blocks four specific attack shapes
             without saying anything about where scripts, styles, images,
             fonts or connections may come from. Nothing currently loading
             on the site can be broken by it.
                object-src  — no <object>/<embed>/<applet> plugin content,
                              a legacy but still-live script execution path
                base-uri    — stops an injected <base> tag from silently
                              re-pointing every relative URL on the page at
                              an attacker's host
                form-action — stops an injected form from posting the
                              contact form's contents off-site
                frame-ancestors — the modern equivalent of the
                              X-Frame-Options above, honoured by browsers
                              that no longer read that header
             Locking down script-src is the next step up and would be the
             single strongest control here, but it cannot be switched on
             blind: this page ships inline scripts (the Clarity snippet and
             the JSON-LD blocks), so it needs either nonces or hashes
             wired through first, and getting that wrong takes the site
             down rather than failing quietly. Left as a deliberate
             follow-up rather than a guess. */
          {
            key: 'Content-Security-Policy',
            value: [
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
