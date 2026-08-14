'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import MediaPicker from '@/components/admin/MediaPicker'
import { ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const VIDEO_EXT = /\.(mp4|webm|mov|ogg|ogv)(\?.*)?$/i

interface MediaFieldProps {
  value?: string
  onChange: (url: string) => void
  accept?: 'image' | 'video' | 'all'
  className?: string
}

export default function MediaField({ value, onChange, accept = 'all', className }: MediaFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const isVideo = value ? VIDEO_EXT.test(value) : false

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="block h-40 w-40 overflow-hidden rounded-md border border-neutral-200"
          >
            {isVideo ? (
              <video src={value} className="h-full w-full object-cover" muted preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setPickerOpen(true)}
          className="h-40 w-40 flex-col gap-2"
        >
          <ImageIcon className="h-6 w-6 text-neutral-400" />
          <span className="text-xs text-neutral-500">Select Media</span>
        </Button>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={onChange}
        accept={accept}
        alreadySelected={value ? [value] : []}
      />
    </div>
  )
}
