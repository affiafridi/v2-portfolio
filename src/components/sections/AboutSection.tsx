'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
import ImageCycler       from '@/components/ui/ImageCycler'

/* ─── Images for accent word hover ──────────────────────────────── */
const ABOUT_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',  // code landscape
  'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&q=80',  // dev portrait
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', // laptop landscape
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', // person portrait
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80', // code landscape
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80', // screen portrait
  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80', // workspace landscape
]

gsap.registerPlugin(ScrollTrigger)

/* ─── Design tokens ──────────────────────────────────────────────── */
const BG  = '#f0eeea'
const INK = '#1a1a1a'
const ACC = '#ff4d00'

/* ─── Word map for the scroll-scrub reveal ───────────────────────── */
type W = { w: string; italic?: boolean; accent?: boolean }

const WORDS: W[] = [
  { w: 'A'              },
  { w: 'developer'      },
  { w: 'who',    italic: true },
  { w: 'learned', italic: true },
  { w: 'by',     italic: true },
  { w: 'building.', italic: true },
  { w: 'Not'            },
  { w: 'in'             },
  { w: 'a'              },
  { w: 'classroom', accent: true },
  { w: '—'              },
  { w: 'in'             },
  { w: 'the'            },
  { w: 'real'           },
  { w: 'world.'         },
]

const STATS = [
  { num: '5+',  label: 'Years'       },
  { num: '40+', label: 'Projects'    },
  { num: '2',   label: 'Disciplines' },
]

/* ─── Component ──────────────────────────────────────────────────── */
export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { setCursorType } = useCursorStore()

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Big title slides down — on mobile skip ScrollTrigger (Lenis
         can desync it on touch devices), run immediately on mount    */
      const isMobile = window.innerWidth < 768
      gsap.from('.ab-title', {
        y: isMobile ? -16 : -36,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        delay: isMobile ? 0.15 : 0,
        ...(isMobile ? {} : {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
          },
        }),
      })

      /* Left bio blocks stagger in from left */
      gsap.from('.ab-left-item', {
        x: isMobile ? -16 : -32,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.18,
        delay: isMobile ? 0.35 : 0,
        ...(isMobile ? {} : {
          scrollTrigger: {
            trigger: '.ab-body',
            start: 'top 75%',
          },
        }),
      })

      /* ── Scroll-scrubbed word reveal ────────────────────────────
         Words start at opacity 0.07 (ghost) and light up in
         sequence as you scroll through the section. scrub:2 means
         the animation lags slightly behind the scroll — feels like
         you're reading the words into existence.
         ─────────────────────────────────────────────────────────── */
      gsap.to('.ab-word', {
        opacity:  1,
        ease:     'none',
        stagger:  { each: 0.055, from: 'start' },
        scrollTrigger: {
          trigger: '.ab-statement',
          start:   'top 68%',
          end:     'bottom 55%',
          scrub:   2,
        },
      })

      /* Stats — sequential blur-in, same technique as WorkSection tags */
      gsap.fromTo('.ab-stat',
        { opacity: 0, filter: 'blur(10px)', x: 6 },
        {
          opacity:  1,
          filter:   'blur(0px)',
          x:        0,
          duration: 0.45,
          ease:     'power2.out',
          stagger:  { each: 0.18, from: 'start' },
          scrollTrigger: {
            trigger: '.ab-footer',
            start:   'top 90%',
          },
        }
      )

      /* CTA — same blur+x as stats, fires after all three settle */
      gsap.fromTo('.ab-cta',
        { opacity: 0, filter: 'blur(10px)', x: 6 },
        {
          opacity:  1,
          filter:   'blur(0px)',
          x:        0,
          duration: 0.45,
          ease:     'power2.out',
          delay:    0.54,   /* 3 stats × 0.18s = 0.54s */
          scrollTrigger: {
            trigger: '.ab-footer',
            start:   'top 90%',
          },
        }
      )

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* ── Shared text sizes ── */
  const LABEL_STYLE: React.CSSProperties = {
    fontSize:      '10px',
    fontWeight:    600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color:         `${INK}40`,
    display:       'block',
    marginBottom:  '10px',
  }

  return (
    <section
      ref={sectionRef}
      className="ab-section"
      style={{
        background: BG,
        minHeight:  '100vh',
        position:   'relative',
        zIndex:     1,
        padding:    'clamp(64px, 8vw, 108px) clamp(32px, 6.5vw, 96px)',
      }}
    >

      {/* ══ 1. BIG SECTION TITLE ═════════════════════════════════ */}
      <h2
        className="ab-title"
        style={{
          fontSize:      'clamp(72px, 11.5vw, 168px)',
          fontWeight:    800,
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
          color:         INK,
          margin:        0,
          marginBottom:  'clamp(48px, 7vw, 96px)',
          userSelect:    'none',
        }}
      >
        About
      </h2>

      {/* ══ 2. BODY: left bio + right word-scrub ════════════════
          CRITICAL: minmax(0, Xfr) instead of plain Xfr.
          Without the 0 minimum, a grid cell's implicit minimum
          is "auto" (= content width). The huge inline statement
          text would expand the right cell to thousands of pixels,
          crushing the left column to near-zero.
          minmax(0, Xfr) forces the minimum to 0 so the cell
          MUST stay within its fr share, causing the text to wrap.
          ═════════════════════════════════════════════════════════ */}
      <div
        className="ab-body"
        style={{
          display:             'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
          gap:                 'clamp(40px, 5.5vw, 88px)',
          alignItems:          'end',
          marginBottom:        'clamp(48px, 6vw, 80px)',
        }}
      >

        {/* ── Left: bio blocks ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem' }}>

          <div className="ab-left-item">
            <span style={LABEL_STYLE}>My Story</span>
            <p style={{ fontSize: '14px', lineHeight: 1.9, color: `${INK}65`, margin: 0 }}>
              I didn&apos;t learn development in a classroom. I learned it by
              building projects, solving problems, breaking things, and figuring
              out how to make them work again. What started as curiosity became
              a long-term commitment to creating products that are useful,
              reliable, and enjoyable to use.
            </p>
          </div>

          <div
            className="ab-left-item"
            style={{ borderLeft: `2px solid ${ACC}`, paddingLeft: '16px' }}
          >
            <p style={{ fontSize: '14px', lineHeight: 1.9, color: `${INK}65`, margin: 0 }}>
              Being self-taught taught me more than programming. It taught me
              how to learn, adapt, and solve problems independently. Every
              project is another opportunity to improve, experiment, and create
              something meaningful.
            </p>
          </div>

        </div>

        {/* ── Right: scroll-scrubbed word reveal ────────────── */}
        <p
          className="ab-statement"
          style={{
            fontSize:      'clamp(40px, 5.8vw, 88px)',
            fontWeight:    800,
            letterSpacing: '-0.03em',
            lineHeight:    1.07,
            margin:        0,
            /* overflowWrap ensures very long words (if any) wrap */
            overflowWrap:  'break-word',
          }}
        >
          {WORDS.map(({ w, italic, accent }, i) => {
            const wordSpan = (
              <span
                key={i}
                className="ab-word"
                style={{
                  display:     'inline',
                  opacity:     accent ? 0.30 : 0.07,
                  fontStyle:   italic ? 'italic'  : 'normal',
                  color:       accent  ? ACC       : INK,
                  marginRight: '0.22em',
                  ...(accent ? {
                    textDecorationLine:      'underline',
                    textDecorationColor:     ACC,
                    textUnderlineOffset:     '7px',
                    textDecorationThickness: '3px',
                  } : {}),
                }}
              >
                {w}
              </span>
            )

            return accent ? (
              <ImageCycler key={i} images={ABOUT_IMAGES}>
                {wordSpan}
              </ImageCycler>
            ) : wordSpan
          })}
        </p>

      </div>

      {/* ══ 3. FOOTER: stats + CTA ═══════════════════════════════ */}
      <div
        className="ab-footer"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            '20px',
          borderTop:      `1px solid ${INK}12`,
          paddingTop:     'clamp(22px, 3.5vw, 36px)',
        }}
      >

        {/* Stats */}
        <div style={{ display: 'flex', gap: 'clamp(28px, 4.5vw, 64px)' }}>
          {STATS.map(({ num, label }) => (
            <div key={label} className="ab-stat">
              <div
                style={{
                  fontSize:      'clamp(22px, 2.6vw, 40px)',
                  fontWeight:    800,
                  letterSpacing: '-0.03em',
                  color:         INK,
                  lineHeight:    1,
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontSize:      '10px',
                  fontWeight:    500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color:         `${INK}42`,
                  marginTop:     '6px',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/contact"
          className="ab-cta"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '10px',
            fontSize:       '12px',
            fontWeight:     600,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            color:          INK,
            textDecoration: 'none',
            borderBottom:   `1px solid ${INK}28`,
            paddingBottom:  '4px',
            transition:     'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = ACC
            e.currentTarget.style.borderColor = ACC
            setCursorType('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = INK
            e.currentTarget.style.borderColor = `${INK}28`
            setCursorType('default')
          }}
        >
          Have a project in mind?
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

      </div>

    </section>
  )
}
