import { create } from 'zustand'

interface AdminNavStore {
  loading: boolean
  start: () => void
  stop: () => void
}

let timer: ReturnType<typeof setTimeout> | null = null

export const useAdminNavStore = create<AdminNavStore>((set) => ({
  loading: false,
  start: () => {
    if (timer) clearTimeout(timer)
    set({ loading: true })
    timer = setTimeout(() => set({ loading: false }), 4000)
  },
  stop: () => {
    if (timer) clearTimeout(timer)
    set({ loading: false })
  },
}))
