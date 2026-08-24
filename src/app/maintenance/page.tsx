import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data'
import MaintenancePage from '@/components/sections/MaintenancePage'

export const metadata: Metadata = {
  title: 'Working on something new',
  robots: { index: false, follow: false },
}

// Reached via a middleware rewrite (src/middleware.ts), not direct
// navigation — the visitor's URL stays whatever they actually requested.
export default async function Maintenance() {
  const settings = await getSiteSettings()
  const footer = (settings.footer as { email?: string } | undefined) ?? {}
  return <MaintenancePage email={footer.email} />
}
