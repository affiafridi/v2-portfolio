'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useAdminNavStore } from '@/store/useAdminNavStore'

interface AdminHeaderProps {
  title?: string
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const loading = useAdminNavStore((s) => s.loading)
  const stop = useAdminNavStore((s) => s.stop)

  useEffect(() => { stop() }, [stop])

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-neutral-900">{title || 'Dashboard'}</h1>
      <div className="flex items-center gap-3">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="gap-2 text-neutral-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  )
}
