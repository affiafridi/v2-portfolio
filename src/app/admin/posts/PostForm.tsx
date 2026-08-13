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
import RichTextEditor from '@/components/admin/RichTextEditor'

interface PostData {
  id?: string
  slug: string
  num: string
  category: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  image: string
  published: boolean
}

const DEFAULT: PostData = {
  slug: '', num: '', category: '', title: '', excerpt: '', content: '',
  date: '', readTime: '', image: '', published: false,
}

export default function PostForm({ initial }: { initial?: PostData }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [data, setData] = useState<PostData>(initial || DEFAULT)
  const [saving, setSaving] = useState(false)
  const isEdit = !!initial?.id

  const set = <K extends keyof PostData>(key: K, val: PostData[K]) =>
    setData((d) => ({ ...d, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = isEdit ? `/api/admin/posts/${initial!.id}` : '/api/admin/posts'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setSaving(false)
    if (res.ok) {
      toast(isEdit ? 'Post updated' : 'Post created')
      router.push('/admin/posts')
      router.refresh()
    } else {
      toast('Failed to save post', 'error')
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

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Number *</Label>
          <Input value={data.num} onChange={(e) => set('num', e.target.value)} placeholder="001" required />
        </div>
        <div className="space-y-2">
          <Label>Category *</Label>
          <Input value={data.category} onChange={(e) => set('category', e.target.value)} placeholder="Design" required />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input value={data.date} onChange={(e) => set('date', e.target.value)} placeholder="12 May 2025" required />
        </div>
        <div className="space-y-2">
          <Label>Read Time</Label>
          <Input value={data.readTime} onChange={(e) => set('readTime', e.target.value)} placeholder="6 min" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Excerpt *</Label>
        <Textarea value={data.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={3} required />
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        <ImageUpload value={data.image} onChange={(url) => set('image', url)} />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor content={data.content} onChange={(html) => set('content', html)} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox checked={data.published} onCheckedChange={(v) => set('published', v === true)} />
        <Label>Published</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
