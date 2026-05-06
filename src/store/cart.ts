import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types/database'

interface CartItem extends Product { quantity: number }
interface CartStore {
    items: CartItem[]
    addItem: (p: Product) => void
    removeItem: (id: string) => void
    updateQty: (id: string, qty: number) => void
    clear: () => void
    total: () => number
    count: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (p) => set(s => {
                const ex = s.items.find(i => i.id === p.id)
                return {
                    items: ex ? s.items.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
                        : [...s.items, { ...p, quantity: 1 }]
                }
            }),
            removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
            updateQty: (id, qty) => set(s => ({
                items: qty <= 0 ? s.items.filter(i => i.id !== id)
                    : s.items.map(i => i.id === id ? { ...i, quantity: qty } : i)
            })),
            clear: () => set({ items: [] }),
            total: () => get().items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
            count: () => get().items.reduce((s, i) => s + i.quantity, 0),
        }),
        { name: 'boox-cart', version: 1 }
    )
)
