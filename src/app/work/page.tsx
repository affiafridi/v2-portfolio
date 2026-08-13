import WorkHero       from '@/components/sections/WorkPageHero'
import WorkList        from '@/components/sections/WorkPageList'
import WorkGrid        from '@/components/sections/WorkPageGrid'
import FooterSection   from '@/components/sections/FooterSection'
import { getProjects, getSiteSettings } from '@/lib/data'

export const metadata = {
  title: 'Work',
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
