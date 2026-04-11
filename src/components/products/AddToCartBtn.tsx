'use client'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import type { Product } from '@/types/product'
import { useToastStore } from '@/components/ui/Toast'

export default function AddToCartBtn({ product }: { product: Product }) {
    const addItem = useCart(s => s.addItem)
    const addToast = useToastStore(s => s.addToast)

    return (
        <button
            onClick={() => {
                addItem(product)
                addToast('تمت الإضافة للسلة بنجاح', 'success')
            }}
            className="w-full bg-[var(--neon)] text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform min-h-[56px] text-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] cursor-pointer"
        >
            <ShoppingBag size={24} />
            أضف إلى السلة
        </button>
    )
}
