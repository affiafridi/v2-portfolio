'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useCursorStore } from '@/store/useCursorStore'

export default function Cursor() {
  /* ── Positional wrappers — GSAP owns x/y, React never sets transform ── */
  const ringWrapRef = useRef<HTMLDivElement>(null)
  const dotWrapRef  = useRef<HTMLDivElement>(null)

  /* ── Visual inners — GSAP owns scale/opacity ──────────────────────── */
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  const { cursorType } = useCursorStore()
  const [hasPointer, setHasPointer] = useState(true)

  /* Touch devices never fire mousemove, so the ring/dot would otherwise
     sit stuck at their initial center-screen position forever. */
  useEffect(() => {
    setHasPointer(window.matchMedia('(pointer: fine)').matches)
  }, [])

  /* ── Mouse tracking ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!hasPointer) return
    const rw = ringWrapRef.current
    const dw = dotWrapRef.current
    if (!rw || !dw) return

    /* Centre with xPercent/yPercent so GSAP fully owns the transform
       and React's re-render can't collide with it.                   */
    gsap.set([rw, dw], { xPercent: -50, yPercent: -50 })

    let mouseX = window.innerWidth  / 2
    let mouseY = window.innerHeight / 2
    let ringX  = mouseX
    let ringY  = mouseY

    /* Snap dot and ring to center on first load (avoids top-left flash) */
    gsap.set(dw, { x: mouseX, y: mouseY })
    gsap.set(rw, { x: mouseX, y: mouseY })

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      /* Dot follows exactly — no lag */
      gsap.set(dw, { x: mouseX, y: mouseY })
    }

    const tick = () => {
      /* deltaRatio(60) normalises the lerp to 60 fps so it feels the
         same on 60 Hz, 120 Hz, and 144 Hz displays.                  */
      const dr = gsap.ticker.deltaRatio(60)
      const lerp = 0.10 * dr
      ringX += (mouseX - ringX) * lerp
      ringY += (mouseY - ringY) * lerp
      gsap.set(rw, { x: ringX, y: ringY })
    }

    gsap.ticker.add(tick)
    window.addEventListener('mousemove', onMove)

    /* Hide ring when cursor leaves the window */
    const onLeave  = () => gsap.to(ringRef.current,  { opacity: 0, duration: 0.2 })
    const onEnter  = () => gsap.to(ringRef.current,  { opacity: 1, duration: 0.2 })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  /* ── Cursor state reactions ───────────────────────────────────────── */
  useEffect(() => {
    const ring = ringRef.current
    const dot  = dotRef.current
    if (!ring || !dot) return

    switch (cursorType) {
      case 'hover':
        gsap.to(ring, { scale: 2.0, opacity: 1, duration: 0.35, ease: 'power2.out' })
        gsap.to(dot,  { scale: 0,   opacity: 0, duration: 0.2 })
        break
      case 'drag':
        gsap.to(ring, { scale: 3.0, opacity: 1, duration: 0.35, ease: 'power2.out' })
        gsap.to(dot,  { scale: 0,   opacity: 0, duration: 0.2 })
        break
      case 'text':
        gsap.to(ring, { scale: 0,   opacity: 0, duration: 0.2 })
        gsap.to(dot,  { scale: 5,   opacity: 1, borderRadius: '2px', duration: 0.3, ease: 'power2.out' })
        break
      case 'hidden':
        gsap.to(ring, { scale: 0, opacity: 0, duration: 0.2 })
        gsap.to(dot,  { scale: 0, opacity: 0, duration: 0.2 })
        break
      default:
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' })
        gsap.to(dot,  { scale: 1, opacity: 1, borderRadius: '50%', duration: 0.25, ease: 'power2.out' })
    }
  }, [cursorType])

  if (!hasPointer) return null

  return (
    <>
      {/* ── Ring positional wrapper — GSAP sets x/y here.
           mix-blend-mode must live on this outermost fixed element so it
           blends against the page content. Putting it on a child whose
           parent has a GSAP transform isolates the stacking context and
           kills the colour-inversion effect. ────────────────────────── */}
      <div
        ref={ringWrapRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999]"
        style={{ mixBlendMode: 'difference' }}
        aria-hidden="true"
      >
        {/* Visual ring — GSAP sets scale/opacity */}
        <div ref={ringRef}>
          <div
            className="h-9 w-9 rounded-full border"
            style={{ borderColor: '#ffffff' }}
          />
        </div>
      </div>

      {/* ── Dot positional wrapper ──────────────────────────────────────── */}
      <div
        ref={dotWrapRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999]"
        style={{ mixBlendMode: 'difference' }}
        aria-hidden="true"
      >
        {/* Visual dot — GSAP sets scale/opacity */}
        <div ref={dotRef}>
          <div
            className="h-[6px] w-[6px] rounded-full"
            style={{ background: '#ffffff' }}
          />
        </div>
      </div>
    </>
  )
}
