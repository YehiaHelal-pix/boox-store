'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Clock, CheckCircle, PenTool, RefreshCcw } from 'lucide-react'

export default function TrackingSection({ type }: { type: 'trade' | 'maintenance' }) {
    const [phone, setPhone] = useState('')
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const table = type === 'trade' ? 'trade_requests' : 'maintenance_requests'

    const fetchRequests = async () => {
        if (!phone) return
        setLoading(true)
        const sb = createClient()
        const { data } = await sb.from(table).select('*').eq(type === 'trade' ? 'customer_phone' : 'phone', phone).order('created_at', { ascending: false })
        setRequests(data || [])
        setHasSearched(true)
        setLoading(false)
    }

    useEffect(() => {
        const sb = createClient()
        const channel = sb.channel(`replies-${type}-${phone}`).on('postgres_changes', {
            event: 'UPDATE', schema: 'public', table: table, filter: `${type === 'trade' ? 'customer_phone' : 'phone'}=eq.${phone}`
        }, (payload) => {
            setRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req))
        }).subscribe()

        return () => { sb.removeChannel(channel) }
    }, [phone, type])

    return (
        <div className="mt-12 w-full max-w-3xl mx-auto glass rounded-[2rem] p-8 border border-white/5 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 text-center">تتبع طلبك</h2>
            <div className="flex gap-4">
                <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="أدخل رقم هاتفك (مثال: 01xxxxxxxxx)"
                    className="flex-grow bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-colors"
                />
                <button
                    onClick={fetchRequests}
                    disabled={loading || !phone}
                    className="bg-[var(--neon)] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
                >
                    {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Search size={18} /> تتبع الطلب</>}
                </button>
            </div>

            {hasSearched && (
                <div className="mt-8 flex flex-col gap-4">
                    {requests.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">لا توجد طلبات مسجلة بهذا الرقم.</p>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                                {req.status === 'completed' && <div className="absolute top-0 right-0 w-1.5 h-full bg-green-500" />}
                                {req.status === 'in_progress' && <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500" />}
                                {req.status === 'pending' && <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            {type === 'trade' ? <RefreshCcw size={20} className="text-white" /> : <PenTool size={20} className="text-white" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white mb-0.5">{type === 'trade' ? `${req.device_model} ← ${req.desired_model}` : `${req.device_type} ${req.device_model}`}</h3>
                                            <p className="text-xs text-gray-400 font-mono">{new Date(req.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {req.status === 'completed' && <span className="bg-green-500/10 text-green-400 px-3 py-1 text-xs rounded-full border border-green-500/20 font-bold flex items-center gap-1"><CheckCircle size={12} /> مكتمل</span>}
                                        {req.status === 'in_progress' && <span className="bg-blue-500/10 text-blue-400 px-3 py-1 text-xs rounded-full border border-blue-500/20 font-bold flex items-center gap-1"><Clock size={12} /> قيد المعالجة</span>}
                                        {req.status === 'pending' && <span className="bg-amber-500/10 text-amber-400 px-3 py-1 text-xs rounded-full border border-amber-500/20 font-bold flex items-center gap-1"><Clock size={12} /> قيد المراجعة</span>}
                                    </div>
                                </div>
                                {type === 'trade' && (
                                    <div className="text-sm text-gray-300 mb-4 bg-black/20 p-3 rounded-lg">الحالة: {req.device_condition} | البطارية: {req.battery_health}%</div>
                                )}
                                {type === 'maintenance' && (
                                    <div className="text-sm text-gray-300 mb-4 bg-black/20 p-3 rounded-lg leading-relaxed">المشكلة: {req.issue}</div>
                                )}

                                {req.admin_reply && (
                                    <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-5 relative">
                                        <div className="absolute -top-3 right-5 bg-[#11111a] px-2 text-green-400 text-xs font-bold border border-green-500/20 rounded-full">رد الإدارة</div>
                                        <p className="text-white text-sm whitespace-pre-line leading-relaxed">{req.admin_reply}</p>
                                        <p className="text-[10px] text-gray-500 mt-2 font-mono text-left" dir="ltr">{new Date(req.reply_at).toLocaleString('en-US')}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
