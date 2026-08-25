'use client'

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
  /* No /admin or /maintenance bypass here anymore — this component is
     only ever rendered inside (site)/layout.tsx now, which /admin and
     /maintenance both sit outside of. See the root layout's comment for
     why a runtime pathname check here couldn't reliably detect
     /maintenance in the first place (it's reached via a middleware
     rewrite, invisible to the client). */

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
