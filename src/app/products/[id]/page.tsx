'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { buildWhatsAppUrl, getConditionLabel } from '@/lib/products'
import type { Product } from '@/types/database'

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const identifier = params.id
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'box'>('specs')

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${identifier}`, { cache: 'no-store' })
        const payload = (await response.json()) as Product | { error?: string }

        if (!response.ok || Array.isArray(payload) || ('error' in payload && typeof payload.error !== 'undefined')) {
          setError(!Array.isArray(payload) && 'error' in payload ? payload.error ?? 'المنتج غير موجود' : 'المنتج غير موجود')
          setProduct(null)
          return
        }

        setProduct(payload as Product)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'المنتج غير موجود')
      } finally {
        setLoading(false)
      }
    }

    void loadProduct()
  }, [identifier])

  const productImages = useMemo(() => (product?.images ?? []).filter(Boolean), [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white text-xl" dir="rtl">
        جاري تحميل المنتج...
      </div>
    )
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white gap-4 px-4 text-center" dir="rtl">
        <div className="text-5xl">⌁</div>
        <div className="text-2xl font-bold">المنتج غير موجود</div>
        <p className="text-gray-400">{error ?? 'الرابط غير صالح أو المنتج غير متاح حاليًا.'}</p>
        <button
          onClick={() => router.push('/products')}
          className="rounded-xl bg-[var(--neon-cyan)] px-5 py-3 font-bold text-black"
        >
          رجوع للمنتجات
        </button>
      </div>
    )
  }

  const discount = product.original_price && product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const batteryHealth = typeof product.battery_health === 'number' ? product.battery_health : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-[var(--neon-cyan)] transition-colors">الرئيسية</button>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180"><path d="M9 18l6-6-6-6"/></svg>
          <button onClick={() => router.push('/products')} className="hover:text-[var(--neon-cyan)] transition-colors">{product.category_name_ar ?? product.category}</button>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180"><path d="M9 18l6-6-6-6"/></svg>
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

          {/* Right side: Image Gallery (RTL) */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0d1117] to-[#111827] border border-white/10 overflow-hidden">
              {/* Badges on image */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {product.in_stock && (
                  <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
                    متوفر
                  </span>
                )}
              </div>
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                    خصم {discount}%
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-[var(--neon-cyan)] text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  {getConditionLabel(product.condition)}
                </span>
              </div>

              {/* Main Image */}
              <div className="aspect-square flex items-center justify-center p-8">
                {productImages[activeImage] ? (
                  <img src={productImages[activeImage]} alt={product.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-gray-500">لا توجد صور</div>
                )}
              </div>

              {/* Share/Save buttons */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      void navigator.share({ title: product.name, url: window.location.href })
                    } else {
                      void navigator.clipboard.writeText(window.location.href)
                    }
                  }}
                  aria-label="مشاركة"
                  className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
              </div>

              {/* Image navigation arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % productImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center border border-white/10 transition-colors z-10"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + productImages.length) % productImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center border border-white/10 transition-colors z-10"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 mt-3 justify-end">
                {productImages.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`صورة ${index + 1}`}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                      index === activeImage
                        ? 'border-[var(--neon-cyan)] shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Left side: Product Info (RTL) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5">

            {/* Brand + Category */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-gray-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Apple•{product.category_name_ar ?? product.category}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= 4 ? '#facc15' : 'none'} stroke={star <= 4 ? '#facc15' : '#4b5563'} strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="font-bold">4.8</span>
              <span className="text-gray-500">(124 تقييم)</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">تم بيع +500</span>
            </div>

            {/* Price Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-l from-[#0d1117] to-[#0a0f18] p-5">
              {product.price_on_inquiry || product.price === null ? (
                <div className="text-2xl font-black text-[var(--neon-cyan)]">السعر عند الطلب</div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl md:text-4xl font-black text-white">
                      {product.price.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-lg font-bold text-gray-400">ج.م</span>
                    {product.original_price && product.original_price > (product.price ?? 0) && (
                      <span className="text-base text-gray-500 line-through">
                        {product.original_price.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="bg-red-500/15 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/20">
                        خصم {discount}%
                      </span>
                    )}
                  </div>
                  {discount > 0 && product.original_price && product.price && (
                    <p className="text-sm text-emerald-400">
                      وفّر {(product.original_price - product.price).toLocaleString('ar-EG')} ج.م على هذا المنتج
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Color */}
            {product.color && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">اللون:</span>
                <span className="text-sm font-bold">{product.color}</span>
              </div>
            )}

            {/* Storage */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-400">السعة التخزينية:</span>
              <button className="px-4 py-2 text-sm font-bold rounded-xl border-2 border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]">
                {product.storage_size}
              </button>
            </div>

            {/* Trust badges row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'ضمان 12 شهر' },
                { icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0', label: 'توصيل لكل مصر' },
                { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', label: 'دفع عند الاستلام' },
                { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: 'استبدال 14 يوم' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-xs text-gray-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5" className="shrink-0"><path d={item.icon}/></svg>
                  {item.label}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <a
                href={buildWhatsAppUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[var(--neon-1)] to-[var(--neon-3)] px-5 py-4 text-center font-black text-white transition hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                تواصل للحجز السريع
              </a>
              <a
                href={buildWhatsAppUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-4 font-bold text-white transition hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:-translate-y-0.5 shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.629-1.467A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.156 0-4.154-.688-5.787-1.856l-.415-.297-2.746.87.879-2.677-.326-.433A9.707 9.707 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75z"/></svg>
              </a>
            </div>

            {/* Quick Specs Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', title: 'الموديل', value: product.device_model },
                batteryHealth !== null ? { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'صحة البطارية', value: `${batteryHealth}%` } : null,
                { icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4', title: 'السعة', value: product.storage_size },
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'الضمان', value: 'ضمان Boox 12 شهر' },
              ].filter(Boolean).map(item => (
                <div key={item!.title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--neon-cyan)]/10 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5"><path d={item!.icon}/></svg>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400">{item!.title}</h4>
                    <p className="text-sm font-bold">{item!.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden">
          <div className="flex border-b border-white/10 overflow-x-auto">
            {([
              { key: 'specs' as const, label: 'المواصفات' },
              { key: 'desc' as const, label: 'الوصف' },
              { key: 'box' as const, label: 'محتويات العلبة' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3.5 text-sm font-bold whitespace-nowrap transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-[var(--neon-cyan)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--neon-cyan)]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'specs' && (
              <table className="w-full">
                <tbody>
                  {[
                    { label: 'السعة التخزينية', value: product.storage_size },
                    { label: 'اللون', value: product.color },
                    { label: 'الموديل', value: product.device_model },
                    batteryHealth !== null ? { label: 'صحة البطارية', value: `${batteryHealth}%` } : null,
                    product.network ? { label: 'الشبكة', value: product.network === 'unlocked' ? 'مفتوح لجميع الشبكات' : product.network } : null,
                    { label: 'الحالة', value: getConditionLabel(product.condition) },
                  ].filter(Boolean).map((row, idx) => (
                    <tr key={row!.label} className={idx % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                      <td className="py-3 px-4 text-sm text-gray-400 font-medium w-1/3">{row!.label}</td>
                      <td className="py-3 px-4 text-sm font-medium">{row!.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'desc' && (
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap text-sm">
                {product.description || 'لا يوجد وصف إضافي للمنتج.'}
              </p>
            )}
            {activeTab === 'box' && (
              <div className="text-gray-400 text-sm space-y-2">
                <p>• جهاز {product.name}</p>
                <p>• كابل شحن</p>
                <p>• ضمان Boox Store</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
