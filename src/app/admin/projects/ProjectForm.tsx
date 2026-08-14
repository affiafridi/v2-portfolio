'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/store/useToastStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { refreshCursor } from '@/lib/cursorRefresh'
import MediaField from '@/components/admin/MediaField'
import GalleryMediaInput from '@/components/admin/GalleryMediaInput'
import TagsInput from '@/components/admin/TagsInput'
import FeaturesInput from '@/components/admin/FeaturesInput'
import FormSection from '@/components/admin/FormSection'
import FormToolbar from '@/components/admin/FormToolbar'
import SlugField from '@/components/admin/SlugField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import PublishToggle from '@/components/admin/PublishToggle'

interface ProjectData {
  id?: string
  title: string
  slug: string
  type: string
  year: number
  role: string
  client: string
  duration: string
  description: string
  challenge: string
  tags: string[]
  image: string
  url: string
  published: boolean
  features: { title: string; desc: string }[]
  gallery: string[]
}

const DEFAULT: ProjectData = {
  title: '', slug: '', type: '', year: new Date().getFullYear(), role: '', client: '',
  duration: '', description: '', challenge: '', tags: [], image: '', url: '',
  published: false, features: [], gallery: [],
}

export default function ProjectForm({ initial }: { initial?: ProjectData }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [data, setData] = useState<ProjectData>(initial || DEFAULT)
  const [saving, setSaving] = useState(false)
  const [types, setTypes] = useState<{ id: string; name: string }[]>([])
  const isEdit = !!initial?.id

  useEffect(() => {
    fetch('/api/admin/project-types')
      .then((res) => res.json())
      .then((d) => setTypes(d.types || []))
  }, [])

  const set = <K extends keyof ProjectData>(key: K, val: ProjectData[K]) =>
    setData((d) => ({ ...d, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = isEdit ? `/api/admin/projects/${initial!.id}` : '/api/admin/projects'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setSaving(false)
    if (res.ok) {
      toast(isEdit ? 'Project updated' : 'Project created')
      router.push('/admin/projects')
      router.refresh()
    } else {
      toast('Failed to save project', 'error')
    }
  }

  return (
    <>
      <FormToolbar
        backHref="/admin/projects"
        backLabel="Back to Projects"
        formId="project-form"
        saving={saving}
        isEdit={isEdit}
        entityLabel="Project"
        viewHref={isEdit ? `/work/${data.slug}` : undefined}
        extra={<PublishToggle published={data.published} onChange={(v) => set('published', v)} />}
      />

      <form id="project-form" onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main column — focus content */}
          <div className="space-y-4 lg:col-span-2">
            <FormSection title="Title">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={data.title}
                  onChange={(e) => set('title', e.target.value)}
                  className="text-base"
                  required
                />
                <SlugField
                  title={data.title}
                  value={data.slug}
                  onChange={(slug) => set('slug', slug)}
                  pathPrefix="/work/"
                  isEdit={isEdit}
                />
              </div>
            </FormSection>

            <FormSection title="Description" description="A short, punchy summary shown as the animated headline on the project page">
              <Textarea value={data.description} onChange={(e) => set('description', e.target.value)} rows={3} required />
            </FormSection>

            <FormSection title="Challenge" description="The problem this project solved — supports rich formatting">
              <RichTextEditor content={data.challenge} onChange={(html) => set('challenge', html)} />
            </FormSection>

            <FormSection title="Features">
              <FeaturesInput value={data.features} onChange={(v) => set('features', v)} />
            </FormSection>

            <FormSection title="Gallery">
              <GalleryMediaInput value={data.gallery} onChange={(v) => set('gallery', v)} />
            </FormSection>
          </div>

          {/* Sidebar column — compact metadata */}
          <div className="space-y-4">
            <FormSection title="Cover Image">
              <MediaField value={data.image} onChange={(url) => set('image', url)} />
            </FormSection>

            <FormSection title="Details" description="Metadata for this project">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={data.type || undefined}
                    onValueChange={(v) => set('type', v)}
                    onOpenChange={(open) => { if (!open) refreshCursor() }}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Year *</Label>
                  <Input type="number" value={data.year} onChange={(e) => set('year', parseInt(e.target.value))} required className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration</Label>
                  <Input value={data.duration} onChange={(e) => set('duration', e.target.value)} placeholder="6 weeks" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Role</Label>
                  <Input value={data.role} onChange={(e) => set('role', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Client</Label>
                  <Input value={data.client} onChange={(e) => set('client', e.target.value)} className="h-8 text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tags</Label>
                <TagsInput value={data.tags} onChange={(v) => set('tags', v)} placeholder="Type a tag and press Enter" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">External URL</Label>
                <Input value={data.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" className="h-8 text-sm" />
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </>
  )
}
