'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/admin/ImageUpload'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToastStore } from '@/store/useToastStore'
import { Trash2, Copy, Check } from 'lucide-react'

export default function MediaPage() {
  const toast = useToastStore((s) => s.add)
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const loadFiles = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    if (res.ok) {
      const data = await res.json()
      setFiles(data.files || [])
    }
    setLoading(false)
  }

  useEffect(() => { loadFiles() }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch('/api/admin/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: deleteTarget }) })
    setDeleteTarget(null)
    setDeleting(false)
    if (!res.ok) {
      toast('Failed to delete file', 'error')
      return
    }
    toast('File deleted')
    loadFiles()
  }

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopied(path)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <>
      <AdminHeader title="Media Library" />
      <div className="p-6">
        <div className="mb-6">
          <ImageUpload value="" onChange={() => loadFiles()} />
        </div>

        {loading ? (
          <p className="text-sm text-neutral-400">Loading...</p>
        ) : files.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">No uploaded files yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {files.map((file) => (
              <div key={file} className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <div className="aspect-square">
                  <img src={file} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => copyPath(file)}>
                      {copied === file ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setDeleteTarget(file)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="truncate px-2 py-1 text-xs text-neutral-500">{file.split('/').pop()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete this file?"
        description="This will permanently remove the file from the server."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
