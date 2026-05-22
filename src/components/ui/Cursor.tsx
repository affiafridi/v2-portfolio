'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useCursorStore } from '@/store/useCursorStore'

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const { cursorType } = useCursorStore()

  /* ── Mouse tracking ──────────────────────────────────────────── */
  useEffect(() => {
    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0

    // Dot snaps exactly to cursor
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      gsap.set(dotRef.current, { x: mouseX, y: mouseY })
    }

    // Ring lags behind with lerp inside the GSAP ticker
    const tick = () => {
      ringX += (mouseX - ringX) * 0.1
      ringY += (mouseY - ringY) * 0.1
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
    const dot = dotRef.current
    if (!ring || !dot) return

    switch (cursorType) {
      case 'hover':
        gsap.to(ring, { scale: 2.2, borderColor: 'var(--color-accent)', duration: 0.35, ease: 'power2.out' })
        gsap.to(dot, { scale: 0, duration: 0.2 })
        break
      case 'drag':
        gsap.to(ring, { scale: 3, borderColor: 'rgba(240,240,240,0.6)', duration: 0.35, ease: 'power2.out' })
        gsap.to(dot, { scale: 0, duration: 0.2 })
        break
      case 'text':
        gsap.to(ring, { scale: 0, duration: 0.2 })
        gsap.to(dot, { scale: 4, borderRadius: '2px', duration: 0.3, ease: 'power2.out' })
        break
      case 'hidden':
        gsap.to(ring, { scale: 0, opacity: 0, duration: 0.2 })
        gsap.to(dot, { scale: 0, opacity: 0, duration: 0.2 })
        break
      default: // 'default'
        gsap.to(ring, { scale: 1, opacity: 1, borderColor: 'rgba(240,240,240,0.35)', borderRadius: '50%', duration: 0.35, ease: 'power2.out' })
        gsap.to(dot, { scale: 1, opacity: 1, borderRadius: '50%', duration: 0.25, ease: 'power2.out' })
        break
    }
  }, [cursorType])

  return (
    <>
      {/* Lagging ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      >
        <div
          className="h-9 w-9 rounded-full border"
          style={{ borderColor: 'rgba(26,26,26,0.28)' }}
        />
      </div>

      {/* Exact-position dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      >
        <div
          className="h-[6px] w-[6px] rounded-full"
          style={{ background: 'rgba(26,26,26,0.75)' }}
        />
      </div>
    </>
  )
}
