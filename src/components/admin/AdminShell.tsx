'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Toaster from '@/components/admin/Toaster'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return <div className="admin-shell">{children}</div>
  }

  return (
    <div className="admin-shell flex h-screen bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Toaster />
    </div>
  )
}
