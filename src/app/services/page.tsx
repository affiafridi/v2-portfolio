
import { getServices, getSiteSettings } from '@/lib/data'
import ServicesPageClient from './ServicesPageClient'

export const metadata = { title: 'Services' }

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
