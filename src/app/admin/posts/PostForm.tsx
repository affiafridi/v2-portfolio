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
import RichTextEditor from '@/components/admin/RichTextEditor'
import FormSection from '@/components/admin/FormSection'
import FormToolbar from '@/components/admin/FormToolbar'
import SlugField from '@/components/admin/SlugField'
import DateField from '@/components/admin/DateField'
import PublishToggle from '@/components/admin/PublishToggle'
import SeoFields from '@/components/admin/SeoFields'

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
  seoTitle: string
  seoDescription: string
  seoImage: string
  noindex: boolean
}

const DEFAULT: PostData = {
  slug: '', num: '', category: '', title: '', excerpt: '', content: '',
  date: '', readTime: '', image: '', published: false,
  seoTitle: '', seoDescription: '', seoImage: '', noindex: false,
}

export default function PostForm({ initial }: { initial?: PostData }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [data, setData] = useState<PostData>(initial || DEFAULT)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const isEdit = !!initial?.id

  useEffect(() => {
    fetch('/api/admin/post-categories')
      .then((res) => res.json())
      .then((d) => setCategories(d.categories || []))
  }, [])

  const set = <K extends keyof PostData>(key: K, val: PostData[K]) =>
    setData((d) => ({ ...d, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.date) {
      toast('Please select a publish date', 'error')
      return
    }
    if (!data.category) {
      toast('Please select a category', 'error')
      return
    }
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
    <>
      <FormToolbar
        backHref="/admin/posts"
        backLabel="Back to Posts"
        formId="post-form"
        saving={saving}
        isEdit={isEdit}
        entityLabel="Post"
        viewHref={isEdit ? `/blog/${data.slug}` : undefined}
        extra={<PublishToggle published={data.published} onChange={(v) => set('published', v)} />}
      />

      <form id="post-form" onSubmit={handleSubmit} className="p-6">
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
                  pathPrefix="/blog/"
                  isEdit={isEdit}
                />
              </div>
            </FormSection>

            <FormSection title="Content">
              <RichTextEditor content={data.content} onChange={(html) => set('content', html)} />
            </FormSection>
          </div>

          {/* Sidebar column — compact metadata */}
          <div className="space-y-4">
            <FormSection title="Cover Image">
              <MediaField value={data.image} onChange={(url) => set('image', url)} />
            </FormSection>

            <FormSection title="Details" description="Metadata for this post">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Number *</Label>
                  <Input value={data.num} onChange={(e) => set('num', e.target.value)} placeholder="001" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Category *</Label>
                  <Select
                    value={data.category || undefined}
                    onValueChange={(v) => set('category', v)}
                    onOpenChange={(open) => { if (!open) refreshCursor() }}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Read Time</Label>
                  <Input value={data.readTime} onChange={(e) => set('readTime', e.target.value)} placeholder="6 min" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date *</Label>
                  <DateField value={data.date} onChange={(date) => set('date', date)} className="h-8 text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Excerpt *</Label>
                <Textarea value={data.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={3} required className="text-sm" />
              </div>
            </FormSection>

            <SeoFields
              value={{ seoTitle: data.seoTitle, seoDescription: data.seoDescription, seoImage: data.seoImage, noindex: data.noindex }}
              onChange={(v) => setData((d) => ({ ...d, ...v }))}
              fallbackTitle={data.title}
              fallbackDescription={data.excerpt}
              fallbackImage={data.image}
              previewPath={`/blog/${data.slug || 'your-slug'}`}
            />
          </div>
        </div>
      </form>
    </>
  )
}
