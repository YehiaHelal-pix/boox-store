'use client'

import { useState } from 'react'

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-2xl bg-[var(--neon-cyan)] px-4 py-4 text-base font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'جاري تسجيل الدخول...' : 'دخول لوحة الإدارة'}
    </button>
  )
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [pending, setPending] = useState(false)

  return (
    <form
      action="/auth/sign-in"
      method="post"
      onSubmit={() => setPending(true)}
      className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0b0f16] p-8 shadow-[0_0_50px_rgba(0,0,0,0.45)]"
    >
      <input type="hidden" name="next" value={nextPath} />
      <p className="text-sm uppercase tracking-[0.35em] text-[var(--neon-cyan)]">Boox Admin</p>
      <h1 className="mt-3 text-3xl font-black text-white">تسجيل دخول الإدارة</h1>
      <p className="mt-2 text-sm leading-7 text-gray-400">ادخل بإيميل الأدمن والباسورد الحقيقي عشان تفتح لوحة الإدارة بشكل آمن.</p>

      <label className="mt-6 block text-sm font-bold text-white">
        الإيميل
        <input
          type="email"
          name="email"
          dir="ltr"
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none focus:border-[var(--neon-cyan)]"
          placeholder="admin@booxstore.com"
        />
      </label>

      <label className="mt-4 block text-sm font-bold text-white">
        الباسورد
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none focus:border-[var(--neon-cyan)]"
          placeholder="اكتب الباسورد"
        />
      </label>

      <SubmitButton pending={pending} />
    </form>
  )
}
