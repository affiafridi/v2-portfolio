import { create } from 'zustand'

export interface TransitionOrigin { x: number; y: number }

interface PageTransitionStore {
  active: boolean
  /* Screen coordinates the reveal circle grows from (the click point)
     — null falls back to viewport center, for triggers that don't
     have a click event to read a position from (e.g. a redirect after
     a form submit). */
  origin: TransitionOrigin | null
  start: (origin?: TransitionOrigin | null) => void
  end: () => void
}

export const usePageTransitionStore = create<PageTransitionStore>((set) => ({
  active: false,
  origin: null,
  start: (origin = null) => set({ active: true, origin }),
  end: () => set({ active: false }),
}))
