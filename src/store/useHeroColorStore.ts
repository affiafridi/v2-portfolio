import { create } from 'zustand'

const STORAGE_KEY = 'hero-portrait-color'

interface HeroColorStore {
  color:  boolean
  toggle: () => void
  hydrate: () => void
}

export const useHeroColorStore = create<HeroColorStore>((set, get) => ({
  color: false,
  toggle: () => {
    const next = !get().color
    set({ color: next })
    try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
  },
  hydrate: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) set({ color: saved === '1' })
    } catch {}
  },
}))
