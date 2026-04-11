'use client'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useEffect, useState } from 'react'

export default function CartButton({ onClick }: { onClick: () => void }) {
    const count = useCart(s => s.count())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <button
            onClick={onClick}
            className="relative flex items-center justify-center w-11 h-11 rounded-full glass border border-[var(--border)] hover:border-[var(--neon-cyan)] transition-all min-h-[44px] min-w-[44px] cursor-pointer"
            aria-label="Open Cart"
        >
            <ShoppingBag size={20} className="text-[var(--text)]" />
            {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--neon)] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full pointer-events-none shadow-[0_0_10px_rgba(99,102,241,0.8)]">
                    {count}
                </span>
            )}
        </button>
    )
}
