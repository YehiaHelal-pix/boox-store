import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminAuthState, sanitizeAdminNextPath } from '@/lib/auth/admin'
import { LoginForm } from '@/app/auth/login/LoginForm'

interface LoginPageProps {
  searchParams: Promise<{
    error?: string
    message?: string
    next?: string
  }>
}

function mapMessage(message?: string) {
  switch (message) {
    case 'logged_out':
      return 'تم تسجيل الخروج بأمان'
    default:
      return null
  }
}

function mapError(error?: string) {
  switch (error) {
    case 'session_expired':
      return 'الجلسة انتهت، سجّل دخولك تاني'
    case 'invalid_credentials':
      return 'بيانات الدخول غير صحيحة'
    case 'not_admin':
      return 'الحساب ده مش عليه صلاحية دخول لوحة الإدارة'
    default:
      return null
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const nextPath = sanitizeAdminNextPath(params.next)
  const authState = await getAdminAuthState()

  if (authState.isAdmin) {
    redirect(nextPath)
  }

  const topMessage = mapMessage(params.message)
  const topError = mapError(params.error)

  return (
    <div className="min-h-screen bg-[#06090f] px-4 py-10" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center gap-8 lg:grid lg:grid-cols-[minmax(0,1.2fr)_480px]">
        <div className="hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_52%),linear-gradient(135deg,rgba(7,11,19,0.96),rgba(6,10,16,0.88))] p-10 lg:block">
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--neon-cyan)]">Boox Store</p>
          <h2 className="mt-4 text-5xl font-black leading-tight text-white">أمان حقيقي للوحة الإدارة</h2>
          <p className="mt-4 max-w-xl text-lg leading-9 text-gray-300">
            الدخول بقى معتمد على Supabase Auth وجلسة آمنة بالكوكيز، وصلاحية الأدمن بتتراجع من السيرفر قبل أي صفحة أو API حساسة.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-gray-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">تسجيل دخول بالإيميل والباسورد</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">تحقق Server-Side من صلاحيات الأدمن</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">منع الوصول لأي route إداري بدون تصريح فعلي</div>
          </div>
        </div>

        <div className="w-full">
          {topMessage ? <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{topMessage}</div> : null}
          {topError ? <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{topError}</div> : null}
          <LoginForm nextPath={nextPath} />
          <div className="mt-4 text-center text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              رجوع للمتجر
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
