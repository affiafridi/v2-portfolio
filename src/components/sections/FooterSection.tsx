'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from '@/components/ui/TransitionLink'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore }   from '@/store/useCursorStore'
import ImageCycler         from '@/components/ui/ImageCycler'

const FOOTER_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', // team landscape
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', // portrait
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80',    // code landscape
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', // portrait
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&q=80', // code landscape
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80', // portrait
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80', // workspace landscape
]
import { useContactStore }  from '@/store/useContactStore'

gsap.registerPlugin(ScrollTrigger)

/* ─── Tokens ─────────────────────────────────────────────────────── */
const BG  = '#f0eeea'
const INK = '#1a1a1a'
const ACC = '#ff4d00'

/* ─── Word map for scroll-scrub reveal ──────────────────────────── */
type W = { w: string; italic?: boolean; accent?: boolean }

const WORDS: W[] = [
  { w: 'Whether'       },
  { w: 'you\'re'       },
  { w: 'starting', accent: true },
  { w: 'from'          },
  { w: 'scratch'       },
  { w: 'or'            },
  { w: 'improving',    italic: true },
  { w: 'an',           italic: true },
  { w: 'existing',     italic: true },
  { w: 'product,',     italic: true },
  { w: 'let\'s'        },
  { w: 'build'         },
  { w: 'something'     },
  { w: 'real.'         },
]

/* ─── Ticker text ────────────────────────────────────────────────── */
const TICKER_TEXT =
  'Available for Freelance · Based in Dubai · Creative Development · Motion Design · UI/UX Design · Web Development · '

/* ─── Nav + social data ──────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Index',   href: '/'        },
  { label: 'Work',    href: '/work'    },
  { label: 'Process', href: '/process' },
  { label: 'Contact', href: '/contact' },
]

const SOCIAL_LINKS = [
  { label: 'LinkedIn',  href: '#' },
  { label: 'GitHub',    href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Dribbble',  href: '#' },
]

/* ─── Component ──────────────────────────────────────────────────── */
export default function FooterSection({ settings = {} as Record<string, unknown> }: { settings?: Record<string, unknown> }) {
  const footerEmail       = (settings.email as string)       || 'affiafridi.dev@gmail.com'
  const footerSocials     = (settings.socialLinks as { label: string; url: string }[]) || SOCIAL_LINKS.map(l => ({ label: l.label, url: l.href }))
  const footerWords       = (settings.wordReveal as W[])     || WORDS
  const footerImages      = (settings.images as string[])    || FOOTER_IMAGES
  const footerCopyright   = (settings.copyrightName as string) || 'Aftab'
  const footerTechCredits = (settings.techCredits as string) || 'Next.js · GSAP · Three.js · Framer Motion'
  const sectionRef  = useRef<HTMLElement>(null)
  const nameRef     = useRef<HTMLDivElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const { setCursorType } = useCursorStore()
  const { open: openContact } = useContactStore()
  const year = new Date().getFullYear()

  /* Mount flag — portal needs document.body (client only) */
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768

      /* ── "Reach Out" heading — slides down from above, same as About ── */
      gsap.from('.ft-title', {
        y:        -36,
        opacity:  0,
        duration: 1.1,
        ease:     'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 82%', once: true },
      })

      /* ── Left body items — blur + slide in, step by step ── */
      gsap.fromTo('.ft-left-item',
        isMobile ? { x: -18, opacity: 0 } : { x: -18, opacity: 0, filter: 'blur(12px)' },
        {
          x:        0,
          opacity:  1,
          ...(isMobile ? {} : { filter: 'blur(0px)' }),
          duration: 1.1,
          ease:     'power3.out',
          stagger:  0.28,
          delay:    0.4,
          scrollTrigger: { trigger: '.ft-body', start: 'top 78%', once: true },
        }
      )

      /* ── Word reveal — identical to About section ──────────────────
         Desktop: scroll-scrubbed. Mobile: fires once on enter — a
         scrub reads live scroll progress every frame, and Lenis can
         desync from ScrollTrigger's expected position on touch
         devices, stranding mid-sentence words at a random opacity.
         ─────────────────────────────────────────────────────────── */
      gsap.to('.ft-word', {
        opacity:  1,
        ease:     'none',
        stagger:  { each: 0.055, from: 'start' },
        ...(isMobile ? {
          duration: 0.6,
          scrollTrigger: { trigger: '.ft-statement', start: 'top 85%' },
        } : {
          scrollTrigger: {
            trigger: '.ft-statement',
            start:   'top 70%',
            end:     'bottom 52%',
            scrub:   2,
          },
        }),
      })

      /* ── Right column items — blur + slide in, step by step ──
         8 items (4 social + 4 nav) at a 0.12s stagger against a 0.85s
         duration means several are mid-blur simultaneously at any
         given moment — a real jank source on mobile. Opacity+x only. */
      gsap.fromTo('.ft-right-item',
        isMobile ? { x: 14, opacity: 0 } : { x: 14, opacity: 0, filter: 'blur(10px)' },
        {
          x:        0,
          opacity:  1,
          ...(isMobile ? {} : { filter: 'blur(0px)' }),
          duration: 0.85,
          ease:     'power3.out',
          stagger:  0.12,
          delay:    0.6,
          scrollTrigger: { trigger: '.ft-body', start: 'top 75%', once: true },
        }
      )

      /* ── Divider wipe ── */
      gsap.fromTo('.ft-divider',
        { scaleX: 0 },
        {
          scaleX:   1,
          duration: 0.85,
          ease:     'power3.out',
          scrollTrigger: { trigger: '.ft-divider', start: 'top 94%', once: true },
        }
      )

      /* ── AFFI. — scroll-position scrub, grows bottom → up ───────
         scaleY starts at 0 (flat/hidden) while footer is below
         the viewport. Grows to 1 as you scroll the footer into view.
         Fully reverses when scrolling back up.
         transformOrigin: 'left bottom' keeps bottom edge on the
         border line — text rises upward as you scroll down.
         scrub: 1.5 gives a smooth lag behind the scroll position.
         ─────────────────────────────────────────────────────────── */
      const nameEl = nameRef.current!
      gsap.set(nameEl, { scaleY: 0, transformOrigin: 'left bottom' })

      gsap.to(nameEl, {
        scaleY: 1,
        ease:   'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start:   'top bottom',
          end:     'top 15%',
          /* Same fix as WorkSection's panel scrub: on touch, scrub lag
             stacks on top of Lenis's own smoothing, and after any brief
             stall (touch-start is a common source) GSAP's catch-up
             reads as a visible jump. Snappier scrub keeps this closer
             to 1:1 with the actual swipe. */
          scrub:   isMobile ? 0.4 : 1.5,
        },
      })

      /* ── Bottom bar fades up ── */
      gsap.from('.ft-bottom-item', {
        y:        10,
        opacity:  0,
        duration: 0.55,
        ease:     'power3.out',
        stagger:  0.07,
        scrollTrigger: { trigger: '.ft-bottom', start: 'top 100%', once: true },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
    <footer
      ref={sectionRef}
      style={{
        background:     BG,
        position:       'relative',
        zIndex:         3,
        marginTop:      '-40px',
        minHeight:      '100dvh',
        display:        'flex',
        flexDirection:  'column',
        overflowX:      'hidden',
      }}
    >

      {/* ══ BODY GRID — 3 columns ═══════════════════════════════════
          Col 1 (left):   Reach Out heading + email + CTA
          Col 2 (center): word-reveal paragraph
          Col 3 (right):  nav + socials
          All columns start at the top — no empty space anywhere.
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="ft-body"
        style={{
          display:             'grid',
          gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,0.7fr)',
          gap:                 'clamp(32px,4.5vw,72px)',
          alignItems:          'start',
          alignContent:        'start',
          padding:             'clamp(104px,10vw,148px) clamp(24px,6.5vw,96px) clamp(48px,6vw,80px)',
        }}
      >

        {/* ── Col 1: heading + email + CTA ─────────────────────── */}
        <div className="ft-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem' }}>

          {/* Two lines always — "Reach" alone, then the gif + "Out" —
              rather than one flex row that happens to wrap based on
              available width. flexWrap-based wrapping put all 3 items
              (word, gif, word) on one line whenever the viewport was
              wide enough to fit them, and an awkward break (gif
              stranded alone before "Out") whenever it wasn't quite
              wide enough — neither of which is this deliberate 2-line
              layout, on any screen size. */}
          <h2
            className="ft-title"
            style={{
              fontSize:      'clamp(72px, 11.5vw, 168px)',
              fontWeight:    800,
              letterSpacing: '-0.04em',
              lineHeight:    0.88,
              color:         INK,
              margin:        0,
              userSelect:    'none',
            }}
          >
            <span style={{ display: 'block', marginBottom: '0.08em' }}>Reach</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.14em' }}>
              <span
                className="ft-title-gif"
                style={{
                  display:      'inline-block',
                  width:        'clamp(72px, 10vw, 150px)',
                  height:       'clamp(58px, 8.2vw, 128px)',
                  borderRadius: '10px',
                  overflow:     'hidden',
                  verticalAlign: 'middle',
                  flexShrink:   0,
                  position:     'relative',
                }}
              >
                <Image
                  src="/uploads/1786797195871-reach-out.gif"
                  alt=""
                  fill
                  unoptimized
                  sizes="130px"
                  className="object-cover object-center"
                />
              </span>
              Out
            </span>
          </h2>

          <div className="ft-left-item" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.20em',
              textTransform: 'uppercase', color: `${INK}30`,
            }}>
              Get in touch
            </span>
            <a
              href={`mailto:${footerEmail}`}
              style={{
                fontSize:       'clamp(14px, 1.5vw, 22px)',
                fontWeight:     700,
                letterSpacing:  '-0.02em',
                color:          ACC,
                textDecoration: 'none',
                borderBottom:   `2px solid ${ACC}40`,
                paddingBottom:  '5px',
                width:          'fit-content',
                transition:     'color 0.22s ease, border-color 0.22s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = INK; setCursorType('hover') }}
              onMouseLeave={e => { e.currentTarget.style.color = ACC; e.currentTarget.style.borderColor = `${ACC}40`; setCursorType('default') }}
            >
              {footerEmail}
            </a>
          </div>

          <button
            onClick={openContact}
            className="ft-left-item"
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
              width:          'fit-content',
              cursor:         'none',
              transition:     'color 0.22s ease, border-color 0.22s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = ACC; e.currentTarget.style.borderColor = ACC; setCursorType('hover') }}
            onMouseLeave={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = `${INK}28`; setCursorType('default') }}
          >
            Get in touch
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
              <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

        </div>

        {/* ── Col 2: word reveal + navigation below ────────────── */}
        <div className="ft-col-statement" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(28px,3.5vw,52px)', paddingTop: 'clamp(40px,5vw,80px)' }}>

          <p
            className="ft-statement"
            style={{
              fontSize:      'clamp(32px, 4.4vw, 72px)',
              fontWeight:    800,
              letterSpacing: '-0.03em',
              lineHeight:    1.07,
              margin:        0,
              overflowWrap:  'break-word',
            }}
          >
            {footerWords.map(({ w, italic, accent }, i) => {
              const wordSpan = (
                <span
                  className="ft-word"
                  style={{
                    display:     'inline',
                    opacity:     accent ? 0.30 : 0.07,
                    fontStyle:   italic  ? 'italic' : 'normal',
                    color:       accent  ? ACC      : INK,
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

              /* Real space character, not just margin — see AboutSection's
                 identical word-reveal for why: margin-only gaps between
                 spans give the browser no line-break opportunity, so long
                 sentences never wrap and get silently clipped instead. */
              return (
                <Fragment key={i}>
                  {accent ? <ImageCycler images={footerImages}>{wordSpan}</ImageCycler> : wordSpan}
                  {' '}
                </Fragment>
              )
            })}
          </p>

        </div>

        {/* ── Col 3: social (top) + navigation (bottom) ────────── */}
        <div className="ft-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem', alignItems: 'flex-end', alignSelf: 'end' }}>

          {/* Social */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.20em',
              textTransform: 'uppercase', color: `${INK}28`,
              marginBottom: '14px', display: 'block',
            }}>
              Social
            </span>
            {footerSocials.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ft-right-item"
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            '5px',
                  fontSize:       '13px',
                  fontWeight:     500,
                  color:          INK,
                  textDecoration: 'none',
                  padding:        '4px 0',
                  transition:     'color 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = ACC; setCursorType('hover') }}
                onMouseLeave={e => { e.currentTarget.style.color = INK; setCursorType('default') }}
              >
                {link.label}
                <span style={{ fontSize: '10px', opacity: 0.35 }}>↗</span>
              </a>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.20em',
              textTransform: 'uppercase', color: `${INK}28`,
              marginBottom: '14px', display: 'block',
            }}>
              Navigation
            </span>
            {NAV_LINKS.map(link => (
              link.label === 'Contact' ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={openContact}
                  className="ft-right-item"
                  style={{
                    display:        'block',
                    fontSize:       '13px',
                    fontWeight:     500,
                    color:          INK,
                    background:     'none',
                    border:         'none',
                    textAlign:      'left',
                    textDecoration: 'none',
                    padding:        '4px 0',
                    cursor:         'none',
                    transition:     'color 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = ACC; setCursorType('hover') }}
                  onMouseLeave={e => { e.currentTarget.style.color = INK; setCursorType('default') }}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="ft-right-item"
                  style={{
                    display:        'block',
                    fontSize:       '13px',
                    fontWeight:     500,
                    color:          INK,
                    textDecoration: 'none',
                    padding:        '4px 0',
                    transition:     'color 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = ACC; setCursorType('hover') }}
                  onMouseLeave={e => { e.currentTarget.style.color = INK; setCursorType('default') }}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

        </div>

      </div>


      {/* ══ BIG NAME ════════════════════════════════════════════════ */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: 'clamp(8px, 2vw, 24px)' }}>
        <div
          ref={nameRef}
          className="ft-big-name"
          style={{
            display:       'flex',
            alignItems:    'flex-end',
            fontSize:      'clamp(130px, 26vw, 420px)',
            fontWeight:    800,
            letterSpacing: '-0.045em',
            lineHeight:    0.72,
            color:         INK,
            paddingBottom: 0,
            marginBottom:  0,
            overflow:      'hidden',
            userSelect:    'none',
            whiteSpace:    'nowrap',
          }}
        >
          <span>AFFI</span>
          {/* Orange dot — proportional to font size, bottom edge on the border line */}
          <span style={{
            display:      'inline-block',
            flexShrink:   0,
            width:        'clamp(30px, 4.2vw, 72px)',
            height:       'clamp(30px, 4.2vw, 72px)',
            borderRadius: '50%',
            background:   ACC,
            marginLeft:   'clamp(8px, 0.8vw, 16px)',
            marginBottom: 0,
          }} />
        </div>
      </div>

      {/* ══ BOTTOM BAR ══════════════════════════════════════════════ */}
      <div
        className="ft-bottom"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        'clamp(12px,1.8vw,20px) clamp(24px,6.5vw,96px)',
          borderTop:      `1px solid ${INK}10`,
          gap:            '16px',
          flexWrap:       'wrap',
        }}
      >
        <span className="ft-bottom-item" style={{ fontSize: '10px', color: INK, letterSpacing: '0.08em' }}>
          © {year} {footerCopyright} · Designed &amp; developed by {footerCopyright}
        </span>

        <span className="ft-bottom-item" style={{ fontSize: '10px', color: INK, letterSpacing: '0.06em' }}>
          {footerTechCredits}
        </span>

        <button
          className="ft-bottom-item ft-back-btn"
          onClick={() => {
            const overlay = overlayRef.current
            const lenis   = (window as unknown as Record<string, unknown>).__lenis as {
              scrollTo: (target: number, opts: object) => void
              on:  (event: string, cb: (e: { scroll: number }) => void) => void
              off: (event: string, cb: (e: { scroll: number }) => void) => void
            } | undefined

            /* 1 — Fade blur in */
            if (overlay) {
              gsap.killTweensOf(overlay)
              gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.in' })
            }

            /* 2 — Scroll to top via Lenis */
            if (lenis) {
              lenis.scrollTo(0, {
                duration: 2.2,
                easing: (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2,
              })

              /* 3 — Fade blur out as we approach the top */
              const onScroll = ({ scroll }: { scroll: number }) => {
                if (scroll < 400) {
                  if (overlay) {
                    gsap.killTweensOf(overlay)
                    gsap.to(overlay, { opacity: 0, duration: 1.2, ease: 'power2.out' })
                  }
                  lenis.off('scroll', onScroll)
                }
              }
              lenis.on('scroll', onScroll)
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              if (overlay) gsap.to(overlay, { opacity: 0, delay: 1.5, duration: 0.8, ease: 'power2.out' })
            }
          }}
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '6px',
            fontSize:      '10px',
            fontWeight:    600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         INK,
            background:    'none',
            border:        'none',
            cursor:        'none',
            padding:       0,
            transition:    'color 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ACC; setCursorType('hover') }}
          onMouseLeave={e => { e.currentTarget.style.color = INK; setCursorType('default') }}
        >
          Back to top
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M5 9V1M1 5l4-4 4 4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

    </footer>

    {/* ── Blur overlay — rendered at body level via portal ─────────
        Covers the entire viewport during back-to-top scroll.
        backdropFilter blurs all content. opacity driven by GSAP.
        pointerEvents: none — never blocks interaction.
        ─────────────────────────────────────────────────────────── */}

    {mounted && createPortal(
      <div
        ref={overlayRef}
        style={{
          position:             'fixed',
          inset:                0,
          zIndex:               9990,
          opacity:              0,
          pointerEvents:        'none',
          backdropFilter:       'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          background:           'rgba(240,238,234,0.18)',
        }}
        aria-hidden="true"
      />,
      document.body
    )}
    </>
  )
}
