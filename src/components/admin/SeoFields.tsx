'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import MediaField from '@/components/admin/MediaField'
import { SITE_URL } from '@/lib/seo'
import { cn } from '@/lib/utils'

export interface SeoFieldsValue {
  seoTitle: string
  seoDescription: string
  seoImage: string
  noindex: boolean
}

interface SeoFieldsProps {
  value: SeoFieldsValue
  onChange: (value: SeoFieldsValue) => void
  fallbackTitle: string
  fallbackDescription: string
  fallbackImage: string
  previewPath: string
  siteName?: string
}

const TITLE_LIMIT = 60
const TITLE_MIN = 30
const DESCRIPTION_LIMIT = 160
const DESCRIPTION_MIN = 120

type CheckLevel = 'good' | 'ok' | 'bad'
interface Check {
  level: CheckLevel
  message: string
}

const DOT_COLOR: Record<CheckLevel, string> = {
  good: 'bg-emerald-500',
  ok: 'bg-amber-500',
  bad: 'bg-red-500',
}

function getChecks(value: SeoFieldsValue, effectiveTitle: string, effectiveDescription: string, hasImage: boolean): Check[] {
  const checks: Check[] = []

  if (!value.seoTitle) {
    checks.push({ level: 'ok', message: 'No custom SEO title set — using the page title as-is' })
  } else if (effectiveTitle.length > TITLE_LIMIT) {
    checks.push({ level: 'bad', message: 'Title is too long and may get cut off in search results' })
  } else if (effectiveTitle.length < TITLE_MIN) {
    checks.push({ level: 'ok', message: 'Title could be a bit longer for better visibility' })
  } else {
    checks.push({ level: 'good', message: 'Title length looks good' })
  }

  if (!effectiveDescription) {
    checks.push({ level: 'bad', message: 'No meta description — Google will pick text from the page automatically' })
  } else if (effectiveDescription.length > DESCRIPTION_LIMIT) {
    checks.push({ level: 'bad', message: 'Description is too long and may get cut off' })
  } else if (effectiveDescription.length < DESCRIPTION_MIN) {
    checks.push({ level: 'ok', message: 'Description could be a bit longer' })
  } else {
    checks.push({ level: 'good', message: 'Description length looks good' })
  }

  checks.push(
    hasImage
      ? { level: 'good', message: 'A social share image is set' }
      : { level: 'ok', message: 'No image set — add a cover image or a custom social image' }
  )

  if (value.noindex) {
    checks.push({ level: 'bad', message: 'This page is hidden from search engines (noindex is on)' })
  }

  return checks
}

export default function SeoFields({
  value,
  onChange,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  previewPath,
  siteName = 'Aftab',
}: SeoFieldsProps) {
  const update = (patch: Partial<SeoFieldsValue>) => onChange({ ...value, ...patch })

  const effectiveTitle = value.seoTitle || fallbackTitle || 'Untitled'
  const effectiveDescription = value.seoDescription || fallbackDescription || ''
  const effectiveImage = value.seoImage || fallbackImage
  const domain = SITE_URL.replace(/^https?:\/\//, '')
  const checks = getChecks(value, effectiveTitle, effectiveDescription, !!effectiveImage)

  return (
    <div className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600">
          <Search className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">SEO</h3>
          <p className="text-xs text-neutral-500">How this page appears in search results and social shares</p>
        </div>
      </div>

      {/* Google-style preview card */}
      <div className="rounded-md border border-neutral-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-500">
            {siteName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-neutral-800">{siteName}</p>
            <p className="truncate text-[11px] text-neutral-500">{domain}{previewPath}</p>
          </div>
        </div>
        <p className="mt-1.5 truncate text-lg leading-snug text-[#1a0dab]">{effectiveTitle}</p>
        <p className="line-clamp-2 text-sm text-neutral-600">{effectiveDescription || 'No description set — Google will show text pulled from the page.'}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Meta Title</Label>
          <span className={cn('text-xs', effectiveTitle.length > TITLE_LIMIT ? 'text-red-500' : 'text-neutral-400')}>
            {effectiveTitle.length}/{TITLE_LIMIT}
          </span>
        </div>
        <Input
          value={value.seoTitle}
          onChange={(e) => update({ seoTitle: e.target.value })}
          placeholder={fallbackTitle}
          className="h-8 border-neutral-200 bg-white text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Meta Description</Label>
          <span className={cn('text-xs', effectiveDescription.length > DESCRIPTION_LIMIT ? 'text-red-500' : 'text-neutral-400')}>
            {effectiveDescription.length}/{DESCRIPTION_LIMIT}
          </span>
        </div>
        <Textarea
          value={value.seoDescription}
          onChange={(e) => update({ seoDescription: e.target.value })}
          placeholder={fallbackDescription || 'Describe this page for search engines'}
          rows={3}
          className="border-neutral-200 bg-white text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Social Share Image</Label>
        <p className="text-xs text-neutral-400">Leave empty to use the cover image</p>
        <MediaField value={value.seoImage} onChange={(url) => update({ seoImage: url })} size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox checked={value.noindex} onCheckedChange={(v) => update({ noindex: v === true })} />
        <Label className="text-xs font-normal">Hide from search engines (noindex)</Label>
      </div>

      <div className="space-y-1.5 border-t border-indigo-100 pt-3">
        {checks.map((check, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', DOT_COLOR[check.level])} />
            <span className="text-xs text-neutral-600">{check.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
