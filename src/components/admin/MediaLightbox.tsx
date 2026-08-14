'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToastStore } from '@/store/useToastStore'
import { Copy, Check, Trash2 } from 'lucide-react'
import { formatFileSize } from '@/lib/formatFileSize'

export interface MediaAsset {
  id: string
  url: string
  filename: string
  type: 'image' | 'video'
  alt: string
  title: string
  size: number
  createdAt: string
}

interface MediaLightboxProps {
  asset: MediaAsset | null
  onClose: () => void
  onSaved: (asset: MediaAsset) => void
  onDeleted: (id: string) => void
}

export default function MediaLightbox({ asset, onClose, onSaved, onDeleted }: MediaLightboxProps) {
  const toast = useToastStore((s) => s.add)
  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (asset) {
      setTitle(asset.title)
      setAlt(asset.alt)
    }
  }, [asset])

  if (!asset) return null

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/media/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, alt }),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      onSaved(updated)
      toast('Media updated')
    } else {
      toast('Failed to update media', 'error')
    }
  }

  const copyPath = () => {
    navigator.clipboard.writeText(asset.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/admin/media/${asset.id}`, { method: 'DELETE' })
    setDeleting(false)
    setShowDelete(false)
    if (res.ok) {
      toast('File deleted')
      onDeleted(asset.id)
      onClose()
    } else {
      toast('Failed to delete file', 'error')
    }
  }

  return (
    <>
      <Dialog open={!!asset} onOpenChange={(open) => { if (!open) onClose() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              {asset.type === 'video' ? (
                <video src={asset.url} controls className="h-full max-h-72 w-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.url} alt={asset.alt} className="h-full max-h-72 w-full object-contain" />
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Alt Text</Label>
                <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe this image" />
              </div>
              <p className="text-xs text-neutral-400">{formatFileSize(asset.size)}</p>

              <div className="space-y-1.5">
                <Label className="text-xs">File URL</Label>
                <div className="flex items-center gap-2">
                  <Input value={asset.url} readOnly className="font-mono text-xs" />
                  <Button type="button" variant="outline" size="icon" onClick={copyPath} className="h-9 w-9 shrink-0">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDelete(true)}
                  className="gap-1.5 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete this file?"
        description="This will permanently remove the file from the server."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
