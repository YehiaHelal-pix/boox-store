'use client'
import { useState, useEffect } from 'react'
import { Phone, User, Send, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { useCustomer } from '@/hooks/useCustomer'

export default function CallbackForm({ productId }: { productId: string }) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const addToast = useToastStore(s => s.addToast)
    const { customer, isLoaded } = useCustomer()

    const [form, setForm] = useState({
        name: '',
        phone: ''
    })

    useEffect(() => {
        if (isLoaded) {
            setForm({
                name: customer.name || '',
                phone: customer.phone || ''
            })
        }
    }, [isLoaded, customer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.phone) {
            addToast('يرجى ملء جميع الحقول', 'error')
            return
        }

        setLoading(true)
        try {
            const sb = createClient()
            const { error } = await sb.from('callback_requests').insert({
                customer_name: form.name,
                customer_phone: form.phone,
                product_id: productId
            })

            if (error) throw error
            setSubmitted(true)
            addToast('تم استلام طلبك، سنتصل بك قريباً', 'success')
        } catch (err) {
            console.error('Error requesting callback:', err)
            addToast('حدث خطأ أثناء إرسال الطلب', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="glass p-8 rounded-3xl border border-green-500/20 bg-green-500/5 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">تم إرسال الطلب بنجاح</h3>
                <p className="text-[var(--text-muted)] text-sm">سوف يقوم فريقنا بالتواصل معك في أقرب وقت ممكن.</p>
            </div>
        )
    }

    return (
        <div className="glass p-8 rounded-3xl border border-white/5 bg-white/5">
            <h3 className="text-xl font-bold text-white mb-2">اطلب مكالمة</h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">هل لديك أي استفسار عن هذا المنتج؟ اترك رقمك وسنقوم بالاتصال بك.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative group">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--neon-cyan)] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="الاسم بالكامل"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                        required
                    />
                </div>
                <div className="relative group">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--neon-cyan)] transition-colors" size={20} />
                    <input
                        type="tel"
                        placeholder="رقم الهاتف"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--neon-cyan)] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={18} /> طلب اتصال</>}
                </button>
            </form>
        </div>
    )
}
