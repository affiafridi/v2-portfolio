'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface TagsInputProps {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  placeholder?: string
}

export default function TagsInput({ value, onChange, label, placeholder }: TagsInputProps) {
  const [draft, setDraft] = useState('')

  function commit() {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-neutral-300 bg-transparent px-2.5 py-2 focus-within:ring-1 focus-within:ring-neutral-400">
        {value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="text-neutral-400 transition-colors hover:text-neutral-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[100px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
      </div>
    </div>
  )
}
