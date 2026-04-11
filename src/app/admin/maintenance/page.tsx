'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { PenTool } from 'lucide-react'

type MaintenanceRequest = {
    id: string
    customer_name: string
    phone: string
    device_type: string
    device_model: string
    issue: string
    status: string
    admin_notes: string | null
    created_at: string | null
}

const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    in_progress: 'قيد المعالجة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
}
const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function AdminMaintenancePage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const addToast = useToastStore(s => s.addToast)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const sb = createClient()
        const { data } = await sb.from('maintenance_requests').select('*').order('created_at', { ascending: false })
        if (data) setRequests(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/maintenance', {
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

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <PenTool className="text-purple-400" size={28} />
                <h1 className="text-3xl font-black text-white">طلبات الصيانة</h1>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--neon)] border-t-transparent rounded-full animate-spin" /></div>
            ) : requests.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center text-[var(--text-muted)] text-xl">لا توجد طلبات صيانة حالياً</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {requests.map(r => (
                        <div key={r.id} className="glass rounded-2xl p-6 border border-[var(--border)]">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{r.customer_name}</h3>
                                    <p className="text-[var(--text-muted)] text-sm">{r.phone} • {r.device_type} — {r.device_model}</p>
                                </div>
                                <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className={`px-4 py-2 rounded-xl border font-bold text-sm min-h-[44px] appearance-none cursor-pointer bg-[var(--bg)] ${statusColors[r.status] || ''}`}>
                                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <p className="text-[var(--text-muted)] bg-white/[0.02] p-4 rounded-xl">{r.issue}</p>
                            {r.created_at && <p className="text-xs text-gray-500 mt-3">{new Date(r.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
