import HeroSection    from '@/components/sections/HeroSection'
import AboutSection   from '@/components/sections/AboutSection'
import WorkSection    from '@/components/sections/WorkSection'
import ServiceSection from '@/components/sections/ServiceSection'
import StackSection   from '@/components/sections/StackSection'
import FooterSection  from '@/components/sections/FooterSection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <ServiceSection />
      <StackSection />
      <FooterSection />
    </main>
  )
}
