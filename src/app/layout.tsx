import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/globals.css'
import Header               from '@/components/layout/Header'
import Cursor               from '@/components/ui/Cursor'
import MenuOverlay          from '@/components/ui/MenuOverlay'
import Preloader            from '@/components/ui/Preloader'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ContactModal         from '@/components/ui/ContactModal'
import ScrollRestoration   from '@/components/ui/ScrollRestoration'
import BackToTop           from '@/components/ui/BackToTop'

/* ─── Font ───────────────────────────────────────────────────────── */
/* GeistSans and GeistMono from the `geist` npm package already
   expose .variable (CSS custom property) and .className directly —
   no configuration needed.                                          */

/* ─── Metadata ───────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'Aftab — Creative Developer',
    template: '%s | Aftab',
  },
  description:
    'Creative developer crafting immersive digital experiences that push the limits of the web.',
}

/* ─── Layout ─────────────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-loading="" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/* TODO: Wrap body children with Lenis SmoothScroll provider */}
      <body>
        <Preloader />
        {/* pc = "page content" — hidden until Preloader burn phase starts,
            so nothing flashes through the transparent canvas pre-JS.
            Preloader calls document.getElementById('pc').style.visibility=''
            right before the burn holes begin. */}
        <div id="pc" style={{ visibility: 'hidden' }}>
          <SmoothScrollProvider>
            <Cursor />
            <Header />
            <MenuOverlay />
            <ContactModal />
            <ScrollRestoration />
            <BackToTop />
            {children}
          </SmoothScrollProvider>
        </div>
      </body>
    </html>
  )
}
