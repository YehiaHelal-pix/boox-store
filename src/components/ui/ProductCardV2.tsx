'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  IoCheckmarkCircle,
  IoFlashOutline,
  IoHardwareChipOutline,
  IoBatteryFullOutline,
  IoCartOutline,
  IoStar,
} from 'react-icons/io5'
import type { Product } from '@/types/database'
import { useCart } from '@/store/cart'

function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return ''
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return ''
  return num.toLocaleString('ar-EG')
}

function pushToast(msg: string, type: 'success' | 'error' | 'warn' | 'info') {
  window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
}

export default function ProductCardV2({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem)

  const discount =
    product.original_price && product.price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  const imgSrc = product.image_url || '/placeholder-phone.png'
  const rating = 4.8
  const reviewCount = 124

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ y: -6 }}
        className="product-card group relative rounded-3xl overflow-hidden flex flex-col cursor-pointer"
      >
        <div className="product-card__glow pointer-events-none" aria-hidden />

        {/* Image area */}
        <div className="relative h-52 sm:h-60 md:h-64 flex items-center justify-center overflow-hidden bg-[#f5f5f7] rounded-[22px] m-3 border border-white/[0.08] shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
          {/* Subtle Stage Lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 items-start">
            {discount > 0 && (
              <span className="bg-red-500 text-white font-extrabold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg tracking-tight shadow-md">
                خصم {discount}%
              </span>
            )}
          </div>

          <motion.div
            className="relative z-10 h-full w-full flex items-center justify-center p-4 sm:p-5"
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={imgSrc}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-1"
              style={{ mixBlendMode: 'multiply' }}
              draggable={false}
            />
          </motion.div>
        </div>


        {/* Content */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-4 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight product-title-glow line-clamp-1">
              {product.name}
            </h3>
            {/* Rating */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-white/60">
              <IoStar className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-amber-300">{rating.toFixed(1)}</span>
              <span>({reviewCount} تقييم)</span>
            </div>
            {/* Specs */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {product.storage_size && (
                <span className="spec-chip">
                  <IoHardwareChipOutline className="w-3.5 h-3.5" />
                  {product.storage_size}
                </span>
              )}
              {typeof product.battery_health === 'number' && (
                <span className="spec-chip">
                  <IoBatteryFullOutline className="w-3.5 h-3.5 text-emerald-400" />
                  بطارية {product.battery_health}%
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            {product.price !== null && product.price !== undefined ? (
              <>
                <span className="text-2xl font-extrabold price-neon tracking-tight">
                  {formatPrice(product.price)}{' '}
                  <span className="text-base font-semibold opacity-80">ج.م</span>
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-white/35 line-through">
                    {formatPrice(product.original_price)} ج.م
                  </span>
                )}
              </>
            ) : (
              <span className="text-lg font-bold price-neon">السعر عند الطلب</span>
            )}
          </div>

          <button
            type="button"
            className="cta-glossy mt-1 w-full h-11 rounded-2xl text-sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!product.in_stock) return
              addItem(product)
              pushToast('تمت الإضافة للسلة ✓', 'success')
            }}
          >
            <IoCartOutline className="w-4 h-4" />
            أضف للسلة
          </button>
        </div>
      </motion.div>
    </Link>
  )
}
