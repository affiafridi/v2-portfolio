'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToastStore } from '@/store/useToastStore'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'

export default function ProjectActions({ id, title, slug }: { id: string; title: string; slug: string }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setShowDelete(false)
    setDeleting(false)
    if (res.ok) {
      toast('Project deleted')
    } else {
      toast('Failed to delete project', 'error')
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <a href={`/work/${slug}`} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
      </a>
      <Link href={`/admin/projects/${id}/edit`}>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setShowDelete(true)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title={`Delete "${title}"?`}
        description="This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
