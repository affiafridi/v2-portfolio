import { create } from 'zustand'

interface LoadingStore {
  isLoading: boolean
  progress: number
  setLoading: (loading: boolean) => void
  setProgress: (progress: number) => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: true,
  progress: 0,
  setLoading: (loading) => set({ isLoading: loading }),
  setProgress: (progress) =>
    set({ progress: Math.min(100, Math.max(0, progress)) }),
}))
