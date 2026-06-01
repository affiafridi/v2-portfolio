import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Header               from '@/components/layout/Header'
import Cursor               from '@/components/ui/Cursor'
import MenuOverlay          from '@/components/ui/MenuOverlay'
import Preloader            from '@/components/ui/Preloader'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'

/* ─── Font ───────────────────────────────────────────────────────── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

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
    <html lang="en" suppressHydrationWarning data-loading="" className={inter.variable}>
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
            {children}
          </SmoothScrollProvider>
        </div>
      </body>
    </html>
  )
}
