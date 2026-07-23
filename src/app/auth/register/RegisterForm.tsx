'use client'

import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Store, Phone, MapPin, Link, Mail, Lock } from 'lucide-react'

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-2xl bg-[var(--neon-cyan)] px-4 py-4 text-base font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <span>جاري تهيئة متجرك الجديد...</span>
        </>
      ) : (
        '🚀 إنشاء متجري وتفعيل النظام'
      )}
    </button>
  )
}

export function RegisterForm() {
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // حقول الإدخال
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [shopAddress, setShopAddress] = useState('')

  // فحص وتنسيق الـ slug فورياً أثناء الكتابة
  function handleSlugChange(val: string) {
    // استبدال المسافات بالشرطة وحذف الأحرف غير الإنجليزية الخاصة
    const cleaned = val
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setShopSlug(cleaned)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(null)

    if (!email || !password || !shopName || !shopSlug || !shopPhone || !shopAddress) {
      setError('يرجى ملء جميع الحقول المطلوبة لتسجيل المتجر')
      setPending(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          shopName,
          shopSlug,
          shopPhone,
          shopAddress,
          shopLogo: '/assets/boox-logo.jpg', // الشعار الافتراضي
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ غير متوقع أثناء تسجيل المتجر')
      }

      setSuccess('تم إنشاء متجرك الجديد وتهيئة النظام بنجاح! جاري تحويلك للوحة التحكم...')
      
      // توجيه تلقائي بعد ثانيتين إلى صفحة تسجيل الدخول لكي يدخل حسابه الجديد
      setTimeout(() => {
        window.location.assign('/admin/login')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الاتصال بالخادم')
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0b0f16]/90 backdrop-blur-md p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-right font-sans"
    >
      <h2 className="text-2xl font-black text-white">ابدأ متجرك الإلكتروني</h2>
      <p className="mt-1 text-xs text-gray-400">
        أدخل بيانات متجرك وحساب الإدارة لإنشاء لوحة التحكم فوراً.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
          🎉 {success}
        </div>
      )}

      {/* حقول المتجر */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-white mb-2">اسم المحل / العلامة التجارية</label>
          <div className="relative">
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pr-10 pl-4 py-3 text-xs text-white outline-none focus:border-[var(--neon-cyan)] transition"
              placeholder="مثال: البركة ستور"
            />
            <Store size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white mb-1">رابط المحل الفريد (Slug)</label>
          <p className="text-[10px] text-gray-400 mb-2">الاسم بالإنجليزية الذي سيظهر برابط فواتيرك (مثال: `albaraka` ليكون الرابط `/share/invoice?shop=albaraka`):</p>
          <div className="relative">
            <input
              type="text"
              required
              dir="ltr"
              value={shopSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pr-10 pl-4 py-3 text-xs text-white outline-none focus:border-[var(--neon-cyan)] transition"
              placeholder="albaraka-store"
            />
            <Link size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white mb-2">رقم الواتساب للمحل</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pr-10 pl-4 py-3 text-xs text-white outline-none focus:border-[var(--neon-cyan)] transition"
                placeholder="201012345678"
              />
              <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-white mb-2">عنوان المحل بالتفصيل</label>
            <div className="relative">
              <input
                type="text"
                required
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pr-10 pl-4 py-3 text-xs text-white outline-none focus:border-[var(--neon-cyan)] transition"
                placeholder="المنصورة - شارع الجيش"
              />
              <MapPin size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="my-6 border-t border-white/10"></div>

      {/* حقول حساب الإدارة */}
      <h3 className="text-sm font-bold text-white mb-1">بيانات حساب الإدارة</h3>
      <p className="text-[10px] text-gray-400 mb-4">هذه البيانات التي ستستخدمها لتسجيل الدخول إلى لوحة التحكم الخاصة بمحلك.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-white mb-2">البريد الإلكتروني للقرير</label>
          <div className="relative">
            <input
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pr-10 pl-4 py-3 text-xs text-white outline-none focus:border-[var(--neon-cyan)] transition"
              placeholder="admin@albaraka.com"
            />
            <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white mb-2">كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pr-10 pl-12 py-3 text-xs text-white outline-none focus:border-[var(--neon-cyan)] transition"
              placeholder="اكتب كلمة مرور قوية"
            />
            <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <SubmitButton pending={pending} />
    </form>
  )
}
