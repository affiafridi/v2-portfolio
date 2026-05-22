import HeroJerez from '@/components/sections/HeroJerez'

export default function Home() {
  return (
    <main>
      <HeroJerez />

      {/* Scroll buffer — lets the sticky header trigger on the dark header.
          Remove once real Work/About sections are built. */}
      <section
        className="flex min-h-screen items-center justify-center"
        style={{ background: '#f0eeea' }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(26,26,26,0.18)' }}
        >
          Work section coming soon
        </p>
      </section>
    </main>
  )
}
