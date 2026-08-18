'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Loader2 } from 'lucide-react'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/utils'

export default function FeaturedToggle({
  id, initialFeatured, endpoint = '/api/admin/projects',
}: { id: string; initialFeatured: boolean; endpoint?: string }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [featured, setFeatured] = useState(initialFeatured)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    const next = !featured
    setLoading(true)
    const res = await fetch(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: next }),
    })
    setLoading(false)
    if (res.ok) {
      setFeatured(next)
      toast(next ? 'Marked as featured' : 'Removed from featured')
      router.refresh()
    } else {
      toast('Failed to update', 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={featured}
      aria-label={featured ? 'Remove from featured' : 'Mark as featured'}
      className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-neutral-100 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
      ) : (
        <Star
          className={cn(
            'h-4 w-4 transition-colors',
            featured ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 hover:text-neutral-400'
          )}
        />
      )}
    </button>
  )
}
