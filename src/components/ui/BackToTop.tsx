'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { useCursorStore } from '@/store/useCursorStore'
import { useWhatsAppStore } from '@/store/useWhatsAppStore'

const ACC  = '#ff4d00'
const INK  = '#1a1a1a'
const SIZE = 44
const R    = 18
const CIRC = 2 * Math.PI * R   // ≈ 113.1

type LenisInstance = {
  scrollTo: (target: number, opts?: Record<string, unknown>) => void
  on:  (event: string, cb: (e: { scroll: number }) => void) => void
  off: (event: string, cb: (e: { scroll: number }) => void) => void
}

/* `shiftedForWidget` lifts this above the WhatsApp FAB, which occupies
   the same bottom-right corner. Offsets are derived from that button's
   own geometry (its clamp() inset + 58px height) so the two stay
   aligned on a shared centre axis at every viewport width, rather than
   being eyeballed at one breakpoint. */
const FAB_INSET  = 'clamp(16px,3vw,28px)'
const FAB_SIZE   = 58
const STACK_GAP  = 14

export default function BackToTop({ shiftedForWidget = false }: { shiftedForWidget?: boolean }) {
  const [visible,  setVisible]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted,  setMounted]  = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { setCursorType } = useCursorStore()

  /* The chat panel opens upward from its FAB and covers the exact slot
     this button was moved into, so it would sit half-hidden behind the
     card. Stepping out while the panel is open is cleaner than fighting
     for z-order, and this button is unreachable during that time
     anyway. */
  const whatsappOpen = useWhatsAppStore((s) => s.isOpen)

  /* ── Mount guard for portal ─────────────────────────────────── */
  useEffect(() => { setMounted(true) }, [])

  /* ── rAF loop — always in sync with Lenis interpolated position ─
     Lenis drives scroll via GSAP ticker, so native scroll events
     are unreliable for reading the real-time smooth position.
     Reading window.scrollY inside rAF gives the authoritative value
     on every rendered frame.
     ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    let rafId: number

    const tick = () => {
      const scrollY   = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0)
      setVisible(scrollY > 320)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  /* ── Click handler — blur overlay + smooth scroll to top ─────── */
  const handleClick = () => {
    const overlay = overlayRef.current
    const lenis   = (window as unknown as Record<string, unknown>).__lenis as LenisInstance | undefined

    /* 1 — Fade blur overlay in */
    if (overlay) {
      gsap.killTweensOf(overlay)
      gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.in' })
    }

    /* 2 — Smooth scroll to top */
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 2.2,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      } as Record<string, unknown>)

      /* 3 — Fade overlay out when scroll nears the top */
      const onScroll = ({ scroll }: { scroll: number }) => {
        if (scroll < 400) {
          if (overlay) {
            gsap.killTweensOf(overlay)
            gsap.to(overlay, { opacity: 0, duration: 1.2, ease: 'power2.out' })
          }
          lenis.off('scroll', onScroll)
        }
      }
      lenis.on('scroll', onScroll)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (overlay) gsap.to(overlay, { opacity: 0, delay: 1.5, duration: 0.8, ease: 'power2.out' })
    }
  }

  const dashOffset = CIRC * (1 - progress)
  const shown = visible && !whatsappOpen

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={() => setCursorType('hover')}
        onMouseLeave={() => setCursorType('default')}
        aria-label="Back to top"
        style={{
          position:     'fixed',
          /* Sits directly above the FAB, centres aligned: the FAB's
             centre is inset + 29px from the right, so this 44px button
             needs inset + 29 - 22 to match. */
          bottom:       shiftedForWidget
            ? `calc(${FAB_INSET} + ${FAB_SIZE + STACK_GAP}px)`
            : '2rem',
          right:        shiftedForWidget
            ? `calc(${FAB_INSET} + ${(FAB_SIZE - SIZE) / 2}px)`
            : '2rem',
          width:        `${SIZE}px`,
          height:       `${SIZE}px`,
          borderRadius: '50%',
          background:   'rgba(240,238,234,0.90)',
          backdropFilter:       'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border:       'none',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          cursor:       'none',
          zIndex:       9000,
          opacity:      shown ? 1 : 0,
          transform:    shown ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.82)',
          transition:   'opacity 0.35s ease, transform 0.40s cubic-bezier(0.34,1.56,0.64,1)',
          pointerEvents: shown ? 'auto' : 'none',
          boxShadow:    '0 4px 20px rgba(0,0,0,0.10)',
        }}
      >
        {/* Scroll-progress ring */}
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={`${INK}14`}
            strokeWidth="1.5"
          />
          {/* Filled arc */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={ACC}
            strokeWidth="1.5"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Up arrow */}
        <svg
          width="11" height="11" viewBox="0 0 12 12" fill="none"
          style={{ position: 'relative', zIndex: 1 }}
          aria-hidden="true"
        >
          <path
            d="M6 10V2M2 6l4-4 4 4"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Blur overlay — same as footer's back-to-top effect */}
      {mounted && createPortal(
        <div
          ref={overlayRef}
          style={{
            position:             'fixed',
            inset:                0,
            zIndex:               9990,
            opacity:              0,
            pointerEvents:        'none',
            backdropFilter:       'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            background:           'rgba(240,238,234,0.18)',
          }}
          aria-hidden="true"
        />,
        document.body
      )}
    </>
  )
}
