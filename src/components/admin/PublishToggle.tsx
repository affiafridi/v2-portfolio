'use client'

import { cn } from '@/lib/utils'

interface PublishToggleProps {
  published: boolean
  onChange: (published: boolean) => void
}

export default function PublishToggle({ published, onChange }: PublishToggleProps) {
  return (
    <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-50 p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'rounded-full px-3 py-1 transition-colors',
          !published ? 'bg-neutral-300 text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'
        )}
      >
        Draft
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'rounded-full px-3 py-1 transition-colors',
          published ? 'bg-green-600 text-white' : 'text-neutral-500 hover:text-neutral-700'
        )}
      >
        Published
      </button>
    </div>
  )
}
