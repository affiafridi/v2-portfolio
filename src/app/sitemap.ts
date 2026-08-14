import type { MetadataRoute } from 'next'
import { getProjects, getServices, getPublishedPosts } from '@/lib/data'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services, posts] = await Promise.all([
    getProjects(),
    getServices(),
    getPublishedPosts(),
  ])

  const staticPages: MetadataRoute.Sitemap = ['', '/work', '/services', '/blog'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }))

  const projectPages: MetadataRoute.Sitemap = projects
    .filter((p) => !p.noindex)
    .map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, lastModified: p.updatedAt }))

  const servicePages: MetadataRoute.Sitemap = services
    .filter((s) => !s.noindex)
    .map((s) => ({ url: `${SITE_URL}/services/${s.slug}`, lastModified: s.updatedAt }))

  const postPages: MetadataRoute.Sitemap = posts
    .filter((p) => !p.noindex)
    .map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt }))

  return [...staticPages, ...projectPages, ...servicePages, ...postPages]
}
