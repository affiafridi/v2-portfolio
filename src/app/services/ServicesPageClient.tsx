'use client'

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import Link from '@/components/ui/TransitionLink'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
import type { CursorType } from '@/types'
import FooterSection from '@/components/sections/FooterSection'

interface ServiceData {
  slug: string; num: string; title: string; tag: string; description: string
  points: string[]; deliverables: string[]; image: string | null
}

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

/* ─── Single service row ─────────────────────────────────────────── */
function ServiceRow({ service, index, setCursorType, onDividerComplete, playFnRef }: {
  service:           ServiceData
  index:             number
  setCursorType:     (t: CursorType) => void
  onDividerComplete: () => void
  playFnRef:         { current: (() => void) | null }
}) {
  const rowRef               = useRef<HTMLDivElement>(null)
  const inViewRef            = useRef(false)
  const readyRef             = useRef(index === 0)
  const revealedRef          = useRef(false)          // plays once, never again
  const tlRef                = useRef<gsap.core.Timeline | null>(null)
  const onDividerCompleteRef = useRef(onDividerComplete)

  /* keep callback ref current without re-running the effect */
  useEffect(() => { onDividerCompleteRef.current = onDividerComplete })

  /* hide before first paint */
  useLayoutEffect(() => {
    const el = rowRef.current!
    gsap.set(el.querySelectorAll('.sr-num'),     { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelectorAll('.sr-name'),    { autoAlpha: 0, y: 36, clipPath: 'inset(0 0 100% 0)' })
    gsap.set(el.querySelectorAll('.sr-desc'),    { autoAlpha: 0, filter: 'blur(8px)', y: 10 })
    gsap.set(el.querySelectorAll('.sr-pt'),      { autoAlpha: 0, x: -12 })
    gsap.set(el.querySelectorAll('.sr-cta'),     { autoAlpha: 0, y: 10 })
    gsap.set(el.querySelectorAll('.sr-img'),     { autoAlpha: 0, y: 28, scale: 0.96 })
    gsap.set(el.querySelectorAll('.sr-divider'), { clipPath: 'inset(0 100% 0 0)' })
  }, [])

  useEffect(() => {
    const el = rowRef.current!

    /* Play once — if already revealed, do nothing */
    const doPlay = () => {
      if (revealedRef.current) return
      revealedRef.current = true
      tlRef.current?.progress(0).play()
    }

    /* Snap to fully-visible end state without animation */
    const doSnap = () => {
      if (revealedRef.current) return
      revealedRef.current = true
      tlRef.current?.progress(1).pause()
    }

    /* Parent calls this when the previous row's divider finishes */
    playFnRef.current = () => {
      readyRef.current = true
      if (inViewRef.current) doPlay()
    }

    /* Guard against React StrictMode double-fire ───────────────────
       StrictMode mounts → cleans up → remounts in dev, synchronously,
       within the same tick. Building the timeline/ScrollTrigger (and,
       for row 0, immediately playing it — see the in-view check below)
       directly in the effect body meant the FIRST (fake) mount could
       set revealedRef.current = true and start playing, get killed by
       its own cleanup a tick later — but revealedRef is a ref, so it
       survives that fake mount/cleanup cycle. The SECOND (real) mount
       then called doPlay() again, saw revealedRef already true, and
       skipped playing the *new* tl that's actually the one still
       attached to the live DOM. Every element was left stuck at its
       initial gsap.set hidden state forever — exactly the "first
       service permanently blank" bug found on real testing (this only
       ever hit row 0, since it's the only row whose readyRef is true
       — and therefore whose doPlay() can fire synchronously on mount
       at all — during that vulnerable window; every other row only
       gets played later via a genuine scroll/divider-chain event, long
       after StrictMode's fake cycle has already finished). Wrapping
       the real setup in a tiny setTimeout means the fake mount's
       cleanup clears the timeout before it ever fires, so this only
       ever runs once, on the real mount — same fix already used in
       Preloader.tsx for the identical StrictMode race. ───────────── */
    let st: ScrollTrigger | null = null
    let tl: gsap.core.Timeline | null = null

    const startId = setTimeout(() => {
      tl = gsap.timeline({ paused: true })

      tl.fromTo(el.querySelectorAll('.sr-num'),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.40, ease: 'power2.out' })
        .fromTo(el.querySelectorAll('.sr-name'),
          { autoAlpha: 0, y: 36, clipPath: 'inset(0 0 100% 0)' },
          { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.70, ease: 'expo.out' }, '-=0.22')
        .fromTo(el.querySelectorAll('.sr-img'),
          { autoAlpha: 0, y: 28, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, '-=0.50')
        .fromTo(el.querySelectorAll('.sr-desc'),
          { autoAlpha: 0, filter: 'blur(8px)', y: 10 },
          { autoAlpha: 1, filter: 'blur(0px)', y: 0, duration: 0.50, ease: 'power2.out' }, '-=0.42')
        .fromTo(el.querySelectorAll('.sr-pt'),
          { autoAlpha: 0, x: -12 },
          { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 }, '-=0.22')
        .fromTo(el.querySelectorAll('.sr-cta'),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.18')
        .fromTo(el.querySelectorAll('.sr-divider'),
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.65, ease: 'power3.out',
            onComplete: () => onDividerCompleteRef.current() }, '+=0.10')

      tlRef.current = tl

      st = ScrollTrigger.create({
        trigger: el,
        start:   'top 80%',
        onEnter: () => {
          inViewRef.current = true
          if (readyRef.current) doPlay()
        },
        onLeaveBack: () => {
          inViewRef.current = false
          /* Snap to fully visible if skipped (scrolled too fast / never reached).
             Ensures no empty section on scroll-up. Animation stays permanent. */
          doSnap()
        },
      })

      /* onEnter only fires on a scroll crossing — a row that's already
         inside the 'top 80%' zone the instant this trigger is created
         (row 0, on any viewport short enough that the hero doesn't push
         it below that line) never gets one, so it just sits at its
         initial hidden gsap.set state forever. Checking the real
         position right after creation and firing the same logic
         manually covers that case without waiting on a scroll event
         that may never happen. doPlay's revealedRef guard makes this
         safe even if onEnter does also fire. */
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.8) {
        inViewRef.current = true
        if (readyRef.current) doPlay()
      }
    }, 0)

    return () => {
      clearTimeout(startId)
      tl?.kill()
      st?.kill()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    /* Outer wrapper — rowRef scope for GSAP context */
    <div ref={rowRef}>

      {/* Grid — padding lives here, NOT on the wrapper */}
      <div
        className="sr-row"
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr minmax(0, 420px)',
          gap:                 'clamp(40px, 6vw, 88px)',
          padding:             'clamp(56px,7vw,96px) clamp(32px,6.5vw,96px)',
          alignItems:          'start',
        }}
      >
      {/* ── Left: content ──────────────────────────────────────── */}
      <div className="sr-content">

        {/* Section label + number */}
        <div className="sr-num" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(18px,2.8vw,30px)' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: `${INK}35` }}>
            What I Do
          </span>
          <span style={{ width: '1px', height: '14px', background: `${INK}18` }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: ACC }}>
            {service.num}
          </span>
        </div>

        {/* Service name — large editorial heading */}
        <h2
          className="sr-name"
          style={{
            fontSize:      'clamp(48px, 7.5vw, 110px)',
            fontWeight:    800,
            letterSpacing: '-0.04em',
            lineHeight:    0.88,
            color:         INK,
            margin:        '0 0 clamp(20px, 3vw, 36px)',
            textTransform: 'uppercase',
          }}
        >
          {service.title}
        </h2>

        {/* Description */}
        <p
          className="sr-desc"
          style={{
            fontSize:   'clamp(13px, 1.2vw, 16px)',
            lineHeight:  1.70,
            color:      `${INK}65`,
            maxWidth:   '54ch',
            margin:     '0 0 clamp(16px, 2.5vw, 24px)',
          }}
        >
          {service.description}
        </p>

        {/* Points — 2-column grid, uppercase tracking text */}
        <div
          className="sr-points"
          style={{
            display:             'grid',
            gridTemplateColumns: 'auto auto',
            gap:                 '0',
            width:               'fit-content',
            marginBottom:        'clamp(22px, 3vw, 36px)',
            borderTop:           `1px solid ${INK}0e`,
          }}
        >
          {service.points.map((pt, pi) => (
            <div
              key={pi}
              className="sr-pt"
              style={{
                padding:       '8px 0',
                borderBottom:  `1px solid ${INK}0e`,
                borderRight:   pi % 2 === 0 ? `1px solid ${INK}0e` : 'none',
                paddingRight:  pi % 2 === 0 ? '28px' : '0',
                paddingLeft:   pi % 2 === 1 ? '20px' : '0',
                fontSize:      '10px',
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         `${INK}60`,
                lineHeight:    1.4,
                whiteSpace:    'nowrap',
              }}
            >
              {pt}
            </div>
          ))}
        </div>

        {/* Learn More */}
        <Link
          href={`/services/${service.slug}`}
          className="sr-cta"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '8px',
            fontSize:       '11px',
            fontWeight:     700,
            letterSpacing:  '0.18em',
            textTransform:  'uppercase',
            color:          `${INK}55`,
            textDecoration: 'none',
            transition:     'color 0.2s ease, gap 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ACC; e.currentTarget.style.gap = '14px'; setCursorType('hover') }}
          onMouseLeave={e => { e.currentTarget.style.color = `${INK}55`; e.currentTarget.style.gap = '8px'; setCursorType('default') }}
        >
          View Service
          <svg width="24" height="10" viewBox="0 0 28 10" fill="none" aria-hidden>
            <path d="M0 5h26M22 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* ── Right: image ───────────────────────────────────────── */}
      <div
        className="sr-img"
        style={{
          borderRadius: 'clamp(10px, 1.2vw, 16px)',
          overflow:     'hidden',
          aspectRatio:  '4/3',
          border:       `1px solid ${INK}0d`,
          boxShadow:    '0 24px 64px rgba(0,0,0,0.08)',
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

      {/* Divider — border-top renders identically at every scroll position */}
      <div
        className="sr-divider"
        style={{
          height:    0,
          borderTop: `1px solid ${INK}`,
          display:   'block',
        }}
      />

    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function ServicesPageClient({ services = [] }: { services?: ServiceData[] }) {
  const heroRef = useRef<HTMLElement>(null)
  const { setCursorType } = useCursorStore()

  /* One slot per row — parent calls playFnRefs[i+1] when row i's divider completes */
  const playFnRefs = useRef<Array<{ current: (() => void) | null }>>(
    Array.from({ length: services.length }, () => ({ current: null }))
  )

  const handleDividerComplete = useCallback((i: number) => {
    playFnRefs.current[i + 1]?.current?.()
  }, [])

  useLayoutEffect(() => {
    gsap.set('.sph-line1',  { opacity: 0, y: -48, filter: 'blur(12px)' })
    gsap.set('.sph-line2',  { opacity: 0, y: -36, filter: 'blur(10px)' })
    gsap.set('.sph-scroll', { opacity: 0, y: 16 })
  }, [])

  useEffect(() => {
    const el = heroRef.current!

    const resetHero = () => {
      gsap.set('.sph-line1',  { opacity: 0, y: -48, filter: 'blur(12px)' })
      gsap.set('.sph-line2',  { opacity: 0, y: -36, filter: 'blur(10px)' })
      gsap.set('.sph-scroll', { opacity: 0, y: 16 })
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    tl.to('.sph-line1',  { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.30 })
      .to('.sph-line2',  { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.20 }, '-=0.80')
      .to('.sph-scroll', { y: 0, opacity: 1, duration: 0.70 }, '-=0.50')

    /* play on first load */
    tl.play()

    /* restart hero when scrolling back up. Do NOT reset service rows here,
       because that hides rows that are currently visible on upward scroll. */
    const st = ScrollTrigger.create({
      trigger:    el,
      start:      'top top',
      end:        'bottom top',
      onLeave:     resetHero,
      onEnterBack: () => {
        tl.restart()
      },
    })

    /* Refresh after the page's real layout has settled — each row's
       ScrollTrigger caches its 'top 80%' pixel position at mount, but
       these large uppercase headings (fontWeight 800, tight 0.88 line-
       height) shift height when the real font swaps in for its
       fallback, same as any other late layout change. That shift
       invalidates every trigger positioned below wherever it happened,
       which reads as "some row further down never reveals" — exactly
       the class of bug already hit (and fixed the same way) on the
       homepage's own service list, see ServiceSection.tsx. Same
       requestIdleCallback/setTimeout split for the same reason: Safari
       has no requestIdleCallback, and this is squarely a
       Safari/real-device-only symptom (desktop Chrome's font cache
       rarely reproduces the swap-timing gap devtools' mobile emulation
       inherits from it). */
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => ScrollTrigger.refresh())
    } else {
      timeoutId = setTimeout(() => ScrollTrigger.refresh(), 400)
    }

    return () => {
      tl.kill(); st.kill()
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div style={{ background: CREAM }}>

      {/* ══ HERO — matches Selected Work on /work ════════════════════ */}
      <section
        ref={heroRef}
        className="sph-section"
        style={{
          background:     CREAM,
          height:         '100vh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        'clamp(24px,3.5vw,48px) 0',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Heading */}
        <div style={{ width: '100%', textAlign: 'center', userSelect: 'none', lineHeight: 0.86 }}>
          <div
            className="sph-line1"
            style={{
              fontSize:      'clamp(80px, 16vw, 240px)',
              fontWeight:    800,
              letterSpacing: '-0.05em',
              color:         INK,
            }}
          >
            What I
          </div>
          <div
            className="sph-line2"
            style={{
              fontSize:      'clamp(80px, 16vw, 240px)',
              fontWeight:    800,
              letterSpacing: '-0.05em',
              color:         INK,
              display:       'inline-flex',
              alignItems:    'flex-end',
              gap:           '0.06em',
            }}
          >
            Build
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

        {/* Scroll indicator */}
        <div
          className="sph-scroll"
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
          <div style={{ width: '1px', height: '48px', background: `linear-gradient(to bottom, ${ACC}, transparent)` }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACC }} />
        </div>
      </section>

      {/* ══ SERVICE LIST ════════════════════════════════════════════ */}
      {services.map((service, i) => (
        <ServiceRow
          key={service.slug}
          service={service}
          index={i}
          setCursorType={setCursorType}
          onDividerComplete={() => handleDividerComplete(i)}
          playFnRef={playFnRefs.current[i]}
        />
      ))}

      <FooterSection />

    </div>
  )
}
