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

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 text-white" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          رجوع
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
          <section className="rounded-[28px] border border-white/10 bg-[#0d1117] p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
              {productImages[activeImage] ? (
                <img src={productImages[activeImage]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">لا توجد صور</div>
              )}
            </div>
            {productImages.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-20 overflow-hidden rounded-2xl border transition ${
                      index === activeImage ? 'border-[var(--neon-cyan)] shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'border-white/10'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#090d13] p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--neon-cyan)]">
                {product.category_name_ar ?? product.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">{getConditionLabel(product.condition)}</span>
            </div>

            <h1 className="text-3xl font-black leading-tight md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-gray-400">{product.description || 'لا يوجد وصف إضافي للمنتج.'}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">الموديل: {product.device_model}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">السعة: {product.storage_size}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">اللون: {product.color}</span>
              {typeof product.battery_health === 'number' ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">البطارية: {product.battery_health}%</span>
              ) : null}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              {product.price_on_inquiry || product.price === null ? (
                <div className="text-2xl font-black text-[var(--neon-cyan)]">اسأل على السعر</div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-black text-[var(--neon-cyan)]">{product.price.toLocaleString('ar-EG')} جنيه</div>
                  {product.original_price ? <div className="pb-1 text-lg text-gray-500 line-through">{product.original_price.toLocaleString('ar-EG')} جنيه</div> : null}
                </div>
              )}
              <div className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold ${product.in_stock ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                {product.in_stock ? 'متاح الآن' : 'غير متاح حاليًا'}
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <a
                href={buildWhatsAppUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-4 text-center font-black text-white shadow-[0_0_30px_rgba(37,211,102,0.25)] transition hover:-translate-y-0.5"
              >
                اسأل بوكس على واتساب
              </a>
              <button
                onClick={() => router.push('/products')}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center font-bold text-white transition hover:bg-white/10"
              >
                شوف باقي المنتجات
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
