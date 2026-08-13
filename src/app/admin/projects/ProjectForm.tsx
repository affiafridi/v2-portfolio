'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/store/useToastStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import ImageUpload from '@/components/admin/ImageUpload'
import ArrayInput from '@/components/admin/ArrayInput'
import FeaturesInput from '@/components/admin/FeaturesInput'

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
  featured: boolean
  sortOrder: number
  features: { title: string; desc: string }[]
  gallery: string[]
}

const DEFAULT: ProjectData = {
  title: '', slug: '', type: '', year: new Date().getFullYear(), role: '', client: '',
  duration: '', description: '', challenge: '', tags: [], image: '', url: '',
  featured: false, sortOrder: 0, features: [], gallery: [],
}

export default function ProjectForm({ initial }: { initial?: ProjectData }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [data, setData] = useState<ProjectData>(initial || DEFAULT)
  const [saving, setSaving] = useState(false)
  const isEdit = !!initial?.id

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
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={data.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Input value={data.type} onChange={(e) => set('type', e.target.value)} placeholder="e.g. E-commerce Website" />
        </div>
        <div className="space-y-2">
          <Label>Year *</Label>
          <Input type="number" value={data.year} onChange={(e) => set('year', parseInt(e.target.value))} required />
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input value={data.duration} onChange={(e) => set('duration', e.target.value)} placeholder="e.g. 6 weeks" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={data.role} onChange={(e) => set('role', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Client</Label>
          <Input value={data.client} onChange={(e) => set('client', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea value={data.description} onChange={(e) => set('description', e.target.value)} rows={3} required />
      </div>

      <div className="space-y-2">
        <Label>Challenge</Label>
        <Textarea value={data.challenge} onChange={(e) => set('challenge', e.target.value)} rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        <ImageUpload value={data.image} onChange={(url) => set('image', url)} />
      </div>

      <div className="space-y-2">
        <Label>External URL</Label>
        <Input value={data.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" />
      </div>

      <ArrayInput value={data.tags} onChange={(v) => set('tags', v)} label="Tags" placeholder="e.g. Next.js" />
      <ArrayInput value={data.gallery} onChange={(v) => set('gallery', v)} label="Gallery URLs" placeholder="Image URL" />
      <FeaturesInput value={data.features} onChange={(v) => set('features', v)} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" value={data.sortOrder} onChange={(e) => set('sortOrder', parseInt(e.target.value))} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Checkbox
            checked={data.featured}
            onCheckedChange={(v) => set('featured', v === true)}
          />
          <Label>Featured on homepage</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
