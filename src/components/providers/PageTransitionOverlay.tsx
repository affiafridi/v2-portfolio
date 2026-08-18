'use client'

import { useEffect, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTransitionStore } from '@/store/usePageTransitionStore'

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function PageTransitionOverlay() {
  const active = usePageTransitionStore((s) => s.active)
  const origin = usePageTransitionStore((s) => s.origin)
  const end    = usePageTransitionStore((s) => s.end)
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  // The overlay lives above the layout that swaps pages, so it survives
  // the navigation. Once the pathname actually changes underneath it
  // (meaning the destination route has rendered), hold briefly for the
  // paint to settle, then reveal it.
  useEffect(() => {
    if (active && pathname !== prevPathname.current) {
      const t = setTimeout(() => end(), 200)
      prevPathname.current = pathname
      return () => clearTimeout(t)
    }
    prevPathname.current = pathname
  }, [pathname, active, end])

  // Safety net: this whole mechanism depends on `pathname` changing to
  // fire the effect above — if a navigation ever fails to change route
  // (a thrown error mid-render, a redirect back to the same path, or
  // any edge case that doesn't trip Next's router the way expected),
  // there's nothing left to end() the overlay and it stays covering
  // the screen indefinitely. This forces it closed a couple of seconds
  // after the reveal should have finished no matter what happened
  // underneath, so a broken navigation degrades to "overlay clears
  // early" instead of "page is stuck covered forever".
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => end(), 3000)
    return () => clearTimeout(t)
  }, [active, end])

  // Point the reveal grows from — the click position (see TransitionLink),
  // falling back to viewport center for triggers with no click to read a
  // position from (e.g. the admin login redirect). Memoized on `origin`
  // specifically (not recomputed every render) so the open animation and
  // the close animation that follows it are mathematically guaranteed to
  // use the exact same coordinate — origin only changes on the next
  // start(), never mid-cycle, so this stays locked for the whole
  // open→close sequence.
  const point = useMemo(() => (
    origin ?? {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    }
  ), [origin])

  // Distance from that point to the farthest viewport corner — the
  // circle has to grow at least this large to fully cover the screen
  // regardless of where the click landed.
  const maxRadius = useMemo(() => (
    typeof window !== 'undefined'
      ? Math.hypot(
          Math.max(point.x, window.innerWidth  - point.x),
          Math.max(point.y, window.innerHeight - point.y),
        )
      : 0
  ), [point])

  const circleTransition = { duration: 0.62, ease: EASE }

  return (
    <AnimatePresence>
      {active && (
        // Single top-level element under AnimatePresence — the earlier
        // version had the background and the ring as two separate
        // top-level siblings (a Fragment with two keyed motion.divs),
        // which is what produced the "stacked border" glitch: on a
        // fast second click, Framer Motion could end up running that
        // ring's exit and a freshly-started enter at once, doubling it
        // up visibly. Nesting both inside one tracked wrapper means
        // there's only ever one mount/unmount cycle for AnimatePresence
        // to manage, not two independently-timed ones.
        // This wrapper is itself a motion.div (not a plain div) even
        // though it has no animated properties of its own — a plain
        // element as AnimatePresence's direct child, with only its
        // *nested* children animating, is a less standard pattern and
        // one place AnimatePresence has been seen to lose track of
        // when the exit animation actually finished, leaving the whole
        // subtree mounted (and covering the screen) indefinitely.
        <motion.div key="page-transition" style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}>
          <motion.div
            initial={{ clipPath: `circle(0px at ${point.x}px ${point.y}px)` }}
            animate={{ clipPath: `circle(${maxRadius}px at ${point.x}px ${point.y}px)` }}
            exit={{    clipPath: `circle(0px at ${point.x}px ${point.y}px)` }}
            transition={circleTransition}
            style={{
              position:       'absolute',
              inset:          0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:           'rgba(240,238,234,0.55)',
              backdropFilter:       'blur(14px) saturate(150%)',
              WebkitBackdropFilter: 'blur(14px) saturate(150%)',
              willChange:           'clip-path',
            }}
          >
            {/* Dot loader — three staggered pulsing dots, no text label.
                Pure CSS keyframe animation (see .pt-dot in globals.css)
                so it loops continuously for however long the transition
                takes, independent of Framer Motion's one-shot timeline.
                Stays centered on the viewport regardless of where the
                circle grows from — a steady place to look while the
                bloom does the directional part of the animation. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              style={{ display: 'flex', gap: '10px' }}
            >
              <span className="pt-dot" style={{ animationDelay: '0s' }} />
              <span className="pt-dot" style={{ animationDelay: '0.15s' }} />
              <span className="pt-dot" style={{ animationDelay: '0.3s' }} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
