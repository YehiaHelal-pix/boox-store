'use client'
import { useRouter } from 'next/navigation'
import { MessageCircle, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import type { Product } from '@/types/database'
import { CONDITION_LABELS } from '@/lib/products'
import { openWhatsAppInquiry } from '@/lib/whatsapp'

export default function ProductCard({ p, index }: { p: Product; index: number }) {
  const router = useRouter()
  const isUnavailable = !p.in_stock || !p.is_available
  const discount =
    p.original_price && p.price && p.original_price > p.price
      ? Math.round((1 - p.price / p.original_price) * 100)
      : 0
  const conditionLabel = CONDITION_LABELS[p.condition] ?? 'مضمون'

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
      onClick={() => router.push(`/products/${p.slug}`)}
    >
      <div className="product-img">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.style.display = 'none'
              if (target.parentElement) {
                target.parentElement.style.background = '#111'
              }
            }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}

        <div className="product-card-shine" />
        {isUnavailable && <div className="badge-sold">نفد</div>}
        {discount > 0 && <div className="badge-disc">-{discount}%</div>}
        {p.is_featured && (
          <div className="badge-feat">
            <Star size={12} fill="currentColor" />
            مميز
          </div>
        )}
      </div>

      <div className="product-body">
        <div className="product-card-topline">
          <span>{p.category_name_ar ?? 'Apple'}</span>
          <strong>{conditionLabel}</strong>
        </div>
        <div className="product-name">{p.name}</div>
        <div className="product-model">{p.device_model}</div>

        <div className="product-specs">
          {typeof p.battery_health === 'number' && <span>بطارية {p.battery_health}%</span>}
          <span>{p.storage_size}</span>
          <span>{p.color}</span>
          {p.grade ? <span>Grade {p.grade}</span> : null}
        </div>

        <div className="product-service-row">
          <span>
            <ShieldCheck size={13} />
            ضمان
          </span>
          <span>
            <Truck size={13} />
            توصيل سريع
          </span>
        </div>

        {p.price_on_inquiry || p.price === null ? (
          <button
            onClick={(event) => {
              event.stopPropagation()
              openWhatsAppInquiry(p)
            }}
            className={`product-buy ${isUnavailable ? 'disabled' : ''}`}
            style={{ marginTop: 'auto' }}
            disabled={isUnavailable}
          >
            <MessageCircle size={16} />
            اسأل على السعر
          </button>
        ) : (
          <>
            <div className="product-prices">
              <span className="product-price">{p.price.toLocaleString('ar-EG')} جنيه</span>
              {p.original_price ? <span className="product-old">{p.original_price.toLocaleString('ar-EG')} جنيه</span> : null}
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation()
                openWhatsAppInquiry(p)
              }}
              className={`product-buy ${isUnavailable ? 'disabled' : ''}`}
              disabled={isUnavailable}
            >
              <ShoppingBag size={16} />
              اطلب عبر واتساب
            </button>
          </>
        )}
      </div>
    </div>
  )
}
