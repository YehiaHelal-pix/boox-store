'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoAddOutline, 
  IoFilterOutline, 
  IoPencilOutline, 
  IoTrashOutline,
  IoCloseOutline
} from 'react-icons/io5'

export default function AdminFiltersPage() {
  const [filters, setFilters] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFilter, setEditingFilter] = useState<any>(null)
  const [formData, setFormData] = useState({
    category_id: '',
    field_name: '',
    label_ar: '',
    filter_type: 'select',
    filter_options: [],
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [filtersRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/filters'),
        fetch('/api/categories')
      ])
      const filtersData = await filtersRes.json()
      const categoriesData = await categoriesRes.json()
      setFilters(filtersData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (filter?: any) => {
    if (filter) {
      setEditingFilter(filter)
      setFormData({
        category_id: filter.category_id || '',
        field_name: filter.field_name,
        label_ar: filter.label_ar,
        filter_type: filter.filter_type || 'select',
        filter_options: filter.filter_options || [],
        display_order: filter.display_order || 0,
        is_active: filter.is_active
      })
    } else {
      setEditingFilter(null)
      setFormData({
        category_id: '',
        field_name: '',
        label_ar: '',
        filter_type: 'select',
        filter_options: [],
        display_order: 0,
        is_active: true
      })
    }
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editingFilter ? 'PUT' : 'POST'
    const url = editingFilter ? `/api/admin/filters/${editingFilter.id}` : '/api/admin/filters'
    
    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        setIsModalOpen(false)
        fetchData()
      }
    } catch (err) {
      console.error('Submit error', err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">إدارة الفلاتر</h1>
          <p className="text-gray-400 mt-1">تحديد فلاتر البحث المخصصة لكل قسم.</p>
        </div>
        <button onClick={() => openModal()} className="cta-glossy flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl">
          <IoAddOutline className="text-xl" /> إضافة فلتر جديد
        </button>
      </div>

      <div className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
         <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-sm font-black text-gray-400">الفلتر</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400">القسم</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400">الحقل</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center">جارٍ التحميل...</td></tr>
              ) : filters.map((f) => (
                <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{f.label_ar}</td>
                  <td className="px-6 py-4 text-xs text-cyan-400 font-bold">{f.category?.name_ar || 'عام'}</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{f.field_name}</td>
                  <td className="px-6 py-4 text-left">
                     <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(f)} className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all"><IoPencilOutline /></button>
                        <button className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><IoTrashOutline /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg rounded-[36px] border border-white/10 bg-[#0f172a] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white mb-8">{editingFilter ? 'تعديل الفلتر' : 'إضافة فلتر جديد'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-400">الاسم بالعربي</label>
                       <input type="text" value={formData.label_ar} onChange={(e) => setFormData({...formData, label_ar: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-400">اسم الحقل (DB Field)</label>
                       <input type="text" value={formData.field_name} onChange={(e) => setFormData({...formData, field_name: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">القسم المرتبط</label>
                    <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50">
                       <option value="">كل الأقسام (عام)</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-cyan-400 text-black font-black py-4 rounded-2xl">حفظ الفلتر</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
