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

      /* syncTouch: with this off (the default), touch scroll is handled
         natively by the browser — Lenis only *observes* the resulting
         position each frame to keep ScrollTrigger in sync, it doesn't
         own it. That leaves a real gap: the instant a new touch gesture
         starts in a new direction, there's a brief window where the
         native scroll position and Lenis's internally-tracked state
         disagree, and GSAP's pinned/scrubbed sections are reading off
         Lenis's side of that gap — reconciling it is exactly what a
         "moves backward, then corrects" glitch on the first touch of a
         direction looks like. syncTouch:true makes Lenis the sole
         source of truth for touch too (same as it already is for wheel
         via smoothWheel), removing the two-source mismatch entirely. */
      syncTouch:            true,
      syncTouchLerp:         0.075,   // Lenis default
      touchInertiaExponent:  1.7,     // Lenis default
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
    /* NOT lagSmoothing(0). That fully disables GSAP's frame-drop
       protection: after ANY stall, however brief, the next tick treats
       the whole gap as real elapsed time, so every scroll-linked
       animation (ScrollTrigger scrub, Lenis-driven progress) snaps
       forward to "catch up" in one visible jump. Touch-start is exactly
       the kind of event that causes a brief main-thread stall (hit-
       testing across this site's many hover/touch handlers) right as a
       new gesture begins — matching the reported bug precisely: a
       jump/vibrate on the first movement of a scroll, on touch only,
       settling once frames are ticking normally. GSAP's own default
       (500ms threshold, clamp to 33ms) absorbs that stall instead of
       replaying it as a jump, without meaningfully conflicting with
       Lenis — Lenis's own lerp/velocity math is independent of GSAP's
       ticker-level lag compensation. */

    /* ── Keep ScrollTrigger in sync with Lenis scroll position ──
       Without this, ScrollTrigger reads the native scrollY which
       lags behind Lenis's interpolated position on fast scrolls.
       ─────────────────────────────────────────────────────────── */
    lenis.on('scroll', ScrollTrigger.update)

    /* ── Refresh ScrollTrigger after Lenis is ready ───────────
       Deferred one frame (not called synchronously here) so it runs
       after the browser's first paint instead of blocking it — this
       fires at the same moment every section's own mount-time
       gsap.context()/ScrollTrigger.create() calls do too, and with a
       page this animation-heavy, doing all of that plus a full
       ScrollTrigger.refresh() (which measures live layout for every
       registered trigger) synchronously in one go delayed how soon
       Hero's entrance animation could even start. */
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      gsap.ticker.remove(onTick)
      lenis.destroy()
      cancelAnimationFrame(rafId)
    }
  }, [])

  return <>{children}</>
}
