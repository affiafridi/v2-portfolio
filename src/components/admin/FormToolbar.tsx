'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormToolbarProps {
  backHref: string
  backLabel: string
  formId: string
  saving: boolean
  isEdit: boolean
  entityLabel: string
  extra?: ReactNode
  viewHref?: string
}

export default function FormToolbar({ backHref, backLabel, formId, saving, isEdit, entityLabel, extra, viewHref }: FormToolbarProps) {
  const router = useRouter()

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-6 py-3 backdrop-blur">
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>
      <div className="flex items-center gap-3">
        {viewHref && (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            View live
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {extra}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => router.push(backHref)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="sm" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? `Update ${entityLabel}` : `Create ${entityLabel}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
