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
  size?: 'default' | 'sm'
}

const SIZE_CLASS = {
  default: 'h-40 w-40',
  sm: 'h-20 w-20',
}

export default function MediaField({ value, onChange, accept = 'all', className, size = 'default' }: MediaFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const isVideo = value ? VIDEO_EXT.test(value) : false
  const sizeClass = SIZE_CLASS[size]

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={cn('block overflow-hidden rounded-md border border-neutral-200', sizeClass)}
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
          className={cn('flex-col gap-1.5', sizeClass)}
        >
          <ImageIcon className={cn('text-neutral-400', size === 'sm' ? 'h-4 w-4' : 'h-6 w-6')} />
          <span className={cn('text-neutral-500', size === 'sm' ? 'text-[10px]' : 'text-xs')}>Select Media</span>
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
