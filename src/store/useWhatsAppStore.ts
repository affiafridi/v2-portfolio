import { create } from 'zustand'

/* Shared so BackToTop can step out of the way while the chat panel is
   open — the two occupy the same corner, and the panel opens upward
   across exactly where BackToTop sits. Mirrors the shape of
   useMenuStore / useContactStore / useGifFlourishStore. */
interface WhatsAppStore {
  isOpen:  boolean
  setOpen: (open: boolean) => void
  toggle:  () => void
}

export const useWhatsAppStore = create<WhatsAppStore>((set) => ({
  isOpen:  false,
  setOpen: (isOpen) => set({ isOpen }),
  toggle:  () => set((s) => ({ isOpen: !s.isOpen })),
}))
