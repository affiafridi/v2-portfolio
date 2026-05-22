import { create } from 'zustand'
import type { CursorType } from '@/types'

interface CursorStore {
  cursorType: CursorType
  cursorText: string
  setCursorType: (type: CursorType) => void
  setCursorText: (text: string) => void
}

export const useCursorStore = create<CursorStore>((set) => ({
  cursorType: 'default',
  cursorText: '',
  setCursorType: (type) => set({ cursorType: type }),
  setCursorText: (text) => set({ cursorText: text }),
}))
