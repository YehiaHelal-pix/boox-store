'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Eye, Zap, Star, Truck, ShieldCheck, MessageCircle, CreditCard, ArrowLeftRight } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useCart } from '@/store/cart'
import { useCompare } from '@/store/compare'
import type { Product } from '@/types/database'
import { getConditionLabel, buildWhatsAppUrl } from '@/lib/products'

function pushToast(msg: string, type: 'success' | 'error' | 'warn' | 'info') {
  window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
}

export default function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const addItem = useCart((state) => state.addItem)
  const { addItem: addCompare, isInCompare } = useCompare()

  const discount =
    product.original_price && product.price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0

  const conditionLabel = getConditionLabel(product.condition)
  const conditionColor =
    product.condition === 'new'
      ? '#34d399'
      : product.condition === 'like_new'
        ? '#60a5fa'
        : '#fbbf24'

  const hasInstallment = (product as any).installment_available

  return (
    <div className="ppc-card">
      {/* Glowing border effect */}
      <div className="ppc-glow" />

      {/* ── Image Section ── */}
      <div className="ppc-image-wrap">
        <Link href={`/products/${product.slug}`} className="ppc-image-link">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="ppc-image"
            />
          ) : (
            <div className="ppc-no-image">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.15">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="ppc-sold-overlay">
            <span>نفد من المخزن</span>
          </div>
        )}
      </div>

      {/* ── Info Section ── */}
      <div className="ppc-info relative">
        {/* Relocated Quick Actions */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id) }}
            className={`pdp-icon-btn !w-8 !h-8 !rounded-xl ${isFavorite(product.id) ? 'text-rose-500 border-rose-500/30 bg-rose-500/5' : 'text-white/60 border-white/10 bg-white/5'}`}
            title="أضف للمفضلة"
          >
            <Heart size={14} className={isFavorite(product.id) ? 'fill-current' : ''} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addCompare(product); pushToast('تمت الإضافة للمقارنة', 'success') }}
            className={`pdp-icon-btn !w-8 !h-8 !rounded-xl ${isInCompare(product.id) ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' : 'text-white/60 border-white/10 bg-white/5'}`}
            title="قارن"
          >
            <ArrowLeftRight size={14} />
          </button>
        </div>

        <Link href={`/products/${product.slug}`} className="flex flex-col gap-2">
          {/* Beautiful Pulsing Condition Badge */}
          {product.condition && (
            <div className="flex items-center">
              <span
                className="ppc-condition-badge flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm select-none"
                style={{
                  backgroundColor: `${conditionColor}18`,
                  color: conditionColor,
                  border: `1px solid ${conditionColor}35`,
                  boxShadow: `0 0 12px ${conditionColor}20`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: conditionColor }} />
                <span>{conditionLabel}</span>
              </span>
            </div>
          )}

          {/* Name */}
          <h3 className="ppc-name">{product.name}</h3>

          {/* Specs Row */}
          <div className="ppc-specs">
            <span className="ppc-spec">{product.storage_size}</span>
            <span className="ppc-spec-dot" />
            <span className="ppc-spec">{product.color}</span>
            {typeof product.battery_health === 'number' && (
              <>
                <span className="ppc-spec-dot" />
                <span className="ppc-spec ppc-spec-battery">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="10" x2="23" y2="14" /></svg>
                  {product.battery_health}%
                </span>
              </>
            )}
          </div>

          {/* ── Price Section (Noon-style) ── */}
          <div className="ppc-price-section">
            {product.price_on_inquiry || product.price === null ? (
              <div className="ppc-inquiry-label">
                <MessageCircle size={14} />
                <span>اسأل عن السعر</span>
              </div>
            ) : (
              <>
                <div className="ppc-price-row">
                  <span className="ppc-price">{product.price.toLocaleString('ar-EG')} <small>جنيه</small></span>
                </div>
                {product.original_price && product.original_price > product.price ? (
                  <div className="ppc-price-was">
                    <span className="ppc-price-was-label">بدلاً من</span>
                    <span className="ppc-price-old">{product.original_price.toLocaleString('ar-EG')} جنيه</span>
                    <span className="ppc-price-save">وفّر {(product.original_price - product.price).toLocaleString('ar-EG')} جنيه</span>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Link>
    </div>

      {/* ── Actions ── */}
      <div className="ppc-actions">
        {product.price_on_inquiry || product.price === null ? (
          <Link
            href={buildWhatsAppUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="ppc-btn ppc-btn-whatsapp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.494A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.327 0-4.47-.754-6.215-2.03l-.435-.328-2.655.888.89-2.65-.339-.447A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
            اسأل بوكس 💬
          </Link>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!product.in_stock) return
              addItem(product)
              pushToast('تمت الإضافة للسلة ✓', 'success')
            }}
            className="ppc-btn ppc-btn-cart"
            disabled={!product.in_stock}
          >
            <ShoppingBag size={16} />
            {product.in_stock ? 'أضف للسلة' : 'غير متاح'}
          </button>
        )}
      </div>
    </div>
  )
}
