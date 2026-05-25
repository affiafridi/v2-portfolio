'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useCursorStore } from '@/store/useCursorStore'

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)
  const { cursorType } = useCursorStore()

  /* ── Mouse tracking ──────────────────────────────────────────── */
  useEffect(() => {
    let mouseX = 0, mouseY = 0
    let ringX  = 0, ringY  = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      gsap.set(dotRef.current, { x: mouseX, y: mouseY })
    }

    const tick = () => {
      ringX += (mouseX - ringX) * 0.10
      ringY += (mouseY - ringY) * 0.10
      gsap.set(ringRef.current, { x: ringX, y: ringY })
    }

    gsap.ticker.add(tick)
    window.addEventListener('mousemove', onMove)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  /* ── Cursor state reactions ──────────────────────────────────── */
  useEffect(() => {
    const ring = ringRef.current
    const dot  = dotRef.current
    if (!ring || !dot) return

    switch (cursorType) {
      case 'hover':
        gsap.to(ring, { scale: 2.0, opacity: 1, duration: 0.35, ease: 'power2.out' })
        gsap.to(dot,  { scale: 0,   duration: 0.2 })
        break
      case 'drag':
        gsap.to(ring, { scale: 3.0, opacity: 1, duration: 0.35, ease: 'power2.out' })
        gsap.to(dot,  { scale: 0,   duration: 0.2 })
        break
      case 'text':
        gsap.to(ring, { scale: 0,   duration: 0.2 })
        gsap.to(dot,  { scale: 5, borderRadius: '2px', duration: 0.3, ease: 'power2.out' })
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

  return (
    <>
      {/* Lagging ring — mix-blend-mode:difference makes it auto-invert on dark/light bgs */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ transform: 'translate(-50%, -50%)', mixBlendMode: 'difference' }}
        aria-hidden="true"
      >
        <div
          className="h-9 w-9 rounded-full border"
          style={{ borderColor: '#ffffff' }}
        />
      </div>

      {/* Exact-position dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ transform: 'translate(-50%, -50%)', mixBlendMode: 'difference' }}
        aria-hidden="true"
      >
        <div
          className="h-[6px] w-[6px] rounded-full"
          style={{ background: '#ffffff' }}
        />
      </div>
    </>
  )
}
