import type { Metadata } from 'next'
import NotFoundContent from '@/components/sections/NotFoundContent'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
  // Next's automatic icon.svg file-convention injection doesn't reach the
  // special not-found boundary the way it does normal page segments, so
  // it has to be declared explicitly here.
  icons: { icon: '/icon.svg' },
}

export default function NotFound() {
  return <NotFoundContent />
}
