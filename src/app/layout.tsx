import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/globals.css'
import { getServerSession } from 'next-auth'
import PortfolioShell from '@/components/providers/PortfolioShell'
import PageTransitionOverlay from '@/components/providers/PageTransitionOverlay'
import { getSiteSettings } from '@/lib/data'
import { getSeoSettings, absoluteUrl, SITE_URL } from '@/lib/seo'
import { authOptions } from '@/lib/auth'

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

export default async function RootLayout({ children }: { children: ReactNode }) {
  // getSiteSettings() is React cache()-deduped, so this costs nothing
  // extra alongside generateMetadata()'s own call within the same request.
  const settings = await getSiteSettings()
  const general  = (settings.general  as { maintenanceMode?: boolean } | undefined) ?? {}
  const footer   = (settings.footer   as { email?: string } | undefined) ?? {}
  const whatsapp = (settings.whatsapp as { enabled?: boolean; number?: string; profileImage?: string; displayName?: string; greetingMessage?: string } | undefined) ?? {}

  const maintenanceMode = general.maintenanceMode ?? false

  /* Only read the session when maintenance mode is actually on.
     getServerSession() reads cookies, and any cookie access in the root
     layout opts the ENTIRE route tree out of static generation — an
     unconditional call here silently turned every page dynamic, so each
     visit re-rendered and re-queried the database instead of serving
     prerendered HTML.

     Gating it means the normal state (maintenance off) keeps every page
     static, and only the rare maintenance-on state pays for per-request
     rendering — which is correct there anyway, since the whole point is
     to serve different HTML to admins than to everyone else. */
  const session = maintenanceMode ? await getServerSession(authOptions) : null

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
      <body>
        <PortfolioShell
          maintenanceMode={maintenanceMode}
          contactEmail={footer.email}
          isAdminLoggedIn={!!session}
          whatsapp={whatsapp}
        >
          {children}
        </PortfolioShell>
        <PageTransitionOverlay />
      </body>
    </html>
  )
}
