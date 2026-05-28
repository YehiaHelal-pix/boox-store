'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoChatbubblesOutline, 
  IoCallOutline, 
  IoPersonOutline,
  IoTimeOutline,
  IoChevronDownOutline,
  IoLogoWhatsapp
} from 'react-icons/io5'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/leads')
      const data = await res.json()
      setLeads(data)
    } catch (err) {
      console.error('Failed to fetch leads', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status } : l))
      }
    } catch (err) {
      console.error('Update status error', err)
    }
  }

  const statusMap: any = {
    new: { label: 'جديد', color: 'bg-blue-500/20 text-blue-400' },
    contacted: { label: 'تم التواصل', color: 'bg-purple-500/20 text-purple-400' },
    deal_done: { label: 'تم البيع', color: 'bg-emerald-500/20 text-emerald-400' },
    no_deal: { label: 'لم يتم الاتفاق', color: 'bg-rose-500/20 text-rose-400' },
    follow_up: { label: 'متابعة', color: 'bg-amber-500/20 text-amber-400' },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">الطلبات والاستفسارات</h1>
        <p className="text-gray-400 mt-1">إدارة تواصل العملاء من "اسأل Boox" والطلبات المباشرة.</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="p-20 text-center text-gray-500 font-bold">جارٍ التحميل...</div>
        ) : leads.length === 0 ? (
          <div className="p-20 text-center text-gray-500 font-bold bg-[#0b0f16]/50 rounded-[32px] border border-white/5">لا توجد طلبات حالياً.</div>
        ) : leads.map((lead) => (
          <motion.div 
            key={lead.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-xl p-8 relative overflow-hidden group"
          >
            <div className="flex flex-col lg:flex-row gap-8">
               <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
                           <IoChatbubblesOutline className="text-2xl" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-white">{lead.customer_name || 'عميل غير مسجل'}</h3>
                           <p className="text-sm text-gray-500 flex items-center gap-1">
                              <IoTimeOutline /> {new Date(lead.created_at).toLocaleString('ar-EG')}
                           </p>
                        </div>
                     </div>
                     <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${statusMap[lead.status || 'new'].color}`}>
                        {statusMap[lead.status || 'new'].label}
                     </span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                     <p className="text-white leading-relaxed">{lead.customer_message || 'بدون رسالة'}</p>
                     {lead.product_name && (
                       <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                          <span className="text-xs text-gray-500">بخصوص:</span>
                          <span className="text-xs font-bold text-cyan-400">{lead.product_name}</span>
                       </div>
                     )}
                  </div>
               </div>

               <div className="lg:w-72 space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">تواصل سريع</label>
                     <div className="grid grid-cols-2 gap-2">
                        <a 
                          href={`tel:${lead.customer_phone}`}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all text-sm font-bold"
                        >
                           <IoCallOutline /> اتصال
                        </a>
                        <a 
                          href={`https://wa.me/2${lead.customer_phone}`}
                          target="_blank"
                          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-sm font-bold"
                        >
                           <IoLogoWhatsapp /> واتساب
                        </a>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">تحديث الحالة</label>
                     <div className="relative">
                        <select 
                          value={lead.status || 'new'}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-cyan-400 appearance-none"
                        >
                           {Object.keys(statusMap).map(status => (
                             <option key={status} value={status} className="bg-[#0f172a]">{statusMap[status].label}</option>
                           ))}
                        </select>
                        <IoChevronDownOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
