'use client'

import { usePathname } from 'next/navigation'
import Header               from '@/components/layout/Header'
import Cursor               from '@/components/ui/Cursor'
import MenuOverlay          from '@/components/ui/MenuOverlay'
import Preloader            from '@/components/ui/Preloader'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ContactModal         from '@/components/ui/ContactModal'
import GifFlourish          from '@/components/ui/GifFlourish'
import ScrollRestoration    from '@/components/ui/ScrollRestoration'
import BackToTop            from '@/components/ui/BackToTop'
import MaintenancePage      from '@/components/sections/MaintenancePage'

export default function PortfolioShell({
  children,
  maintenanceMode = false,
  contactEmail,
}: {
  children:        React.ReactNode
  maintenanceMode?: boolean
  contactEmail?:    string
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  /* Full takeover, same shape as the isAdmin bypass above — no header,
     menu, or footer, so there's nothing to navigate away to. Checked
     after isAdmin (not before) so /admin/* — the login page included —
     stays reachable the entire time maintenance mode is on; that's the
     only way to turn it back off. */
  if (maintenanceMode) {
    return <MaintenancePage email={contactEmail} />
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
          <GifFlourish />
          <ScrollRestoration />
          <BackToTop />
          {children}
        </SmoothScrollProvider>
      </div>
    </>
  )
}
