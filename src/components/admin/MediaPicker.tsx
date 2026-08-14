'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToastStore } from '@/store/useToastStore'
import { uploadWithProgress } from '@/lib/uploadWithProgress'
import { formatFileSize } from '@/lib/formatFileSize'
import LoadingIndicator from '@/components/admin/LoadingIndicator'
import type { MediaAsset } from '@/components/admin/MediaLightbox'
import { Search, Upload, PlayCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
  onSelectMultiple?: (urls: string[]) => void
  accept?: 'image' | 'video' | 'all'
  multiple?: boolean
  alreadySelected?: string[]
}

export default function MediaPicker({ open, onOpenChange, onSelect, onSelectMultiple, accept = 'all', multiple = false, alreadySelected = [] }: MediaPickerProps) {
  const toast = useToastStore((s) => s.add)
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadCount, setUploadCount] = useState<{ done: number; total: number } | null>(null)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailFile, setDetailFile] = useState<MediaAsset | null>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const [altDraft, setAltDraft] = useState('')
  const [savingDetail, setSavingDetail] = useState(false)

  const loadFiles = async (preselectUrls: string[]) => {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    let list: MediaAsset[] = []
    if (res.ok) {
      const data = await res.json()
      list = data.files || []
    }
    setFiles(list)
    setLoading(false)
    const matches = list.filter((f) => preselectUrls.includes(f.url))
    setSelected(new Set(matches.map((f) => f.id)))
    // In single-select mode there's exactly one meaningful preselection —
    // show its details right away instead of making the admin click it again.
    if (!multiple && matches[0]) {
      setDetailFile(matches[0])
      setTitleDraft(matches[0].title)
      setAltDraft(matches[0].alt)
    } else {
      setDetailFile(null)
    }
  }

  useEffect(() => {
    if (open) {
      loadFiles(alreadySelected)
      setQuery('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const filtered = useMemo(() => {
    let list = files
    if (accept !== 'all') list = list.filter((f) => f.type === accept)
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((f) => f.title.toLowerCase().includes(q) || f.filename.toLowerCase().includes(q))
  }, [files, query, accept])

  const openDetail = (file: MediaAsset) => {
    setDetailFile(file)
    setTitleDraft(file.title)
    setAltDraft(file.alt)
  }

  const handleTileClick = (file: MediaAsset) => {
    openDetail(file)
    if (multiple) {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(file.id)) next.delete(file.id)
        else next.add(file.id)
        return next
      })
    } else {
      setSelected(new Set([file.id]))
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || [])
    if (fileList.length === 0) return

    const uploaded: MediaAsset[] = []
    for (let i = 0; i < fileList.length; i++) {
      setUploadCount({ done: i, total: fileList.length })
      setUploadProgress(0)
      const result = await uploadWithProgress(fileList[i], setUploadProgress)
      if (result.asset) {
        uploaded.push(result.asset)
      } else {
        toast(result.error || `Failed to upload ${fileList[i].name}`, 'error')
      }
    }
    setUploadProgress(null)
    setUploadCount(null)
    if (inputRef.current) inputRef.current.value = ''

    if (uploaded.length > 0) {
      setFiles((prev) => [...uploaded, ...prev])
      setSelected((prev) => {
        const next = multiple ? new Set(prev) : new Set<string>()
        uploaded.forEach((a) => next.add(a.id))
        return next
      })
      openDetail(uploaded[uploaded.length - 1])
    }
  }

  const handleSaveDetail = async () => {
    if (!detailFile) return
    setSavingDetail(true)
    const res = await fetch(`/api/admin/media/${detailFile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleDraft, alt: altDraft }),
    })
    setSavingDetail(false)
    if (res.ok) {
      const updated = await res.json()
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      setDetailFile(updated)
      toast('Media updated')
    } else {
      toast('Failed to update media', 'error')
    }
  }

  const handleConfirm = () => {
    const chosen = files.filter((f) => selected.has(f.id))
    if (chosen.length === 0) return
    if (multiple) {
      onSelectMultiple?.(chosen.map((f) => f.url))
    } else {
      onSelect(chosen[0].url)
    }
    onOpenChange(false)
  }

  const acceptAttr = accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*' : 'image/*,video/*'
  const isUploading = uploadProgress !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search media…"
            className="pl-9"
          />
        </div>

        <div className="flex gap-5">
          <div className="max-h-[420px] flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              <input ref={inputRef} type="file" accept={acceptAttr} multiple={multiple} onChange={handleUpload} className="hidden" />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
              >
                {isUploading ? (
                  <>
                    <span className="text-center text-[10px] font-semibold text-neutral-700">
                      {uploadCount && uploadCount.total > 1 ? `${uploadCount.done + 1}/${uploadCount.total} · ` : ''}
                      {uploadProgress}%
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-neutral-200">
                      <div
                        className="h-full bg-neutral-900 transition-[width]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Upload New</span>
                  </>
                )}
              </button>

              {loading ? (
                <div className="col-span-full flex justify-center py-8">
                  <LoadingIndicator />
                </div>
              ) : filtered.length === 0 ? (
                <p className="col-span-full py-8 text-center text-sm text-neutral-400">No media found.</p>
              ) : (
                filtered.map((file) => {
                  const isSelected = selected.has(file.id)
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => handleTileClick(file)}
                      className={cn(
                        'group relative aspect-square overflow-hidden rounded-lg border bg-neutral-50',
                        isSelected ? 'border-neutral-900 ring-2 ring-neutral-900' : 'border-neutral-200'
                      )}
                    >
                      {file.type === 'video' ? (
                        <>
                          <video src={file.url} className="h-full w-full object-cover" preload="metadata" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <PlayCircle className="h-5 w-5 text-white drop-shadow" />
                          </div>
                        </>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file.url} alt={file.alt} className="h-full w-full object-cover" />
                      )}
                      {isSelected && (
                        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {!isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/10 group-hover:opacity-100" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="w-56 shrink-0 border-l border-neutral-200 pl-5">
            {detailFile ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  {detailFile.type === 'video' ? (
                    <video src={detailFile.url} className="h-32 w-full object-contain" muted controls />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={detailFile.url} alt={detailFile.alt} className="h-32 w-full object-contain" />
                  )}
                </div>
                <p className="truncate text-xs text-neutral-500">{detailFile.filename}</p>
                <p className="text-xs text-neutral-400">{formatFileSize(detailFile.size)}</p>

                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Alt Text</Label>
                  <Input value={altDraft} onChange={(e) => setAltDraft(e.target.value)} className="h-8 text-sm" placeholder="Describe this image" />
                </div>
                <Button type="button" size="sm" variant="outline" onClick={handleSaveDetail} disabled={savingDetail} className="w-full">
                  {savingDetail ? 'Saving…' : 'Save Details'}
                </Button>
              </div>
            ) : (
              <p className="pt-8 text-center text-xs text-neutral-400">Select an item to see its details.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleConfirm} disabled={selected.size === 0}>
            {multiple ? `Add ${selected.size || ''} Image${selected.size === 1 ? '' : 's'}` : 'Use Image'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
