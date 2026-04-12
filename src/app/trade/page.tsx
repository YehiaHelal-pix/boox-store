'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { RefreshCcw, Send, AlertCircle, ShieldCheck, ReceiptText, Smartphone } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useCustomer } from '@/hooks/useCustomer'
import { buildWhatsAppMessage } from '@/lib/whatsapp'
import TrackingSection from '@/components/TrackingSection'
import { motion, AnimatePresence } from 'framer-motion'

const conditions = [
    { id: 'excellent', label: 'ممتاز (Excellent)' },
    { id: 'good', label: 'جيد جداً (Good)' },
    { id: 'fair', label: 'جيد (Fair)' }
]

function TradeContent() {
    const params = useSearchParams()
    const targetProduct = params.get('product')
    const targetName = params.get('name')
    const targetPrice = params.get('price')

    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const addToast = useToastStore(s => s.addToast)
    const { customer, saveCustomer, isLoaded } = useCustomer()

    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        device_model: '',
        device_condition: '',
        battery_health: '',
        desired_model: targetName || '',
        tax_exempt: true,
        tax_value: '',
        has_warranty: false,
        warranty_months: ''
    })

    useEffect(() => {
        if (isLoaded) {
            setForm(f => ({
                ...f,
                customer_name: f.customer_name || customer.name,
                customer_phone: f.customer_phone || customer.phone,
            }))
        }
    }, [isLoaded, customer.name, customer.phone])

    useEffect(() => {
        if (targetName && !form.desired_model) {
            setForm(f => ({ ...f, desired_model: targetName }))
        }
    }, [targetName])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === 'radio' ? value === 'true' : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.customer_name || !form.customer_phone || !form.device_model || !form.device_condition) {
            addToast('يرجى ملء جميع الحقول المطلوبة', 'error')
            return
        }

        if (!form.tax_exempt && !form.tax_value) {
            addToast('يرجى إدخال قيمة الضريبة', 'error')
            return
        }
        if (form.has_warranty && !form.warranty_months) {
            addToast('يرجى إدخال المدة المتبقية للضمان', 'error')
            return
        }

        setLoading(true)
        try {
            // Save to customer hook
            saveCustomer({ name: form.customer_name, phone: form.customer_phone })

            const sb = createClient()
            const payload = {
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                device_model: form.device_model,
                device_condition: form.device_condition,
                battery_health: form.battery_health ? parseInt(form.battery_health) : null,
                desired_model: form.desired_model,
                tax_exempt: form.tax_exempt,
                tax_value: form.tax_value ? parseFloat(form.tax_value) : 0,
                has_warranty: form.has_warranty,
                warranty_months: form.warranty_months ? parseInt(form.warranty_months) : 0,
            }
            const { error } = await sb.from('trade_requests').insert([payload])
            if (error) throw error

            setSubmitted(true)
            addToast('تم إرسال طلب الاستبدال بنجاح!', 'success')

            const message = buildWhatsAppMessage('trade', form)
            window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'}?text=${encodeURIComponent(message)}`, '_blank')
        } catch (err: any) {
            console.error(err)
            addToast('حدث خطأ أثناء الإرسال', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 gap-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4"
                >
                    <RefreshCcw size={48} className="text-green-400" />
                </motion.div>
                <h2 className="text-3xl font-black text-white">تم إرسال طلبك بنجاح!</h2>
                <p className="text-[var(--text-muted)] text-lg max-w-md">سنتواصل معك قريباً على الواتساب لتنسيق عملية الاستبدال.</p>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setForm({
                            customer_name: customer.name || '', customer_phone: customer.phone || '', device_model: '', device_condition: '',
                            battery_health: '', desired_model: targetName || '', tax_exempt: true, tax_value: '',
                            has_warranty: false, warranty_months: ''
                        })
                    }}
                    className="px-8 py-3 bg-[var(--neon)] text-white rounded-xl font-bold min-h-[44px]"
                >
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
                {targetName && (
                    <div className="bg-white/5 border border-[var(--neon-cyan)]/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-[var(--neon-cyan)]"></div>
                        <div className="flex items-center gap-2 text-[var(--neon-cyan)]">
                            <Smartphone size={20} />
                            <span className="font-bold text-sm">الجهاز المطلوب كبديل:</span>
                        </div>
                        <h3 className="text-xl font-black text-white px-2">{targetName}</h3>
                        {targetPrice && <p className="text-[var(--text-muted)] px-2 text-sm font-mono">السعر الأساسي: {Number(targetPrice).toLocaleString()} جنيه</p>}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">الاسم الكامل</label>
                    <input name="customer_name" required value={form.customer_name} onChange={handleChange} placeholder="محمد أحمد" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">رقم الهاتف</label>
                    <input name="customer_phone" required value={form.customer_phone} onChange={handleChange} placeholder="01XXXXXXXXX" type="tel" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">الجهاز القديم (للاستبدال)</label>
                    <input name="device_model" required value={form.device_model} onChange={handleChange} placeholder="مثال: iPhone 13 Pro" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white">حالة الجهاز القديم</label>
                    <select name="device_condition" required value={form.device_condition} onChange={handleChange} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px] appearance-none cursor-pointer">
                        <option value="">اختر الحالة</option>
                        {conditions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-bold text-white text-sm">صحة البطارية (%)</label>
                    <input name="battery_health" type="number" min="0" max="100" value={form.battery_health} onChange={handleChange} placeholder="مثال: 95" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ReceiptText className="text-[var(--neon-cyan)]" size={20} />
                        <h3 className="font-bold text-white">حالة الضريبة</h3>
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="tax_exempt" value="true" checked={form.tax_exempt} onChange={handleChange} className="accent-[var(--neon-cyan)] w-4 h-4" />
                            <span className="text-white text-sm">معفي من الضريبة</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="tax_exempt" value="false" checked={!form.tax_exempt} onChange={handleChange} className="accent-[var(--neon-cyan)] w-4 h-4" />
                            <span className="text-white text-sm">غير معفي</span>
                        </label>
                    </div>

                    <AnimatePresence mode="wait">
                        {!form.tax_exempt && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="mt-4 flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">قيمة الضريبة (جنيه)</label>
                                    <input name="tax_value" type="number" min="0" required={!form.tax_exempt} value={form.tax_value} onChange={handleChange} placeholder="أدخل قيمة الضريبة بالجنيه" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="text-[var(--neon-green)]" size={20} />
                        <h3 className="font-bold text-white">حالة الضمان</h3>
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="has_warranty" value="true" checked={form.has_warranty} onChange={handleChange} className="accent-[var(--neon-green)] w-4 h-4" />
                            <span className="text-white text-sm">يوجد ضمان</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="has_warranty" value="false" checked={!form.has_warranty} onChange={handleChange} className="accent-[var(--neon-green)] w-4 h-4" />
                            <span className="text-white text-sm">لا يوجد ضمان</span>
                        </label>
                    </div>

                    <AnimatePresence mode="wait">
                        {form.has_warranty && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="mt-4 flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">المدة المتبقية للضمان</label>
                                    <input name="warranty_months" type="number" min="1" max="24" required={form.has_warranty} value={form.warranty_months} onChange={handleChange} placeholder="عدد الأشهر المتبقية" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!targetName && (
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-white">الجهاز المطلوب</label>
                        <input name="desired_model" required value={form.desired_model} onChange={handleChange} placeholder="مثال: iPhone 16 Pro Max" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none transition-colors min-h-[50px]" />
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-[var(--neon-purple)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity min-h-[56px] text-lg disabled:opacity-50 mt-4 cursor-pointer">
                    {loading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={20} /> إرسال الطلب عبر واتساب</>}
                </button>
            </form>

            <TrackingSection type="trade" />
        </div>
    )
}

export default function TradePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="animate-spin w-10 h-10 border-4 border-[var(--neon-purple)] border-t-transparent rounded-full"></div></div>}>
            <TradeContent />
        </Suspense>
    )
}
