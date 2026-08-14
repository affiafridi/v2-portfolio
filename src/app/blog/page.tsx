import type { Metadata } from 'next'
import { getPublishedPosts, getSiteSettings } from '@/lib/data'
import { getSeoSettings, buildMetadata } from '@/lib/seo'
import BlogPageClient from './BlogPageClient'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const seo = getSeoSettings(settings)
  return buildMetadata({
    title: seo.blog.title || 'Blog',
    description: seo.blog.description || seo.defaultDescription,
    image: seo.defaultOgImage,
    path: '/blog',
    seo,
  })
}

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSiteSettings()])
  const footer = (settings.footer || {}) as Record<string, unknown>

  const mapped = posts.map(p => ({
    slug:     p.slug,
    num:      p.num,
    category: p.category,
    title:    p.title,
    excerpt:  p.excerpt,
    date:     p.date,
    readTime: p.readTime,
    image:    p.image,
  }))

  return <BlogPageClient posts={mapped} footerSettings={footer} />
}
