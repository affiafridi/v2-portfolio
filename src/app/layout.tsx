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
  const general = (settings.general as { maintenanceMode?: boolean } | undefined) ?? {}
  const footer  = (settings.footer as { email?: string } | undefined) ?? {}
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning data-loading="" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <PortfolioShell
          maintenanceMode={general.maintenanceMode ?? false}
          contactEmail={footer.email}
          isAdminLoggedIn={!!session}
        >
          {children}
        </PortfolioShell>
        <PageTransitionOverlay />
      </body>
    </html>
  )
}
