import type { Metadata } from 'next'
import HeroSection    from '@/components/sections/HeroSection'
import WorkSection    from '@/components/sections/WorkSection'
import ServiceSection from '@/components/sections/ServiceSection'
import StackSection   from '@/components/sections/StackSection'
import FooterSection  from '@/components/sections/FooterSection'
import { getFeaturedProjects, getServices, getStackCategories, getSiteSettings } from '@/lib/data'
import { getSeoSettings, buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const seo = getSeoSettings(settings)
  return {
    ...buildMetadata({
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      image: seo.defaultOgImage,
      path: '/',
      seo,
    }),
    // The root layout's title.template would otherwise wrap this in
    // "<title> | Aftab" — the home page's title IS the site title.
    title: { absolute: seo.defaultTitle },
  }
}

export default async function Home() {
  const [settings, services, stackCategories] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getStackCategories(),
  ])

  const hero   = (settings.hero   || {}) as Record<string, unknown>
  const about  = (settings.about  || {}) as Record<string, unknown>
  const footer = (settings.footer || {}) as Record<string, unknown>

  return (
    <main>
      <HeroSection settings={hero} />
      <WorkSection aboutSettings={about} />
      <ServiceSection services={services.map(s => ({ num: s.num, label: s.title, tag: s.tag, slug: s.slug, image: s.image }))} />
      <StackSection categories={stackCategories.map(c => ({ num: c.num, label: c.label, desc: c.desc, items: c.items.map(i => ({ name: i.name, slug: i.slug, color: i.color })) }))} />
      <FooterSection settings={footer} />
    </main>
  )
}
