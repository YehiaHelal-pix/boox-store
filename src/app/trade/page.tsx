'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { RefreshCcw, Send } from 'lucide-react'

const conditions = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'يحتاج إصلاح']

export default function TradePage() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const addToast = useToastStore(s => s.addToast)

    const [form, setForm] = useState({
        customer_name: '',
        phone: '',
        old_device: '',
        old_condition: '',
        desired_device: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.customer_name || !form.phone || !form.old_device || !form.old_condition || !form.desired_device) {
            addToast('يرجى ملء جميع الحقول', 'error')
            return
        }
        setLoading(true)
        try {
            const sb = createClient()
            const { error } = await sb.from('trade_requests').insert([form])
            if (error) throw error
            setSubmitted(true)
            addToast('تم إرسال طلب الاستبدال بنجاح!', 'success')
            const msg = encodeURIComponent(`طلب استبدال جديد:\nالاسم: ${form.customer_name}\nالهاتف: ${form.phone}\nالجهاز القديم: ${form.old_device} (${form.old_condition})\nالجهاز المطلوب: ${form.desired_device}`)
            window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'}?text=${msg}`, '_blank')
        } catch {
            addToast('حدث خطأ أثناء الإرسال', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 gap-6">
                <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
                    <RefreshCcw size={48} className="text-green-400" />
                </div>
                <h2 className="text-3xl font-black text-white">تم إرسال طلبك بنجاح!</h2>
                <p className="text-[var(--text-muted)] text-lg max-w-md">سنتواصل معك قريباً على الواتساب لتنسيق عملية الاستبدال.</p>
                <button onClick={() => { setSubmitted(false); setForm({ customer_name: '', phone: '', old_device: '', old_condition: '', desired_device: '' }) }} className="px-8 py-3 bg-[var(--neon)] text-white rounded-xl font-bold min-h-[44px]">
                    إرسال طلب آخر
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-10 px-4 lg:px-[var(--container)] max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-full bg-[var(--neon-purple)]/10 border border-[var(--neon-purple)]/30 flex items-center justify-center mx-auto mb-6">
                    <RefreshCcw className="text-[var(--neon-purple)]" size={40} />
                </div>
                <h1 className="text-4xl font-black text-white mb-4">طلب استبدال</h1>
                <p className="text-[var(--text-muted)] text-lg">بدّل جهازك القديم بجهاز جديد بأفضل الأسعار</p>
            </div>

            <form onSubmit={handleSubmit} className="glass rounded-[2rem] p-8 md:p-12 flex flex-col gap-6 border border-[var(--border)]">
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">الاسم الكامل</label>
                    <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="محمد أحمد" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">رقم الهاتف</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" type="tel" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">الجهاز القديم</label>
                    <input name="old_device" value={form.old_device} onChange={handleChange} placeholder="مثال: iPhone 13 Pro" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">حالة الجهاز القديم</label>
                    <select name="old_condition" value={form.old_condition} onChange={handleChange} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px] appearance-none cursor-pointer">
                        <option value="">اختر الحالة</option>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">الجهاز المطلوب</label>
                    <input name="desired_device" value={form.desired_device} onChange={handleChange} placeholder="مثال: iPhone 16 Pro Max" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[var(--neon-purple)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity min-h-[56px] text-lg disabled:opacity-50 mt-4 cursor-pointer">
                    {loading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={20} /> إرسال الطلب</>}
                </button>
            </form>
        </div>
    )
}
