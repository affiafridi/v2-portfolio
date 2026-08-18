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
        <div key="page-transition" style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}>
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

          {/* Leading-edge ring — clip-path has no stroke of its own, so
              on two pages with similar background colors the reveal's
              boundary can be almost invisible, making the bloom hard to
              actually see happening. This is a separate, unclipped
              circle (not nested inside the div above — being clipped
              along with it would cut its own border off right at the
              same edge it's meant to trace) driven by the exact same
              transition config, so its edge stays locked to the reveal
              boundary the whole time.
              Sized at its FINAL diameter from the start (left/top/width/
              height are all static, computed once) and animated purely
              via `scale` — animating width/height directly forces a
              browser layout recalc on every frame, and under any frame
              pressure that shows up as the border visibly doubling/
              smearing ("stacking") instead of tracing one clean edge.
              scale is a transform, so it's compositor-only: no layout
              work per frame, and it scales from the element's own
              center by default, which (since the box is already
              centered on `point`) keeps the edge exactly where the
              clip-path's edge is throughout. */}
          <motion.div
            aria-hidden
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{    scale: 0, opacity: 0 }}
            transition={circleTransition}
            style={{
              position:      'absolute',
              left:          point.x - maxRadius,
              top:           point.y - maxRadius,
              width:         maxRadius * 2,
              height:        maxRadius * 2,
              borderRadius:  '50%',
              border:        '1.5px solid rgba(120,120,120,0.4)',
              boxSizing:     'border-box',
              willChange:    'transform',
            }}
          />
        </div>
      )}
    </AnimatePresence>
  )
}
