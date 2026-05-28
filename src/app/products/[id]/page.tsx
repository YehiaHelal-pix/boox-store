'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { buildWhatsAppUrl, getConditionLabel } from '@/lib/products'
import type { Product } from '@/types/database'
import { motion } from 'framer-motion'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const identifier = params.id
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'specs' | 'trade'>('specs')

  // Trade form states
  const [oldDevice, setOldDevice] = useState('')
  const [oldStorage, setOldStorage] = useState('128GB')
  const [oldCondition, setOldCondition] = useState('like_new')
  const [oldBattery, setOldBattery] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Fetch all products for similar items
  const { products: allProducts } = useProducts()

  const otherProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.id !== product.id && p.is_visible && p.is_available)
      .slice(0, 3)
  }, [allProducts, product])

  const conditionOptions = [
    { value: 'new', label: 'جديد (مغلف)' },
    { value: 'like_new', label: 'كسر زيرو (ممتاز)' },
    { value: 'good', label: 'مستعمل (حالة جيدة)' },
    { value: 'fair', label: 'مستعمل (به خدوش)' }
  ]

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldDevice.trim()) {
      alert('يرجى كتابة اسم وموديل جهازك القديم')
      return
    }
    const phone = process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'
    const targetProductPrice = product && (product.price_on_inquiry || product.price === null || product.price === 0)
      ? 'اسأل على السعر' 
      : product && product.price !== null ? `${product.price.toLocaleString('ar-EG')} جنيه` : '—'

    const conditionText = conditionOptions.find(o => o.value === oldCondition)?.label || oldCondition

    const lines = [
      '🔄 *طلب استبدال جهاز - Boox Store*',
      '',
      '🛒 *المنتج الجديد المطلوب:*',
      `- *الاسم:* ${product?.name}`,
      `- *الموديل:* ${product?.device_model || product?.model || '—'}`,
      `- *السعة:* ${product?.storage_size || product?.storage || '—'}`,
      `- *اللون:* ${product?.color || '—'}`,
      `- *السعر:* ${targetProductPrice}`,
      '',
      '📱 *بيانات جهازي القديم للاستبدال:*',
      `- *اسم وموديل الجهاز:* ${oldDevice.trim()}`,
      `- *السعة:* ${oldStorage}`,
      `- *حالة الجهاز:* ${conditionText}`,
      `- *صحة البطارية:* ${oldBattery.trim() ? oldBattery.trim() + '%' : 'غير محدد'}`,
      `- *اسم العميل:* ${customerName.trim() ? customerName.trim() : 'غير محدد'}`,
      `- *رقم الهاتف للتواصل:* ${customerPhone.trim() ? customerPhone.trim() : 'غير محدد'}`,
      '',
      '💬 *أريد فحص جهازي القديم ومعرفة قيمة التقييم وفارق السعر لإتمام الاستبدال.*'
    ]

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(whatsappUrl, '_blank')
  }

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

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

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
          <section className="rounded-[32px] border border-white/10 bg-[#0d1117] p-3 sm:p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)] flex flex-col gap-4">
            {/* Main Stage Gallery */}
            <div className="relative h-80 sm:h-[450px] w-full bg-[#f5f5f7] rounded-[24px] border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.06)] group">
              {/* Subtle lighting overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              {/* Product Image */}
              {productImages[activeImage] ? (
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  src={productImages[activeImage]}
                  alt={product.name}
                  className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)] select-none transition-transform duration-500 hover:scale-105"
                  style={{ mixBlendMode: 'multiply' }}
                  draggable={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500 font-bold">لا توجد صور للمنتج</div>
              )}

              {/* Side Navigation Chevrons */}
              {productImages.length > 1 && (
                <>
                  {/* Right chevron (points right, goes prev in RTL visually) */}
                  <button
                    onClick={prevImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/75 hover:bg-white backdrop-blur-md rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 active:scale-95 group/btn"
                    aria-label="الصورة السابقة"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-black/60 group-hover/btn:text-black">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Left chevron (points left, goes next in RTL visually) */}
                  <button
                    onClick={nextImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/75 hover:bg-white backdrop-blur-md rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 active:scale-95 group/btn"
                    aria-label="الصورة التالية"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-black/60 group-hover/btn:text-black">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                </>
              )}

              {/* Active Dot Indicators */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === activeImage ? 'w-5 bg-orange-500' : 'w-2 bg-black/25 hover:bg-black/40'
                      }`}
                      aria-label={`الذهاب للصورة ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails list below */}
            {productImages.length > 1 ? (
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-[16px] border transition-all duration-300 flex items-center justify-center p-2 bg-[#f5f5f7] ${
                      index === activeImage
                        ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)] scale-102 ring-1 ring-orange-500/30'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                      draggable={false}
                    />
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

            {/* TradeLine-style Tabs Selector */}
            {product.category === 'iphone' && (
              <div className="mt-6 border-b border-white/10 flex gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-3 transition-colors relative ${activeTab === 'specs' ? 'text-[var(--neon-cyan)]' : 'text-gray-400 hover:text-white'}`}
                >
                  مواصفات الجهاز
                  {activeTab === 'specs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--neon-cyan)] rounded-full animate-pulse" />}
                </button>
                <button
                  onClick={() => setActiveTab('trade')}
                  className={`pb-3 transition-colors relative ${activeTab === 'trade' ? 'text-[var(--neon-cyan)]' : 'text-gray-400 hover:text-white'}`}
                >
                  استبدل بجهازي القديم 🔄
                  {activeTab === 'trade' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--neon-cyan)] rounded-full animate-pulse" />}
                </button>
              </div>
            )}


            {/* Tabs Content */}
            <div className="mt-6">
              {product.category !== 'iphone' || activeTab === 'specs' ? (
                <div className="grid gap-3 sm:grid-cols-2 text-sm bg-white/[0.02] rounded-3xl p-5 border border-white/5">
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-gray-400 font-semibold w-24">الموديل:</span>
                    <span className="text-white font-bold">{product.device_model || product.model || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-gray-400 font-semibold w-24">السعة:</span>
                    <span className="text-white font-bold">{product.storage_size || product.storage || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-gray-400 font-semibold w-24">اللون:</span>
                    <span className="text-white font-bold">{product.color || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-gray-400 font-semibold w-24">الحالة:</span>
                    <span className="text-white font-bold">{getConditionLabel(product.condition)}</span>
                  </div>
                  {typeof product.battery_health === 'number' && product.battery_health > 0 ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.01] border border-white/5">
                      <span className="text-gray-400 font-semibold w-24">صحة البطارية:</span>
                      <span className="text-emerald-400 font-bold">{product.battery_health}%</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-gray-400 font-semibold w-24">الشبكة:</span>
                    <span className="text-white font-bold">{product.network === 'unlocked' ? 'مفتوح على كل الشبكات' : product.network || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-gray-400 font-semibold w-24">الضمان:</span>
                    <span className="text-white font-bold">{product.warranty_days ? `${product.warranty_days} يوم` : 'ضمان سنة كاملة ضد عيوب الصناعة'}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleTradeSubmit} className="bg-gradient-to-br from-orange-500/10 via-transparent to-transparent rounded-3xl p-6 border border-orange-500/15 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-bounce">🔄</span>
                    <div className="flex flex-col">
                      <span className="text-base font-black text-orange-300 leading-tight">استبدال جهازك القديم فوريًا</span>
                      <span className="text-xs text-gray-400">ادخل بيانات جهازك القديم للاستبدال مع الهاتف الذي تتصفحه الآن</span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-right">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        📱 اسم وموديل جهازك القديم *
                      </label>
                      <input
                        type="text"
                        required
                        value={oldDevice}
                        onChange={(e) => setOldDevice(e.target.value)}
                        placeholder="مثال: iPhone 13 Pro Max"
                        className="bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all duration-300 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        💾 سعة التخزين الحالي القديم *
                      </label>
                      <select
                        value={oldStorage}
                        onChange={(e) => setOldStorage(e.target.value)}
                        className="bg-[#0f141c] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all duration-300 text-right"
                      >
                        <option value="64GB">64 جيجابايت</option>
                        <option value="128GB">128 جيجابايت</option>
                        <option value="256GB">256 جيجابايت</option>
                        <option value="512GB">512 جيجابايت</option>
                        <option value="1TB">1 تيرا بايت</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        🔋 نسبة صحة البطارية % (اختياري)
                      </label>
                      <input
                        type="text"
                        value={oldBattery}
                        onChange={(e) => setOldBattery(e.target.value)}
                        placeholder="مثال: 85"
                        className="bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all duration-300 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        👤 اسمك الكريم (اختياري)
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: أحمد محمد"
                        className="bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all duration-300 text-right"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      📞 رقم هاتف للتواصل (اختياري)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="مثال: 01111222333"
                      className="bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all duration-300 text-right"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      ✨ حالة جهازك الحالي القديم *
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {conditionOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setOldCondition(opt.value)}
                          className={`p-3 rounded-2xl border text-center transition-all duration-300 text-xs font-semibold flex items-center justify-center ${
                            oldCondition === opt.value
                              ? 'bg-orange-500/10 border-orange-500 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.15)] font-bold scale-[1.02]'
                              : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 text-center font-black text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-2xl shadow-[0_4px_25px_rgba(249,115,22,0.25)] transition duration-300 hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
                  >
                    أرسل طلب الاستبدال لـ بوكس ستور عبر واتساب 🔄
                  </button>
                </form>
              )}
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

        {/* Other Products Section */}
        {otherProducts.length > 0 && (
          <section className="mt-16 border-t border-white/10 pt-16" dir="rtl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-black text-white relative pr-4">
                <span className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-full" />
                منتجات أخرى قد تعجبك 👀
              </h2>
              <Link
                href="/products"
                className="text-xs font-bold text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
              >
                عرض كل المنتجات ←
              </Link>
            </div>

            <div className="products-grid">
              {otherProducts.map((p, idx) => (
                <ProductCard key={p.id} p={p} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
