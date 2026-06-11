'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type Lenis = { scrollTo: (target: number, opts: Record<string, unknown>) => void }

/* Scroll to top on real page navigation.
   Skips when the transition involves /contact so the contact modal
   opening/closing never disturbs the user's scroll position. */
export default function ScrollRestoration() {
  const pathname    = usePathname()
  const prevRef     = useRef(pathname)

  useEffect(() => {
    const from = prevRef.current
    const to   = pathname
    prevRef.current = to

    /* Don't scroll when entering or leaving the contact modal route */
    if (from === '/contact' || to === '/contact') return

    const lenis = (window as unknown as Record<string, unknown>).__lenis as Lenis | undefined
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
