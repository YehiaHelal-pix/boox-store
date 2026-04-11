'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { PenTool, Send } from 'lucide-react'

const deviceTypes = ['iPhone', 'iPad', 'MacBook', 'AirPods', 'Apple Watch', 'iMac', 'أخرى']

export default function MaintenancePage() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const addToast = useToastStore(s => s.addToast)

    const [form, setForm] = useState({
        customer_name: '',
        phone: '',
        device_type: '',
        device_model: '',
        issue: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.customer_name || !form.phone || !form.device_type || !form.device_model || !form.issue) {
            addToast('يرجى ملء جميع الحقول', 'error')
            return
        }
        setLoading(true)
        try {
            const sb = createClient()
            const { error } = await sb.from('maintenance_requests').insert([form])
            if (error) throw error
            setSubmitted(true)
            addToast('تم إرسال طلب الصيانة بنجاح!', 'success')
            const msg = encodeURIComponent(`طلب صيانة جديد:\nالاسم: ${form.customer_name}\nالهاتف: ${form.phone}\nالجهاز: ${form.device_type} - ${form.device_model}\nالمشكلة: ${form.issue}`)
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
                    <PenTool size={48} className="text-green-400" />
                </div>
                <h2 className="text-3xl font-black text-white">تم إرسال طلبك بنجاح!</h2>
                <p className="text-[var(--text-muted)] text-lg max-w-md">سنتواصل معك قريباً على الواتساب لتأكيد موعد الصيانة.</p>
                <button onClick={() => { setSubmitted(false); setForm({ customer_name: '', phone: '', device_type: '', device_model: '', issue: '' }) }} className="px-8 py-3 bg-[var(--neon)] text-white rounded-xl font-bold min-h-[44px]">
                    إرسال طلب آخر
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-10 px-4 lg:px-[var(--container)] max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-full bg-[var(--neon)]/10 border border-[var(--neon)]/30 flex items-center justify-center mx-auto mb-6">
                    <PenTool className="text-[var(--neon-cyan)]" size={40} />
                </div>
                <h1 className="text-4xl font-black text-white mb-4">طلب صيانة</h1>
                <p className="text-[var(--text-muted)] text-lg">أرسل لنا تفاصيل العطل وسنتواصل معك خلال ساعات</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-white">نوع الجهاز</label>
                        <select name="device_type" value={form.device_type} onChange={handleChange} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px] appearance-none cursor-pointer">
                            <option value="">اختر النوع</option>
                            {deviceTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-white">موديل الجهاز</label>
                        <input name="device_model" value={form.device_model} onChange={handleChange} placeholder="iPhone 15 Pro Max" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">وصف المشكلة</label>
                    <textarea name="issue" value={form.issue} onChange={handleChange} placeholder="اشرح المشكلة بالتفصيل..." rows={5} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors resize-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[var(--neon)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity min-h-[56px] text-lg disabled:opacity-50 mt-4 cursor-pointer">
                    {loading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={20} /> إرسال الطلب</>}
                </button>
            </form>
        </div>
    )
}
