'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

interface WorkProject { slug: string; title: string; type: string; year: number; image: string; tags: string[]; id?: string; description?: string }

export default function WorkPageList({ projects = [] }: { projects?: WorkProject[] }) {
  const sectionRef  = useRef<HTMLElement>(null)
  const floatRef    = useRef<HTMLDivElement>(null)
  const imgRefs     = useRef<(HTMLDivElement | null)[]>([])
  const lineRefs    = useRef<(HTMLDivElement | null)[]>([])
  const nameRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const numRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const tagRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const prevIdx     = useRef(-1)
  const floatVisible = useRef(false)
  const { setCursorType } = useCursorStore()

  const handleEnter = useCallback((idx: number) => {
    const float = floatRef.current
    const prev  = prevIdx.current
    if (!float) return

    /* Position float on right side of screen */
    gsap.killTweensOf(float)

    if (!floatVisible.current) {
      gsap.set(float, { scale: 0.80, opacity: 0 })
      gsap.to(float, { opacity: 1, scale: 1, duration: 0.50, ease: 'back.out(1.4)' })
      floatVisible.current = true
    } else {
      gsap.to(float, { scale: 0.90, duration: 0.10, ease: 'power2.in' })
      gsap.to(float, { scale: 1,    duration: 0.38, ease: 'back.out(1.6)', delay: 0.10 })
    }

    /* Swap image */
    imgRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.killTweensOf(el)
      gsap.to(el, {
        opacity:  i === idx ? 1 : 0,
        duration: i === idx ? 0.32 : 0.14,
        ease:     i === idx ? 'power2.out' : 'power2.in',
      })
    })

    /* Outgoing row */
    if (prev >= 0 && prev !== idx) {
      if (nameRefs.current[prev])
        gsap.to(nameRefs.current[prev]!, { color: `${INK}22`, duration: 0.24 })
      if (numRefs.current[prev])
        gsap.to(numRefs.current[prev]!, { opacity: 0.18, duration: 0.22 })
      if (tagRefs.current[prev])
        gsap.to(tagRefs.current[prev]!, { opacity: 0, x: 8, duration: 0.16 })
    }

    /* Incoming row */
    if (nameRefs.current[idx])
      gsap.to(nameRefs.current[idx]!, { color: INK, duration: 0.28 })
    if (numRefs.current[idx])
      gsap.to(numRefs.current[idx]!, { opacity: 0.65, duration: 0.22 })
    if (tagRefs.current[idx])
      gsap.to(tagRefs.current[idx]!, { opacity: 1, x: 0, duration: 0.24, ease: 'power2.out' })

    prevIdx.current = idx
    setCursorType('hover')
  }, [setCursorType])

  const handleLeave = useCallback(() => {
    const float = floatRef.current
    if (!float) return

    gsap.killTweensOf(float)
    gsap.to(float, { opacity: 0, scale: 0.82, duration: 0.22, ease: 'power2.in' })
    floatVisible.current = false
    prevIdx.current = -1

    nameRefs.current.forEach(el => el && gsap.to(el, { color: `${INK}22`, duration: 0.24 }))
    numRefs.current.forEach(el  => el && gsap.to(el,  { opacity: 0.18, duration: 0.20 }))
    tagRefs.current.forEach(el  => el && gsap.to(el,  { opacity: 0, x: 6, duration: 0.16 }))
    setCursorType('default')
  }, [setCursorType])

  useEffect(() => {
    /* Initial states */
    nameRefs.current.forEach(el => el && gsap.set(el, { color: `${INK}22` }))
    numRefs.current.forEach(el  => el && gsap.set(el,  { opacity: 0.18 }))
    tagRefs.current.forEach(el  => el && gsap.set(el,  { opacity: 0, x: 6 }))
    imgRefs.current.forEach(el  => el && gsap.set(el,  { opacity: 0 }))
    lineRefs.current.forEach(el => el && gsap.set(el,  { scaleX: 0, transformOrigin: 'left center' }))
    if (floatRef.current) gsap.set(floatRef.current, { opacity: 0, scale: 0.80 })

    const ctx = gsap.context(() => {

      /* Section label */
      gsap.from('.wpl-label', {
        y: -10, opacity: 0, filter: 'blur(6px)', duration: 0.30, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 90%', once: true },
      })

      /* Lines + names sequential reveal */
      const lines = lineRefs.current.filter(Boolean) as HTMLDivElement[]
      const names = nameRefs.current.filter(Boolean) as HTMLSpanElement[]
      const nums  = numRefs.current.filter(Boolean)  as HTMLSpanElement[]

      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.wpl-list', start: 'top 80%', once: true },
        delay: 0.05,
      })

      /* Top line */
      tl.fromTo(lines[0], { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: 'power3.out' })

      names.forEach((name, i) => {
        tl.fromTo(name,
          { opacity: 0, filter: 'blur(8px)', x: 6 },
          { opacity: 1, filter: 'blur(0px)', x: 0,
            duration: 0.22, ease: 'power2.out',
            onComplete: () => { gsap.set(name, { color: `${INK}22` }) }
          }
        )
        if (nums[i]) tl.fromTo(nums[i],
          { opacity: 0 }, { opacity: 0.18, duration: 0.16, ease: 'power2.out' }, '<'
        )
        if (lines[i + 1]) tl.fromTo(lines[i + 1],
          { scaleX: 0 }, { scaleX: 1, duration: 0.26, ease: 'power3.out' }
        )
      })

    }, sectionRef)

    /* Hide float when section leaves */
    const st = ScrollTrigger.create({
      trigger: sectionRef.current!,
      start: 'top bottom', end: 'bottom top',
      onLeave: handleLeave, onLeaveBack: handleLeave,
    })

    return () => { ctx.revert(); st.kill() }
  }, [handleLeave])

  return (
    <section
      ref={sectionRef}
      style={{ background: CREAM, position: 'relative', zIndex: 2 }}
      onMouseLeave={handleLeave}
    >
      <div style={{ padding: 'clamp(28px,3.5vw,48px) clamp(28px,5vw,68px) clamp(48px,6vw,80px)' }}>

        {/* Label */}
        <div className="wpl-label" style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 'clamp(40px,5vw,64px)' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: `${INK}32` }}>
            All Projects
          </span>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: `${INK}22` }}>
            {String(projects.length).padStart(2, '0')} Total
          </span>
        </div>

        {/* List */}
        <div className="wpl-list">

          {/* Top divider */}
          <div ref={el => { lineRefs.current[0] = el }}
            style={{ height: '1px', background: `${INK}10`, transformOrigin: 'left center' }} />

          {projects.map((project, i) => (
            <div key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'clamp(16px,2vw,28px) 0', textDecoration: 'none', cursor: 'none' }}
                onMouseEnter={() => handleEnter(i)}
              >
                {/* Number + Name */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(16px,2vw,28px)', flex: 1 }}>
                  <span
                    ref={el => { numRefs.current[i] = el }}
                    style={{ fontSize: 'clamp(10px,0.85vw,12px)', fontWeight: 700,
                      letterSpacing: '0.14em', color: ACC, flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    ref={el => { nameRefs.current[i] = el }}
                    style={{ fontSize: 'clamp(40px,6.5vw,100px)', fontWeight: 800,
                      letterSpacing: '-0.04em', lineHeight: 1, textTransform: 'uppercase',
                      color: `${INK}22`, userSelect: 'none' }}
                  >
                    {project.title}
                  </span>
                  <span
                    ref={el => { tagRefs.current[i] = el }}
                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em',
                      textTransform: 'uppercase', color: ACC, opacity: 0, flexShrink: 0 }}
                  >
                    {project.type}
                  </span>
                </div>

              </Link>

              {/* Divider */}
              <div ref={el => { lineRefs.current[i + 1] = el }}
                style={{ height: '1px', background: `${INK}10`, transformOrigin: 'left center' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating image preview ──────────────────────────────── */}
      <div
        ref={floatRef}
        style={{ position: 'fixed', top: '50%', right: '6vw', transform: 'translateY(-50%)',
          width: 'min(28vw, 420px)', aspectRatio: '16/10',
          pointerEvents: 'none', zIndex: 200,
          borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
          border: `1px solid ${INK}08`,
        }}
      >
        {projects.map((project, i) => (
          <div key={project.slug}
            ref={el => { imgRefs.current[i] = el }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.image} alt={project.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>
    </section>
  )
}
