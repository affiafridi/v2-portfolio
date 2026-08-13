'use client'

import { usePathname } from 'next/navigation'
import Header               from '@/components/layout/Header'
import Cursor               from '@/components/ui/Cursor'
import MenuOverlay          from '@/components/ui/MenuOverlay'
import Preloader            from '@/components/ui/Preloader'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ContactModal         from '@/components/ui/ContactModal'
import ScrollRestoration    from '@/components/ui/ScrollRestoration'
import BackToTop            from '@/components/ui/BackToTop'

export default function PortfolioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Preloader />
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
    </>
  )
}
