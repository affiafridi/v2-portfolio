import type { ReactNode } from 'react'
import PortfolioShell from '@/components/providers/PortfolioShell'
import PageTransitionOverlay from '@/components/providers/PageTransitionOverlay'
import { getSiteSettings } from '@/lib/data'

/* Portfolio chrome — Preloader, Header, MenuOverlay, ContactModal, etc.
   Applies only to routes inside this (site) group by virtue of file
   placement, not a runtime pathname check (see the root layout's
   comment for why the old check-based approach broke for /maintenance).
   /admin and /maintenance both sit outside this group entirely. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  // getSiteSettings() is React cache()-deduped, so this costs nothing
  // extra alongside the root layout's own generateMetadata() call
  // within the same request.
  const settings = await getSiteSettings()
  const whatsapp = (settings.whatsapp as { enabled?: boolean; number?: string; profileImage?: string; displayName?: string; greetingMessage?: string } | undefined) ?? {}

  return (
    <>
      <PortfolioShell whatsapp={whatsapp}>
        {children}
      </PortfolioShell>
      <PageTransitionOverlay />
    </>
  )
}
