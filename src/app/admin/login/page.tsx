import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminAuthState, sanitizeAdminNextPath } from '@/lib/auth/admin'
import { LoginForm } from '@/app/auth/login/LoginForm'

interface AdminLoginPageProps {
  searchParams: Promise<{
    error?: string
    next?: string
  }>
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

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams
  const nextPath = sanitizeAdminNextPath(params.next)
  const authState = await getAdminAuthState()

  if (authState.isAdmin) {
    redirect(nextPath)
  }

  if (authState.user) {
    redirect('/auth/forbidden')
  }

  const topError = mapError(params.error)

  return (
    <div className="min-h-screen bg-[#06090f] px-4 py-10 flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.15),_transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.1),_transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--neon-cyan)] mb-2">Boox Store</p>
          <h1 className="text-4xl font-black text-white">دخول آمن للوحة الإدارة</h1>
        </div>

        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {topError ? (
            <div className="w-full mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
              {topError}
            </div>
          ) : null}
          
          <LoginForm nextPath={nextPath} />
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              &rarr; رجوع للمتجر
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
