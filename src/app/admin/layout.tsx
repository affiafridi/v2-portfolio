import { SessionProvider } from '@/components/admin/SessionProvider'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = {
  title: 'Admin | Portfolio',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  )
}
