import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/globals.css'
import PortfolioShell from '@/components/providers/PortfolioShell'
import PageTransitionOverlay from '@/components/providers/PageTransitionOverlay'

export const metadata: Metadata = {
  title: {
    default: 'Aftab — Creative Developer',
    template: '%s | Aftab',
  },
  description:
    'Creative developer crafting immersive digital experiences that push the limits of the web.',
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
