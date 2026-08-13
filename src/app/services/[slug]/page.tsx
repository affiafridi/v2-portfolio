import { notFound } from 'next/navigation'
import { getServices, getServiceBySlug } from '@/lib/data'
import ServiceDetailClient from './ServiceDetailClient'

export async function generateStaticParams() {
  const services = await getServices()
  return services.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  return { title: service ? `${service.title} — Services` : 'Services' }
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
