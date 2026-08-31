'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from '@/components/ui/TransitionLink'
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
  const rowRefs     = useRef<(HTMLAnchorElement | null)[]>([])
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
      /* opacity:1 belongs here too. killTweensOf above cuts the entrance
         tween short whenever the pointer reaches a second row inside its
         0.5s window — and since this branch previously animated only
         scale, the preview stayed pinned at whatever partial opacity it
         had reached, for the rest of the hover. */
      gsap.to(float, { opacity: 1, scale: 0.90, duration: 0.10, ease: 'power2.in' })
      gsap.to(float, { scale: 1,   duration: 0.38, ease: 'back.out(1.6)', delay: 0.10 })
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

  /* ── Pointer-driven hover, decoupled from each row's own DOM box ──
     Same fix as ServiceSection's row list, for the same reason: a plain
     onMouseEnter on each row only fires when the mouse itself moves into
     that exact element — hovering into empty space on the same line (the
     gap around the number/type text) fell outside the row's box and
     dropped the hover, and scrolling under a stationary cursor left the
     preview stuck on whatever was last actively hovered, since nothing
     re-fires without real mouse movement. Tracking the raw pointer Y and
     re-matching it against each row's current bounding rect — on both
     mousemove and Lenis's own scroll event — fixes both. X is never
     checked, only Y, so hovering anywhere across a row's full height
     counts regardless of how far from the title text the cursor is. */
  useEffect(() => {
    let lastY = -1

    const updateHover = () => {
      if (lastY < 0) return
      let matchedIdx = -1
      for (let i = 0; i < rowRefs.current.length; i++) {
        const row = rowRefs.current[i]
        if (!row) continue
        const rect = row.getBoundingClientRect()
        if (lastY >= rect.top && lastY <= rect.bottom) { matchedIdx = i; break }
      }
      if (matchedIdx === -1) {
        if (floatVisible.current) handleLeave()
      } else if (matchedIdx !== prevIdx.current) {
        handleEnter(matchedIdx)
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      lastY = e.clientY
      updateHover()
    }
    window.addEventListener('mousemove', onMouseMove)

    /* Same StrictMode/ordering hazard as ServiceSection: SmoothScrollProvider
       sets window.__lenis in its own effect, and effects run child-before-
       parent, so this component's effect body runs before that one has had
       a chance to set it. A setTimeout(0) defers past that window. */
    type LenisLike = { on: (evt: string, cb: () => void) => void; off: (evt: string, cb: () => void) => void }
    let lenis: LenisLike | undefined
    const lenisId = setTimeout(() => {
      lenis = (window as unknown as Record<string, unknown>).__lenis as LenisLike | undefined
      lenis?.on('scroll', updateHover)
    }, 0)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      clearTimeout(lenisId)
      lenis?.off('scroll', updateHover)
    }
  }, [handleEnter, handleLeave])

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
                className="wpl-row"
                ref={el => { rowRefs.current[i] = el }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'clamp(16px,2vw,28px) 0', textDecoration: 'none', cursor: 'none' }}
              >
                {/* Number + Name */}
                <div className="wpl-row-inner" style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(16px,2vw,28px)', flex: 1, minWidth: 0 }}>
                  <span
                    ref={el => { numRefs.current[i] = el }}
                    className="wpl-num"
                    style={{ fontSize: 'clamp(10px,0.85vw,12px)', fontWeight: 700,
                      letterSpacing: '0.14em', color: ACC, flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    ref={el => { nameRefs.current[i] = el }}
                    className="wpl-name"
                    style={{ fontSize: 'clamp(40px,6.5vw,100px)', fontWeight: 800,
                      letterSpacing: '-0.04em', lineHeight: 1, textTransform: 'uppercase',
                      color: `${INK}22`, userSelect: 'none' }}
                  >
                    {project.title}
                  </span>
                  <span
                    ref={el => { tagRefs.current[i] = el }}
                    className="wpl-type"
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
        className="wpl-float"
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
