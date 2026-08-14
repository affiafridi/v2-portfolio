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
  const services = await getServices()

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

  return <ServicesPageClient services={mapped} />
}
