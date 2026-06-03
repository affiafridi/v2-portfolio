'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────────
   SmoothScrollProvider
   ─────────────────────────────────────────────────────────────────
   Initialises Lenis and drives it through GSAP's ticker so every
   ScrollTrigger animation stays perfectly in sync with the smooth
   scroll position — no jitter, no lag between scroll and animation.

   Integration chain:
     browser wheel/touch
       → Lenis (lerp + easing)
         → lenis.raf() called inside gsap.ticker
           → ScrollTrigger.update() on every Lenis scroll event
             → all GSAP scroll animations run in lockstep

   lagSmoothing(0) disables GSAP's own frame-skip compensation so
   it doesn't fight Lenis's interpolation on slow frames.
   ───────────────────────────────────────────────────────────────── */

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      /* ── Feel ────────────────────────────────────────────────── */
      duration:    1.25,                        // scroll response duration
      easing:      (t: number) =>               // expo-out — fast then coast
        t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      lerp:        0.08,                        // interpolation factor (0–1)

      /* ── Behaviour ───────────────────────────────────────────── */
      orientation:        'vertical',
      gestureOrientation: 'vertical',
      smoothWheel:        true,
      wheelMultiplier:    1.0,
      touchMultiplier:    1.8,                  // slightly faster on touch
      infinite:           false,
    })

    lenisRef.current = lenis

    /* ── Expose instance globally for programmatic scrollTo calls ──
       e.g. the footer's "Back to top" button calls
       window.__lenis.scrollTo(0, { duration: 2 }) to animate a
       fast sweep through all sections back to the top.
       ─────────────────────────────────────────────────────────── */
    ;(window as unknown as Record<string, unknown>).__lenis = lenis
    ;(window as unknown as Record<string, unknown>).ScrollTrigger = ScrollTrigger

    /* ── Wire Lenis into GSAP ticker ────────────────────────────
       Calling lenis.raf() inside the GSAP ticker (rather than a
       separate requestAnimationFrame loop) means Lenis and GSAP
       share a single rAF call per frame — eliminating the one-frame
       offset that causes scroll-animation jitter.
       ─────────────────────────────────────────────────────────── */
    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    /* ── Keep ScrollTrigger in sync with Lenis scroll position ──
       Without this, ScrollTrigger reads the native scrollY which
       lags behind Lenis's interpolated position on fast scrolls.
       ─────────────────────────────────────────────────────────── */
    lenis.on('scroll', ScrollTrigger.update)

    /* ── Refresh ScrollTrigger after Lenis is ready ─────────── */
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
