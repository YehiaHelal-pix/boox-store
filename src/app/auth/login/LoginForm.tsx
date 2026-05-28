'use client'

import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-2xl bg-[var(--neon-cyan)] px-4 py-4 text-base font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'جارٍ تسجيل الدخول...' : 'دخول لوحة الإدارة'}
    </button>
  )
}

function VisibilityButton({
  shown,
  onToggle,
  label,
}: {
  shown: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
    >
      {shown ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const supabase = createClient()
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail || !password) {
        setError('اكتب الإيميل وكلمة المرور')
        return
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (authError || !data.user) {
        setError('بيانات الدخول غير صحيحة')
        return
      }

      const adminStateResponse = await fetch('/api/admin/session', {
        cache: 'no-store',
        credentials: 'same-origin',
      })

      if (!adminStateResponse.ok) {
        await supabase.auth.signOut()
        setError(adminStateResponse.status === 403 ? 'الحساب ده مش عليه صلاحية دخول لوحة الإدارة' : 'تعذر التحقق من صلاحيات الأدمن')
        return
      }

      window.location.assign(nextPath)
    } catch {
      setError('حصل خطأ غير متوقع أثناء تسجيل الدخول')
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0b0f16] p-8 shadow-[0_0_50px_rgba(0,0,0,0.45)]"
    >
      <p className="text-sm uppercase tracking-[0.35em] text-[var(--neon-cyan)]">Boox Admin</p>
      <h1 className="mt-3 text-3xl font-black text-white">تسجيل دخول الإدارة</h1>
      <p className="mt-2 text-sm leading-7 text-gray-400">
        اكتب إيميل الأدمن وكلمة المرور. بعد تسجيل الدخول يتم التحقق من جدول `admin_users` قبل
        فتح لوحة التحكم.
      </p>

      {error ? <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      <label className="mt-4 block text-sm font-bold text-white">
        إيميل الأدمن
        <div className="relative mt-2">
          <input
            type="email"
            name="email"
            dir="ltr"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none focus:border-[var(--neon-cyan)]"
            placeholder="admin@booxstore.com"
          />
        </div>
      </label>

      <label className="mt-4 block text-sm font-bold text-white">
        كلمة مرور الأدمن
        <div className="relative mt-2">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pl-12 text-white outline-none focus:border-[var(--neon-cyan)]"
            placeholder="اكتب كلمة المرور"
          />
          <VisibilityButton
            shown={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          />
        </div>
      </label>

      <SubmitButton pending={pending} />
    </form>
  )
}
