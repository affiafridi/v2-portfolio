'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export default function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = preview ?? value

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      onChange(data.url)
      setPreview(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(localPreview)
    }

    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemove() {
    setPreview(null)
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {displayUrl ? (
        <div className="relative inline-block">
          <div className="relative h-40 w-40 overflow-hidden rounded-md border border-neutral-200">
            <Image
              src={displayUrl}
              alt="Upload preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-40 w-40 flex-col gap-2"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          ) : (
            <Upload className="h-6 w-6 text-neutral-400" />
          )}
          <span className="text-xs text-neutral-500">
            {uploading ? 'Uploading...' : 'Upload image'}
          </span>
        </Button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
