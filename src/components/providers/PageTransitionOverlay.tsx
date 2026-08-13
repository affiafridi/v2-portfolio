'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTransitionStore } from '@/store/usePageTransitionStore'

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function PageTransitionOverlay() {
  const active = usePageTransitionStore((s) => s.active)
  const end = usePageTransitionStore((s) => s.end)
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

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="page-transition-overlay"
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.62, ease: EASE }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'none',
            background: 'rgba(240,238,234,0.55)',
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
          }}
        >
          {/* Leading-edge glass highlight for a bit of depth */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 6%), linear-gradient(270deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 6%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
