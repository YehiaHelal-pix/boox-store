'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, GitCompare, MessageCircle, RefreshCw, Share2, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useComparison } from '@/hooks/useComparison'
import { CONDITION_LABELS } from '@/lib/products'
import { openWhatsAppInquiry } from '@/lib/whatsapp'
import type { Product } from '@/types/database'

export default function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { toggleCompare, isComparing } = useComparison()
  const discount =
    product.original_price && product.price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0
  const isUnavailable = !product.in_stock || !product.is_available
  const conditionLabel = CONDITION_LABELS[product.condition] ?? 'مضمون'

  return (
    <div className="premium-product-card group">
      <button
        onClick={(event) => {
          event.preventDefault()
          toggleFavorite(product.id)
        }}
        className="premium-card-icon-btn right-3"
        aria-label="إضافة للمفضلة"
      >
        <Heart size={18} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white'} />
      </button>
      {discount > 0 ? <span className="premium-discount">خصم {discount}%</span> : null}
      {product.is_featured ? (
        <span className="premium-featured">
          <Star size={12} fill="currentColor" />
          مميز
        </span>
      ) : null}

      <Link href={`/products/${product.slug}`} className="block">
        <div className="premium-product-image">
          <Image
            src={product.image_url || '/assets/boox-logo.jpg'}
            alt={product.name}
            fill
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="premium-product-body">
          <div className="premium-card-topline">
            <span>{product.category_name_ar ?? 'Apple'}</span>
            <strong>{conditionLabel}</strong>
          </div>
          <h3 className="premium-product-title" title={product.name}>
            {product.name}
          </h3>
          <p className="premium-product-model">{product.device_model}</p>
          {product.price_on_inquiry || product.price === null ? (
            <p className="premium-product-price">اسأل على السعر</p>
          ) : (
            <p className="premium-product-price">{product.price.toLocaleString('ar-EG')} جنيه</p>
          )}
          {product.original_price ? (
            <p className="premium-product-old-price">{product.original_price.toLocaleString('ar-EG')} جنيه</p>
          ) : null}
          <div className="premium-specs">
            {typeof product.battery_health === 'number' ? <span>بطارية {product.battery_health}%</span> : null}
            <span>{product.storage_size}</span>
            <span>{product.color}</span>
            {product.grade ? <span>Grade {product.grade}</span> : null}
          </div>
          <div className="premium-service-row">
            <span>
              <ShieldCheck size={13} />
              ضمان
            </span>
            <span>
              <Truck size={13} />
              توصيل سريع
            </span>
          </div>
        </div>
      </Link>

      <div className="premium-product-actions">
        <button
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            openWhatsAppInquiry(product)
          }}
          disabled={isUnavailable}
          className={`premium-buy-btn ${isUnavailable ? 'disabled' : ''}`}
        >
          {product.price_on_inquiry || product.price === null ? <MessageCircle size={16} /> : <ShoppingBag size={16} />}
          {product.price_on_inquiry || product.price === null ? 'اسأل على السعر' : 'اطلب عبر واتساب'}
        </button>
        <Link
          href={`/trade?product=${product.slug}&name=${encodeURIComponent(product.name)}&price=${product.price ?? 0}`}
          className="premium-trade-link"
        >
          <RefreshCw size={14} />
          استبدل مع جهازك القديم
        </Link>

        <div className="premium-card-tools">
          <button
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              toggleCompare(product.id)
            }}
            className={`premium-tool-btn ${isComparing(product.id) ? 'active' : ''}`}
          >
            <GitCompare size={13} />
            قارن
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ title: product.name, url: `${window.location.origin}/products/${product.slug}` })
                return
              }
              void navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`)
            }}
            className="premium-tool-btn"
          >
            <Share2 size={13} />
            شارك
          </button>
        </div>
      </div>
    </div>
  )
}
