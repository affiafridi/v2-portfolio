import HeroSection    from '@/components/sections/HeroSection'
import AboutSection   from '@/components/sections/AboutSection'
import WorkSection    from '@/components/sections/WorkSection'
import ServiceSection from '@/components/sections/ServiceSection'
import StackSection   from '@/components/sections/StackSection'
import FooterSection  from '@/components/sections/FooterSection'
import { getFeaturedProjects, getServices, getStackCategories, getSiteSettings } from '@/lib/data'

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
      <AboutSection settings={about} />
      <WorkSection />
      <ServiceSection services={services.map(s => ({ num: s.num, label: s.title, tag: s.tag, slug: s.slug, image: s.image }))} />
      <StackSection categories={stackCategories.map(c => ({ num: c.num, label: c.label, desc: c.desc, items: c.items.map(i => ({ name: i.name, slug: i.slug, color: i.color })) }))} />
      <FooterSection settings={footer} />
    </main>
  )
}
