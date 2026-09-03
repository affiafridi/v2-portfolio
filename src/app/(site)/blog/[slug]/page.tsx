import { notFound } from 'next/navigation'
import { getPublishedPosts, getPostBySlug, getSiteSettings } from '@/lib/data'
import { getSeoSettings, buildMetadata, blogPostingJsonLd, serializeJsonLd } from '@/lib/seo'
import BlogPostClient from './BlogPostClient'

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  // An empty slug collides with this page's own listing route during
  // static export and fails the whole production build (real incident —
  // API routes now reject saving one, but this is the last line of
  // defense against the build breaking sitewide over one bad record).
  return posts.filter(p => p.slug).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSiteSettings()])
  if (!post) return { title: 'Blog' }

  const seo = getSeoSettings(settings)
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.seoImage || post.image || seo.defaultOgImage,
    path: `/blog/${slug}`,
    noindex: post.noindex,
    seo,
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, allPosts, settings] = await Promise.all([getPostBySlug(slug), getPublishedPosts(), getSiteSettings()])

  if (!post) notFound()

  const postIdx = allPosts.findIndex(p => p.slug === slug)
  const nextPost = allPosts[(postIdx + 1) % allPosts.length]
  const seo = getSeoSettings(settings)

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

  const jsonLd = blogPostingJsonLd({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.seoImage || post.image || undefined,
    path: `/blog/${slug}`,
    datePublished: post.date,
    dateModified: post.updatedAt,
    authorName: seo.siteName,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <BlogPostClient post={mapPost(post)} next={mapPost(nextPost)} />
    </>
  )
}
