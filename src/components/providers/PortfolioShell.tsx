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
  whatsapp,
}: {
  children:  React.ReactNode
  whatsapp?: WhatsAppSettings
}) {
  const pathname = usePathname()

  /* /admin renders its own shell. /maintenance is a full takeover with
     no header/menu/footer — middleware (src/middleware.ts) rewrites
     every non-admin request to this path while maintenance mode is on,
     so by the time a render reaches here there's nothing else on the
     site to navigate to anyway. Admin-logged-in bypass also lives in
     that same middleware check now, not here. */
  if (pathname.startsWith('/admin') || pathname === '/maintenance') {
    return <>{children}</>
  }

  /* Mirrors WhatsAppWidget's own render guard — it needs both a toggle
     and a usable number, so BackToTop must only shift when the FAB is
     genuinely on screen to avoid a floating gap when it isn't. */
  const whatsappActive = !!(whatsapp?.enabled && (whatsapp?.number || '').replace(/\D/g, '').length > 0)

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
