import { createClient } from '@/lib/supabase/server'
import { FileText } from 'lucide-react'

export default async function AdminLogsPage() {
    const supabase = await createClient()
    const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <FileText className="text-green-400" size={28} />
                <h1 className="text-3xl font-black text-white">سجل العمليات</h1>
            </div>

            {!logs || logs.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center text-[var(--text-muted)] text-xl">لا توجد عمليات مسجلة حالياً</div>
            ) : (
                <div className="overflow-x-auto glass rounded-2xl border border-[var(--border)]">
                    <table className="w-full text-right">
                        <thead className="border-b border-[var(--border)] bg-white/[0.02]">
                            <tr>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4">الإجراء</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4">الجدول</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4 hidden md:table-cell">البريد</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="border-b border-[var(--border)] hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-white font-bold text-sm">{log.action}</td>
                                    <td className="p-4"><span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[var(--text-muted)] border border-[var(--border)]">{log.table_name || '—'}</span></td>
                                    <td className="p-4 text-[var(--text-muted)] text-sm hidden md:table-cell">{log.admin_email}</td>
                                    <td className="p-4 text-xs text-gray-500">{log.created_at ? new Date(log.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
