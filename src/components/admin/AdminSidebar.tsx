'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  FileText,
  Layers,
  Settings,
  MessageSquare,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminNavStore } from '@/store/useAdminNavStore'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Services', href: '/admin/services', icon: Briefcase },
  { label: 'Blog', href: '/admin/posts', icon: FileText },
  { label: 'Stack', href: '/admin/stack', icon: Layers },
  { label: 'Submissions', href: '/admin/submissions', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const start = useAdminNavStore((s) => s.start)

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-14 items-center border-b border-neutral-200 px-6">
        <Link href="/admin" className="text-lg font-bold text-neutral-900">
          Portfolio Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { if (!active) start() }}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-neutral-200 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900"
        >
          View site &rarr;
        </Link>
      </div>
    </aside>
  )
}
