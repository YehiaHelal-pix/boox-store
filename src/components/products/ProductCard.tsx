'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, RefreshCw, Share2 } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { CONDITION_LABELS } from '@/lib/products'
import type { Product, ProductCondition } from '@/types/database'

export default function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites()

  const discount =
    product.original_price && product.price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0

  return (
    <div className="group relative bg-gradient-to-b from-[#0c1220] to-[#0a0f1a] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(product.id)
        }}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 flex items-center justify-center transition-all border border-white/10"
      >
        <Heart size={16} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white/70'} />
      </button>

      {/* Discount badge */}
      {discount > 0 ? (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
          خصم {discount}%
        </div>
      ) : null}

      {/* Featured badge */}
      {product.is_featured ? (
        <div className="absolute bottom-[calc(50%+8px)] left-3 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          مميز
        </div>
      ) : null}

      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative h-52 w-full bg-gradient-to-b from-[#080c15] to-[#060a13] flex items-center justify-center overflow-hidden">
          <Image
            src={product.image_url || '/boox-logo.jpg'}
            alt={product.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
          {!product.in_stock ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white/80 font-bold text-sm bg-red-500/80 px-4 py-1.5 rounded-lg">نفد من المخزن</span>
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Condition + Storage row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              {CONDITION_LABELS[product.condition as ProductCondition] ?? product.condition}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
              {product.storage_size}
            </span>
            {product.color ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                {product.color}
              </span>
            ) : null}
          </div>

          {/* Name */}
          <h3 className="font-bold text-white text-[15px] leading-snug line-clamp-2" title={product.name}>
            {product.name}
          </h3>

          {/* Battery */}
          {typeof product.battery_health === 'number' ? (
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${product.battery_health >= 80 ? 'bg-emerald-400' : product.battery_health >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${product.battery_health}%` }}
                />
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">{product.battery_health}%</span>
            </div>
          ) : null}

          {/* Price */}
          <div className="pt-2 border-t border-white/5">
            {product.price_on_inquiry || product.price === null ? (
              <p className="text-cyan-400 font-bold text-base">اسأل عن السعر</p>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-cyan-400 font-black text-lg">{product.price.toLocaleString('ar-EG')} <span className="text-sm font-semibold">ج.م</span></p>
                {product.original_price ? (
                  <p className="line-through text-gray-500 text-xs">{product.original_price.toLocaleString('ar-EG')}</p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/trade?product=${product.slug}&name=${encodeURIComponent(product.name)}&price=${product.price ?? 0}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-300 hover:bg-indigo-500/30 transition-colors"
        >
          <RefreshCw size={13} />
          استبدل جهازك
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (navigator.share) {
              void navigator.share({ title: product.name, url: `${window.location.origin}/products/${product.slug}` })
              return
            }
            void navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`)
          }}
          className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Share2 size={14} />
        </button>
      </div>
    </div>
  )
}
