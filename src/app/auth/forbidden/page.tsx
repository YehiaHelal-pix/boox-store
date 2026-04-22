import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#06090f] px-4 py-10" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-red-500/20 bg-[#0b0f16] p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.45)]">
          <p className="text-sm uppercase tracking-[0.35em] text-red-300">403</p>
          <h1 className="mt-3 text-3xl font-black text-white">مش مسموح لك تدخل لوحة الإدارة</h1>
          <p className="mt-3 text-sm leading-7 text-gray-400">الحساب الحالي متسجل دخول، لكن ماعندوش صلاحية الأدمن المطلوبة للوصول للوحة الإدارة.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              رجوع للرئيسية
            </Link>
            <form action="/auth/logout" method="post">
              <button type="submit" className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20">
                تسجيل خروج
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
