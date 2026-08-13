'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToastStore } from '@/store/useToastStore'
import { Mail, MailOpen, Archive, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface Submission {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  interests: string[]
  read: boolean
  archived: boolean
  createdAt: string
}

export default function SubmissionsList({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const toggleRead = async (id: string, read: boolean) => {
    const res = await fetch(`/api/admin/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: !read }) })
    if (!res.ok) { toast('Failed to update submission', 'error'); return }
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, read: !read } : s))
    router.refresh()
  }

  const toggleArchive = async (id: string, archived: boolean) => {
    const res = await fetch(`/api/admin/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: !archived }) })
    if (!res.ok) { toast('Failed to update submission', 'error'); return }
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, archived: !archived } : s))
    router.refresh()
  }

  const filtered = submissions.filter((s) => {
    if (filter === 'unread') return !s.read && !s.archived
    if (filter === 'archived') return s.archived
    return !s.archived
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/submissions/${deleteTarget}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    if (!res.ok) { toast('Failed to delete submission', 'error'); return }
    setSubmissions((prev) => prev.filter((s) => s.id !== deleteTarget))
    toast('Submission deleted')
    router.refresh()
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Inbox</Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>Unread</Button>
        <Button variant={filter === 'archived' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('archived')}>Archived</Button>
        <span className="ml-auto text-sm text-neutral-500">{filtered.length} submissions</span>
      </div>

      <div className="space-y-3">
        {filtered.map((sub) => (
          <Card key={sub.id} className={`transition-colors ${!sub.read ? 'border-blue-200 bg-blue-50/50' : ''}`}>
            <CardHeader className="cursor-pointer pb-2" onClick={() => { setExpandedId(expandedId === sub.id ? null : sub.id); if (!sub.read) toggleRead(sub.id, false) }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!sub.read ? <Mail className="h-4 w-4 text-blue-500" /> : <MailOpen className="h-4 w-4 text-neutral-400" />}
                  <div>
                    <CardTitle className="text-sm font-medium">{sub.name}</CardTitle>
                    <p className="text-xs text-neutral-500">{sub.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sub.interests.length > 0 && (
                    <div className="flex gap-1">
                      {sub.interests.slice(0, 2).map((int) => (
                        <Badge key={int} variant="secondary" className="text-xs">{int}</Badge>
                      ))}
                      {sub.interests.length > 2 && <Badge variant="secondary" className="text-xs">+{sub.interests.length - 2}</Badge>}
                    </div>
                  )}
                  <span className="text-xs text-neutral-400">{new Date(sub.createdAt).toLocaleDateString()}</span>
                  {expandedId === sub.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
            {expandedId === sub.id && (
              <CardContent className="pt-0">
                <div className="mb-3 rounded-md bg-neutral-50 p-3">
                  <p className="whitespace-pre-wrap text-sm">{sub.message}</p>
                </div>
                {sub.phone && <p className="mb-3 text-sm text-neutral-500">Phone: {sub.phone}</p>}
                {sub.interests.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {sub.interests.map((int) => <Badge key={int} variant="outline">{int}</Badge>)}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleRead(sub.id, sub.read)}>
                    {sub.read ? <><Mail className="mr-1 h-3 w-3" /> Mark Unread</> : <><MailOpen className="mr-1 h-3 w-3" /> Mark Read</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleArchive(sub.id, sub.archived)}>
                    <Archive className="mr-1 h-3 w-3" /> {sub.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => setDeleteTarget(sub.id)}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">No submissions found.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete submission?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
