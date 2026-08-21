import type { Metadata } from 'next'
import { getServices, getSiteSettings } from '@/lib/data'
import { getSeoSettings, buildMetadata } from '@/lib/seo'
import ServicesPageClient from './ServicesPageClient'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const seo = getSeoSettings(settings)
  return buildMetadata({
    title: seo.services.title || 'Services',
    description: seo.services.description || seo.defaultDescription,
    image: seo.defaultOgImage,
    path: '/services',
    seo,
  })
}

export default async function ServicesPage() {
  // getSiteSettings() is React cache()-deduped, so calling it again here
  // (generateMetadata above already does) costs nothing extra. This page
  // was the only one of Work/Services/Blog never fetching it at all, so
  // its footer rendered site-wide hardcoded defaults (wrong email,
  // socials, copyright name, ...) regardless of what's actually
  // configured in the dashboard — same fetch-and-forward pattern already
  // used by work/page.tsx and BlogPageClient's caller.
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()])
  const footer = (settings.footer || {}) as Record<string, unknown>

  const mapped = services.map(s => ({
    slug:         s.slug,
    num:          s.num,
    title:        s.title,
    tag:          s.tag,
    description:  s.description,
    points:       s.points,
    deliverables: s.deliverables,
    image:        s.image,
  }))

  return <ServicesPageClient services={mapped} footerSettings={footer} />
}
