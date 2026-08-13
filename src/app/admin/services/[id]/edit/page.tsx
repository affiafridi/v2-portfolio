import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import ServiceForm from '../../ServiceForm'

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const service = await prisma.service.findUnique({ where: { id: params.id } })
  if (!service) notFound()

  return (
    <>
      <AdminHeader title={`Edit: ${service.title}`} />
      <ServiceForm initial={{ ...service, image: service.image || '' }} />
    </>
  )
}
