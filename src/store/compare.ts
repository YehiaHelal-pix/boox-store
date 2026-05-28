import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types/database'

interface CompareStore {
  items: Product[]
  addItem: (p: Product) => void
  removeItem: (id: string) => void
  clear: () => void
  isInCompare: (id: string) => boolean
  count: () => number
}

export const useCompare = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (p) => set(s => {
        if (s.items.length >= 4) return s // max 4
        if (s.items.find(i => i.id === p.id)) return s
        return { items: [...s.items, p] }
      }),
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      clear: () => set({ items: [] }),
      isInCompare: (id) => get().items.some(i => i.id === id),
      count: () => get().items.length
    }),
    { name: 'boox-compare', version: 1 }
  )
)
