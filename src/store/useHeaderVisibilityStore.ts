import { create } from 'zustand'

interface HeaderVisibilityStore {
  visible: boolean
  hide:    () => void
  show:    () => void
}

export const useHeaderVisibilityStore = create<HeaderVisibilityStore>((set) => ({
  visible: true,
  hide:    () => set({ visible: false }),
  show:    () => set({ visible: true  }),
}))
