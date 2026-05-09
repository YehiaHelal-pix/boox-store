'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product } from '@/types/database'
import { openWhatsAppInquiry } from '@/lib/whatsapp'
import { CONDITION_LABELS } from '@/lib/products'
import type { ProductCondition } from '@/types/database'

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
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontSize: '48px' }}>
            📱
          </div>
        )}

        {!p.in_stock ? <div className="badge-sold">نفد</div> : null}
        {discount > 0 ? <div className="badge-disc">خصم {discount}%</div> : null}
        {p.is_featured ? <div className="badge-feat">مميز</div> : null}
      </div>

      <div className="product-body">
        {/* Condition pill */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(99,102,241,0.15)',
            color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            {CONDITION_LABELS[p.condition as ProductCondition] ?? p.condition}
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {p.storage_size}
          </span>
        </div>

        <div className="product-name">{p.name}</div>
        <div className="product-model">{p.device_model}</div>

        {/* Battery health bar */}
        {typeof p.battery_health === 'number' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${p.battery_health}%`,
                borderRadius: '10px',
                background: p.battery_health >= 80 ? '#34d399' : p.battery_health >= 60 ? '#fbbf24' : '#f87171',
              }} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{p.battery_health}%</span>
          </div>
        ) : null}

        {p.price_on_inquiry || p.price === null ? (
          <button
            onClick={(event) => {
              event.stopPropagation()
              openWhatsAppInquiry(p)
            }}
            className={`product-buy ${p.in_stock ? '' : 'disabled'}`}
            style={{ marginTop: 'auto' }}
            disabled={!p.in_stock}
          >
            اسأل بوكس عن السعر
          </button>
        ) : (
          <>
            <div className="product-prices">
              <span className="product-price">{p.price.toLocaleString('ar-EG')} <span style={{ fontSize: '13px', fontWeight: 600 }}>ج.م</span></span>
              {p.original_price ? <span className="product-old">{p.original_price.toLocaleString('ar-EG')}</span> : null}
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation()
                openWhatsAppInquiry(p)
              }}
              className={`product-buy ${p.in_stock ? '' : 'disabled'}`}
              disabled={!p.in_stock}
            >
              اسأل بوكس
            </button>
          </>
        )}
      </div>
    </div>
  )
}
