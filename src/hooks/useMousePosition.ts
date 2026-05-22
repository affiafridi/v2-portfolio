'use client'

interface MousePosition {
  x: number
  y: number
}

/**
 * Returns the current mouse position in viewport coordinates.
 * TODO: wire up pointermove listener and RAF smoothing.
 */
export function useMousePosition(): MousePosition {
  // TODO: implement
  return { x: 0, y: 0 }
}
