'use client'

import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Label } from '@/components/ui/label'
import MediaPicker from '@/components/admin/MediaPicker'
import { useToastStore } from '@/store/useToastStore'
import { GripVertical, Plus, X, PlayCircle } from 'lucide-react'

const VIDEO_EXT = /\.(mp4|webm|mov|ogg|ogv)(\?.*)?$/i
const MAX_IMAGES = 12

interface GalleryMediaInputProps {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
}

/* This order is real, not cosmetic — WorkSection's homepage card-stack
   and the single project page's gallery grid both render in this exact
   array order, so dragging a tile here changes what visitors actually
   see and in what sequence, not just how the admin grid looks. */
function SortableTile({ url, onEdit, onRemove }: { url: string; onEdit: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url })
  const isVideo = VIDEO_EXT.test(url)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200"
    >
      <button type="button" onClick={onEdit} className="block h-full w-full">
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
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
      {/* Separate handle, not the whole tile — the tile's own onClick
          already opens the edit picker (matches every other admin
          drag-list in this app: StackManager's categories, the shared
          AdminDataTable). stopPropagation so a drag-ending click on the
          handle itself doesn't also trigger the tile's edit button. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-1 left-1 flex h-5 w-5 cursor-grab items-center justify-center rounded bg-black/55 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </button>
    </div>
  )
}

export default function GalleryMediaInput({ value, onChange, label }: GalleryMediaInputProps) {
  const toast = useToastStore((s) => s.add)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

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
    const room = MAX_IMAGES - value.length
    const accepted = newOnes.slice(0, room)
    if (newOnes.length > accepted.length) {
      toast(`Gallery is capped at ${MAX_IMAGES} images — added ${accepted.length}, skipped ${newOnes.length - accepted.length}.`, 'error')
    }
    if (accepted.length > 0) onChange([...value, ...accepted])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = value.indexOf(active.id as string)
    const newIndex = value.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    onChange(arrayMove(value, oldIndex, newIndex))
  }

  const atLimit = value.length >= MAX_IMAGES
  const openAdd = () => { setEditIndex(null); setPickerOpen(true) }
  const openEdit = (i: number) => { setEditIndex(i); setPickerOpen(true) }
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {/* The count shows regardless of whether a label was passed — the
          only current call site (ProjectForm's gallery field) relies on
          its wrapping FormSection for the heading instead, so gating
          this on `label &&` would have made it invisible there, the one
          place it actually needs to be seen. */}
      <div className="flex items-center justify-between">
        {label ? <Label>{label}</Label> : <span />}
        <span className="text-xs text-neutral-400">{value.length}/{MAX_IMAGES}</span>
      </div>
      <DndContext id="gallery-media-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-7 gap-2">
            {value.map((url, i) => (
              <SortableTile key={url} url={url} onEdit={() => openEdit(i)} onRemove={() => remove(i)} />
            ))}
            {!atLimit && (
              <button
                type="button"
                onClick={openAdd}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

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
