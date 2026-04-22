'use client'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import type { Product } from '@/lib/supabase/types'
import { useToastStore } from '@/components/ui/Toast'

export default function AddToCartBtn({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem)
  const addToast = useToastStore((state) => state.addToast)
  const disabled = product.price_on_inquiry || product.price === null

  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          addToast('السعر لازم يكون محدد قبل الإضافة للسلة', 'error')
          return
        }

        addItem(product)
        addToast('تمت الإضافة للسلة بنجاح', 'success')
      }}
      className="w-full bg-[var(--neon)] text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform min-h-[56px] text-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingBag size={24} />
      أضف إلى السلة
    </button>
  )
}
