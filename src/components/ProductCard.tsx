'use client'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/database'
import { openWhatsAppInquiry } from '@/lib/whatsapp'
import { getConditionLabel } from '@/lib/products'

export default function ProductCard({ p, index }: { p: Product; index: number }) {
  const router = useRouter()
  const discount =
    p.original_price && p.price && p.original_price > p.price
      ? Math.round((1 - p.price / p.original_price) * 100)
      : 0

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
      onClick={() => router.push(`/products/${p.slug}`)}
    >
      <div className="product-img">
        {p.in_stock && (
          <div className="badge-stock">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>
            متوفر
          </div>
        )}
        {!p.in_stock && <div className="badge-sold">نفد</div>}

        <div className="badge-group-left">
          {p.condition && (
            <span className="badge-condition">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              {getConditionLabel(p.condition)}
            </span>
          )}
          {discount > 0 && <span className="badge-disc">خصم {discount}%</span>}
        </div>

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
      </div>

      <div className="product-body">
        <h3 className="product-name">{p.name}</h3>
        <div className="product-model">{p.device_model}</div>

        <div className="product-meta-row">
          <span className="product-meta-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="3" strokeLinecap="round"/></svg>
            {p.storage_size}
          </span>
          {typeof p.battery_health === 'number' && (
            <span className="product-meta-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14" strokeWidth="3" strokeLinecap="round"/></svg>
              بطارية {p.battery_health}%
            </span>
          )}
        </div>

        {p.price_on_inquiry || p.price === null ? (
          <div className="product-prices" style={{ marginTop: '4px' }}>
            <span className="product-price">اسأل عن السعر</span>
          </div>
        ) : (
          <div className="product-prices">
            <span className="product-price">{p.price.toLocaleString('ar-EG')} ج.م</span>
            {p.original_price && p.original_price > p.price ? (
              <span className="product-old">{p.original_price.toLocaleString('ar-EG')} ج.م</span>
            ) : null}
          </div>
        )}

        <button
          onClick={(event) => {
            event.stopPropagation()
            openWhatsAppInquiry(p)
          }}
          className={`product-buy ${p.in_stock ? '' : 'disabled'}`}
          disabled={!p.in_stock}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          اسأل بوكس
        </button>
      </div>
    </div>
  )
}
