import HeroJerez      from '@/components/sections/HeroJerez'
import AboutSection   from '@/components/sections/AboutSection'
import WorkSection    from '@/components/sections/WorkSection'
import ServiceSection from '@/components/sections/ServiceSection'
import StackSection   from '@/components/sections/StackSection'

export default function Home() {
  return (
    <main>
      <HeroJerez />
      <AboutSection />
      <WorkSection />
      <ServiceSection />
      <StackSection />
    </main>
  )
}
