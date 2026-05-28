'use client'

import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, MapPin, Phone, User, Send, CheckCircle2, Truck, Store, Tag, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useCart } from '@/store/cart'
import { useCoupon, DEFAULT_COUPONS } from '@/store/coupon'
import confetti from 'canvas-confetti'

function buildCheckoutMessage(
  items: Array<{ name: string; quantity: number; price: number | null }>,
  total: number,
  discount: number,
  couponCode: string | undefined,
  customerData: { name: string; phone: string; address: string; wantsDelivery: boolean }
) {
  const discountText = discount > 0 ? `\n🎁 *الخصم (${couponCode}):* -${discount} ج` : ''
  const lines = [
    '🛍️ *طلب جديد من الموقع*',
    '',
    `👤 *الاسم:* ${customerData.name}`,
    `📞 *رقم الهاتف:* ${customerData.phone}`,
    `🚚 *طريقة الاستلام:* ${customerData.wantsDelivery ? 'توصيل لحد البيت 🏠' : 'استلام من المحل 🏪'}`,
    ...(customerData.wantsDelivery && customerData.address ? [`📍 *العنوان / اللوكيشن:* ${customerData.address}`] : []),
    '',
    '🛒 *تفاصيل الطلب:*',
    ...items.map((item, index) => `${index + 1}. ${item.name} - الكمية: ${item.quantity} - السعر: ${(item.price ?? 0).toLocaleString('ar-EG')} ج`),
    '',
    `💰 *المجموع:* ${total.toLocaleString('ar-EG')} ج${discountText}`,
    `💳 *الإجمالي بعد الخصم:* ${(total - discount).toLocaleString('ar-EG')} ج`,
  ]

  return `https://wa.me/201113614021?text=${encodeURIComponent(lines.join('\n'))}`
}

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQty, removeItem, total, clear } = useCart()
  const [mounted, setMounted] = useState(false)

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [wantsDelivery, setWantsDelivery] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const { appliedCoupon, applyCoupon, removeCoupon, getDiscount } = useCoupon()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen) return null

  const totalPrice = total()

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return
    if (wantsDelivery && !address) return

    setIsSubmitting(true)
    const discount = getDiscount(totalPrice)
    const finalTotal = totalPrice - discount

    try {
      // Create notes with product details
      const itemsDetails = items.map(i => `${i.name} (x${i.quantity})`).join(' | ')
      
      const deliveryNote = wantsDelivery ? `[توصيل] العنوان: ${address}` : '[استلام من المحل]'
      const couponNote = appliedCoupon ? ` | خصم: ${appliedCoupon.code} (-${discount}ج)` : ''
      const payload = {
        customer_name: name,
        customer_phone: phone,
        customer_address: wantsDelivery ? address : 'استلام من المحل',
        product_id: items.length === 1 ? items[0].id : null,
        quantity: items.length === 1 ? items[0].quantity : items.reduce((sum, i) => sum + i.quantity, 0),
        total_price: finalTotal,
        notes: [items.length > 1 ? `المنتجات: ${itemsDetails}` : '', deliveryNote].filter(Boolean).join(' | ') + couponNote
      }

      // Save to database
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      // Show success
      setIsSuccess(true)

      // Trigger beautiful confetti explosion
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#8b5cf6', '#ec4899', '#ffffff']
      })
      
      // Open WhatsApp
      const waUrl = buildCheckoutMessage(items, totalPrice, discount, appliedCoupon?.code, { name, phone, address, wantsDelivery })
      window.open(waUrl, '_blank')
      
      // Clear cart & close after delay
      setTimeout(() => {
        clear()
        removeCoupon()
        setIsCheckingOut(false)
        setIsSuccess(false)
        onClose()
      }, 3000)

    } catch (error) {
      console.error('Checkout error:', error)
      // Fallback: still open WA even if DB fails
      const waUrl = buildCheckoutMessage(items, totalPrice, discount, appliedCoupon?.code, { name, phone, address, wantsDelivery })
      window.open(waUrl, '_blank')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer animate-in fade-in" onClick={onClose} />

      <div className="cart-drawer relative flex h-full w-[90vw] flex-col border-r md:border-r-0 md:border-l border-white/10 bg-[#070714]/80 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-left duration-300 md:w-[450px]" style={{ backdropFilter: 'blur(30px) saturate(180%)' }}>
        <div className="flex h-[var(--navbar-h)] items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass)] p-4">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart className="text-[var(--neon-cyan)]" />
            <span>{isCheckingOut ? 'إتمام الطلب' : 'سلة المشتريات'}</span>
          </h2>
          <button onClick={() => {
            if (isCheckingOut && !isSuccess) setIsCheckingOut(false)
            else onClose()
          }} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/5 bg-white/5 p-2 transition-all hover:bg-white/10">
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="scrollbar-hide flex flex-grow flex-col gap-4 overflow-y-auto p-4">
          {!mounted || items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 opacity-70">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass)]">
                <ShoppingCart size={40} className="text-[var(--glass-border)]" />
              </div>
              <p className="text-lg text-[var(--text-dim)]">السلة فاضية حاليًا</p>
            </div>
          ) : isSuccess ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center animate-in fade-in zoom-in duration-500">
              <CheckCircle2 size={64} className="text-green-500" />
              <h3 className="text-2xl font-black text-white">تم استلام طلبك!</h3>
              <p className="text-gray-400">جاري تحويلك للواتساب لتأكيد الاستلام...</p>
            </div>
          ) : isCheckingOut ? (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300">
              <div className="rounded-2xl border border-[var(--neon-cyan)]/20 bg-[var(--neon-cyan)]/5 p-4 mb-2">
                <p className="text-sm font-medium text-[var(--neon-cyan)] text-center">
                  يرجى تعبئة البيانات لتسجيل طلبك وإرساله للإدارة
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                  <User size={16} className="text-[var(--neon-cyan)]" />
                  الاسم بالكامل
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-[var(--neon-cyan)] focus:bg-[var(--neon-cyan)]/5" 
                  placeholder="مثال: أحمد محمد"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                  <Phone size={16} className="text-[var(--neon-cyan)]" />
                  رقم الهاتف (واتساب)
                </label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-[var(--neon-cyan)] focus:bg-[var(--neon-cyan)]/5 text-left" 
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              {/* Delivery Toggle */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">طريقة الاستلام</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setWantsDelivery(false); setAddress('') }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      !wantsDelivery
                        ? 'border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 shadow-[0_0_16px_rgba(34,211,238,0.15)]'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    }`}
                  >
                    <Store size={24} className={!wantsDelivery ? 'text-[var(--neon-cyan)]' : 'text-gray-500'} />
                    <span className={`text-sm font-bold ${!wantsDelivery ? 'text-[var(--neon-cyan)]' : 'text-gray-400'}`}>استلام من المحل</span>
                    <span className="text-[11px] text-gray-500">🏪 تعال واستلم طلبك</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWantsDelivery(true)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      wantsDelivery
                        ? 'border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 shadow-[0_0_16px_rgba(34,211,238,0.15)]'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    }`}
                  >
                    <Truck size={24} className={wantsDelivery ? 'text-[var(--neon-cyan)]' : 'text-gray-500'} />
                    <span className={`text-sm font-bold ${wantsDelivery ? 'text-[var(--neon-cyan)]' : 'text-gray-400'}`}>توصيل لحد البيت</span>
                    <span className="text-[11px] text-gray-500">🚚 هنوصلك لحد الباب</span>
                  </button>
                </div>
              </div>

              {/* Address - only if delivery */}
              {wantsDelivery && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                    <MapPin size={16} className="text-[var(--neon-cyan)]" />
                    العنوان أو رابط اللوكيشن
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-[var(--neon-cyan)] focus:bg-[var(--neon-cyan)]/5 leading-relaxed" 
                    placeholder="اكتب العنوان بالتفصيل أو الصق رابط خرائط جوجل (Google Maps)..."
                  />
                </div>
              )}
            </form>
          ) : (
            items.map((item) => (
              <div key={item.id} className="group relative flex gap-4 overflow-hidden rounded-[var(--radius)] border border-[var(--glass-border)] bg-[var(--glass)] p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black/20">
                  {item.images && item.images.length > 0 ? (
                    <Image src={item.images[0]} alt={item.name} fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">لا توجد صورة</div>
                  )}
                </div>

                <div className="flex flex-grow flex-col justify-between py-1">
                  <div className="flex items-start justify-between gap-2 pr-1">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="rounded p-1.5 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300" title="إزالة">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-end justify-between">
                    <span className="font-black text-[var(--neon-cyan)]">{(item.price ?? 0).toLocaleString('ar-EG')} ج</span>
                    <div className="flex shrink-0 items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--bg)] p-1">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="flex min-w-[30px] items-center justify-center rounded-md p-1.5 transition-colors hover:bg-white/5 hover:text-[var(--neon-cyan)]">
                        <Minus size={14} />
                      </button>
                      <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="flex min-w-[30px] items-center justify-center rounded-md p-1.5 transition-colors hover:bg-white/5 hover:text-[var(--neon-cyan)]">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {mounted && items.length > 0 && !isSuccess ? (
          <div className="relative z-20 border-t border-[var(--glass-border)] bg-[var(--glass)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-xl shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
            {/* Coupon Input */}
            {!isCheckingOut && (
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5" style={{ animation: 'fadeInScale 0.3s ease both' }}>
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">{appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-300/70">-{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value} ج`}</span>
                    </div>
                    <button onClick={() => removeCoupon()} className="text-gray-400 hover:text-red-400 transition"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="🎁 كود الخصم"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[var(--neon-cyan)]"
                      dir="ltr"
                    />
                    <button
                      onClick={() => {
                        const found = DEFAULT_COUPONS.find(c => c.code === couponCode && c.is_active)
                        if (!found) { setCouponError('كود غير صحيح'); return }
                        if (found.min_order && totalPrice < found.min_order) { setCouponError(`الحد الأدنى ${found.min_order} ج`); return }
                        applyCoupon(found); setCouponCode(''); setCouponError('')
                      }}
                      className="rounded-xl bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/20 px-4 text-xs font-bold text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 transition"
                    >تطبيق</button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-400 mt-1 pr-1">{couponError}</p>}
              </div>
            )}

            {/* Price Summary */}
            <div className="mb-4 space-y-2 px-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-dim)]">المجموع</span>
                <span className="text-white font-bold">{totalPrice.toLocaleString('ar-EG')} ج</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-sm" style={{ animation: 'fadeInScale 0.3s ease both' }}>
                  <span className="text-emerald-400">الخصم ({appliedCoupon.code})</span>
                  <span className="text-emerald-400 font-bold">-{getDiscount(totalPrice).toLocaleString('ar-EG')} ج</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg pt-2 border-t border-white/5">
                <span className="font-medium text-[var(--text-dim)]">الإجمالي</span>
                <span className="text-2xl font-black text-white">
                  {(totalPrice - getDiscount(totalPrice)).toLocaleString('ar-EG')} <span className="text-sm text-[var(--neon-cyan)]">جنيه</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {isCheckingOut ? (
                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--neon-cyan)] py-4 text-lg font-bold text-black transition-all hover:scale-[1.02] hover:opacity-90 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري تسجيل الطلب...' : (
                    <>
                      <Send size={20} className="mr-2" />
                      تأكيد الطلب
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => setIsCheckingOut(true)} 
                  className="flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--neon)] py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] hover:opacity-90 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                >
                  إتمام الشراء
                </button>
              )}

              {!isCheckingOut && (
                <button
                  onClick={() => {
                    clear()
                    onClose()
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-gray-200 transition hover:bg-white/10"
                >
                  تفريغ السلة
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
