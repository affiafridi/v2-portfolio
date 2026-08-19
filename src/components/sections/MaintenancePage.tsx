'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

export default function MaintenancePage({ email }: { email?: string }) {
  const sectionRef = useRef<HTMLElement>(null)

  // Hide before first paint — same pattern as NotFoundContent/WorkPageHero.
  useLayoutEffect(() => {
    gsap.set('.mp-portrait', { opacity: 0, scale: 0.92, filter: 'blur(10px)' })
    gsap.set('.mp-heading',  { opacity: 0, y: -40, filter: 'blur(14px)' })
    gsap.set('.mp-message',  { opacity: 0, y: -18, filter: 'blur(8px)' })
    gsap.set('.mp-contact',  { opacity: 0, y: 14 })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('.mp-portrait', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.0 })
        .to('.mp-heading',  { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2 }, '-=0.55')
        .to('.mp-message',  { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, '-=0.80')
        .to('.mp-contact',  { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        background:     CREAM,
        minHeight:      '100dvh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'clamp(24px,4vw,48px) 24px',
        textAlign:      'center',
      }}
    >
      {/* Portrait — rounded-rect card, the same treatment used for
          images site-wide (ServiceDetailClient's hero image, gallery
          thumbnails, etc: borderRadius clamp(10-16px), not a circle).
          The 404 page's circular crop was a one-off, chosen specifically
          because it sits inside the "4 4" numerals — this one stands
          alone, so it follows the site's normal card language instead. */}
      <div
        style={{
          position:     'relative',
          width:        'clamp(180px, 22vw, 320px)',
          marginBottom: 'clamp(28px,3.5vw,44px)',
        }}
      >
        <div
          className="mp-portrait"
          style={{
            position:     'relative',
            aspectRatio:  '4/3',
            borderRadius: 'clamp(10px,1.2vw,16px)',
            overflow:     'hidden',
            border:       `1px solid ${INK}0d`,
            boxShadow:    '0 24px 64px rgba(0,0,0,0.10)',
          }}
        >
          <Image
            src="/uploads/1787142822531-waiting.gif"
            alt=""
            fill
            unoptimized
            sizes="320px"
            className="object-cover object-center"
          />
        </div>

        {/* Loading badge — small spinner in the corner instead of a
            ring wrapping the whole shape; a full ring read fine around
            a circle but not around a rectangle. Same track+arc spinner
            as before, just scaled down into a badge. */}
        <div
          style={{
            position:     'absolute',
            right:        'clamp(-8px,-1vw,-12px)',
            bottom:       'clamp(-8px,-1vw,-12px)',
            width:        'clamp(34px,4vw,46px)',
            height:       'clamp(34px,4vw,46px)',
            borderRadius: '50%',
            background:   CREAM,
            boxShadow:    '0 6px 18px rgba(0,0,0,0.12)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
          }}
        >
          <svg className="mp-orbit" viewBox="0 0 100 100" aria-hidden="true" style={{ width: '68%', height: '68%' }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke={INK} strokeOpacity="0.1" strokeWidth="9" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke={ACC} strokeWidth="9" strokeLinecap="round"
              strokeDasharray="66 198"
              style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'mp-orbit-spin 1.4s linear infinite' }}
            />
          </svg>
        </div>
      </div>

      <h1
        className="mp-heading"
        style={{
          fontSize:      'clamp(40px, 7vw, 104px)',
          fontWeight:    800,
          letterSpacing: '-0.04em',
          lineHeight:    0.92,
          color:         INK,
          margin:        0,
          userSelect:    'none',
        }}
      >
        Working on something new.
      </h1>

      <p
        className="mp-message"
        style={{
          fontSize:   'clamp(16px, 1.6vw, 20px)',
          fontWeight: 500,
          color:      INK,
          opacity:    0.7,
          maxWidth:   '460px',
          marginTop:  'clamp(20px,2.5vw,32px)',
          lineHeight: 1.5,
        }}
      >
        I&apos;m making a few improvements behind the scenes. The site will be back up shortly — thanks for your patience.
      </p>

      {email && (
        <a
          href={`mailto:${email}`}
          className="mp-contact"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '8px',
            fontSize:       '13px',
            fontWeight:     600,
            letterSpacing:  '0.01em',
            color:          INK,
            textDecoration: 'none',
            borderBottom:   `1px solid ${INK}28`,
            paddingBottom:  '4px',
            marginTop:      'clamp(36px,4.5vw,52px)',
            transition:     'color 0.22s ease, border-color 0.22s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ACC; e.currentTarget.style.borderColor = ACC }}
          onMouseLeave={(e) => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = `${INK}28` }}
        >
          {email}
        </a>
      )}
    </section>
  )
}
