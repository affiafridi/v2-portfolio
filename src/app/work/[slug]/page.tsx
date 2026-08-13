import { notFound } from 'next/navigation'
import { getProjects, getProjectBySlug } from '@/lib/data'
import ProjectDetail from '@/components/sections/ProjectDetail'

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project  = await getProjectBySlug(slug)
  return { title: project ? `${project.title} — Work` : 'Work' }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [project, allProjects] = await Promise.all([getProjectBySlug(slug), getProjects()])
  if (!project) notFound()

  const idx = allProjects.findIndex(p => p.slug === slug)
  const nextProj = allProjects[(idx + 1) % allProjects.length]

  return <ProjectDetail
    project={{
      ...project,
      type: project.type || undefined,
      role: project.role || undefined,
      client: project.client || undefined,
      duration: project.duration || undefined,
      challenge: project.challenge || undefined,
      url: project.url || undefined,
      features: (project.features as { title: string; desc: string }[]) || [],
      gallery: project.gallery || [],
    }}
    nextProject={{ slug: nextProj.slug, title: nextProj.title, type: nextProj.type || undefined, year: nextProj.year }}
  />
}
