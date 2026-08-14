'use client'

import { Input } from '@/components/ui/input'

interface ColorPickerInputProps {
  value: string
  onChange: (hex: string) => void
}

export default function ColorPickerInput({ value, onChange }: ColorPickerInputProps) {
  const sanitized = /^[0-9a-fA-F]{6}$/.test(value) ? value : '000000'

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={`#${sanitized}`}
        onChange={(e) => onChange(e.target.value.replace('#', '').toUpperCase())}
        className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-neutral-300 bg-transparent p-0.5"
        aria-label="Pick a color"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.replace('#', '').toUpperCase())}
        placeholder="61DAFB"
        className="flex-1 font-mono uppercase"
        maxLength={6}
      />
    </div>
  )
}
