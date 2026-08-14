import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import ProjectForm from '../../ProjectForm'

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) notFound()

  const initial = {
    ...project,
    type: project.type || '',
    role: project.role || '',
    client: project.client || '',
    duration: project.duration || '',
    challenge: project.challenge || '',
    url: project.url || '',
    features: project.features as { title: string; desc: string }[],
    seoTitle: project.seoTitle || '',
    seoDescription: project.seoDescription || '',
    seoImage: project.seoImage || '',
  }

  return (
    <>
      <AdminHeader title={`Edit: ${project.title}`} />
      <ProjectForm initial={initial} />
    </>
  )
}
