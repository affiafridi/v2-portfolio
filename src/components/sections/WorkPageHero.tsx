'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

export default function WorkPageHero() {
  const sectionRef = useRef<HTMLElement>(null)

  /* ── Hide before first paint — prevents flash on page navigation ── */
  useLayoutEffect(() => {
    gsap.set('.wph-line1', { opacity: 0, y: -48, filter: 'blur(12px)' })
    gsap.set('.wph-line2', { opacity: 0, y: -36, filter: 'blur(10px)' })
    gsap.set('.wph-scroll', { opacity: 0, y: 16 })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('.wph-line1', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.30 })
        .to('.wph-line2', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.20 }, '-=0.80')
        .to('.wph-scroll', { y: 0, opacity: 1, duration: 0.70 }, '-=0.50')
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="wph-section"
      style={{
        background:     CREAM,
        height:         '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',      /* horizontally centre everything */
        justifyContent: 'center',      /* vertically centre the heading  */
        padding:        'clamp(24px,3.5vw,48px) 0',  /* vertical only — no side padding */
        position:       'relative',
        overflow:       'hidden',
      }}
    >

      {/* ── Heading — full-viewport-width centred block ─────────── */}
      <div
        style={{
          width:         '100%',
          textAlign:     'center',
          userSelect:    'none',
          lineHeight:    0.86,
        }}
      >
        <div
          className="wph-line1"
          style={{
            fontSize:      'clamp(80px, 16vw, 240px)',
            fontWeight:    800,
            letterSpacing: '-0.05em',
            color:         INK,
          }}
        >
          Selected
        </div>

        <div
          className="wph-line2"
          style={{
            fontSize:       'clamp(80px, 16vw, 240px)',
            fontWeight:     800,
            letterSpacing:  '-0.05em',
            color:          INK,
            display:        'inline-flex',   /* shrink-wrap so it stays centred */
            alignItems:     'flex-end',
            gap:            '0.06em',
          }}
        >
          Work
          {/* Orange ball accent */}
          <span
            style={{
              display:      'inline-block',
              width:        'clamp(16px, 2.2vw, 38px)',
              height:       'clamp(16px, 2.2vw, 38px)',
              borderRadius: '50%',
              background:   ACC,
              flexShrink:   0,
              marginBottom: 'clamp(10px, 1.4vw, 22px)',
            }}
          />
        </div>
      </div>

      {/* ── Scroll indicator — pinned to section bottom ─────────── */}
      <div
        className="wph-scroll"
        style={{
          position:      'absolute',
          bottom:        'clamp(20px, 3vw, 36px)',
          left:          '50%',
          transform:     'translateX(-50%)',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           '10px',
        }}
      >
        <div style={{
          width:      '1px',
          height:     '48px',
          background: `linear-gradient(to bottom, ${ACC}, transparent)`,
        }} />
        <div style={{
          width:        '6px',
          height:       '6px',
          borderRadius: '50%',
          background:   ACC,
        }} />
      </div>

    </section>
  )
}
