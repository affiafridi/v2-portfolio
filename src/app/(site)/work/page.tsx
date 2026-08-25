import type { Metadata } from 'next'
import WorkHero       from '@/components/sections/WorkPageHero'
import WorkList        from '@/components/sections/WorkPageList'
import WorkGrid        from '@/components/sections/WorkPageGrid'
import FooterSection   from '@/components/sections/FooterSection'
import { getProjects, getSiteSettings } from '@/lib/data'
import { getSeoSettings, buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const seo = getSeoSettings(settings)
  return buildMetadata({
    title: seo.work.title || 'Work',
    description: seo.work.description || seo.defaultDescription,
    image: seo.defaultOgImage,
    path: '/work',
    seo,
  })
}

export default async function WorkPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()])
  const footer = (settings.footer || {}) as Record<string, unknown>

  const mapped = projects.map(p => ({
    slug:        p.slug,
    title:       p.title,
    type:        p.type || '',
    year:        p.year,
    image:       p.image,
    tags:        p.tags,
    id:          p.id,
    description: p.description,
  }))

  return (
    <main>
      <WorkHero />
      <WorkGrid projects={mapped} />
      <WorkList projects={mapped} />
      <FooterSection settings={footer} />
    </main>
  )
}
