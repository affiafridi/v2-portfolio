import { notFound } from 'next/navigation'
import { getProjects, getProjectBySlug, getSiteSettings } from '@/lib/data'
import { getSeoSettings, buildMetadata, creativeWorkJsonLd } from '@/lib/seo'
import ProjectDetail from '@/components/sections/ProjectDetail'

export async function generateStaticParams() {
  const projects = await getProjects()
  // An empty slug collides with this page's own listing route during
  // static export and fails the whole production build (real incident —
  // API routes now reject saving one, but this is the last line of
  // defense against the build breaking sitewide over one bad record).
  return projects.filter(p => p.slug).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()])
  if (!project) return { title: 'Work' }

  const seo = getSeoSettings(settings)
  return buildMetadata({
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.description,
    image: project.seoImage || project.image || seo.defaultOgImage,
    path: `/work/${slug}`,
    noindex: project.noindex,
    seo,
  })
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [project, allProjects, settings] = await Promise.all([getProjectBySlug(slug), getProjects(), getSiteSettings()])
  if (!project) notFound()

  const idx = allProjects.findIndex(p => p.slug === slug)
  const nextProj = allProjects[(idx + 1) % allProjects.length]
  const seo = getSeoSettings(settings)

  const jsonLd = creativeWorkJsonLd({
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.description,
    image: project.seoImage || project.image,
    path: `/work/${slug}`,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    authorName: seo.siteName,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectDetail
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
    </>
  )
}
