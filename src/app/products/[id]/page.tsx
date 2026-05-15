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
  const batteryColor = batteryHealth !== null
    ? batteryHealth >= 85 ? '#22c55e' : batteryHealth >= 70 ? '#eab308' : '#ef4444'
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <button onClick={() => router.push('/')} className="hover:text-[var(--neon-cyan)] transition-colors">الرئيسية</button>
            <span className="text-gray-600">/</span>
            <button onClick={() => router.push('/products')} className="hover:text-[var(--neon-cyan)] transition-colors">المنتجات</button>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] xl:gap-10">

          {/* Left: Image Gallery (Noon style) */}
          <div className="flex flex-col-reverse lg:flex-row gap-3">
            {/* Thumbnails sidebar */}
            {productImages.length > 1 && (
              <div className="flex lg:flex-col gap-2 lg:w-[72px] shrink-0 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px]">
                {productImages.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                      index === activeImage
                        ? 'border-[var(--neon-cyan)] shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden">
              <div className="aspect-square relative">
                {productImages[activeImage] ? (
                  <img
                    src={productImages[activeImage]}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">لا توجد صور</div>
                )}

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    -{discount}%
                  </div>
                )}

                {/* Condition badge */}
                <div className="absolute top-3 right-3 bg-[var(--neon-cyan)]/15 border border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)] text-xs font-bold px-3 py-1 rounded-md backdrop-blur-sm">
                  {getConditionLabel(product.condition)}
                </div>
              </div>

              {/* Image navigation arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % productImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center border border-white/10 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + productImages.length) % productImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center border border-white/10 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              {productImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  {activeImage + 1} / {productImages.length}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info (Noon + Tradeline style) */}
          <div className="flex flex-col gap-5">

            {/* Category */}
            <div className="text-sm text-[var(--neon-cyan)] font-medium">
              {product.category_name_ar ?? product.category}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-black leading-tight">{product.name}</h1>

            {/* Rating placeholder (like Noon) */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= 4 ? '#facc15' : 'none'} stroke={star <= 4 ? '#facc15' : '#4b5563'} strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span>4.8</span>
              <span className="text-gray-600">|</span>
              <span>{product.views_count ?? 0} مشاهدة</span>
            </div>

            {/* Price Section (Noon style) */}
            <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4">
              {product.price_on_inquiry || product.price === null ? (
                <div className="text-xl font-black text-[var(--neon-cyan)]">السعر عند الاستفسار</div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[var(--neon-cyan)]">
                      {product.price.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-lg text-[var(--neon-cyan)] font-bold">جنيه</span>
                  </div>
                  {product.original_price && product.original_price > (product.price ?? 0) && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500 line-through">
                        {product.original_price.toLocaleString('ar-EG')} جنيه
                      </span>
                      {discount > 0 && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                          وفر {(product.original_price - (product.price ?? 0)).toLocaleString('ar-EG')} جنيه
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stock status */}
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                product.in_stock
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.in_stock ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                {product.in_stock ? 'متاح في المخزون' : 'غير متاح حالياً'}
              </div>
            </div>

            {/* Specifications Grid (Tradeline style) */}
            <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 text-sm font-bold text-gray-300">المواصفات</div>
              <div className="divide-y divide-white/5">
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">الموديل</span>
                  <span className="font-medium">{product.device_model}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">السعة التخزينية</span>
                  <span className="font-medium">{product.storage_size}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">اللون</span>
                  <span className="font-medium">{product.color}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">الحالة</span>
                  <span className="font-medium text-[var(--neon-cyan)]">{getConditionLabel(product.condition)}</span>
                </div>
                {batteryHealth !== null && (
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-400">صحة البطارية</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${batteryHealth}%`, backgroundColor: batteryColor ?? '#22c55e' }}
                        />
                      </div>
                      <span className="font-bold" style={{ color: batteryColor ?? '#22c55e' }}>{batteryHealth}%</span>
                    </div>
                  </div>
                )}
                {product.network && (
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-400">الشبكة</span>
                    <span className="font-medium">{product.network === 'unlocked' ? 'مفتوح لجميع الشبكات' : product.network}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <a
                href={buildWhatsAppUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-4 text-center font-black text-white shadow-[0_0_20px_rgba(37,211,102,0.2)] transition hover:shadow-[0_0_30px_rgba(37,211,102,0.35)] hover:-translate-y-0.5"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.629-1.467A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.156 0-4.154-.688-5.787-1.856l-.415-.297-2.746.87.879-2.677-.326-.433A9.707 9.707 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75z"/></svg>
                اسأل بوكس على واتساب
              </a>
              <button
                onClick={() => router.push('/products')}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-center font-bold text-white transition hover:bg-white/10"
              >
                تصفح باقي المنتجات
              </button>
            </div>

            {/* Trust Badges (Noon + Tradeline style) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#0d1117] p-3 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span className="text-xs text-gray-400">ضمان أصلي</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#0d1117] p-3 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5">
                  <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                </svg>
                <span className="text-xs text-gray-400">توصيل سريع</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#0d1117] p-3 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5">
                  <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                </svg>
                <span className="text-xs text-gray-400">دفع آمن</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section (Tradeline Overview tab style) */}
        {product.description && (
          <div className="mt-8 rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-bold text-white border-b-2 border-[var(--neon-cyan)] pb-3">الوصف</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap text-sm">{product.description}</p>
            </div>
          </div>
        )}

        {/* Trade-in Banner */}
        <div className="mt-6 rounded-xl border border-orange-500/20 bg-gradient-to-l from-orange-500/5 to-transparent p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-orange-300">استبدل جهازك القديم</div>
              <div className="text-xs text-gray-500">بدل جهازك واحصل على أفضل سعر تقييم</div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/trade?product=${product.slug}&name=${encodeURIComponent(product.name)}&price=${product.price}`)}
            className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300 hover:bg-orange-500/20 transition shrink-0"
          >
            قيّم جهازك الآن
          </button>
        </div>
      </div>
    </div>
  )
}
