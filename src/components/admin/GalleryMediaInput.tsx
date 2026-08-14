'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import MediaPicker from '@/components/admin/MediaPicker'
import { Plus, X, PlayCircle } from 'lucide-react'

const VIDEO_EXT = /\.(mp4|webm|mov|ogg|ogv)(\?.*)?$/i

interface GalleryMediaInputProps {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
}

export default function GalleryMediaInput({ value, onChange, label }: GalleryMediaInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const handleSelect = (url: string) => {
    if (editIndex === null) {
      onChange([...value, url])
    } else {
      const next = [...value]
      next[editIndex] = url
      onChange(next)
    }
  }

  const handleSelectMultiple = (urls: string[]) => {
    const newOnes = urls.filter((u) => !value.includes(u))
    if (newOnes.length > 0) onChange([...value, ...newOnes])
  }

  const openAdd = () => { setEditIndex(null); setPickerOpen(true) }
  const openEdit = (i: number) => { setEditIndex(i); setPickerOpen(true) }
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="grid grid-cols-7 gap-2">
        {value.map((url, i) => {
          const isVideo = VIDEO_EXT.test(url)
          return (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200">
              <button type="button" onClick={() => openEdit(i)} className="block h-full w-full">
                {isVideo ? (
                  <>
                    <video src={url} className="h-full w-full object-cover" muted preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <PlayCircle className="h-4 w-4 text-white drop-shadow" />
                    </div>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
        <button
          type="button"
          onClick={openAdd}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
        onSelectMultiple={handleSelectMultiple}
        multiple={editIndex === null}
        alreadySelected={editIndex === null ? value : value[editIndex] ? [value[editIndex]] : []}
      />
    </div>
  )
}
