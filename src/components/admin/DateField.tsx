'use client'

import { useState } from 'react'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const DISPLAY_FORMAT = 'd MMM yyyy'

interface DateFieldProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function DateField({ value, onChange, className }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const parsed = value ? parse(value, DISPLAY_FORMAT, new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-neutral-300 bg-transparent px-3 text-sm shadow-sm transition-colors hover:bg-neutral-50',
            !selected && 'text-neutral-500',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-neutral-400" />
          {selected ? format(selected, DISPLAY_FORMAT) : 'Select a date'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, DISPLAY_FORMAT))
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
