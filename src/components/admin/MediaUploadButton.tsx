'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToastStore } from '@/store/useToastStore'
import { uploadWithProgress } from '@/lib/uploadWithProgress'
import { Upload } from 'lucide-react'

interface MediaUploadButtonProps {
  onUploaded: () => void
}

export default function MediaUploadButton({ onUploaded }: MediaUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToastStore((s) => s.add)
  const [progress, setProgress] = useState<number | null>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProgress(0)
    const result = await uploadWithProgress(file, setProgress)
    setProgress(null)

    if (result.url) {
      toast('File uploaded')
      onUploaded()
    } else {
      toast(result.error || 'Upload failed', 'error')
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  const uploading = progress !== null

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleChange} className="hidden" />
      <Button
        size="sm"
        className="relative gap-2 overflow-hidden"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading && (
          <span
            className="absolute inset-y-0 left-0 bg-white/20 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {uploading ? `Uploading… ${progress}%` : 'Upload Media'}
        </span>
      </Button>
    </>
  )
}
