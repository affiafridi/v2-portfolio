'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { useCursorStore } from '@/store/useCursorStore'

const MARQUEE_TEXT = 'Creative Developer — Motion Designer — '

export default function Hero() {
  const sectionRef  = useRef<HTMLElement>(null)
  const marqueeRef  = useRef<HTMLDivElement>(null)
  const { setCursorType } = useCursorStore()

  /* ── Scroll progress (0 = top of hero at viewport top, 1 = bottom) ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  /* ── Image: slow upward parallax + subtle zoom ───────────────────── */
  const imageY     = useTransform(scrollYProgress, [0, 1], ['0%',   '-12%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1,       1.08])

  /* ── Left text: fade out + gentle lift ──────────────────────────── */
  /* Starts fading at 5% scroll, fully gone at 45% */
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.45], [1, 0])
  const textY       = useTransform(scrollYProgress, [0, 0.45],    ['0%', '-8%'])

  /* ── GSAP: entrance sequence + infinite marquee loop ────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Staggered entrance (children of motion.div — no conflict since
      // GSAP touches children opacity/y, Framer Motion touches wrapper)
      tl.from('.h-tag',  { y: 24, opacity: 0, duration: 0.9, delay: 0.25 })
        .from('.h-bio',  { y: 24, opacity: 0, duration: 0.9 }, '-=0.6')
        .from('.h-img-clip', {
            clipPath: 'inset(100% 0 0 0)',
            duration: 1.6,
            ease: 'expo.out',
          }, '-=0.85')
        .from('.h-marquee-wrap', { opacity: 0, duration: 0.7 }, '-=0.45')

      // Infinite marquee — GSAP animates the inner track only
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          x: '-50%',
          duration: 30,
          ease: 'linear',
          repeat: -1,
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >

      {/* ── Left content — fades + lifts on scroll ─────────────────── */}
      <motion.div
        className="absolute left-8 top-[38%] z-20 max-w-[260px]"
        style={{ opacity: textOpacity, y: textY }}
      >
        <p
          className="h-tag mb-8 text-[11px] leading-relaxed tracking-wide"
          style={{ color: 'rgba(240,240,240,0.28)' }}
        >
          Currently available for
          <br />
          freelance projects
        </p>

        <p
          className="h-bio text-[13px] leading-[1.85] tracking-[0.01em]"
          style={{ color: 'rgba(240,240,240,0.46)' }}
        >
          Developer and designer crafting
          <br />
          immersive digital experiences
          <br />
          that push the limits of the web.
        </p>
      </motion.div>

      {/* ── Portrait — parallax (outer clip, inner translate + scale) ── */}
      {/*
        Structure:
          .h-img-clip  ← GSAP clips this (clipPath entrance)
            motion.div ← Framer Motion translates Y (parallax)
              motion.div ← Framer Motion scales (Ken Burns)
                <Image>
          [gradient fades — outside the scroll layer, stay at edges]
      */}
      <div
        className="h-img-clip absolute right-0 top-0 overflow-hidden"
        style={{
          width: '44%',
          height: '88vh',
          clipPath: 'inset(0% 0 0 0)', // reset after GSAP entrance
        }}
        onMouseEnter={() => setCursorType('hover')}
        onMouseLeave={() => setCursorType('default')}
      >
        {/* Parallax wrapper */}
        <motion.div
          className="absolute inset-0"
          style={{ y: imageY }}
        >
          {/* Scale wrapper (Ken Burns) */}
          <motion.div
            className="relative h-full w-full origin-center"
            style={{ scale: imageScale }}
          >
            <Image
              src="/images/aftab.jpg"
              alt="Aftab — Creative Developer"
              fill
              priority
              sizes="44vw"
              className="object-cover object-top"
              style={{ filter: 'grayscale(100%)' }}
            />
          </motion.div>
        </motion.div>

        {/* Fade — bottom edge (stays fixed at container bottom) */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 z-10"
          style={{
            background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)',
          }}
        />
        {/* Fade — left edge (blends into dark bg) */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 w-32 z-10"
          style={{
            background: 'linear-gradient(to right, var(--color-bg) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* ── Marquee ─────────────────────────────────────────────────── */}
      {/*
        mix-blend-mode: difference makes white text render as medium-grey
        where it overlaps the lighter parts of the photo, creating the
        "text becoming transparent on the image" effect.

        How it works:
          white (#f0f0f0) on dark bg (#0a0a0a)  → #e6e6e6  (stays white)  ✓
          white (#f0f0f0) on grey photo (~#808080) → #707070 (goes grey)   ✓
          white (#f0f0f0) on light area (~#c0c0c0) → #303030 (goes dark)   ✓
      */}
      <div
        className="h-marquee-wrap pointer-events-none absolute bottom-0 left-0 right-0 z-30 select-none overflow-hidden"
        style={{
          lineHeight: 0.88,
          mixBlendMode: 'difference',
        }}
      >
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap will-change-transform"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: 'clamp(72px, 11.5vw, 176px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'var(--color-fg)',
                paddingRight: '1.5rem',
              }}
            >
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>

    </section>
  )
}
