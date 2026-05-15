'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { getConditionLabel } from '@/lib/products'
import { openWhatsAppInquiry } from '@/lib/whatsapp'
import type { Product } from '@/types/database'

export default function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites()

  const discount =
    product.original_price && product.price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-[#0d1117] to-[#0a0a0f] hover:border-[rgba(34,211,238,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <button
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          toggleFavorite(product.id)
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/10 transition-colors"
      >
        <Heart size={16} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white/70'} />
      </button>

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-52 w-full bg-gradient-to-br from-[#0a0a14] to-[#111827]">
          {product.in_stock && (
            <span className="absolute top-3 right-14 z-10 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
              متوفر
            </span>
          )}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {product.condition && (
              <span className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-[var(--neon-cyan)] text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                {getConditionLabel(product.condition)}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                خصم {discount}%
              </span>
            )}
          </div>

          <Image
            src={product.image_url || '/boox-logo.jpg'}
            alt={product.name}
            fill
            className="object-contain p-5 group-hover:scale-[1.08] transition-transform duration-500"
          />
        </div>

        <div className="p-4">
          <h3 className="font-extrabold text-white truncate text-[0.95rem]" title={product.name}>
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= 4 ? '#facc15' : 'none'} stroke={star <= 4 ? '#facc15' : '#4b5563'} strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="font-bold text-gray-300">4.8</span>
            <span className="text-gray-500">(124 تقييم)</span>
          </div>

          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full text-[11px] text-gray-400">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="3" strokeLinecap="round"/></svg>
              {product.storage_size}
            </span>
            {typeof product.battery_health === 'number' && (
              <span className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full text-[11px] text-gray-400">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14" strokeWidth="3" strokeLinecap="round"/></svg>
                بطارية {product.battery_health}%
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 flex flex-col gap-2">
        {product.price_on_inquiry || product.price === null ? (
          <div className="flex items-baseline gap-2">
            <span className="text-[var(--neon-cyan)] font-black text-lg">اسأل عن السعر</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[var(--neon-cyan)] font-black text-lg">{product.price.toLocaleString('ar-EG')} ج.م</span>
            {product.original_price && product.original_price > product.price ? (
              <span className="line-through text-gray-500 text-xs">{product.original_price.toLocaleString('ar-EG')} ج.م</span>
            ) : null}
          </div>
        )}

        <button
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            openWhatsAppInquiry(product)
          }}
          disabled={!product.in_stock}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--neon-1)] to-[var(--neon-3)] text-white font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          اسأل بوكس
        </button>
      </div>
    </div>
  )
}
