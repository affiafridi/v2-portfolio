'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Returns the active Lenis instance if needed for programmatic control.
 * The global Lenis instance is initialised in SmoothScrollProvider —
 * this hook is a lightweight accessor for components that need it
 * (e.g. to temporarily pause scroll during a modal open).
 */
export function useSmoothScroll(lenis?: Lenis | null): void {
  useEffect(() => {
    if (!lenis) return
    // Example: pause on mount, resume on unmount
    // lenis.stop()
    // return () => lenis.start()
  }, [lenis])
}
