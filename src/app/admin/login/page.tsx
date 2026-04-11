'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogIn } from 'lucide-react'

export default function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const sb = createClient()
            const { error } = await sb.auth.signInWithPassword({ email, password })
            if (error) throw error
            router.push('/admin')
            router.refresh()
        } catch {
            setError('بيانات الدخول غير صحيحة')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
            <div className="w-full max-w-md glass rounded-[2rem] p-10 border border-[var(--border)]">
                <div className="text-center mb-10">
                    <Image src="/boox-logo.jpg" alt="Boox Store" width={80} height={80} className="mx-auto rounded-2xl mb-6" style={{ filter: 'invert(1)' }} />
                    <h1 className="text-3xl font-black text-white mb-2">تسجيل دخول الأدمن</h1>
                    <p className="text-[var(--text-muted)]">مرحباً بك في لوحة إدارة Boox Store</p>
                </div>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-center font-medium">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-white text-sm">البريد الإلكتروني</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-white text-sm">كلمة المرور</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[var(--neon)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity min-h-[56px] text-lg disabled:opacity-50 mt-4 cursor-pointer">
                        {loading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn size={20} /> تسجيل الدخول</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
