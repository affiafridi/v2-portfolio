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
    <div className="space-y-1.5">
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-4 shrink-0 text-right text-xs tabular-nums text-neutral-300">
            {index + 1}
          </span>
          <div className="flex flex-1 gap-2">
            <Input
              value={item.title}
              onChange={(e) => handleChange(index, 'title', e.target.value)}
              placeholder="Feature title"
              className="h-8 w-[35%]"
            />
            <Input
              value={item.desc}
              onChange={(e) => handleChange(index, 'desc', e.target.value)}
              placeholder="Feature description"
              className="h-8 flex-1"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(index)}
            className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="h-7 gap-1 text-xs">
        <Plus className="h-3 w-3" />
        Add feature
      </Button>
    </div>
  )
}
