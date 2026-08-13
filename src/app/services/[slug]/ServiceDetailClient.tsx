'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
import { useContactStore } from '@/store/useContactStore'

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

interface ServiceData {
  slug: string; num: string; title: string; tag: string; description: string
  points: string[]; deliverables: string[]; image: string | null | undefined
}

export default function ServiceDetailClient({ service, next }: { service: ServiceData; next: ServiceData }) {
  const { setCursorType }     = useCursorStore()
  const { open: openContact } = useContactStore()

  const pageRef = useRef<HTMLDivElement>(null)

  /* ── initial hide ─────────────────────────────────────────────── */
  useLayoutEffect(() => {
    gsap.set('.sd-label',  { autoAlpha: 0, y: 10 })
    gsap.set('.sd-title',  { autoAlpha: 0, y: 44, clipPath: 'inset(0 0 100% 0)' })
    gsap.set('.sd-desc',   { autoAlpha: 0, filter: 'blur(8px)', y: 12 })
    gsap.set('.sd-back',   { autoAlpha: 0, x: -10 })
    gsap.set('.sd-img',    { autoAlpha: 0, scale: 0.97, y: 20 })
    gsap.set('.sd-pts',    { autoAlpha: 0, y: 16 })
  }, [])

  /* ── hero entrance ────────────────────────────────────────────── */
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.06 })
    tl.to('.sd-back',  { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' })
      .to('.sd-label', { autoAlpha: 1, y: 0, duration: 0.40, ease: 'power2.out' }, '-=0.15')
      .to('.sd-title', { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.80, ease: 'expo.out' }, '-=0.22')
      .to('.sd-desc',  { autoAlpha: 1, filter: 'blur(0px)', y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.42')
      .to('.sd-pts',   { autoAlpha: 1, y: 0, duration: 0.50, ease: 'power2.out' }, '-=0.30')
      .to('.sd-img',   { autoAlpha: 1, scale: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.60')

    return () => { tl.kill() }
  }, [service.slug])

  /* ── scroll animations ────────────────────────────────────────── */
  useEffect(() => {
    if (!pageRef.current) return
    const ctx = gsap.context(() => {

      /* next service */
      gsap.from('.sd-next-label', {
        autoAlpha: 0, x: -16, duration: 0.50, ease: 'power2.out',
        scrollTrigger: { trigger: '.sd-next', start: 'top 80%', once: true },
      })
      gsap.from('.sd-next-title', {
        autoAlpha: 0, y: 32, duration: 0.70, ease: 'expo.out',
        scrollTrigger: { trigger: '.sd-next', start: 'top 80%', once: true },
      })

    }, pageRef)
    return () => ctx.revert()
  }, [service])

  return (
    <div ref={pageRef} style={{ background: CREAM }}>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(120px,14vw,172px) clamp(32px,6.5vw,96px) clamp(72px,9vw,112px)' }}>

        {/* ── Row 1: title + image ──────────────────────────────────── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr minmax(0, 460px)',
          gap:                 'clamp(48px,7vw,96px)',
          alignItems:          'end',
          marginBottom:        'clamp(56px,7vw,96px)',
        }}>

          {/* Left: nav + label + title */}
          <div>
            <Link
              href="/services"
              className="sd-back"
              style={{ display: 'flex', width: 'fit-content', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${INK}45`, textDecoration: 'none', transition: 'color 0.2s ease', marginBottom: 'clamp(28px,4vw,48px)', lineHeight: 1 }}
              onMouseEnter={e => { e.currentTarget.style.color = INK; setCursorType('hover') }}
              onMouseLeave={e => { e.currentTarget.style.color = `${INK}45`; setCursorType('default') }}
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Services
            </Link>

            <div className="sd-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'clamp(16px,2vw,22px)' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: `${INK}38` }}>What I Do</span>
              <span style={{ width: '1px', height: '12px', background: `${INK}18` }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: ACC }}>{service.num}</span>
            </div>

            <h1
              className="sd-title"
              style={{ fontSize: 'clamp(52px,8vw,120px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.88, color: INK, margin: 0 }}
            >
              {service.title}
            </h1>
          </div>

          {/* Right: image */}
          <div
            className="sd-img"
            style={{
              borderRadius: 'clamp(10px,1.2vw,16px)',
              overflow:     'hidden',
              aspectRatio:  '4/3',
              border:       `1px solid ${INK}0d`,
              boxShadow:    '0 24px 64px rgba(0,0,0,0.07)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.image ?? undefined}
              alt={service.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div style={{ height: 0, borderTop: `1px solid ${INK}0d`, marginBottom: 'clamp(48px,6vw,80px)' }} />

        {/* ── Row 2: description + points & CTA ────────────────────── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '3fr 1fr',
          gap:                 'clamp(48px,7vw,96px)',
          alignItems:          'start',
        }}>

          {/* Description */}
          <p
            className="sd-desc"
            style={{ fontSize: 'clamp(15px,1.3vw,18px)', lineHeight: 1.75, color: `${INK}65`, margin: 0 }}
          >
            {service.description}
          </p>

          {/* Points + CTA */}
          <div className="sd-pts">
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 clamp(32px,4vw,48px)' }}>
              {service.points.map((pt, i) => (
                <li
                  key={i}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '16px',
                    padding:      'clamp(10px,1.2vw,15px) 0',
                    borderBottom: `1px solid ${INK}0e`,
                  }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: ACC, letterSpacing: '0.10em', minWidth: '22px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 'clamp(13px,1.1vw,15px)', color: `${INK}80`, lineHeight: 1.45, fontWeight: 500 }}>
                    {pt}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={openContact}
              onMouseEnter={e => { e.currentTarget.style.color = ACC; e.currentTarget.style.borderColor = ACC; setCursorType('hover') }}
              onMouseLeave={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = `${INK}28`; setCursorType('default') }}
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '10px',
                fontSize:       '12px',
                fontWeight:     600,
                letterSpacing:  '0.12em',
                textTransform:  'uppercase',
                color:          INK,
                background:     'none',
                border:         'none',
                borderBottom:   `1px solid ${INK}28`,
                paddingBottom:  '4px',
                paddingLeft:    0,
                paddingRight:   0,
                paddingTop:     0,
                cursor:         'none',
                transition:     'color 0.22s ease, border-color 0.22s ease',
              }}
            >
              Start a Project
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* ══ NEXT SERVICE ════════════════════════════════════════════ */}
      <Link
        href={`/services/${next.slug}`}
        className="sd-next"
        style={{
          display:        'block',
          background:     INK,
          padding:        'clamp(60px,8vw,120px) clamp(32px,6.5vw,96px)',
          textDecoration: 'none',
          position:       'relative',
          overflow:       'hidden',
          cursor:         'none',
        }}
        onMouseEnter={() => setCursorType('hover')}
        onMouseLeave={() => setCursorType('default')}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>

          {/* Label */}
          <div className="sd-next-label" style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.26em',
            textTransform: 'uppercase', color: `${CREAM}45`,
            marginBottom: 'clamp(12px,1.5vw,20px)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ display: 'inline-block', width: '28px', height: '1px', background: `${CREAM}25` }} />
            Next Service
          </div>

          {/* Title + arrow row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
            <h3 className="sd-next-title" style={{
              fontSize: 'clamp(36px,7vw,108px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 0.88, color: CREAM,
              textTransform: 'uppercase', margin: 0,
              transition: 'color 0.3s ease',
            }}>
              {next.title}
            </h3>
            <div className="sd-next-arrow" style={{
              flexShrink: 0, width: 'clamp(44px,5vw,64px)', height: 'clamp(44px,5vw,64px)',
              borderRadius: '50%', border: `1px solid ${CREAM}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: `${CREAM}60`,
              transition: 'background 0.30s ease, border-color 0.30s ease, color 0.30s ease',
            }}>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
                <path d="M1 6h14M9 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Tag */}
          <div style={{
            fontSize: 'clamp(11px,1vw,14px)', fontWeight: 500,
            color: `${CREAM}35`, marginTop: '16px', letterSpacing: '0.04em',
          }}>
            {next.tag}
          </div>

        </div>
      </Link>

      {/* Arrow hover styles */}
      <style>{`
        .sd-next:hover .sd-next-arrow {
          background: ${ACC} !important;
          border-color: ${ACC} !important;
          color: #fff !important;
        }
        .sd-next:hover .sd-next-title {
          color: ${ACC};
        }
      `}</style>

    </div>
  )
}
