import { createClient } from '@/lib/supabase/server'
import { Package, PenTool, RefreshCcw, FileText } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    const [productsRes, maintRes, tradeRes, logsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('maintenance_requests').select('id', { count: 'exact', head: true }),
        supabase.from('trade_requests').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
    ])

    const stats = [
        { label: 'المنتجات', count: productsRes.count || 0, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'طلبات الصيانة', count: maintRes.count || 0, icon: PenTool, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'طلبات الاستبدال', count: tradeRes.count || 0, icon: RefreshCcw, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
        { label: 'سجل العمليات', count: logsRes.count || 0, icon: FileText, color: 'text-green-400', bg: 'bg-green-400/10' },
    ]

    return (
        <div>
            <h1 className="text-3xl font-black text-white mb-10">لوحة التحكم</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                {stats.map((s, i) => (
                    <div key={i} className="glass p-8 rounded-2xl border border-[var(--border)] hover:border-white/20 transition-colors group">
                        <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                            <s.icon className={s.color} size={28} />
                        </div>
                        <p className="text-4xl font-black text-white mb-2">{s.count}</p>
                        <p className="text-[var(--text-muted)] font-medium">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
