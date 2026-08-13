import { notFound } from 'next/navigation'
import { getPublishedPosts, getPostBySlug } from '@/lib/data'
import BlogPostClient from './BlogPostClient'

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  return { title: post ? `${post.title} — Blog` : 'Blog' }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPublishedPosts()])

  if (!post) notFound()

  const postIdx = allPosts.findIndex(p => p.slug === slug)
  const nextPost = allPosts[(postIdx + 1) % allPosts.length]

  const mapPost = (p: typeof post) => ({
    slug:     p.slug,
    num:      p.num,
    category: p.category,
    title:    p.title,
    excerpt:  p.excerpt,
    content:  p.content,
    date:     p.date,
    readTime: p.readTime,
    image:    p.image,
  })

  return <BlogPostClient post={mapPost(post)} next={mapPost(nextPost)} />
}
