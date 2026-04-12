'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { RefreshCcw, ShieldCheck, ReceiptText, Battery, MessageSquare, X, Send } from 'lucide-react'

type TradeRequest = {
    id: string
    customer_name: string
    customer_phone: string
    device_model: string
    device_condition: string
    battery_health: number | null
    desired_model: string
    tax_exempt: boolean
    tax_value: number
    has_warranty: boolean
    warranty_months: number
    status: string
    admin_notes: string | null
    admin_reply?: string | null
    reply_at?: string | null
    created_at: string | null
}

const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    reviewing: 'قيد المراجعة',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
}
const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    approved: 'bg-green-500/10 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const conditionLabels: Record<string, string> = {
    excellent: 'ممتاز',
    good: 'جيد جداً',
    fair: 'جيد'
}

export default function AdminTradePage() {
    const [requests, setRequests] = useState<TradeRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [replyModal, setReplyModal] = useState<{ id: string, text: string } | null>(null)
    const addToast = useToastStore(s => s.addToast)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const sb = createClient()
        const { data } = await sb.from('trade_requests').select('*').order('created_at', { ascending: false })
        if (data) setRequests(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/trade', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            if (!res.ok) throw new Error('Failed')
            addToast('تم تحديث الحالة', 'success')
            fetchData()
        } catch {
            addToast('حدث خطأ', 'error')
        }
    }

    const handleReplySubmit = async () => {
        if (!replyModal) return
        try {
            const sb = createClient()
            const { error } = await sb.from('trade_requests').update({
                admin_reply: replyModal.text,
                reply_at: new Date().toISOString()
            }).eq('id', replyModal.id)
            if (error) throw error
            addToast('تم إرسال الرد للعميل', 'success')
            setReplyModal(null)
            fetchData()
        } catch {
            addToast('حدث خطأ أثناء إرسال الرد', 'error')
        }
    }

    return (
        <div className="pb-10">
            <div className="flex items-center gap-3 mb-8">
                <RefreshCcw className="text-cyan-400" size={28} />
                <h1 className="text-3xl font-black text-white">طلبات الاستبدال</h1>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--neon)] border-t-transparent rounded-full animate-spin" /></div>
            ) : requests.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center text-[var(--text-muted)] text-xl">لا توجد طلبات استبدال حالياً</div>
            ) : (
                <div className="flex flex-col gap-6">
                    {requests.map(r => (
                        <div key={r.id} className="glass rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="font-bold text-white text-xl">{r.customer_name}</h3>
                                    <p className="text-[var(--text-muted)] font-mono">{r.customer_phone}</p>
                                </div>
                                <select
                                    value={r.status}
                                    onChange={e => updateStatus(r.id, e.target.value)}
                                    className={`px-6 py-2 rounded-xl border font-bold text-sm min-h-[44px] appearance-none cursor-pointer bg-[var(--bg)] transition-all ${statusColors[r.status] || ''}`}
                                >
                                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block mb-1">الجهاز القديم</span>
                                    <span className="text-white font-bold">{r.device_model}</span>
                                    <div className="mt-1 inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] text-gray-300">
                                        {conditionLabels[r.device_condition] || r.device_condition}
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1">البطارية</span>
                                        <span className="text-white font-bold">{r.battery_health ? `${r.battery_health}%` : 'N/A'}</span>
                                    </div>
                                    <Battery size={20} className={r.battery_health && r.battery_health < 80 ? 'text-red-400' : 'text-green-400'} />
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block mb-1">الجهاز المطلوب</span>
                                    <span className="text-[var(--neon-cyan)] font-bold">{r.desired_model}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <ReceiptText size={16} className={r.tax_exempt ? 'text-gray-500' : 'text-cyan-400'} />
                                        <span className="text-xs text-white font-bold">{r.tax_exempt ? 'معفي من الضريبة' : `ضريبة: ${r.tax_value} ج`}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className={r.has_warranty ? 'text-green-400' : 'text-red-400'} />
                                        <span className="text-xs text-white font-bold">{r.has_warranty ? `ضمان: ${r.warranty_months} شهر` : 'بدون ضمان'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setReplyModal({ id: r.id, text: r.admin_reply || '' })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${r.admin_reply ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                    >
                                        <MessageSquare size={16} />
                                        {r.admin_reply ? 'تعديل الرد' : 'رد على العميل'}
                                    </button>
                                    {r.created_at && (
                                        <p className="text-xs text-gray-500 hidden sm:block">
                                            {new Date(r.created_at).toLocaleString('ar-EG', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-700 font-mono">ID: {r.id.slice(0, 8)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {replyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setReplyModal(null)} />
                    <div className="relative glass rounded-[2rem] p-8 w-full max-w-lg border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                <MessageSquare className="text-green-400" />
                                رد على العميل
                            </h2>
                            <button onClick={() => setReplyModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <textarea
                                value={replyModal.text}
                                onChange={(e) => setReplyModal({ ...replyModal, text: e.target.value })}
                                placeholder="اكتب ردك هنا ليعرفه العميل من خلال تتبع الطلب..."
                                rows={5}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:border-green-400 focus:outline-none resize-none"
                            />
                            <button
                                onClick={handleReplySubmit}
                                className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                            >
                                <Send size={18} /> إرسال الرد
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
