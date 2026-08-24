'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/store/useToastStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import MediaField from '@/components/admin/MediaField'
import ArrayInput from '@/components/admin/ArrayInput'
import FormSection from '@/components/admin/FormSection'
import FormToolbar from '@/components/admin/FormToolbar'
import SlugField from '@/components/admin/SlugField'
import PublishToggle from '@/components/admin/PublishToggle'
import SeoFields from '@/components/admin/SeoFields'

interface ServiceData {
  id?: string
  slug: string
  title: string
  tag: string
  description: string
  points: string[]
  deliverables: string[]
  image: string
  published: boolean
  seoTitle: string
  seoDescription: string
  seoImage: string
  noindex: boolean
}

const DEFAULT: ServiceData = {
  slug: '', title: '', tag: '', description: '',
  points: [], deliverables: [], image: '', published: false,
  seoTitle: '', seoDescription: '', seoImage: '', noindex: false,
}

export default function ServiceForm({ initial }: { initial?: ServiceData }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [data, setData] = useState<ServiceData>(initial || DEFAULT)
  const [saving, setSaving] = useState(false)
  const isEdit = !!initial?.id

  const set = <K extends keyof ServiceData>(key: K, val: ServiceData[K]) =>
    setData((d) => ({ ...d, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = isEdit ? `/api/admin/services/${initial!.id}` : '/api/admin/services'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setSaving(false)
    if (res.ok) {
      toast(isEdit ? 'Service updated' : 'Service created')
      router.push('/admin/services')
      router.refresh()
    } else {
      toast('Failed to save service', 'error')
    }
  }

  return (
    <>
      <FormToolbar
        backHref="/admin/services"
        backLabel="Back to Services"
        formId="service-form"
        saving={saving}
        isEdit={isEdit}
        entityLabel="Service"
        viewHref={isEdit ? `/services/${data.slug}` : undefined}
        extra={<PublishToggle published={data.published} onChange={(v) => set('published', v)} />}
      />

      <form id="service-form" onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main column — focus content */}
          <div className="space-y-4 lg:col-span-2">
            <FormSection title="Title">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={data.title} onChange={(e) => set('title', e.target.value)} className="text-base" required />
                <SlugField
                  title={data.title}
                  value={data.slug}
                  onChange={(slug) => set('slug', slug)}
                  pathPrefix="/services/"
                  isEdit={isEdit}
                />
              </div>
            </FormSection>

            <FormSection title="Description">
              <Textarea value={data.description} onChange={(e) => set('description', e.target.value)} rows={4} required />
            </FormSection>

            <FormSection title="Points & Deliverables">
              <ArrayInput value={data.points} onChange={(v) => set('points', v)} label="Key Points" placeholder="e.g. Next.js & React architecture" />
              <ArrayInput value={data.deliverables} onChange={(v) => set('deliverables', v)} label="Deliverables" placeholder="e.g. Source code & documentation" />
            </FormSection>
          </div>

          {/* Sidebar column — compact metadata */}
          <div className="space-y-4">
            <FormSection title="Cover Image">
              <MediaField value={data.image} onChange={(url) => set('image', url)} />
            </FormSection>

            <FormSection title="Details" description="Metadata for this service">
              <div className="space-y-1.5">
                <Label className="text-xs">Tag *</Label>
                <Input value={data.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Full Stack" required className="h-8 text-sm" />
              </div>
            </FormSection>

            <SeoFields
              value={{ seoTitle: data.seoTitle, seoDescription: data.seoDescription, seoImage: data.seoImage, noindex: data.noindex }}
              onChange={(v) => setData((d) => ({ ...d, ...v }))}
              fallbackTitle={data.title}
              fallbackDescription={data.description}
              fallbackImage={data.image}
              previewPath={`/services/${data.slug || 'your-slug'}`}
            />
          </div>
        </div>
      </form>
    </>
  )
}
