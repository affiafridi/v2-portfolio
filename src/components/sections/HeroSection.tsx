'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
interface HeroSettings {
  heading?: string
  bio?: string
  marqueeText?: string
  location?: string
  availabilityText?: string
  portraitImage?: string
}

export default function HeroSection({ settings = {} as Record<string, unknown> }: { settings?: Record<string, unknown> }) {
  const s: HeroSettings = {
    heading:          (settings.heading as string)          || 'Building products people *enjoy using.*',
    bio:              (settings.bio as string)              || 'Self-taught developer passionate about turning ideas into real products. I build modern web applications, SaaS platforms, and digital experiences with a focus on performance, usability, and clean execution.',
    marqueeText:      (settings.marqueeText as string)     || 'Full-Stack Developer',
    location:         (settings.location as string)        || 'Dubai, UAE',
    availabilityText: (settings.availabilityText as string)|| 'Currently available for Freelance projects.',
    portraitImage:    (settings.portraitImage as string)    || '/images/aftab.jpg',
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
          }}
        >
          <div className="relative h-full w-full">
            <Image
              src={s.portraitImage!}
              alt="Portrait"
              fill priority sizes="38vw"
              className="object-cover object-top"
              style={{ filter: 'grayscale(100%) contrast(1.06)' }}
            />
          </div>

          {/* Green glitch channel */}
          <div ref={greenRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
            <Image
              src={s.portraitImage!} alt="" fill sizes="38vw"
              className="object-cover object-top"
              style={{
                filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(90deg) brightness(0.6) contrast(1.3)',
                mixBlendMode: 'screen',
              }}
            />
          </div>

          {/* Magenta glitch channel */}
          <div ref={magentaRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
            <Image
              src={s.portraitImage!} alt="" fill sizes="38vw"
              className="object-cover object-top"
              style={{
                filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(270deg) brightness(0.6) contrast(1.3)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Left column ────────────────────────────────────────── */}
      <div className="hj-left absolute z-20" style={{ top: '30%', left: '5%', width: '46%' }}>

        {/* Sublabel — matches brand label style */}
        <div
          className="hj-bio"
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           '8px',
            marginBottom:  '1.2rem',
          }}
        >
          <span style={{
            display:      'inline-block',
            width:        '6px',
            height:       '6px',
            borderRadius: '50%',
            background:   '#ff4d00',
            flexShrink:   0,
          }} />
          <span style={{
            fontSize:      '10px',
            fontWeight:    700,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color:         `${INK}40`,
          }}>
            {s.availabilityText}
          </span>
        </div>

        {/* Heading — 800 weight, tight tracking, editorial */}
        <p
          className="hj-bio"
          style={{
            fontSize:      'clamp(34px, 4.0vw, 62px)',
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
          className="hj-bio"
          style={{
            fontSize:      '13px',
            fontWeight:    500,
            lineHeight:    1.85,
            letterSpacing: '0.01em',
            color:         `${INK}52`,
            borderLeft:    `2px solid ${INK}12`,
            paddingLeft:   '16px',
            maxWidth:      '480px',
          }}
        >
          {s.bio}
        </p>
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
