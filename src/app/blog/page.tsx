import { getPublishedPosts, getSiteSettings } from '@/lib/data'
import BlogPageClient from './BlogPageClient'

export const metadata = { title: 'Blog' }

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
