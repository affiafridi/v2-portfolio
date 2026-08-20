import type { MetadataRoute } from 'next'
import { getProjects, getServices, getPublishedPosts } from '@/lib/data'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services, posts] = await Promise.all([
    getProjects(),
    getServices(),
    getPublishedPosts(),
  ])

  /* Derived from the newest item each page actually lists, rather than
     new Date(). Stamping "now" on every crawl claims these pages change
     continuously, which is untrue and teaches crawlers to discount the
     field — the opposite of what it's for. */
  const newest = (dates: Date[]) =>
    dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : undefined

  const projectsUpdated = newest(projects.map(p => p.updatedAt))
  const servicesUpdated = newest(services.map(s => s.updatedAt))
  const postsUpdated    = newest(posts.map(p => p.updatedAt))

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`,          lastModified: newest([projectsUpdated, servicesUpdated, postsUpdated].filter(Boolean) as Date[]) },
    { url: `${SITE_URL}/work`,     lastModified: projectsUpdated },
    { url: `${SITE_URL}/services`, lastModified: servicesUpdated },
    { url: `${SITE_URL}/blog`,     lastModified: postsUpdated },
  ]

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
