'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, CheckCircle, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { useCustomer } from '@/hooks/useCustomer'

export default function ReserveForm({ productId, productName }: { productId: string, productName: string }) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const addToast = useToastStore(s => s.addToast)
    const { customer, isLoaded } = useCustomer()

    const [form, setForm] = useState({
        name: '',
        phone: '',
        date: '',
        time: ''
    })

    useEffect(() => {
        if (isLoaded) {
            setForm(prev => ({
                ...prev,
                name: customer.name || '',
                phone: customer.phone || ''
            }))
        }
    }, [isLoaded, customer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.phone || !form.date || !form.time) {
            addToast('يرجى ملء جميع الحقول', 'error')
            return
        }

        setLoading(true)
        try {
            const sb = createClient()
            const { error } = await sb.from('reservations').insert({
                customer_name: form.name,
                customer_phone: form.phone,
                product_id: productId,
                pickup_date: form.date,
                pickup_time: form.time
            })

            if (error) throw error
            setSubmitted(true)
            addToast('تم حجز الجهاز بنجاح!', 'success')

            // Build WhatsApp message for reservation
            const msg = encodeURIComponent(`طلب حجز جهاز:\nالجهاز: ${productName}\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nموعد الاستلام: ${form.date} الساعة ${form.time}`)
            window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'}?text=${msg}`, '_blank')
        } catch (err) {
            console.error('Error reserving device:', err)
            addToast('حدث خطأ أثناء إرسال الطلب', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="glass p-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">تم الحجز بنجاح</h3>
                <p className="text-[var(--text-muted)] text-sm">تم إرسال طلب الحجز وسنقوم بالتواصل معك لتأكيد الموعد.</p>
            </div>
        )
    }

    return (
        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
            <h3 className="text-2xl font-black text-white mb-2">حجز الجهاز</h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">احجز هذا الجهاز الآن واستلمه من الفرع في الوقت الذي يناسبك.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--neon-cyan)] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="الاسم"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--neon-cyan)] transition-colors" size={20} />
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:border-[var(--neon-cyan)] outline-none transition-all [color-scheme:dark]"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--neon-cyan)] transition-colors" size={20} />
                        <input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:border-[var(--neon-cyan)] outline-none transition-all [color-scheme:dark]"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50 transition-all cursor-pointer text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    {loading ? <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><CheckCircle size={20} /> تأكيد الحجز</>}
                </button>
            </form>
        </div>
    )
}
