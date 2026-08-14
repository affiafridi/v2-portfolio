import { SessionProvider } from '@/components/admin/SessionProvider'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = {
  title: 'Admin | Portfolio',
  // Belt-and-suspenders alongside robots.txt's Disallow: /admin — that only
  // stops crawling, it doesn't guarantee exclusion if a URL gets discovered
  // via an external link. This tag directly tells search engines not to
  // index the page even if they find it.
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  )
}
