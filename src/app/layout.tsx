import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/globals.css'
import { getSiteSettings } from '@/lib/data'
import { getSeoSettings, absoluteUrl, SITE_URL } from '@/lib/seo'

export const viewport: Viewport = {
  themeColor: '#ff4d00',
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const seo = getSeoSettings(settings)

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    openGraph: {
      siteName: seo.siteName,
      type: 'website',
      images: seo.defaultOgImage ? [{ url: absoluteUrl(seo.defaultOgImage), alt: seo.defaultTitle }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      site: seo.twitterHandle || undefined,
    },
  }
}

/* Deliberately minimal — just the <html> shell, fonts, and site-wide
   metadata. Portfolio chrome (Preloader, Header, MenuOverlay, etc.)
   used to live here behind a usePathname()-based bypass for /admin and
   /maintenance, but that bypass silently never matched for /maintenance:
   middleware reaches it via a *rewrite*, which is invisible to the
   browser's URL — usePathname() keeps reporting whatever path the
   visitor actually requested, never '/maintenance', so the chrome
   rendered anyway (full nav on top of the maintenance page — the exact
   bug just reported). No client-side hook can detect a rewrite; it's
   fundamentally a server-side routing concept. The fix is structural
   instead of another runtime check: chrome now lives in
   (site)/layout.tsx, applied by Next's own file-based routing to only
   the routes actually placed in that group. /admin (its own layout)
   and /maintenance both sit outside it and get real full HTML documents
   with nothing to bypass, regardless of how they were reached. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-loading="" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Microsoft Clarity — placed in <head> exactly as Clarity's
            install instructions specify, so it starts recording before
            hydration and doesn't miss early interactions.

            Two guards wrap the vendor snippet, which is otherwise
            verbatim:

            1. Production only. Otherwise every `npm run dev` reload
               counts as a real visitor and localhost viewport sizes
               skew the heatmaps.
            2. Skipped on /admin. Clarity records session replays of the
               DOM, and /admin/submissions displays other people's
               names, emails and phone numbers from the contact form —
               replaying those to a third party isn't something those
               people agreed to. Checked against location.pathname at
               runtime since <head> renders above the router. */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `if(!location.pathname.startsWith('/admin')){(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "y56e5hf0bs");}`,
            }}
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
