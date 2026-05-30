'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ─────────────────────────────────────────────────────────────────
   HeroJerez — Light-theme editorial hero

   HEADLINE BLEND  (mix-blend-mode: difference + white text):
     white (#fff) over cream bg (#f0eeea)
       → (255−240, 255−238, 255−234) = (15,17,21) ≈ near-black    ✓
     white (#fff) over dark portrait shadow (#1a1a1a)
       → (255−26, 255−26, 255−26)   = (229,229,229) ≈ near-white  ✓
     white (#fff) over mid-grey highlight (~#888)
       → (255−136, …)               = ~120 = medium grey           ✓
   Result: text is DARK on the cream background and turns LIGHT/
   WHITE wherever it crosses dark areas of the grayscale portrait —
   exactly the "Blend mode typography" effect in the reference.

   IMAGE ANIMATION:
     Idle : slow sine-wave skewY (±3°) — portrait waves in a breeze
     Scroll: velocity burst (±14°) additive — "flag hit by wind"
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
export default function HeroJerez() {
  const time = useClock()
  const year = new Date().getFullYear()

  const sectionRef      = useRef<HTMLElement>(null)
  const imgWrapRef      = useRef<HTMLDivElement>(null)
  const greenRef        = useRef<HTMLDivElement>(null)
  const magentaRef      = useRef<HTMLDivElement>(null)
  const marqueeRef      = useRef<HTMLDivElement>(null)   // CSS-animated inner div
  const outerMarqueeRef = useRef<HTMLDivElement>(null)   // GSAP scroll-skew wrapper
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

  /* ── 1. Entrance + floating ──────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hj-meta-item', { y: 14, opacity: 0, duration: 0.6, stagger: 0.09 })
        .from(imgWrapRef.current, {
            scale: 0.94, opacity: 0,
            duration: 1.4, ease: 'expo.out', clearProps: 'scale,opacity',
          }, '-=0.35')
        .from('.hj-bio',       { y: 22, opacity: 0, duration: 0.75, stagger: 0.14 }, '-=1.0')
        .from('.hj-headline',  { opacity: 0, duration: 0.55 },        '-=0.38')
        .call(triggerGlitch)

      /* No float tween here — waterTick in useEffect 2 owns y/rotation/skewY */
    }, sectionRef)

    const glitchId = setInterval(triggerGlitch, 5000)
    return () => { ctx.revert(); clearInterval(glitchId); glitchTlRef.current?.kill() }
  }, [triggerGlitch])

  /* ── 3. Headline parallax — scrolls upward faster than the page ─ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hj-headline', {
        y:    -260,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start:   'top top',
          end:     'bottom top',
          scrub:   1.2,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  /* ── 2. Marquee direction + water physics on portrait ───────────

     WATER PHYSICS  — how it works:
     ─────────────────────────────
     Three overlapping sine waves per axis (y, rotation, skewY),
     each at a different frequency and phase offset.  When summed
     they never line up perfectly, creating an organic motion that
     looks like a ship on water rather than a mechanical pendulum.

     Frequencies chosen so no two axes repeat together:
       Wave A  — slow swell       (primary)
       Wave B  — medium chop      (secondary)
       Wave C  — fast surface rip (tertiary)

     STORM MULTIPLIER
     ─────────────────
     Scroll velocity → stormLevel 0→1 via clamp(velocity / 1500).
     Every amplitude is multiplied by (1 + stormLevel × 3.0), so:
       calm water  = 1 × base amplitudes
       light chop  = ~1.5 × (gentle scroll)
       full storm  = 4 × (fast scroll) — image whips violently

     Multiplier springs back to 0 over 2 s with power3 ease.
     ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const imgWrap  = imgWrapRef.current
    const marquee  = marqueeRef.current
    const outerMq  = outerMarqueeRef.current
    if (!imgWrap || !marquee || !outerMq) return

    /* ── Seamless GSAP marquee ticker ─────────────────────────────────
       CSS animation-iteration hard-resets the transform each loop,
       causing a 1-frame jump that the eye catches as a "restart".
       Instead we advance xPos every frame and wrap it modularly —
       the value never resets, it just keeps counting, so the loop
       is completely invisible.
       4 identical spans → wrap boundary at 1 span-width = seamless.
       ─────────────────────────────────────────────────────────────── */
    const BASE_S  = 22   // target duration of one full cycle (seconds)
    let   spanW   = (marquee.children[0] as HTMLElement).offsetWidth
    let   basePpf = spanW / (BASE_S * 60)  // px per frame @ 60 fps
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
      /* modular wrap — both scroll directions handled, no reset */
      if (xPos <= -spanW) xPos += spanW
      if (xPos >   0)     xPos -= spanW
      gsap.set(marquee, { x: xPos })
    }

    gsap.ticker.add(marqueeTick)

    /* ── Scroll: direction flip + mild speed burst + skew + glitch ── */
    let lastScrollY  = window.scrollY
    let lastGlitchAt = 0
    const GLITCH_COOLDOWN = 600

    const onScroll = () => {
      const y     = window.scrollY
      const delta = Math.abs(y - lastScrollY)
      const down  = y >= lastScrollY

      /* direction flip */
      goingLeft = down

      /* mild speed burst — max 2× at fast scroll, springs back over 1.8 s */
      const factor  = Math.min(delta / 22, 1)
      spdProxy.mult = 1 + factor * 1.0   // cap at 2×

      gsap.to(spdProxy, {
        mult:      1,
        duration:  1.8,
        ease:      'power2.out',
        overwrite: true,
      })

      /* Skew the outer wrapper slightly in scroll direction, spring back */
      gsap.to(outerMq, {
        skewX:    down ? -2 : 2,
        duration: 0.12,
        ease:     'none',
        overwrite: true,
      })
      gsap.to(outerMq, {
        skewX:    0,
        duration: 1.1,
        ease:     'power3.out',
        delay:    0.12,
        overwrite: false,
      })

      lastScrollY = y

      const now = Date.now()
      if (now - lastGlitchAt > GLITCH_COOLDOWN) {
        lastGlitchAt = now
        triggerGlitch()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    /* ── Water physics ticker ─────────────────────────────────── */
    let t          = 0           // time counter
    let stormLevel = 0           // 0 = calm, 1 = storm

    // Three waves, each with frequency + phase offset
    // F = frequency multiplier, P = phase offset (rad)
    const WAVES = [
      { f: 1.10, p: 0.00 },   // A — slow swell
      { f: 2.30, p: 0.80 },   // B — medium chop
      { f: 0.72, p: 1.55 },   // C — long surge
    ]

    // Calm-water base amplitudes — subtle, minimal movement
    const Y_AMP    = [4, 2, 3]         // px  (was 13, 6, 9)
    const ROT_AMP  = [0.35, 0.18, 0.28]  // degrees (was 1.6, 0.8, 1.3)
    const SKEW_AMP = [0.55, 0.28, 0.45]  // degrees (was 2.8, 1.4, 2.2)

    const waterTick = () => {
      t += 0.026   // speed of waves — increase for choppier water

      const storm = 1 + stormLevel * 2.0   // amplitude scale: 1× → 3×

      // Sum all three waves per axis
      let y = 0, rotation = 0, skewY = 0
      for (let i = 0; i < 3; i++) {
        const s = Math.sin(t * WAVES[i].f + WAVES[i].p)
        y        += s * Y_AMP[i]    * storm
        rotation += Math.sin(t * WAVES[i].f * 0.75 + WAVES[i].p + 0.4)
                      * ROT_AMP[i]  * storm
        skewY    += Math.sin(t * WAVES[i].f * 1.25 + WAVES[i].p + 1.1)
                      * SKEW_AMP[i] * storm
      }

      gsap.set(imgWrap, { y, rotation, skewY })
    }

    gsap.ticker.add(waterTick)

    /* ── ScrollTrigger → storm multiplier ────────────────────── */
    const stormProxy = { level: 0 }
    const clamp      = gsap.utils.clamp(0, 1)

    const st = ScrollTrigger.create({
      onUpdate(self) {
        const velocity    = Math.abs(self.getVelocity())
        const target      = clamp(velocity / 1500)
        if (target > stormProxy.level) {
          stormProxy.level = target
          gsap.to(stormProxy, {
            level:     0,
            duration:  2.0,
            ease:      'power3.out',
            overwrite: true,
            onUpdate:  () => { stormLevel = stormProxy.level },
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
      className="relative min-h-screen overflow-hidden"
      style={{ background: BG }}
    >

      {/* ══ RIGHT META (name + nav handled by Header.tsx above) ══
          "Based in / New York City" and "year / time" — right side only.
          Left side removed: Header.tsx already shows "Aftab." there.
          ═════════════════════════════════════════════════════════ */}
      <div
        className="pointer-events-none absolute top-8 z-30 flex items-start gap-12"
        style={{ right: 'calc(9% + 16px)' }}   /* aligns with the image's right gap */
      >
        <div className="hj-meta-item flex flex-col items-end gap-[3px]">
          <span className="text-[11px] tracking-[0.06em]" style={{ color: `${INK}55` }}>
            Based in
          </span>
          <span className="text-[11px] tracking-[0.06em]" style={{ color: `${INK}55` }}>
            Dubai, UAE
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

      {/* ══ PORTRAIT ══════════════════════════════════════════════ */}
      <div
        ref={imgWrapRef}
        className="hj-img-wrap absolute overflow-hidden"
        style={{
          width:        '38%',
          height:       '125vh',   /* taller than viewport — scroll reveals lower portion */
          top:          '13%',     /* clear gap below the top bar                        */
          right:        '9%',      /* visible gap on the right — not bleeding off screen  */
          borderRadius: '16px',    /* all corners rounded since image floats away from edges */
          zIndex:       10,
          willChange:   'transform',
        }}
        onMouseEnter={triggerGlitch}
      >
        <div className="relative h-full w-full">
          <Image
            src="/images/aftab.jpg"
            alt="Portrait" fill priority sizes="38vw"
            className="object-cover object-top"
            style={{ filter: 'grayscale(100%) contrast(1.06)' }}
          />
        </div>

        <div ref={greenRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
          <Image src="/images/aftab.jpg" alt="" fill sizes="38vw"
            className="object-cover object-top"
            style={{
              filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(90deg) brightness(0.6) contrast(1.3)',
              mixBlendMode: 'screen',
            }}
          />
        </div>

        <div ref={magentaRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
          <Image src="/images/aftab.jpg" alt="" fill sizes="38vw"
            className="object-cover object-top"
            style={{
              filter: 'grayscale(100%) sepia(100%) saturate(900%) hue-rotate(270deg) brightness(0.6) contrast(1.3)',
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>

      {/* ══ LEFT COLUMN ════════════════════════════════════════════ */}
      <div className="absolute z-20" style={{ top: '32%', left: '5%', width: '44%' }}>

        {/* ── Big headline ─────────────────────────────────────── */}
        <p
          className="hj-bio"
          style={{
            fontSize: 'clamp(32px, 3.8vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.12,
            color: INK,
            marginBottom: '1.6rem',
          }}
        >
          Crafting digital<br />experiences.
        </p>

        {/* ── Supporting text ──────────────────────────────────── */}
        <p
          className="hj-bio"
          style={{
            fontSize: '14px',
            lineHeight: 1.9,
            color: `${INK}50`,
            borderLeft: `2px solid ${INK}14`,
            paddingLeft: '16px',
            maxWidth: '340px',
          }}
        >
          Drawing inspiration from the diverse<br />
          culture of Queens, working as an<br />
          independent creative based in Dubai.
        </p>

      </div>

      {/* ══ OVERSIZED HEADLINE ════════════════════════════════════
          mix-blend-mode: difference + WHITE text (#ffffff):

            white over cream (#f0eeea):
              → (255−240, 255−238, 255−234) = (15,17,21) = near-black ✓

            white over dark portrait shadow (#1a1a1a):
              → (255−26, 255−26, 255−26) = (229,229,229) = near-white ✓

          Text is DARK on the light background and flips to LIGHT/WHITE
          wherever it overlaps the dark portrait — the exact "blend mode
          typography" effect from the reference.
          ═════════════════════════════════════════════════════════ */}
      {/*
        mix-blend-mode MUST sit on the outer absolutely-positioned div
        (a direct stacking-context child of <section>), NOT on the inner
        marquee div. Putting it on the inner div — especially one with
        will-change or transform — creates a new compositing layer that
        isolates the blend and stops it from seeing siblings (portrait).
        Moving it here lets it composite against: cream bg + portrait (z:10).
      */}
      {/*
        overflow-hidden removed from hj-headline — it was clipping descenders
        (g, p, y) of the big font. paddingBottom on the inner wrapper gives
        those descenders room to show inside the section boundary.
        bottom-0 instead of bottom-[-1%] keeps everything within the section
        so the section's own overflow-hidden doesn't clip anything.
      */}
      <div
        className="hj-headline pointer-events-none absolute bottom-0
                   left-0 right-0 select-none"
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
                style={{
                  fontSize:      'clamp(88px, 12.8vw, 200px)',
                  fontWeight:    800,
                  letterSpacing: '-0.03em',
                  color:         '#ffffff',
                  paddingRight:  '2.5rem',
                }}
              >
                Creative Developer — Interaction Designer —&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
