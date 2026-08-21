'use client'

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import Link from '@/components/ui/TransitionLink'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
import type { Project } from '@/types'

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const DARK  = '#0d0d0d'
const ACC   = '#ff4d00'

/* ─── Component ──────────────────────────────────────────────────── */
export default function ProjectDetail({ project, nextProject }: { project: Project; nextProject?: { slug: string; title: string; type?: string; year?: number } }) {
  const sectionRef = useRef<HTMLElement>(null)
  const coverRef   = useRef<HTMLDivElement>(null)
  const { setCursorType } = useCursorStore()

  const next = nextProject || { slug: project.slug, title: project.title, type: project.type }

  /* ── Gallery glitch ────────────────────────────────────────────── */
  const gallery        = project.gallery ?? []
  const galGlitchTls   = useRef<(gsap.core.Timeline | null)[]>([])
  const galGreenRefs   = useRef<(HTMLDivElement | null)[]>([])
  const galMagentaRefs = useRef<(HTMLDivElement | null)[]>([])

  const triggerGalGlitch = useCallback((i: number) => {
    const g = galGreenRefs.current[i]
    const m = galMagentaRefs.current[i]
    if (!g || !m) return
    galGlitchTls.current[i]?.kill()
    const tl = gsap.timeline()
    galGlitchTls.current[i] = tl
    tl.set([g, m], { opacity: 1 })
      .to(g, { x: -12, duration: 0.055, ease: 'none' })
      .to(m, { x:  12, duration: 0.055, ease: 'none' }, '<')
      .to(g, { x:   7, duration: 0.04,  ease: 'none' })
      .to(m, { x:  -7, duration: 0.04,  ease: 'none' }, '<')
      .to(g, { x:  -4, opacity: 0.6, duration: 0.035, ease: 'none' })
      .to(m, { x:   4, opacity: 0.6, duration: 0.035, ease: 'none' }, '<')
      .to([g, m], { x: 0, opacity: 0, duration: 0.14, ease: 'power2.out' })
  }, [])

  /* ── Lightbox ───────────────────────────────────────────────────── */
  const [lbIdx, setLbIdx] = useState<number | null>(null)

  const lbClose = useCallback(() => setLbIdx(null), [])
  const lbPrev  = useCallback(() => setLbIdx(i => i === null ? null : (i - 1 + gallery.length) % gallery.length), [gallery.length])
  const lbNext  = useCallback(() => setLbIdx(i => i === null ? null : (i + 1) % gallery.length), [gallery.length])

  useEffect(() => {
    if (lbIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     lbClose()
      if (e.key === 'ArrowLeft')  lbPrev()
      if (e.key === 'ArrowRight') lbNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lbIdx, lbClose, lbPrev, lbNext])

  /* ── Hide everything before first paint ─────────────────────────── */
  useLayoutEffect(() => {
    gsap.set('.pd-hero-title', { opacity: 0, filter: 'blur(20px)', y: 30 })
    gsap.set('.pd-hero-type',  { opacity: 0, y: 10 })
    gsap.set('.pd-hero-scroll',{ opacity: 0, y: 12 })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Hero entrance ───────────────────────────────────────────── */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('.pd-hero-title', { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.20 })
        .to('.pd-hero-type',  { opacity: 1, y: 0, duration: 0.55 }, '-=0.55')
        .to('.pd-hero-scroll',{ opacity: 1, y: 0, duration: 0.40 }, '-=0.05')

      /* ── Cover parallax ─────────────────────────────────────────── */
      if (coverRef.current) {
        gsap.to(coverRef.current, {
          y: '18%',
          ease: 'none',
          scrollTrigger: {
            trigger: coverRef.current.parentElement!,
            start: 'top bottom',
            end:   'bottom top',
            scrub: true,
          },
        })
      }

      /* ── Stats bar reveal ───────────────────────────────────────── */
      gsap.from('.pd-stat', {
        opacity: 0, y: 18, filter: 'blur(8px)',
        duration: 0.65, stagger: 0.10, ease: 'power3.out',
        scrollTrigger: { trigger: '.pd-stats', start: 'top 85%', once: true },
      })

      /* ── Brief section ───────────────────────────────────────────── */
      gsap.set('.pd-brief-line',      { scaleX: 0, transformOrigin: 'right center' })
      gsap.set('.pd-brief-divider',   { scaleX: 0, transformOrigin: 'left center' })
      gsap.set('.pd-brief-word',      { opacity: 0, filter: 'blur(14px)', y: 14 })
      gsap.set('.pd-brief-challenge', { opacity: 0, filter: 'blur(8px)', y: 16 })
      gsap.set('.pd-tag-item',        { opacity: 0, filter: 'blur(10px)', x: 8 })

      ScrollTrigger.create({
        trigger: '.pd-brief',
        start: 'top 72%',
        onEnter() {
          const tl2 = gsap.timeline()
          tl2.to('.pd-brief-line',      { scaleX: 1, duration: 0.65, ease: 'power3.inOut' })
             .to('.pd-brief-divider',   { scaleX: 1, duration: 0.60, ease: 'power3.inOut' })
             .to('.pd-brief-word',      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.65, stagger: 0.030, ease: 'power3.out' })
             .to('.pd-brief-challenge', { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.30')
             .to('.pd-tag-item',        { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.50, stagger: 0.09, ease: 'power2.out' }, '-=0.45')
        },
        onLeaveBack() {
          gsap.set('.pd-brief-line',      { scaleX: 0, transformOrigin: 'right center' })
          gsap.set('.pd-brief-divider',   { scaleX: 0, transformOrigin: 'left center' })
          gsap.set('.pd-brief-word',      { opacity: 0, filter: 'blur(14px)', y: 14 })
          gsap.set('.pd-brief-challenge', { opacity: 0, filter: 'blur(8px)',  y: 16 })
          gsap.set('.pd-tag-item',        { opacity: 0, filter: 'blur(10px)', x: 8 })
        },
      })

      /* ── Features section ───────────────────────────────────────── */
      gsap.set('.pd-feat-heading', { opacity: 0, filter: 'blur(12px)', y: 20 })
      gsap.set('.pd-feat-line',    { scaleX: 0, transformOrigin: 'left center' })
      gsap.set('.pd-feat-num',     { opacity: 0 })
      gsap.set('.pd-feat-title',   { opacity: 0, filter: 'blur(8px)', x: 10 })
      gsap.set('.pd-feat-desc',    { opacity: 0, y: 8 })

      ScrollTrigger.create({
        trigger: '.pd-features',
        start: 'top 72%',
        onEnter() {
          const tl3 = gsap.timeline()
          tl3.to('.pd-feat-heading', { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.85, ease: 'power3.out' })
             .to('.pd-feat-line',    { scaleX: 1, duration: 0.35, stagger: 0.12, ease: 'power3.out' }, '-=0.30')
             .to('.pd-feat-num',     { opacity: 1, duration: 0.30, stagger: 0.12, ease: 'power2.out' }, '<')
             .to('.pd-feat-title',   { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.55, stagger: 0.12, ease: 'power2.out' }, '<0.08')
             .to('.pd-feat-desc',    { opacity: 1, y: 0, duration: 0.45, stagger: 0.12, ease: 'power2.out' }, '<0.10')
        },
        onLeaveBack() {
          gsap.set('.pd-feat-heading', { opacity: 0, filter: 'blur(12px)', y: 20 })
          gsap.set('.pd-feat-line',    { scaleX: 0, transformOrigin: 'left center' })
          gsap.set('.pd-feat-num',     { opacity: 0 })
          gsap.set('.pd-feat-title',   { opacity: 0, filter: 'blur(8px)', x: 10 })
          gsap.set('.pd-feat-desc',    { opacity: 0, y: 8 })
        },
      })

      /* ── Gallery reveal ─────────────────────────────────────────── */
      gsap.from('.pd-gal-img', {
        opacity: 0, y: 36, filter: 'blur(10px)',
        duration: 0.85, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.pd-gallery', start: 'top 75%', once: true },
      })

      /* ── Next project reveal ────────────────────────────────────── */
      gsap.from('.pd-next-label', {
        opacity: 0, y: 14, duration: 0.55, ease: 'power3.out',
        scrollTrigger: { trigger: '.pd-next', start: 'top 80%', once: true },
      })
      gsap.from('.pd-next-title', {
        opacity: 0, filter: 'blur(14px)', y: 24, duration: 1.0, ease: 'power3.out', delay: 0.15,
        scrollTrigger: { trigger: '.pd-next', start: 'top 80%', once: true },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* Role/Duration only appear when set from the admin dashboard — an
     empty stat column would otherwise show up blank on projects that
     never had those fields filled in. */
  const statEntries = [
    { label: 'Type', value: project.type ?? 'Website' },
    { label: 'Year', value: String(project.year) },
    ...(project.role ? [{ label: 'Role', value: project.role }] : []),
    ...(project.duration ? [{ label: 'Duration', value: project.duration }] : []),
    { label: 'Client', value: project.client ?? 'Personal Project' },
  ]

  return (
    <main ref={sectionRef}>

      {/* ══ 1. HERO ════════════════════════════════════════════════ */}
      <section
        className="pd-hero-section"
        style={{
          height: '100vh', background: DARK, position: 'relative',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Noise grain overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px', opacity: 0.55,
        }} />

        {/* Scanlines */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
        }} />

        {/* Title */}
        <div style={{ textAlign: 'center', zIndex: 10, userSelect: 'none' }}>
          <h1 className="pd-hero-title" style={{
            fontSize: 'clamp(56px,10vw,148px)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 0.88,
            color: '#fff', margin: 0, textTransform: 'uppercase',
          }}>
            {project.title}
          </h1>

          {/* Type tag */}
          <div className="pd-hero-type" style={{
            marginTop: 'clamp(16px,2vw,24px)',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: ACC,
          }}>
            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: ACC }} />
            {project.type}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="pd-hero-scroll" style={{
          position: 'absolute', bottom: 'clamp(24px,3vw,40px)',
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10,
        }}>
          <div style={{ width: '1px', height: '44px', background: `linear-gradient(to bottom, ${ACC}, transparent)` }} />
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ACC }} />
        </div>
      </section>

      {/* ══ 2. STATS BAR ══════════════════════════════════════════ */}
      <section className="pd-stats" style={{
        background: CREAM, borderTop: `1px solid ${INK}10`,
      }}>
        <div className="pd-stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${statEntries.length + (project.url ? 1 : 0)}, 1fr)`,
        }}>
          {/* Type */}
          {statEntries.map((stat, i) => (
            <div key={stat.label} className="pd-stat" style={{
              padding: 'clamp(20px,2.8vw,36px) clamp(20px,3vw,44px)',
              borderRight: `1px solid ${INK}10`,
            }}>
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: `${INK}44`, marginBottom: '8px',
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700,
                letterSpacing: '-0.02em', color: INK,
              }}>
                {stat.value}
              </div>
            </div>
          ))}

          {/* Visit Website — omitted entirely when a project has no URL set,
              rather than rendering a dead self-link. */}
          {project.url && (
            <div className="pd-stat" style={{
              padding: 'clamp(20px,2.8vw,36px) clamp(20px,3vw,44px)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: `${INK}44`, marginBottom: '8px',
              }}>
                Visit Website
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 700,
                  letterSpacing: '-0.02em', color: INK,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${INK}30`, paddingBottom: '2px',
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                  cursor: 'none', width: 'fit-content',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = ACC; (e.currentTarget as HTMLElement).style.borderColor = ACC; setCursorType('hover') }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = INK; (e.currentTarget as HTMLElement).style.borderColor = `${INK}30`; setCursorType('default') }}
              >
                Open ↗
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ══ 3. COVER IMAGE ════════════════════════════════════════ */}
      <section style={{ height: 'clamp(320px,60vh,700px)', overflow: 'hidden', background: DARK }}>
        <div ref={coverRef} style={{ width: '100%', height: '118%', marginTop: '-9%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        </div>
      </section>

      {/* ══ 4. BRIEF ══════════════════════════════════════════════ */}
      <section className="pd-brief" style={{
        background: CREAM,
        padding: 'clamp(60px,8vw,120px) clamp(24px,5vw,80px)',
      }}>

        {/* Header row: line + label + dot */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          marginBottom: 'clamp(48px,6vw,88px)',
        }}>
          <div className="pd-brief-line" style={{
            flex: 1, height: 0, borderTop: `1px solid ${INK}`, alignSelf: 'center',
          }} />
          <div style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.26em',
            textTransform: 'uppercase', color: `${INK}44`, whiteSpace: 'nowrap',
          }}>
            Brief
          </div>
          <div style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: ACC, flexShrink: 0,
          }} />
        </div>

        {/* Word-by-word description reveal */}
        <p style={{
          fontSize: 'clamp(22px,3.4vw,48px)', fontWeight: 500,
          letterSpacing: '-0.025em', lineHeight: 1.28,
          color: INK, margin: 0,
          marginBottom: 'clamp(52px,7vw,96px)',
        }}>
          {project.description.split(' ').map((word, wi) => (
            <span key={wi} className="pd-brief-word" style={{
              display: 'inline-block', marginRight: '0.26em',
            }}>
              {word}
            </span>
          ))}
        </p>

        {/* Bottom line */}
        <div className="pd-brief-divider" style={{
          height: 0, borderTop: `1px solid ${INK}`,
          marginBottom: 'clamp(40px,5vw,72px)',
        }} />

        {/* Bottom 2-col: challenge + tags */}
        <div className="pd-brief-bottom" style={{
          display: 'grid',
          gridTemplateColumns: project.challenge ? 'minmax(0,1.1fr) minmax(0,0.9fr)' : '1fr',
          gap: 'clamp(40px,6vw,100px)',
          alignItems: 'start',
        }}>
          {/* Challenge */}
          {project.challenge && (
            <div className="pd-brief-challenge">
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em',
                textTransform: 'uppercase', color: ACC,
                marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ display: 'inline-block', width: '20px', height: '1px', background: ACC }} />
                Description
              </div>
              <div
                className="prose-challenge"
                dangerouslySetInnerHTML={{ __html: project.challenge }}
              />
            </div>
          )}

          {/* Tech stack */}
          <div className="pd-brief-challenge">
            <div style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: `${INK}44`,
              marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ display: 'inline-block', width: '20px', height: '1px', background: `${INK}40` }} />
              Tech Stack
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {project.tags.map(tag => (
                <span key={tag} className="pd-tag-item" style={{
                  fontSize: 'clamp(10px,0.85vw,12px)', fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: INK, background: `${INK}08`,
                  border: `1px solid ${INK}14`,
                  borderRadius: '999px', padding: '6px 14px', lineHeight: 1,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 5. FEATURES ══════════════════════════════════════════ */}
      {project.features && project.features.length > 0 && (
        <section className="pd-features" style={{
          background: DARK, padding: 'clamp(60px,8vw,120px) clamp(24px,5vw,80px)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background grid lines — AI/terminal aesthetic */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Section label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: 'clamp(10px,1.5vw,18px)',
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: ACC,
            }}>
              <span style={{ display: 'inline-block', width: '20px', height: '1px', background: ACC }} />
              What I Built
            </div>

            <h2 className="pd-feat-heading" style={{
              fontSize: 'clamp(36px,6vw,88px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 0.9, color: '#fff',
              textTransform: 'uppercase', margin: '0 0 clamp(40px,5vw,72px)',
            }}>
              Key Features.
            </h2>

            {/* Feature rows */}
            <div>
              {project.features.map((feat, i) => (
                <div key={feat.title}>
                  <div className="pd-feat-line" style={{
                    height: '1px', background: 'rgba(255,255,255,0.08)',
                    transformOrigin: 'left center',
                  }} />
                  <div className="pd-feat-row" style={{
                    display: 'grid',
                    gridTemplateColumns: 'clamp(40px,5vw,72px) 1fr 1.4fr',
                    gap: 'clamp(16px,2.5vw,40px)',
                    padding: 'clamp(20px,2.8vw,36px) 0',
                    alignItems: 'start',
                  }}>
                    {/* Number */}
                    <span className="pd-feat-num" style={{
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.20em',
                      color: ACC, fontVariantNumeric: 'tabular-nums',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      paddingTop: '3px',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {/* Title */}
                    <div className="pd-feat-title" style={{
                      fontSize: 'clamp(16px,1.8vw,24px)', fontWeight: 700,
                      letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2,
                    }}>
                      {feat.title}
                    </div>
                    {/* Description */}
                    <p className="pd-feat-desc" style={{
                      fontSize: 'clamp(13px,1.1vw,15px)', fontWeight: 400,
                      lineHeight: 1.75, color: 'rgba(255,255,255,0.48)',
                      margin: 0,
                    }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pd-feat-line" style={{
                height: '1px', background: 'rgba(255,255,255,0.08)',
                transformOrigin: 'left center',
              }} />
            </div>
          </div>
        </section>
      )}

      {/* ══ 6. GALLERY ═══════════════════════════════════════════ */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="pd-gallery" style={{
          background: CREAM, padding: 'clamp(40px,5vw,72px) clamp(10px,1.2vw,16px)',
        }}>
          <div className="pd-gallery-grid" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(project.gallery.length, 5)}, 1fr)`,
            gap: 'clamp(6px,0.8vw,10px)',
          }}>
            {project.gallery.map((src, i) => (
              <div
                key={i}
                className="pd-gal-img"
                onClick={() => setLbIdx(i)}
                onMouseEnter={() => { triggerGalGlitch(i); setCursorType('hover') }}
                onMouseLeave={() => setCursorType('default')}
                style={{
                  position: 'relative',
                  aspectRatio: '4/3', overflow: 'hidden',
                  borderRadius: 'clamp(8px,0.8vw,12px)',
                  background: INK, cursor: 'none',
                }}
              >
                {/* Base image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${project.title} screenshot ${i + 1}`}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    display: 'block',
                    transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
                    willChange: 'transform',
                  }}
                  className="pd-gal-photo"
                />

                {/* Green glitch channel */}
                <div
                  ref={el => { galGreenRefs.current[i] = el }}
                  style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', willChange: 'transform, opacity' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(90deg) brightness(0.6) contrast(1.3)',
                    mixBlendMode: 'screen',
                  }} />
                </div>

                {/* Magenta glitch channel */}
                <div
                  ref={el => { galMagentaRefs.current[i] = el }}
                  style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', willChange: 'transform, opacity' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(270deg) brightness(0.6) contrast(1.3)',
                    mixBlendMode: 'screen',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ 7. NEXT PROJECT ══════════════════════════════════════ */}
      <Link
        href={`/work/${next.slug}`}
        className="pd-next"
        style={{
          display: 'block', background: CREAM,
          padding: 'clamp(60px,8vw,120px) clamp(24px,5vw,80px)',
          textDecoration: 'none', position: 'relative', overflow: 'hidden',
          borderTop: `1px solid ${INK}`,
          cursor: 'none',
        }}
        onMouseEnter={() => setCursorType('hover')}
        onMouseLeave={() => setCursorType('default')}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="pd-next-label" style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.26em',
            textTransform: 'uppercase', color: `${INK}55`,
            marginBottom: 'clamp(12px,1.5vw,20px)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ display: 'inline-block', width: '28px', height: '1px', background: `${INK}25` }} />
            Next Project
          </div>

          <div className="pd-next-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
            <h3 className="pd-next-title" style={{
              fontSize: 'clamp(36px,7vw,108px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 0.88, color: INK,
              textTransform: 'uppercase', margin: 0,
              transition: 'color 0.3s ease',
            }}>
              {next.title}
            </h3>
            {/* Filled accent by default rather than only on hover, matching
                the single-service page's next-link. */}
            <div style={{
              flexShrink: 0, width: 'clamp(44px,5vw,64px)', height: 'clamp(44px,5vw,64px)',
              borderRadius: '50%', border: `1px solid ${ACC}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: ACC, color: '#fff',
              transition: 'background 0.30s ease, border-color 0.30s ease, color 0.30s ease',
            }} className="pd-next-arrow">
              <svg width="14" height="11" viewBox="0 0 16 12" fill="none" aria-hidden>
                <path d="M1 6h14M9 1l6 5-6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* ══ LIGHTBOX ══════════════════════════════════════════════ */}
      {lbIdx !== null && gallery.length > 0 && (
        <div
          onClick={lbClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(10,10,10,0.55)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pd-lb-in 0.25s ease',
            cursor: 'none',
          }}
        >
          {/* Image — stop propagation so clicking image doesn't close */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[lbIdx]}
            alt={`${project.title} ${lbIdx + 1}`}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '88vw', maxHeight: '82vh',
              objectFit: 'contain', borderRadius: '12px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              animation: 'pd-lb-img-in 0.30s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          />

          {/* Close */}
          <button
            onClick={lbClose}
            style={{
              position: 'fixed', top: '24px', right: '28px',
              width: '42px', height: '42px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff', cursor: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ACC; (e.currentTarget as HTMLElement).style.borderColor = ACC; setCursorType('hover') }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; setCursorType('default') }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Prev */}
          {gallery.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); lbPrev() }}
              style={{
                position: 'fixed', left: '24px', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ACC; (e.currentTarget as HTMLElement).style.borderColor = ACC; setCursorType('hover') }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; setCursorType('default') }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Next */}
          {gallery.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); lbNext() }}
              style={{
                position: 'fixed', right: '24px', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ACC; (e.currentTarget as HTMLElement).style.borderColor = ACC; setCursorType('hover') }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; setCursorType('default') }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Counter */}
          {gallery.length > 1 && (
            <div style={{
              position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.20em',
              color: 'rgba(255,255,255,0.40)',
            }}>
              {lbIdx + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}

      <style>{`
        .pd-next:hover .pd-next-arrow {
          background: #e04400;
          border-color: #e04400;
        }
        .pd-gal-img:hover .pd-gal-photo { transform: scale(1.06); }
        .prose-challenge p { font-size: clamp(14px,1.3vw,18px); font-weight: 400; line-height: 1.75; color: ${INK}80; margin: 0 0 1em; }
        .prose-challenge p:last-child { margin-bottom: 0; }
        .prose-challenge strong { font-weight: 700; color: ${INK}; }
        .prose-challenge em { font-style: italic; }
        .prose-challenge ul, .prose-challenge ol { padding-left: 1.2em; margin: 0 0 1em; }
        .prose-challenge li { font-size: clamp(14px,1.3vw,18px); line-height: 1.75; color: ${INK}80; }
        .prose-challenge blockquote { border-left: 2px solid ${ACC}; padding-left: 16px; margin: 1em 0; font-style: italic; color: ${INK}60; }
        .prose-challenge a { color: ${ACC}; text-decoration: underline; text-underline-offset: 3px; }
        .prose-challenge code { font-family: var(--font-geist-mono), monospace; font-size: 0.9em; background: ${INK}0a; padding: 0.15em 0.4em; border-radius: 4px; }
        @keyframes pd-lb-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pd-lb-img-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  )
}
