'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Link from '@/components/ui/TransitionLink'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
import FooterSection from '@/components/sections/FooterSection'

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

interface PostItem {
  slug: string
  num: string
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string | null
}

function PostRow({ post }: { post: PostItem }) {
  const wrapRef     = useRef<HTMLDivElement>(null)
  const dividerRef  = useRef<HTMLDivElement>(null)
  const contentRef  = useRef<HTMLAnchorElement>(null)
  const revealedRef = useRef(false)
  const { setCursorType } = useCursorStore()

  useLayoutEffect(() => {
    gsap.set(dividerRef.current,  { clipPath: 'inset(0 100% 0 0)' })
    gsap.set(contentRef.current,  { autoAlpha: 0, y: 20 })
  }, [])

  useEffect(() => {
    const reveal = () => {
      if (revealedRef.current) return
      revealedRef.current = true
      const tl = gsap.timeline()
      tl.to(dividerRef.current, { clipPath: 'inset(0 0% 0 0)', duration: 0.65, ease: 'power3.out' })
        .to(contentRef.current, { autoAlpha: 1, y: 0, duration: 0.60, ease: 'power3.out' }, '-=0.20')
    }
    const st = ScrollTrigger.create({ trigger: wrapRef.current, start: 'top 82%', onEnter: reveal, onLeaveBack: reveal })
    return () => st.kill()
  }, [])

  return (
    <div ref={wrapRef}>
      <div ref={dividerRef} style={{ height: '1px', minHeight: '1px', maxHeight: '1px', background: INK, width: '100%', display: 'block', lineHeight: 0, fontSize: 0, overflow: 'hidden', flexShrink: 0 }} />
      <Link ref={contentRef} href={`/blog/${post.slug}`} className="bl-row" style={{ display: 'grid', gridTemplateColumns: '100px 1fr clamp(200px, 22vw, 320px)', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center', padding: 'clamp(40px, 5.5vw, 64px) 0', textDecoration: 'none', cursor: 'none' }} onMouseEnter={() => setCursorType('hover')} onMouseLeave={() => setCursorType('default')}>
        <div>
          <div style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: `${INK}12`, lineHeight: 1, marginBottom: '10px' }}>{post.num}</div>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACC }}>Blog</div>
        </div>
        <div>
          <h2 className="bl-title" style={{ fontSize: 'clamp(24px, 3vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.0, color: INK, margin: '0 0 clamp(14px, 1.8vw, 22px)', transition: 'color 0.22s ease' }}>{post.title}</h2>
          <p style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', lineHeight: 1.70, color: `${INK}55`, margin: '0 0 clamp(22px, 3vw, 36px)', maxWidth: '58ch' }}>{post.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span className="bl-read" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, borderBottom: `1px solid ${INK}28`, paddingBottom: '4px', transition: 'color 0.22s ease, border-color 0.22s ease' }}>
              Read Article
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden><path d="M1 4h10M7 1l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: `${INK}28` }}>{post.readTime} read</span>
          </div>
        </div>
        <div style={{ borderRadius: 'clamp(8px, 1vw, 12px)', overflow: 'hidden', aspectRatio: '4/3', border: `1px solid ${INK}0d`, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image || ''} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.50s ease' }} className="bl-img" />
        </div>
      </Link>
    </div>
  )
}

export default function BlogPageClient({ posts, footerSettings }: { posts: PostItem[]; footerSettings?: Record<string, unknown> }) {
  const heroRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    gsap.set('.blh-line1',  { opacity: 0, y: -48, filter: 'blur(12px)' })
    gsap.set('.blh-line2',  { opacity: 0, y: -36, filter: 'blur(10px)' })
    gsap.set('.blh-scroll', { opacity: 0, y: 16 })
  }, [])

  useEffect(() => {
    const el = heroRef.current!
    const resetHero = () => {
      gsap.set('.blh-line1',  { opacity: 0, y: -48, filter: 'blur(12px)' })
      gsap.set('.blh-line2',  { opacity: 0, y: -36, filter: 'blur(10px)' })
      gsap.set('.blh-scroll', { opacity: 0, y: 16 })
    }
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    tl.to('.blh-line1',  { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.30 })
      .to('.blh-line2',  { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.20 }, '-=0.80')
      .to('.blh-scroll', { y: 0, opacity: 1, duration: 0.70 }, '-=0.50')
    tl.play()
    const st = ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom top', onLeave: resetHero, onEnterBack: () => tl.restart() })
    return () => { tl.kill(); st.kill() }
  }, [])

  return (
    <div style={{ background: CREAM, minHeight: '100vh' }}>
      <section ref={heroRef} style={{ background: CREAM, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', textAlign: 'center', userSelect: 'none', lineHeight: 0.86 }}>
          <div className="blh-line1" style={{ fontSize: 'clamp(80px, 16vw, 240px)', fontWeight: 800, letterSpacing: '-0.05em', color: INK }}>My</div>
          <div className="blh-line2" style={{ fontSize: 'clamp(80px, 16vw, 240px)', fontWeight: 800, letterSpacing: '-0.05em', color: INK, display: 'inline-flex', alignItems: 'flex-end', gap: '0.06em' }}>
            Writing
            <span style={{ display: 'inline-block', width: 'clamp(16px, 2.2vw, 38px)', height: 'clamp(16px, 2.2vw, 38px)', borderRadius: '50%', background: ACC, flexShrink: 0, marginBottom: 'clamp(10px, 1.4vw, 22px)' }} />
          </div>
        </div>
        <div className="blh-scroll" style={{ position: 'absolute', bottom: 'clamp(20px, 3vw, 36px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '1px', height: '48px', background: `linear-gradient(to bottom, ${ACC}, transparent)` }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACC }} />
        </div>
      </section>

      <div style={{ padding: '0 clamp(32px, 6.5vw, 96px)' }}>
        {posts.map(post => (
          <PostRow key={post.slug} post={post} />
        ))}
        <div style={{ height: '1px', minHeight: '1px', maxHeight: '1px', background: `${INK}18`, lineHeight: 0, fontSize: 0 }} />
      </div>

      <FooterSection settings={footerSettings} />

      <style>{`
        .bl-row:hover .bl-title { color: ${ACC}; }
        .bl-row:hover .bl-read  { color: ${ACC} !important; border-color: ${ACC} !important; }
        .bl-row:hover .bl-img   { transform: scale(1.04); }
      `}</style>
    </div>
  )
}
