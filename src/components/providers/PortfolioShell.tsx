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
import WhatsAppWidget       from '@/components/ui/WhatsAppWidget'

interface WhatsAppSettings {
  enabled?:         boolean
  number?:          string
  profileImage?:    string
  displayName?:     string
  greetingMessage?: string
}

export default function PortfolioShell({
  children,
  maintenanceMode = false,
  contactEmail,
  isAdminLoggedIn = false,
  whatsapp,
}: {
  children:          React.ReactNode
  maintenanceMode?:  boolean
  contactEmail?:     string
  isAdminLoggedIn?:  boolean
  whatsapp?:         WhatsAppSettings
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  /* Mirrors WhatsAppWidget's own render guard — it needs both a toggle
     and a usable number, so BackToTop must only shift when the FAB is
     genuinely on screen to avoid a floating gap when it isn't. */
  const whatsappActive = !!(whatsapp?.enabled && (whatsapp?.number || '').replace(/\D/g, '').length > 0)

  if (isAdmin) {
    return <>{children}</>
  }

  /* Full takeover, same shape as the isAdmin bypass above — no header,
     menu, or footer, so there's nothing to navigate away to. Checked
     after isAdmin (not before) so /admin/* — the login page included —
     stays reachable the entire time maintenance mode is on; that's the
     only way to turn it back off. Skipped entirely for a logged-in
     admin browsing the regular frontend (not /admin/*) — they should
     see the live site as normal instead of the maintenance page,
     which is meant for logged-out visitors only. */
  if (maintenanceMode && !isAdminLoggedIn) {
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
          <BackToTop shiftedForWidget={whatsappActive} />
          {children}
          <WhatsAppWidget settings={whatsapp} />
        </SmoothScrollProvider>
      </div>
    </>
  )
}
