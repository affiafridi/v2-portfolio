'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/store/useToastStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/admin/ImageUpload'
import ArrayInput from '@/components/admin/ArrayInput'

interface ServiceData {
  id?: string
  slug: string
  num: string
  title: string
  tag: string
  description: string
  points: string[]
  deliverables: string[]
  image: string
  sortOrder: number
}

const DEFAULT: ServiceData = {
  slug: '', num: '', title: '', tag: '', description: '',
  points: [], deliverables: [], image: '', sortOrder: 0,
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Number *</Label>
          <Input value={data.num} onChange={(e) => set('num', e.target.value)} placeholder="01" required />
        </div>
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={data.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Tag *</Label>
          <Input value={data.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Full Stack" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input value={data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated" />
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea value={data.description} onChange={(e) => set('description', e.target.value)} rows={4} required />
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        <ImageUpload value={data.image} onChange={(url) => set('image', url)} />
      </div>

      <ArrayInput value={data.points} onChange={(v) => set('points', v)} label="Key Points" placeholder="e.g. Next.js & React architecture" />
      <ArrayInput value={data.deliverables} onChange={(v) => set('deliverables', v)} label="Deliverables" placeholder="e.g. Source code & documentation" />

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input type="number" value={data.sortOrder} onChange={(e) => set('sortOrder', parseInt(e.target.value))} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
