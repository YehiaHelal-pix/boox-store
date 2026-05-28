'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  IoSaveOutline, 
  IoEyeOutline, 
  IoEyeOffOutline,
  IoSettingsOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  async function fetchSections() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/homepage')
      const data = await res.json()
      setSections(data)
    } catch (err) {
      console.error('Failed to fetch sections', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(id: string, updateData: any) {
    setSaving(id)
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        body: JSON.stringify({ id, ...updateData }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        setSections(sections.map(s => s.id === id ? { ...s, ...updateData } : s))
      }
    } catch (err) {
      console.error('Update error', err)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">إدارة الصفحة الرئيسية</h1>
        <p className="text-gray-400 mt-1">تخصيص العناوين وترتيب الأقسام في واجهة المتجر.</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="p-20 text-center text-gray-500 font-bold">جارٍ التحميل...</div>
        ) : sections.map((section) => (
          <div key={section.id} className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-xl p-8 group">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
               <div className="flex-1 space-y-6 w-full">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
                           <IoSettingsOutline className="text-xl" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-white">{section.section_key}</h3>
                           <p className="text-xs text-gray-500 uppercase tracking-widest">Display Order: {section.display_order}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => handleUpdate(section.id, { is_active: !section.is_active })}
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                         section.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                       }`}
                     >
                        {section.is_active ? <IoEyeOutline /> : <IoEyeOffOutline />}
                        {section.is_active ? 'ظاهر' : 'مخفي'}
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">العنوان بالعربي</label>
                        <input 
                          type="text" 
                          defaultValue={section.title_ar}
                          onBlur={(e) => handleUpdate(section.id, { title_ar: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50 transition-colors"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">العنوان الفرعي بالعربي</label>
                        <input 
                          type="text" 
                          defaultValue={section.subtitle_ar}
                          onBlur={(e) => handleUpdate(section.id, { subtitle_ar: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50 transition-colors"
                        />
                     </div>
                  </div>
               </div>

               <div className="flex lg:flex-col gap-2">
                  {saving === section.id ? (
                    <div className="p-3 rounded-xl bg-cyan-400/10 text-cyan-400 animate-pulse font-bold text-xs">جارٍ الحفظ...</div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 text-gray-500 flex items-center gap-2 text-xs font-bold">
                       <IoCheckmarkCircle className="text-emerald-400" /> تم الحفظ
                    </div>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
