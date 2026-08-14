import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/globals.css'
import PortfolioShell from '@/components/providers/PortfolioShell'
import PageTransitionOverlay from '@/components/providers/PageTransitionOverlay'
import { getSiteSettings } from '@/lib/data'
import { getSeoSettings, absoluteUrl, SITE_URL } from '@/lib/seo'

export const viewport: Viewport = {
  themeColor: '#ff4d00',
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-loading="" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <PortfolioShell>{children}</PortfolioShell>
        <PageTransitionOverlay />
      </body>
    </html>
  )
}
