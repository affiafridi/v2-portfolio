import HeroJerez      from '@/components/sections/HeroJerez'
import AboutSection   from '@/components/sections/AboutSection'
import WorkSection    from '@/components/sections/WorkSection'
import ServiceSection from '@/components/sections/ServiceSection'

export default function Home() {
  return (
    <main>
      <HeroJerez />
      <AboutSection />
      <WorkSection />
      <ServiceSection />
    </main>
  )
}
