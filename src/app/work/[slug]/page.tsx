import { notFound } from 'next/navigation'
import { projects }    from '@/data/projects'
import ProjectDetail   from '@/components/sections/ProjectDetail'

export function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project  = projects.find(p => p.slug === slug)
  return { title: project ? `${project.title} — Work` : 'Work' }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project  = projects.find(p => p.slug === slug)
  if (!project) notFound()

  return <ProjectDetail project={project} />
}
