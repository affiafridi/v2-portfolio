'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'
const SIDE  = '8vw'

interface PostData {
  slug: string
  num: string
  category: string
  title: string
  excerpt: string
  content: string | null
  date: string
  readTime: string
  image: string | null
}

export default function BlogPostClient({ post, next }: { post: PostData; next: PostData }) {
  const { setCursorType } = useCursorStore()
  const [copied, setCopied] = useState(false)

  const imgWrapRef  = useRef<HTMLDivElement>(null)
  const imgInnerRef = useRef<HTMLDivElement>(null)
  const pageRef     = useRef<HTMLDivElement>(null)

  const getUrl = () => typeof window !== 'undefined' ? window.location.href : ''

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(getUrl())}&text=${encodeURIComponent(post.title)}`,
      '_blank', 'noopener,noreferrer'
    )
  }
  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(getUrl())}`,
      '_blank', 'noopener,noreferrer'
    )
  }
  const copyLink = () => {
    navigator.clipboard.writeText(getUrl()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useLayoutEffect(() => {
    gsap.set('.bpg-label', { autoAlpha: 0, y: 14 })
    gsap.set('.bpg-title', { autoAlpha: 0, y: 48, clipPath: 'inset(0 0 100% 0)' })
    if (imgInnerRef.current) gsap.set(imgInnerRef.current, { width: 300, borderRadius: '8px' })
  }, [post.slug])

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.06 })
    tl.to('.bpg-label', { autoAlpha: 1, y: 0, duration: 0.40, ease: 'power2.out' })
      .to('.bpg-title', { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.90, ease: 'expo.out' }, '-=0.22')
    return () => { tl.kill() }
  }, [post.slug])

  useEffect(() => {
    const wrap  = imgWrapRef.current
    const inner = imgInnerRef.current
    if (!wrap || !inner) return
    const tl = gsap.timeline({
      scrollTrigger: { trigger: wrap, start: 'top 88%', end: 'top 8%', scrub: true },
    })
    tl.fromTo(inner, { width: 300, borderRadius: '8px' }, { width: '84vw', borderRadius: '8px', ease: 'none' })
    return () => { tl.kill() }
  }, [post.slug])

  useEffect(() => {
    if (!pageRef.current) return
    const ctx = gsap.context(() => {
      gsap.set('.bpg-brief-line',    { scaleX: 0, transformOrigin: 'right center' })
      gsap.set('.bpg-brief-divider', { scaleX: 0, transformOrigin: 'left center' })
      gsap.set('.bpg-brief-word',    { opacity: 0, filter: 'blur(14px)', y: 14 })
      gsap.set('.bpg-sidebar',       { opacity: 0, filter: 'blur(8px)', y: 16 })
      gsap.set('.bpg-block',         { opacity: 0, filter: 'blur(8px)', y: 16 })

      ScrollTrigger.create({
        trigger: '.bpg-body',
        start: 'top 72%',
        onEnter() {
          const tl = gsap.timeline()
          tl.to('.bpg-brief-line',    { scaleX: 1, duration: 0.65, ease: 'power3.inOut' })
            .to('.bpg-brief-word',    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.65, stagger: 0.028, ease: 'power3.out' }, '-=0.30')
            .to('.bpg-brief-divider', { scaleX: 1, duration: 0.60, ease: 'power3.inOut' }, '-=0.20')
            .to('.bpg-sidebar',       { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.40')
            .to('.bpg-block',         { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.60, stagger: 0.09, ease: 'power2.out' }, '-=0.45')
        },
        onLeaveBack() {
          gsap.set('.bpg-brief-line',    { scaleX: 0, transformOrigin: 'right center' })
          gsap.set('.bpg-brief-divider', { scaleX: 0, transformOrigin: 'left center' })
          gsap.set('.bpg-brief-word',    { opacity: 0, filter: 'blur(14px)', y: 14 })
          gsap.set('.bpg-sidebar',       { opacity: 0, filter: 'blur(8px)', y: 16 })
          gsap.set('.bpg-block',         { opacity: 0, filter: 'blur(8px)', y: 16 })
        },
      })
    }, pageRef)
    return () => ctx.revert()
  }, [post.slug])

  return (
    <div ref={pageRef} style={{ background: CREAM }}>

      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 'clamp(100px, 22vh, 160px)', paddingBottom: 0, paddingLeft: 'clamp(32px, 6.5vw, 96px)', paddingRight: 'clamp(32px, 6.5vw, 96px)' }}>
        <div className="bpg-label" style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center', marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
          <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${INK}42`, textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.color = INK; setCursorType('hover') }} onMouseLeave={e => { e.currentTarget.style.color = `${INK}42`; setCursorType('default') }}>
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden><path d="M11 4.5H1M5 1L1 4.5 5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Blog
          </Link>
          <span style={{ width: '1px', height: '12px', background: `${INK}18` }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: ACC }}>{post.num}</span>
        </div>
        <h1 className="bpg-title" style={{ fontSize: 'clamp(36px, 6.5vw, 100px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.90, color: INK, margin: '0 auto', maxWidth: '14ch' }}>{post.title}</h1>
      </section>

      <div ref={imgWrapRef} style={{ paddingTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <div ref={imgInnerRef} style={{ overflow: 'hidden', aspectRatio: '16 / 9', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image || ''} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <section className="bpg-body" style={{ background: CREAM, padding: `clamp(60px, 8vw, 120px) ${SIDE}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(48px, 6vw, 88px)' }}>
          <div className="bpg-brief-line" style={{ flex: 1, height: 0, borderTop: `1px solid ${INK}`, alignSelf: 'center' }} />
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: `${INK}44`, whiteSpace: 'nowrap' }}>Article</div>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ACC, flexShrink: 0 }} />
        </div>

        <p style={{ fontSize: 'clamp(22px, 3.4vw, 48px)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.28, color: INK, margin: 0, marginBottom: 'clamp(52px, 7vw, 96px)' }}>
          {post.excerpt.split(' ').map((word, wi) => (
            <span key={wi} className="bpg-brief-word" style={{ display: 'inline-block', marginRight: '0.26em' }}>{word}</span>
          ))}
        </p>

        <div className="bpg-brief-divider" style={{ height: 0, borderTop: `1px solid ${INK}`, marginBottom: 'clamp(40px, 5vw, 72px)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 'clamp(40px, 6vw, 100px)', alignItems: 'start' }}>
          <article className="bpg-sidebar">
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: ACC, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '20px', height: '1px', background: ACC }} />
              Read
            </div>

            {post.content ? (
              <div className="bpg-block prose-blog" dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <>
                <h2 className="bpg-block" style={{ fontSize: 'clamp(20px, 2.2vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.10, color: INK, margin: '0 0 clamp(14px, 1.8vw, 22px)' }}>The thinking behind it</h2>
                <p className="bpg-block" style={{ fontSize: 'clamp(14px, 1.15vw, 17px)', lineHeight: 1.88, color: `${INK}62`, margin: '0 0 clamp(16px, 1.8vw, 24px)', textAlign: 'justify' }}>Most problems in design and development come from skipping the uncomfortable questions early on. The brief looks complete, the timeline looks feasible, and then somewhere between week two and the first client review, something quietly falls apart.</p>
                <p className="bpg-block" style={{ fontSize: 'clamp(14px, 1.15vw, 17px)', lineHeight: 1.88, color: `${INK}62`, margin: '0 0 clamp(28px, 4vw, 52px)', textAlign: 'justify' }}>The solution is rarely more process. It is usually better judgment — knowing which constraints are real and which are negotiable, and knowing when to push back versus build and show rather than tell.</p>
                <div className="bpg-block" style={{ borderLeft: `2px solid ${ACC}`, paddingLeft: '18px' }}>
                  <p style={{ fontSize: 'clamp(12px, 0.95vw, 14px)', lineHeight: 1.72, color: `${INK}38`, margin: 0, fontStyle: 'italic' }}>Full article content coming soon — this post is a placeholder layout demonstration.</p>
                </div>
              </>
            )}
          </article>

          <aside className="bpg-block" style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: `${INK}44`, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '20px', height: '1px', background: `${INK}40` }} />
                Posted by
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>Affi</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: `${INK}44`, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '20px', height: '1px', background: `${INK}40` }} />
                Published
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: `${INK}65`, marginBottom: '4px' }}>{post.date}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: `${INK}40`, letterSpacing: '0.02em' }}>{post.readTime} read</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: `${INK}44`, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '20px', height: '1px', background: `${INK}40` }} />
                Share
              </div>
              <button onClick={shareTwitter} style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: `${INK}45`, background: 'none', border: 'none', padding: '5px 0', cursor: 'none', textAlign: 'left', transition: 'color 0.18s ease', letterSpacing: '0.01em', width: '100%' }} onMouseEnter={e => { e.currentTarget.style.color = INK; setCursorType('hover') }} onMouseLeave={e => { e.currentTarget.style.color = `${INK}45`; setCursorType('default') }}>Twitter / X</button>
              <button onClick={shareLinkedIn} style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: `${INK}45`, background: 'none', border: 'none', padding: '5px 0', cursor: 'none', textAlign: 'left', transition: 'color 0.18s ease', letterSpacing: '0.01em', width: '100%' }} onMouseEnter={e => { e.currentTarget.style.color = INK; setCursorType('hover') }} onMouseLeave={e => { e.currentTarget.style.color = `${INK}45`; setCursorType('default') }}>LinkedIn</button>
              <button onClick={copyLink} style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: copied ? ACC : `${INK}45`, background: 'none', border: 'none', padding: '5px 0', cursor: 'none', textAlign: 'left', transition: 'color 0.18s ease', letterSpacing: '0.01em', width: '100%' }} onMouseEnter={e => { if (!copied) e.currentTarget.style.color = INK; setCursorType('hover') }} onMouseLeave={e => { if (!copied) e.currentTarget.style.color = `${INK}45`; setCursorType('default') }}>{copied ? 'Copied ✓' : 'Copy link'}</button>
            </div>
          </aside>
        </div>
      </section>

      <Link href={`/blog/${next.slug}`} className="bpg-next" style={{ display: 'block', background: INK, padding: `clamp(60px, 8vw, 120px) ${SIDE}`, textDecoration: 'none', cursor: 'none', overflow: 'hidden' }} onMouseEnter={() => setCursorType('hover')} onMouseLeave={() => setCursorType('default')}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: `${CREAM}45`, marginBottom: 'clamp(12px, 1.5vw, 20px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-block', width: '28px', height: '1px', background: `${CREAM}25` }} />
          Next Article
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
          <h3 className="bpg-next-title" style={{ fontSize: 'clamp(36px, 7vw, 108px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.88, color: CREAM, textTransform: 'uppercase', margin: 0, transition: 'color 0.30s ease' }}>{next.title}</h3>
          <div className="bpg-next-arrow" style={{ flexShrink: 0, width: 'clamp(44px, 5vw, 64px)', height: 'clamp(44px, 5vw, 64px)', borderRadius: '50%', border: `1px solid ${CREAM}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: `${CREAM}60`, transition: 'background 0.30s ease, border-color 0.30s ease, color 0.30s ease' }}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden><path d="M1 6h14M9 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{ fontSize: 'clamp(11px, 1vw, 14px)', fontWeight: 500, color: `${CREAM}30`, marginTop: '16px', letterSpacing: '0.04em' }}>{next.readTime} read · {next.category}</div>
      </Link>

      <style>{`
        .bpg-next:hover .bpg-next-title { color: ${ACC}; }
        .bpg-next:hover .bpg-next-arrow { background: ${ACC} !important; border-color: ${ACC} !important; color: #fff !important; }
        .prose-blog h2 { font-size: clamp(20px, 2.2vw, 32px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.10; color: ${INK}; margin: 0 0 clamp(14px, 1.8vw, 22px); }
        .prose-blog p { font-size: clamp(14px, 1.15vw, 17px); line-height: 1.88; color: ${INK}62; margin: 0 0 clamp(16px, 1.8vw, 24px); text-align: justify; }
        .prose-blog blockquote { border-left: 2px solid ${ACC}; padding-left: 18px; margin: clamp(20px, 2.5vw, 36px) 0; }
        .prose-blog blockquote p { font-size: clamp(12px, 0.95vw, 14px); line-height: 1.72; color: ${INK}38; font-style: italic; }
        .prose-blog ul, .prose-blog ol { padding-left: 1.2em; margin: 0 0 clamp(16px, 1.8vw, 24px); }
        .prose-blog li { font-size: clamp(14px, 1.15vw, 17px); line-height: 1.88; color: ${INK}62; }
        .prose-blog pre { background: ${INK}; color: #f0f0f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: clamp(16px, 2vw, 28px) 0; }
        .prose-blog code { font-family: var(--font-geist-mono), monospace; font-size: 0.9em; }
        .prose-blog img { max-width: 100%; border-radius: 8px; margin: clamp(16px, 2vw, 28px) 0; }
        .prose-blog a { color: ${ACC}; text-decoration: underline; text-underline-offset: 3px; }
      `}</style>
    </div>
  )
}
