import { notFound } from 'next/navigation'
import { getServices, getServiceBySlug, getSiteSettings } from '@/lib/data'
import { getSeoSettings, buildMetadata } from '@/lib/seo'
import ServiceDetailClient from './ServiceDetailClient'

export async function generateStaticParams() {
  const services = await getServices()
  return services.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSiteSettings()])
  if (!service) return { title: 'Services' }

  const seo = getSeoSettings(settings)
  return buildMetadata({
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.description,
    image: service.seoImage || service.image || seo.defaultOgImage,
    path: `/services/${slug}`,
    noindex: service.noindex,
    seo,
  })
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [service, allServices] = await Promise.all([getServiceBySlug(slug), getServices()])

  if (!service) notFound()

  const idx = allServices.findIndex(s => s.slug === slug)
  const nextService = allServices[(idx + 1) % allServices.length]

  const mapService = (s: typeof service) => ({
    slug:         s.slug,
    num:          s.num,
    title:        s.title,
    tag:          s.tag,
    description:  s.description,
    points:       s.points,
    deliverables: s.deliverables,
    image:        s.image,
  })

  return <ServiceDetailClient service={mapService(service)} next={mapService(nextService)} />
}
