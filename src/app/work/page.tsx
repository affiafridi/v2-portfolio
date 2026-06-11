import WorkHero       from '@/components/sections/WorkPageHero'
import WorkList        from '@/components/sections/WorkPageList'
import WorkGrid        from '@/components/sections/WorkPageGrid'
import FooterSection   from '@/components/sections/FooterSection'

export const metadata = {
  title: 'Work',
}

export default function WorkPage() {
  return (
    <main>
      <WorkHero />
      <WorkGrid />
      <WorkList />
      <FooterSection />
    </main>
  )
}
