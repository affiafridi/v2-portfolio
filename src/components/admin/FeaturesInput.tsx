'use client'

import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Feature {
  title: string
  desc: string
}

interface FeaturesInputProps {
  value: Feature[]
  onChange: (value: Feature[]) => void
}

export default function FeaturesInput({ value, onChange }: FeaturesInputProps) {
  function handleAdd() {
    onChange([...value, { title: '', desc: '' }])
  }

  function handleChange(index: number, field: keyof Feature, newValue: string) {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-2 rounded-md border border-neutral-200 p-3"
        >
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <Input
              value={item.title}
              onChange={(e) => handleChange(index, 'title', e.target.value)}
              placeholder="Feature title"
              className="sm:w-1/3"
            />
            <Input
              value={item.desc}
              onChange={(e) => handleChange(index, 'desc', e.target.value)}
              placeholder="Feature description"
              className="flex-1"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(index)}
            className="h-9 w-9 shrink-0 text-neutral-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="gap-1">
        <Plus className="h-3.5 w-3.5" />
        Add feature
      </Button>
    </div>
  )
}
