'use client'

import { useEffect, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTransitionStore } from '@/store/usePageTransitionStore'

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

// Must match circleTransition.duration below (in ms) — the reveal effect
// uses this to guarantee it never fires before the cover animation has
// actually finished, regardless of how fast the underlying navigation
// resolves (see that effect's comment for why this matters now that
// TransitionLink fires router.push() immediately instead of waiting
// out this same duration first).
const COVER_DURATION_MS = 620

export default function PageTransitionOverlay() {
  const active = usePageTransitionStore((s) => s.active)
  const origin = usePageTransitionStore((s) => s.origin)
  const end    = usePageTransitionStore((s) => s.end)
  const pathname = usePathname()
  const prevPathname   = useRef(pathname)
  const activeStartedAt = useRef<number | null>(null)

  // Stamp the moment the cover animation actually started, so the
  // reveal effect below can measure real elapsed time against it.
  useEffect(() => {
    if (active) activeStartedAt.current = Date.now()
  }, [active])

  // The overlay lives above the layout that swaps pages, so it survives
  // the navigation. Once the pathname actually changes underneath it
  // (meaning the destination route has rendered), reveal it — but not
  // before the cover animation itself has had time to finish covering
  // the screen. TransitionLink now fires router.push() immediately on
  // click (not after waiting out the cover duration first), so a route
  // that's already prefetched/cached can resolve in a handful of ms —
  // without this floor, that would reveal the destination mid-bloom,
  // snapping the circle open before it had even finished growing.
  // Slow routes (their own DB query, or a cold uncached one) are the
  // opposite case this whole change targets: previously the fetch
  // didn't start until the cover animation was already done, so the
  // dots kept spinning for however long the fetch took AFTER that —
  // reading as "the animation finished, then it just sat there before
  // eventually redirecting". Starting the fetch immediately instead
  // gives it the cover animation's own duration as real head-start
  // time, so it's far more often already done by the time this floor
  // is reached.
  useEffect(() => {
    if (active && pathname !== prevPathname.current) {
      prevPathname.current = pathname
      const elapsed   = activeStartedAt.current ? Date.now() - activeStartedAt.current : COVER_DURATION_MS
      const remaining = Math.max(0, COVER_DURATION_MS - elapsed)
      const t = setTimeout(() => end(), remaining + 200)
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
  // regardless of where the click landed. iOS Safari's address bar
  // collapses/expands mid-scroll (and can still be mid-transition when
  // a click starts a page transition), so window.innerHeight at the
  // instant this is computed can be smaller than the actual screen
  // once the toolbar finishes hiding — undersizing the circle and
  // leaving real, unblurred corners visible for the rest of the
  // transition (reported on a real iPhone; devtools' mobile emulation
  // doesn't reproduce the address-bar resize at all, same root cause
  // class as the ScrollTrigger fix in SmoothScrollProvider.tsx). A
  // 1.25x safety margin means the circle overshoots the corner it
  // needs to reach even if the viewport grows by the toolbar's full
  // height after this number is calculated.
  const maxRadius = useMemo(() => (
    typeof window !== 'undefined'
      ? Math.hypot(
          Math.max(point.x, window.innerWidth  - point.x),
          Math.max(point.y, window.innerHeight - point.y),
        ) * 1.25
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
        <motion.div
          key="page-transition"
          style={{
            position:       'fixed',
            top:            0,
            left:           0,
            /* Explicit dvh/dvw instead of inset:0 — on iOS Safari a
               fixed element sized via inset:0 anchors to the small
               (toolbar-visible) viewport by default and doesn't grow
               to cover the extra space the large viewport reveals once
               the toolbar collapses, leaving a real unblurred strip
               along whichever edge the toolbar occupied. dvh/dvw track
               the actual current viewport instead. */
            width:          '100dvw',
            height:         '100dvh',
            zIndex:         99999,
            pointerEvents:  'none',
          }}
        >
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
