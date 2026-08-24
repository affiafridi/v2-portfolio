'use client'

import { useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { slugify } from '@/lib/slugify'

interface SlugFieldProps {
  title: string
  value: string
  onChange: (slug: string) => void
  pathPrefix: string
  isEdit?: boolean
}

function sanitizeFinal(v: string) {
  return v.replace(/-+/g, '-').replace(/(^-|-$)/g, '')
}

export default function SlugField({ title, value, onChange, pathPrefix, isEdit }: SlugFieldProps) {
  const [editing, setEditing] = useState(false)
  const touchedRef = useRef(!!isEdit && !!value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!touchedRef.current) onChange(slugify(title))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleManualChange(v: string) {
    touchedRef.current = true
    onChange(v.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))
  }

  function commit() {
    const sanitized = sanitizeFinal(value)
    if (sanitized) {
      onChange(sanitized)
    } else {
      // Clearing the field entirely and blurring used to commit an empty
      // slug outright — which the server had no guard against either
      // (see the API routes), and an empty slug isn't just cosmetically
      // wrong: it collides with the listing page's own path during
      // static export and fails the whole production build. Treating
      // "cleared it" as "go back to auto-generating from the title"
      // instead means there's no way to end up with an empty slug just
      // by blurring, matching what happens before the pencil is ever
      // clicked.
      touchedRef.current = false
      onChange(slugify(title))
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-neutral-400">{pathPrefix}</span>
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleManualChange(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit() }
          }}
          className="border-b border-neutral-300 bg-transparent font-mono text-xs text-neutral-700 outline-none focus:border-neutral-900"
        />
      ) : (
        <>
          <span className="font-mono text-xs text-neutral-500">{value || 'auto-generated'}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-neutral-300 transition-colors hover:text-neutral-600"
            aria-label="Edit slug"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  )
}
