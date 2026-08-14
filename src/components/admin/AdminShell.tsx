'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Toaster from '@/components/admin/Toaster'
import PageLoadingOverlay from '@/components/admin/PageLoadingOverlay'
import { useAdminNavStore } from '@/store/useAdminNavStore'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'
  const start = useAdminNavStore((s) => s.start)
  const stop = useAdminNavStore((s) => s.stop)

  // Radix portals (Popover, Dialog, ...) render as direct children of <body>,
  // outside this component's own subtree, so the .admin-shell cursor override
  // below wouldn't reach them unless the class also lives on <body> itself.
  useEffect(() => {
    document.body.classList.add('admin-shell')
    return () => document.body.classList.remove('admin-shell')
  }, [])

  // <html data-loading> ships on every SSR page and is only ever cleared by
  // the portfolio's <Preloader>, which never mounts on admin routes. Left
  // in place it permanently paints <html>/<body> near-black (see globals.css)
  // — normally hidden behind the admin UI, but exposed as a black gap
  // whenever the admin shell's height falls short of the real viewport.
  useEffect(() => {
    document.documentElement.removeAttribute('data-loading')
  }, [])

  // Consecutive admin pages render <AdminHeader> at the same tree position,
  // so React updates that instance in place instead of remounting it — its
  // own mount-effect stop() only ever fires once. Clearing loading here
  // instead, on every pathname change, is the signal that's actually
  // guaranteed to fire when a navigation completes.
  useEffect(() => {
    stop()
  }, [pathname, stop])

  // Sidebar nav only covers top-level section switches. Any link that
  // navigates to a different admin page — Add/Edit buttons, back links,
  // pagination, etc. — should show the same header loading pill.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a')
      const href = anchor?.getAttribute('href')
      if (!href || !href.startsWith('/admin') || href === pathname) return
      start()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname, start])

  if (isLogin) {
    return <div className="admin-shell">{children}</div>
  }

  return (
    <div className="admin-shell flex h-dvh bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
      <PageLoadingOverlay />
    </div>
  )
}
