'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useHeroColorStore } from '@/store/useHeroColorStore'
import { useCursorStore } from '@/store/useCursorStore'
import { useGifFlourishStore } from '@/store/useGifFlourishStore'

/* ─────────────────────────────────────────────────────────────────
   HeroSection — Light-theme editorial hero

   HEADLINE BLEND  (mix-blend-mode: difference + white text):
     white (#fff) over cream bg (#f0eeea)
       → (255−240, 255−238, 255−234) = (15,17,21) ≈ near-black    ✓
     white (#fff) over dark portrait shadow (#1a1a1a)
       → (255−26, 255−26, 255−26)   = (229,229,229) ≈ near-white  ✓
     white (#fff) over mid-grey highlight (~#888)
       → (255−136, …)               = ~120 = medium grey           ✓
   Result: text is DARK on the cream background and turns LIGHT/
   WHITE wherever it crosses dark areas of the grayscale portrait.

   IMAGE ANIMATION:
     Idle : slow sine-wave skewY (±3°) — portrait waves in a breeze
     Scroll: velocity burst additive — "flag hit by wind"
   ───────────────────────────────────────────────────────────────── */

gsap.registerPlugin(ScrollTrigger)

const BG  = '#f0eeea'
const INK = '#1a1a1a'
const ACC = '#ff4d00'

/* ─── Live clock ─────────────────────────────────────────────────── */
function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true,
        })
      )
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return time
}

/* ─── Component ──────────────────────────────────────────────────── */
interface ImagePosition {
  x: number
  y: number
  zoom?: number
}

interface HeroSettings {
  heading?: string
  bio?: string
  marqueeText?: string
  location?: string
  availabilityText?: string
  portraitImage?: string
  portraitPositionDesktop?: ImagePosition
  portraitPositionTablet?: ImagePosition
  portraitPositionMobile?: ImagePosition
}

export default function HeroSection({ settings = {} as Record<string, unknown> }: { settings?: Record<string, unknown> }) {
  const s: HeroSettings = {
    heading:          (settings.heading as string)          || 'Building products people *enjoy using.*',
    bio:              (settings.bio as string)              || 'Self-taught developer passionate about turning ideas into real products. I build modern web applications, SaaS platforms, and digital experiences with a focus on performance, usability, and clean execution.',
    marqueeText:      (settings.marqueeText as string)     || 'Full-Stack Developer',
    location:         (settings.location as string)        || 'Dubai, UAE',
    availabilityText: (settings.availabilityText as string)|| 'Currently available for Freelance projects.',
    portraitImage:    (settings.portraitImage as string)    || '/images/aftab.jpg',
    portraitPositionDesktop: (settings.portraitPositionDesktop as ImagePosition) || { x: 50, y: 0 },
    portraitPositionTablet:  (settings.portraitPositionTablet as ImagePosition)  || { x: 50, y: 0 },
    portraitPositionMobile:  (settings.portraitPositionMobile as ImagePosition)  || { x: 50, y: 0 },
  }

  const posDesktop  = `${s.portraitPositionDesktop!.x}% ${s.portraitPositionDesktop!.y}%`
  const posTablet   = `${s.portraitPositionTablet!.x}% ${s.portraitPositionTablet!.y}%`
  const posMobile   = `${s.portraitPositionMobile!.x}% ${s.portraitPositionMobile!.y}%`
  const zoomDesktop = (s.portraitPositionDesktop!.zoom ?? 100) / 100
  const zoomTablet  = (s.portraitPositionTablet!.zoom ?? 100) / 100
  const zoomMobile  = (s.portraitPositionMobile!.zoom ?? 100) / 100

  const color   = useHeroColorStore((st) => st.color)
  const toggle  = useHeroColorStore((st) => st.toggle)
  const hydrate = useHeroColorStore((st) => st.hydrate)
  useLayoutEffect(() => { hydrate() }, [hydrate])
  const { setCursorType } = useCursorStore()
  const openFlourish = useGifFlourishStore((s) => s.open)

  /* ── Hero CTA: magnetic pull + diagonal wipe ──────────────────── */
  const [ctaHover, setCtaHover] = useState(false)
  const ctaRef  = useRef<HTMLButtonElement>(null)
  const ctaXTo  = useRef<((v: number) => void) | null>(null)
  const ctaYTo  = useRef<((v: number) => void) | null>(null)

  useEffect(() => {
    if (!ctaRef.current) return
    ctaXTo.current = gsap.quickTo(ctaRef.current, 'x', { duration: 0.5, ease: 'power3.out' })
    ctaYTo.current = gsap.quickTo(ctaRef.current, 'y', { duration: 0.5, ease: 'power3.out' })
  }, [])

  const handleCtaMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ctaRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    ctaXTo.current?.((e.clientX - (r.left + r.width / 2)) * 0.3)
    ctaYTo.current?.((e.clientY - (r.top + r.height / 2)) * 0.3)
  }

  /* ── Availability badge: dot-only on mobile, taps open to the full
     label ──────────────────────────────────────────────────────────
     On mobile the full pill sat over the portrait no matter where it
     went, always covering some part of the photo. Collapsing it down
     to just the pulsing dot leaves the photo clear by default, same
     "tap to reveal, auto-dismiss" interaction already used for the
     accent-word hover images elsewhere on the site (ImageCycler). */
  const [isMobile, setIsMobile] = useState(false)
  const [badgeOpen, setBadgeOpen] = useState(false)
  const badgeCollapseRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    /* Below 1280px the portrait spans the section's full width (see the
       768-1023 and 1024-1279 HeroSection breakpoints in globals.css),
       same as mobile — the always-open badge collides with the fixed
       header sitting right on top of it there too, not just at true
       mobile widths. This is the only thing isMobile drives in this
       component (the badge's collapsed/tap-to-open behavior), so
       widening it doesn't touch anything else. */
    setIsMobile(window.innerWidth < 1280)
  }, [])

  const handleBadgeTap = () => {
    if (badgeCollapseRef.current) clearTimeout(badgeCollapseRef.current)
    setBadgeOpen(prev => {
      const next = !prev
      if (next) badgeCollapseRef.current = setTimeout(() => setBadgeOpen(false), 2600)
      return next
    })
  }

  const badgeShowText = !isMobile || badgeOpen
  const badgeShowRadar = isMobile && !badgeOpen

  const handleCtaLeave = () => {
    setCtaHover(false)
    setCursorType('default')
    ctaXTo.current?.(0)
    ctaYTo.current?.(0)
  }

  const headingParts = s.heading!.split('*')
  const headingMain  = headingParts[0]
  const headingItalic = headingParts[1] || ''
  const time = useClock()
  const year = new Date().getFullYear()

  const sectionRef      = useRef<HTMLElement>(null)
  const imgWrapRef      = useRef<HTMLDivElement>(null)
  const greenRef        = useRef<HTMLDivElement>(null)
  const magentaRef      = useRef<HTMLDivElement>(null)
  const marqueeRef      = useRef<HTMLDivElement>(null)
  const outerMarqueeRef = useRef<HTMLDivElement>(null)
  const glitchTlRef     = useRef<gsap.core.Timeline | null>(null)

  /* ── RGB glitch ──────────────────────────────────────────────── */
  const triggerGlitch = useCallback(() => {
    const g = greenRef.current
    const m = magentaRef.current
    if (!g || !m) return
    glitchTlRef.current?.kill()
    const tl = gsap.timeline()
    glitchTlRef.current = tl
    tl.set([g, m], { opacity: 1 })
      .to(g,      { x: -12, duration: 0.055, ease: 'none' })
      .to(m,      { x:  12, duration: 0.055, ease: 'none' }, '<')
      .to(g,      { x:   7, duration: 0.04,  ease: 'none' })
      .to(m,      { x:  -7, duration: 0.04,  ease: 'none' }, '<')
      .to(g,      { x:  -4, opacity: 0.6, duration: 0.035, ease: 'none' })
      .to(m,      { x:   4, opacity: 0.6, duration: 0.035, ease: 'none' }, '<')
      .to([g, m], { x: 0, opacity: 0, duration: 0.14, ease: 'power2.out' })
  }, [])

  /* ── Hide before first paint — prevents flash on page navigation ── */
  useLayoutEffect(() => {
    gsap.set('.hj-meta-item', { opacity: 0, y: 14 })
    gsap.set(imgWrapRef.current,  { opacity: 0, scale: 0.94 })
    gsap.set('.hj-bio',      { opacity: 0, y: 22 })
    gsap.set('.hj-headline', { opacity: 0 })
  }, [])

  /* ── Entrance animation ──────────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('.hj-meta-item', { y: 0, opacity: 1, duration: 0.6, stagger: 0.09 })
        .to(imgWrapRef.current, {
          scale: 1, opacity: 1,
          duration: 1.4, ease: 'expo.out', clearProps: 'scale,opacity',
        }, '-=0.35')
        .to('.hj-bio',      { y: 0, opacity: 1, duration: 0.75, stagger: 0.14 }, '-=1.0')
        .to('.hj-headline', { opacity: 1, duration: 0.55 }, '-=0.38')
        .call(triggerGlitch)
    }, sectionRef)

    const glitchId = setInterval(triggerGlitch, 5000)
    return () => { ctx.revert(); clearInterval(glitchId); glitchTlRef.current?.kill() }
  }, [triggerGlitch])

  /* ── Headline parallax ───────────────────────────────────────── */
  useEffect(() => {
    const section  = sectionRef.current
    const headline = section?.querySelector<HTMLElement>('.hj-headline')
    if (!section || !headline) return

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom top',
      scrub:   1,
      onUpdate(self) {
        gsap.set(headline, { y: self.progress * -320 })
      },
    })

    return () => st.kill()
  }, [])

  /* ── Marquee + water physics ─────────────────────────────────── */
  useEffect(() => {
    const imgWrap = imgWrapRef.current
    const marquee = marqueeRef.current
    const outerMq = outerMarqueeRef.current
    if (!imgWrap || !marquee || !outerMq) return

    const BASE_S  = 12
    let   spanW   = (marquee.children[0] as HTMLElement).offsetWidth
    let   basePpf = spanW / (BASE_S * 60)
    let   xPos    = 0
    let   goingLeft = true
    const spdProxy  = { mult: 1 }

    const remeasure = () => {
      spanW   = (marquee.children[0] as HTMLElement).offsetWidth
      basePpf = spanW / (BASE_S * 60)
    }
    window.addEventListener('resize', remeasure, { passive: true })

    const marqueeTick = () => {
      const px = basePpf * spdProxy.mult
      xPos += goingLeft ? -px : px
      if (xPos <= -spanW) xPos += spanW
      if (xPos >   0)     xPos -= spanW
      gsap.set(marquee, { x: xPos })
    }
    gsap.ticker.add(marqueeTick)

    let lastScrollY  = window.scrollY
    let lastGlitchAt = 0
    const GLITCH_COOLDOWN = 600

    const onScroll = () => {
      const y     = window.scrollY
      const delta = Math.abs(y - lastScrollY)
      const down  = y >= lastScrollY

      goingLeft = down

      const factor  = Math.min(delta / 12, 1)
      spdProxy.mult = 1 + factor * 4.0

      gsap.to(spdProxy, { mult: 1, duration: 1.4, ease: 'power3.out', overwrite: true })

      gsap.to(outerMq, { skewX: down ? -2 : 2, duration: 0.12, ease: 'none', overwrite: true })
      gsap.to(outerMq, { skewX: 0, duration: 1.1, ease: 'power3.out', delay: 0.12, overwrite: false })

      lastScrollY = y

      const now = Date.now()
      if (now - lastGlitchAt > GLITCH_COOLDOWN) {
        lastGlitchAt = now
        triggerGlitch()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    /* ── Water physics ───────────────────────────────────────────
       Three sine waves per axis at different frequencies & phases.
       Summed, they never align perfectly — organic motion vs pendulum.
       Storm multiplier: scroll velocity → amplifies all axes 1× → 3×.
       ─────────────────────────────────────────────────────────── */
    let t          = 0
    let stormLevel = 0

    const WAVES = [
      { f: 1.10, p: 0.00 },
      { f: 2.30, p: 0.80 },
      { f: 0.72, p: 1.55 },
    ]
    const Y_AMP    = [4,    2,    3   ]
    const ROT_AMP  = [0.35, 0.18, 0.28]
    const SKEW_AMP = [0.55, 0.28, 0.45]

    const waterTick = () => {
      t += 0.026
      const storm = 1 + stormLevel * 2.0
      let y = 0, rotation = 0, skewY = 0
      for (let i = 0; i < 3; i++) {
        const s = Math.sin(t * WAVES[i].f + WAVES[i].p)
        y        += s * Y_AMP[i]    * storm
        rotation += Math.sin(t * WAVES[i].f * 0.75 + WAVES[i].p + 0.4) * ROT_AMP[i]  * storm
        skewY    += Math.sin(t * WAVES[i].f * 1.25 + WAVES[i].p + 1.1) * SKEW_AMP[i] * storm
      }
      gsap.set(imgWrap, { y, rotation, skewY })
    }
    gsap.ticker.add(waterTick)

    const stormProxy = { level: 0 }
    const clamp      = gsap.utils.clamp(0, 1)

    const st = ScrollTrigger.create({
      onUpdate(self) {
        const velocity = Math.abs(self.getVelocity())
        const target   = clamp(velocity / 1500)
        if (target > stormProxy.level) {
          stormProxy.level = target
          gsap.to(stormProxy, {
            level: 0, duration: 2.0, ease: 'power3.out', overwrite: true,
            onUpdate: () => { stormLevel = stormProxy.level },
          })
        }
      },
    })

    return () => {
      gsap.ticker.remove(waterTick)
      gsap.ticker.remove(marqueeTick)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
      st.kill()
    }
  }, [triggerGlitch])

  return (
    <section
      ref={sectionRef}
      className="hj-section relative min-h-screen overflow-hidden"
      style={{ background: BG }}
    >

      {/* ── Right meta ─────────────────────────────────────────── */}
      <div
        className="hj-meta pointer-events-none absolute top-8 z-30 flex items-start gap-12"
        style={{ right: 'calc(9% + 16px)' }}
      >
        <div className="hj-meta-item flex flex-col items-end gap-[3px]">
          <span className="text-[11px] tracking-[0.06em]" style={{ color: `${INK}55` }}>
            Based in
          </span>
          <span className="text-[11px] tracking-[0.06em]" style={{ color: `${INK}55` }}>
            {s.location}
          </span>
        </div>
        <div className="hj-meta-item flex flex-col items-end gap-[3px]">
          <span className="text-[11px] tracking-[0.06em]" style={{ color: `${INK}55` }}>
            {year}
          </span>
          <span className="text-[11px] tracking-[0.06em]" style={{ color: `${INK}55` }}>
            {time}
          </span>
        </div>
      </div>

      {/* ── Portrait + stacked frames ──────────────────────────────
          Perspective tilt: right edge is the anchor (stays fixed),
          left edge recedes — makes right side appear closer/larger.
          GSAP water physics on imgWrapRef (y/rotation/skewY) runs
          independently of the static CSS rotateY on the outer wrapper.
          ─────────────────────────────────────────────────────────── */}
      <div
        className="hj-portrait-outer"
        style={{
          position:        'absolute',
          width:           '38%',
          height:          '125vh',
          top:             '13%',
          right:           '9%',
          zIndex:          10,
          transform:       'perspective(1100px) rotateY(-9deg)',
          transformOrigin: 'right center',
        }}
        onMouseEnter={triggerGlitch}
      >
        {/* Frame 2 — furthest back */}
        <div
          aria-hidden
          className="hj-frame-2 pointer-events-none"
          style={{
            position: 'absolute', top: 0, bottom: 0,
            left: '52px', right: '-52px',
            borderRadius: '16px',
            border: '1px solid rgba(26,26,26,0.11)',
            zIndex: 1,
          }}
        />

        {/* Frame 1 */}
        <div
          aria-hidden
          className="hj-frame-1 pointer-events-none"
          style={{
            position: 'absolute', top: 0, bottom: 0,
            left: '26px', right: '-26px',
            borderRadius: '16px',
            border: '1.5px solid rgba(26,26,26,0.20)',
            zIndex: 2,
          }}
        />

        {/* Portrait — GSAP water physics applied here */}
        <div
          ref={imgWrapRef}
          className="hj-img-wrap overflow-hidden"
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '16px',
            zIndex: 3,
            willChange: 'transform',
            ['--hero-pos-desktop' as string]:  posDesktop,
            ['--hero-pos-tablet' as string]:   posTablet,
            ['--hero-pos-mobile' as string]:   posMobile,
            ['--hero-zoom-desktop' as string]: zoomDesktop,
            ['--hero-zoom-tablet' as string]:  zoomTablet,
            ['--hero-zoom-mobile' as string]:  zoomMobile,
          } as CSSProperties}
        >
          <div className="relative h-full w-full">
            <Image
              src={s.portraitImage!}
              alt="Portrait"
              fill priority
              /* Must track the actual rendered width per breakpoint, not
                 just desktop's 38%. On mobile this box renders at ~92%
                 of viewport width (plus a deliberate oversize buffer for
                 the water-physics wobble, see globals.css), and up to
                 1279px it's 100% — sizes="38vw" everywhere told the
                 browser to fetch a much smaller source than needed, which
                 then got upscaled to fill the real box: the low-quality
                 look on mobile. */
              sizes="(max-width: 767px) 130vw, (max-width: 1279px) 100vw, 39vw"
              draggable={false}
              className="object-cover hj-portrait-img"
              style={{
                filter: color ? 'contrast(1.06)' : 'grayscale(100%) contrast(1.06)',
                /* Best-effort save/select protection — a determined user
                   can always screenshot, but this blocks the common paths
                   (long-press "Save Image" on iOS, drag-out, right-click). */
                WebkitTouchCallout: 'none',
                WebkitUserSelect:   'none',
                userSelect:         'none',
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>

          {/* Green glitch channel */}
          <div ref={greenRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
            <Image
              src={s.portraitImage!} alt="" fill sizes="(max-width: 767px) 130vw, (max-width: 1279px) 100vw, 39vw"
              className="object-cover hj-portrait-img"
              style={{
                filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(90deg) brightness(0.6) contrast(1.3)',
                mixBlendMode: 'screen',
              }}
            />
          </div>

          {/* Magenta glitch channel */}
          <div ref={magentaRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
            <Image
              src={s.portraitImage!} alt="" fill sizes="(max-width: 767px) 130vw, (max-width: 1279px) 100vw, 39vw"
              className="object-cover hj-portrait-img"
              style={{
                filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(270deg) brightness(0.6) contrast(1.3)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>

        {/* Color toggle — sits outside .hj-img-wrap so the water-
            physics wobble transform on that element doesn't drag it
            around; visitors can flip the portrait between grayscale
            (default) and full color. */}
        <button
          onClick={() => { toggle(); triggerGlitch() }}
          onMouseEnter={() => setCursorType('hover')}
          onMouseLeave={() => setCursorType('default')}
          aria-label={color ? 'Switch portrait to grayscale' : 'Switch portrait to color'}
          onContextMenu={(e) => e.preventDefault()}
          className="hj-color-toggle"
          style={{
            position:       'absolute',
            top:            '14px',
            left:           '14px',
            zIndex:         15,
            width:          '34px',
            height:         '34px',
            borderRadius:   '50%',
            background:     'rgba(240,238,234,0.90)',
            backdropFilter:       'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border:         'none',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         'none',
            boxShadow:      '0 4px 16px rgba(0,0,0,0.14)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.4" fill={color ? '#ff4d00' : 'none'} stroke={INK} strokeWidth="1.3" />
            <path d="M8 1.6a6.4 6.4 0 0 1 0 12.8V1.6z" fill={INK} />
          </svg>
        </button>

        {/* Availability badge — replaces the old sublabel that used to
            sit above the heading; now floats over the portrait itself,
            same as the color toggle sitting outside .hj-img-wrap so
            the water-physics wobble doesn't drag it around.
            On mobile it starts collapsed to just the pulsing dot —
            tap to open the full label, auto-collapses after 2.6s (or
            tap again to close early). Desktop stays a static, always-
            open pill (badgeShowText/badgeShowRadar are both fixed
            true/false there via the !isMobile check). */}
        <button
          type="button"
          className="hj-avail-badge"
          onClick={isMobile ? handleBadgeTap : undefined}
          onMouseEnter={() => setCursorType(isMobile ? 'default' : 'hover')}
          onMouseLeave={() => setCursorType('default')}
          aria-label={s.availabilityText}
          style={{
            position:             'absolute',
            top:                  '14px',
            right:                '14px',
            zIndex:               15,
            display:              'flex',
            alignItems:           'center',
            gap:                  badgeShowText ? '8px' : '0px',
            maxWidth:             'calc(100% - 28px)',
            padding:              badgeShowText ? '9px 14px' : '9px',
            borderRadius:         '100px',
            border:               'none',
            background:           'rgba(20,20,20,0.55)',
            backdropFilter:       'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow:            '0 4px 16px rgba(0,0,0,0.18)',
            cursor:               isMobile ? 'pointer' : 'none',
            transition:           'padding 0.4s cubic-bezier(0.16,1,0.3,1), gap 0.4s ease',
          }}
        >
          {/* Dot — plus two expanding/fading rings behind it (radar
              ping) only while collapsed; hidden once open so the
              label reads cleanly without a pulsing distraction. */}
          <span style={{ position: 'relative', width: '7px', height: '7px', flexShrink: 0 }}>
            {badgeShowRadar && (
              <>
                <span aria-hidden className="hj-radar-ring" style={{ animationDelay: '0s' }} />
                <span aria-hidden className="hj-radar-ring" style={{ animationDelay: '0.9s' }} />
              </>
            )}
            <span
              aria-hidden
              style={{
                position:     'absolute', inset: 0,
                borderRadius: '50%',
                background:   '#3ddc73',
                boxShadow:    '0 0 0 3px rgba(61,220,115,0.22)',
              }}
            />
          </span>
          <span
            style={{
              maxWidth:      badgeShowText ? '240px' : '0px',
              opacity:       badgeShowText ? 1 : 0,
              overflow:      'hidden',
              whiteSpace:    'nowrap',
              fontSize:      '11px',
              fontWeight:    600,
              letterSpacing: '0.01em',
              color:         '#fff',
              lineHeight:    1.3,
              transition:    'max-width 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
            }}
          >
            {s.availabilityText}
          </span>
        </button>
      </div>

      {/* ── Left column ────────────────────────────────────────── */}
      <div className="hj-left absolute z-20" style={{ top: '30%', left: '5%', width: '38%' }}>

        {/* Heading — 800 weight, tight tracking, editorial */}
        <p
          className="hj-bio hj-heading"
          style={{
            fontSize:      'clamp(40px, 4.8vw, 78px)',
            fontWeight:    800,
            letterSpacing: '-0.04em',
            lineHeight:    1.04,
            color:         INK,
            marginBottom:  '1.8rem',
          }}
        >
          {headingMain}
          {headingItalic && <><br /><em style={{ fontStyle: 'italic', fontWeight: 800 }}>{headingItalic}</em></>}
        </p>

        {/* Para — clean, correct, on-brand */}
        <p
          className="hj-bio hj-bio-text"
          style={{
            fontSize:      '16px',
            fontWeight:    500,
            lineHeight:    1.7,
            letterSpacing: '0.01em',
            color:         `${INK}52`,
            borderLeft:    `2px solid ${INK}12`,
            paddingLeft:   '16px',
            maxWidth:      '480px',
          }}
        >
          {s.bio}
        </p>

        {/* CTA — magnetic pull toward the cursor + a diagonal accent
            wipe that fills in on hover (instead of a flat color swap),
            with the label doing a one-line conveyor swap in sync. */}
        <button
          ref={ctaRef}
          type="button"
          className="hj-bio hj-cta"
          onClick={openFlourish}
          onMouseEnter={() => { setCtaHover(true); setCursorType('hover') }}
          onMouseLeave={handleCtaLeave}
          onMouseMove={handleCtaMove}
          style={{
            position:       'relative',
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '10px',
            marginTop:      '2.2rem',
            padding:        '15px 30px',
            borderRadius:   '100px',
            border:         `1.5px solid ${INK}22`,
            background:     'transparent',
            overflow:       'hidden',
            cursor:         'none',
          }}
        >
          {/* Diagonal wipe fill — oversized + skewed so its leading
              edge is a diagonal line, not a flat one, then clipped
              back to the pill shape by the button's own overflow:hidden. */}
          <span
            aria-hidden
            style={{
              position:  'absolute',
              inset:     '-40% -20%',
              background: ACC,
              transform:  ctaHover ? 'translateX(0%) skewX(-10deg)' : 'translateX(-130%) skewX(-10deg)',
              transition: 'transform 0.55s cubic-bezier(0.16,1,0.3,1)',
              zIndex:     0,
            }}
          />

          {/* Label — two stacked copies; the whole pair slides up one
              line on hover so the ink-colored label exits the top and
              an identical white copy (readable once the wipe has
              filled behind it) enters from below. */}
          <span
            style={{
              position: 'relative', zIndex: 1, overflow: 'hidden', display: 'inline-block',
              /* 1em height/translate below only clip and slide by
                 exactly one line if "1em" resolves against the SAME
                 font-size the label text actually uses — without an
                 explicit fontSize here, this wrapper (and the sliding
                 column inside it) inherited the page's default size
                 instead of the label's 12px, so the clip window and
                 the slide distance were both slightly off from the
                 real line height, letting a sliver of the other
                 line's text show through in both states. */
              fontSize: '12px', lineHeight: 1, height: '1em',
            }}
          >
            <span
              style={{
                display:   'flex',
                flexDirection: 'column',
                transform:  ctaHover ? 'translateY(-1em)' : 'translateY(0)',
                transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <span style={{ height: '1em', lineHeight: 1, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK }}>
                Let&apos;s talk
              </span>
              <span style={{ height: '1em', lineHeight: 1, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff' }}>
                Let&apos;s talk
              </span>
            </span>
          </span>

          {/* Arrow — nudges up-right on hover, same "launch" motion
              as the wipe/label direction. */}
          <svg
            width="14" height="14" viewBox="0 0 10 10" fill="none" aria-hidden
            style={{
              position:   'relative',
              zIndex:     1,
              color:      ctaHover ? '#fff' : INK,
              transform:  ctaHover ? 'translate(2px, -2px)' : 'translate(0, 0)',
              transition: 'transform 0.35s ease, color 0.3s ease',
            }}
          >
            <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Oversized marquee headline ─────────────────────────────
          mix-blend-mode: difference sits on the outer absolutely-
          positioned div — a direct stacking-context child of section.
          Putting it on an inner div with will-change/transform creates
          a compositing layer that isolates the blend from siblings.
          ─────────────────────────────────────────────────────────── */}
      <div
        className="hj-headline pointer-events-none absolute bottom-0 left-0 right-0 select-none overflow-hidden"
        style={{ zIndex: 20, mixBlendMode: 'difference' }}
      >
        <div ref={outerMarqueeRef} style={{ paddingBottom: '0.20em' }}>
          <div
            ref={marqueeRef}
            className="flex whitespace-nowrap"
            style={{ lineHeight: 0.84 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="hj-marquee-span"
                style={{
                  fontSize:      'clamp(88px, 12.8vw, 200px)',
                  fontWeight:    800,
                  letterSpacing: '-0.03em',
                  color:         '#ffffff',
                  paddingRight:  '2.5rem',
                }}
              >
                {s.marqueeText} —&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
