import { create } from 'zustand'

interface PageTransitionStore {
  active: boolean
  start: () => void
  end: () => void
}

export const usePageTransitionStore = create<PageTransitionStore>((set) => ({
  active: false,
  start: () => set({ active: true }),
  end: () => set({ active: false }),
}))
