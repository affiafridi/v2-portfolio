'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from '@/components/ui/TransitionLink'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

interface WorkProject { slug: string; title: string; type: string; year: number; image: string; tags: string[]; id?: string; description?: string }

export default function WorkPageGrid({ projects }: { projects?: WorkProject[] }) {
  const FEATURED = (projects || []).slice(0, 4)
  const sectionRef  = useRef<HTMLElement>(null)
  const glitchTls   = useRef<(gsap.core.Timeline | null)[]>([null, null, null, null])
  const greenRefs   = useRef<(HTMLDivElement | null)[]>([])
  const magentaRefs = useRef<(HTMLDivElement | null)[]>([])
  const { setCursorType } = useCursorStore()

  /* ── RGB glitch — identical sequence to HeroSection ─────────── */
  const triggerGlitch = useCallback((i: number) => {
    const g = greenRefs.current[i]
    const m = magentaRefs.current[i]
    if (!g || !m) return

    glitchTls.current[i]?.kill()
    const tl = gsap.timeline()
    glitchTls.current[i] = tl

    tl.set([g, m], { opacity: 1 })
      .to(g, { x: -12, duration: 0.055, ease: 'none' })
      .to(m, { x:  12, duration: 0.055, ease: 'none' }, '<')
      .to(g, { x:   7, duration: 0.04,  ease: 'none' })
      .to(m, { x:  -7, duration: 0.04,  ease: 'none' }, '<')
      .to(g, { x:  -4, opacity: 0.6, duration: 0.035, ease: 'none' })
      .to(m, { x:   4, opacity: 0.6, duration: 0.035, ease: 'none' }, '<')
      .to([g, m], { x: 0, opacity: 0, duration: 0.14, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Set all animated content to hidden before scroll fires
      FEATURED.forEach((_, i) => {
        gsap.set(`.wpg-c${i} .wpg-type`,  { opacity: 0, filter: 'blur(12px)', y: 16 })
        gsap.set(`.wpg-c${i} .wpg-num`,   { opacity: 0, filter: 'blur(8px)',  y: 12 })
        gsap.set(`.wpg-c${i} .wpg-title`, { opacity: 0, filter: 'blur(16px)', y: 24 })
        gsap.set(`.wpg-c${i} .wpg-desc`,  { opacity: 0, filter: 'blur(12px)', y: 18 })
        gsap.set(`.wpg-c${i} .wpg-tag`,   { opacity: 0, filter: 'blur(14px)', x: 12 })
        gsap.set(`.wpg-c${i} .wpg-arrow`, { opacity: 0 })
      })

      // Hide glitch channels
      greenRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, x: 0 }))
      magentaRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, x: 0 }))

      // Per-card scroll reveal
      FEATURED.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `.wpg-c${i}`,
          start: 'top 62%',
          once: true,
          onEnter() {
            const tl = gsap.timeline()
            tl.to(`.wpg-c${i} .wpg-num`, {
              opacity: 1, filter: 'blur(0px)', y: 0,
              duration: 0.70, ease: 'power3.out',
            })
            .to(`.wpg-c${i} .wpg-type`, {
              opacity: 1, filter: 'blur(0px)', y: 0,
              duration: 0.70, ease: 'power3.out',
            }, '-=0.45')
            .to(`.wpg-c${i} .wpg-title`, {
              opacity: 1, filter: 'blur(0px)', y: 0,
              duration: 0.90, ease: 'power3.out',
            }, '-=0.30')
            .to(`.wpg-c${i} .wpg-desc`, {
              opacity: 1, filter: 'blur(0px)', y: 0,
              duration: 0.75, ease: 'power3.out',
            }, '-=0.50')
            .to(`.wpg-c${i} .wpg-tag`, {
              opacity: 1, filter: 'blur(0px)', x: 0,
              duration: 0.60, stagger: { each: 0.13 }, ease: 'power2.out',
            }, '-=0.30')
            .to(`.wpg-c${i} .wpg-arrow`, {
              opacity: 1, duration: 0.45, ease: 'power2.out',
            }, '-=0.25')
          },
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ background: CREAM, position: 'relative', zIndex: 2 }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(10px, 1.2vw, 16px)',
        padding: 'clamp(10px, 1.2vw, 16px)',
      }}>
        {FEATURED.map((project, i) => (
          <Link
            key={project.slug}
            href={`/work/${project.slug}`}
            className={`wpg-card wpg-c${i}`}
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              display: 'block',
              overflow: 'hidden',
              textDecoration: 'none',
              cursor: 'none',
              background: INK,
              borderRadius: 'clamp(12px,1.4vw,20px)',
            }}
            onMouseEnter={() => { triggerGlitch(i); setCursorType('hover') }}
            onMouseLeave={() => setCursorType('default')}
          >
            {/* Base image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.title}
              className="wpg-img"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform',
              }}
            />

            {/* Green glitch channel */}
            <div
              ref={el => { greenRefs.current[i] = el }}
              style={{
                position: 'absolute', inset: 0,
                opacity: 0, pointerEvents: 'none',
                willChange: 'transform, opacity',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt=""
                aria-hidden
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(90deg) brightness(0.6) contrast(1.3)',
                  mixBlendMode: 'screen',
                }}
              />
            </div>

            {/* Magenta glitch channel */}
            <div
              ref={el => { magentaRefs.current[i] = el }}
              style={{
                position: 'absolute', inset: 0,
                opacity: 0, pointerEvents: 'none',
                willChange: 'transform, opacity',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt=""
                aria-hidden
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(270deg) brightness(0.6) contrast(1.3)',
                  mixBlendMode: 'screen',
                }}
              />
            </div>

            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(8,8,8,0.08) 0%, rgba(8,8,8,0.75) 100%)',
            }} />

            {/* Index — top left */}
            <div className="wpg-num" style={{
              position: 'absolute',
              top: 'clamp(16px,2vw,28px)',
              left: 'clamp(20px,2.4vw,32px)',
              fontSize: 'clamp(10px,0.85vw,12px)',
              fontWeight: 700,
              letterSpacing: '0.20em',
              color: 'rgba(255,255,255,0.45)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Type — top right */}
            <div className="wpg-type" style={{
              position: 'absolute',
              top: 'clamp(16px,2vw,28px)',
              right: 'clamp(20px,2.4vw,32px)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase' as const,
              color: ACC,
            }}>
              {project.type}
            </div>

            {/* Bottom info */}
            <div style={{
              position: 'absolute',
              bottom: 'clamp(20px,2.4vw,32px)',
              left: 'clamp(20px,2.4vw,32px)',
              right: 'clamp(20px,2.4vw,32px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{ minWidth: 0 }}>
                <div className="wpg-title" style={{
                  fontSize: 'clamp(26px,3.6vw,52px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 0.9,
                  color: '#fff',
                  textTransform: 'uppercase' as const,
                  marginBottom: 'clamp(6px,0.8vw,10px)',
                }}>
                  {project.title}
                </div>

                <div className="wpg-desc" style={{
                  fontSize: 'clamp(11px,1vw,14px)',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.45,
                  maxWidth: '38ch',
                  marginBottom: 'clamp(8px,1vw,14px)',
                }}>
                  {(project.description?.length ?? 0) > 72
                    ? project.description!.slice(0, 72) + '…'
                    : project.description ?? ''}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                  {project.tags.map(tag => (
                    <span key={tag} className="wpg-tag" style={{
                      fontSize: 'clamp(9px,0.75vw,11px)',
                      fontWeight: 600,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase' as const,
                      color: 'rgba(255,255,255,0.70)',
                      background: 'rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      lineHeight: 1,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="wpg-arrow" style={{
                flexShrink: 0,
                width: '38px', height: '38px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)',
                transition: 'background 0.30s ease, border-color 0.30s ease, color 0.30s ease',
              }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .wpg-card:hover .wpg-img { transform: scale(1.06); }
        .wpg-card:hover .wpg-arrow {
          background: ${ACC};
          border-color: ${ACC};
          color: #fff;
        }
      `}</style>
    </section>
  )
}
