import { create } from 'zustand'

interface GifFlourishStore {
  isOpen: boolean
  open:   () => void
  close:  () => void
}

export const useGifFlourishStore = create<GifFlourishStore>((set) => ({
  isOpen: false,
  open:   () => set({ isOpen: true  }),
  close:  () => set({ isOpen: false }),
}))
