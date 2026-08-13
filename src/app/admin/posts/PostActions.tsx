'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToastStore } from '@/store/useToastStore'
import { Pencil, Trash2 } from 'lucide-react'

export default function PostActions({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    setShowDelete(false)
    setDeleting(false)
    if (res.ok) toast('Post deleted')
    else toast('Failed to delete post', 'error')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/admin/posts/${id}/edit`}>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setShowDelete(true)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
      <ConfirmDialog open={showDelete} onOpenChange={setShowDelete} title={`Delete "${title}"?`} description="This action cannot be undone." onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
