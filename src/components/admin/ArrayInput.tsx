'use client'

import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ArrayInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
}

export default function ArrayInput({ value, onChange, placeholder, label }: ArrayInputProps) {
  function handleAdd() {
    onChange([...value, ''])
  }

  function handleChange(index: number, newValue: string) {
    const updated = [...value]
    updated[index] = newValue
    onChange(updated)
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}

      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-4 shrink-0 text-right text-xs tabular-nums text-neutral-300">
            {index + 1}
          </span>
          <Input
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={placeholder}
            className="h-8 flex-1"
          />
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
        Add
      </Button>
    </div>
  )
}
