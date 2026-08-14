'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import MediaUploadButton from '@/components/admin/MediaUploadButton'
import MediaLightbox, { type MediaAsset } from '@/components/admin/MediaLightbox'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import LoadingIndicator from '@/components/admin/LoadingIndicator'
import { useToastStore } from '@/store/useToastStore'
import { Search, ChevronLeft, ChevronRight, ImageOff, PlayCircle, Trash2, X, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 24

export default function MediaPage() {
  const toast = useToastStore((s) => s.add)
  const [files, setFiles] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<MediaAsset | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return files
    return files.filter((f) =>
      f.title.toLowerCase().includes(q) ||
      f.filename.toLowerCase().includes(q) ||
      f.alt.toLowerCase().includes(q)
    )
  }, [files, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())
  const selectAll = () => setSelected(new Set(filtered.map((f) => f.id)))

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    const res = await fetch('/api/admin/media/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected) }),
    })
    setBulkDeleting(false)
    setShowBulkDelete(false)

    if (res.ok) {
      toast(`${selected.size} file${selected.size === 1 ? '' : 's'} deleted`)
      setFiles((prev) => prev.filter((f) => !selected.has(f.id)))
      clearSelection()
    } else {
      toast('Failed to delete selected files', 'error')
    }
  }

  return (
    <>
      <AdminHeader title="Media Library" />
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          {selected.size > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-700">{selected.size} selected</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                disabled={selected.size === filtered.length}
                className="gap-1.5 text-neutral-500"
              >
                <CheckSquare className="h-3.5 w-3.5" /> Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection} className="gap-1.5 text-neutral-500">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDelete(true)}
                className="gap-1.5 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
              </Button>
            </div>
          ) : (
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search media…"
                className="pl-9"
              />
            </div>
          )}
          <MediaUploadButton onUploaded={loadFiles} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingIndicator />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-neutral-400">
            <ImageOff className="h-6 w-6" />
            {query ? `No results for "${query}"` : 'No uploaded files yet.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              {paged.map((file) => {
                const isSelected = selected.has(file.id)
                return (
                  <div
                    key={file.id}
                    className={cn(
                      'group relative overflow-hidden rounded-lg border bg-white text-left',
                      isSelected ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200'
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSelect(file.id) }}
                      className={cn(
                        'absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white/90 transition-colors',
                        isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-white'
                      )}
                      aria-label={isSelected ? 'Deselect' : 'Select'}
                    >
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </button>

                    <button type="button" onClick={() => setActive(file)} className="block w-full text-left">
                      <div className="relative aspect-square overflow-hidden bg-neutral-50">
                        {file.type === 'video' ? (
                          <>
                            <video src={file.url} className="h-full w-full object-cover" preload="metadata" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <PlayCircle className="h-6 w-6 text-white drop-shadow" />
                            </div>
                          </>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={file.url} alt={file.alt} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="truncate px-2 py-1.5 text-[11px] text-neutral-500">
                        {file.title || file.filename}
                      </p>
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between text-sm text-neutral-500">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[88px] text-center text-xs font-medium text-neutral-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <MediaLightbox
        asset={active}
        onClose={() => setActive(null)}
        onSaved={(updated) => {
          setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
          setActive(updated)
        }}
        onDeleted={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={`Delete ${selected.size} file${selected.size === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected files from the server. This action cannot be undone."
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
      />
    </>
  )
}
