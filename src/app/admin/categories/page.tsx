'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoAddOutline, 
  IoPencilOutline, 
  IoTrashOutline,
  IoLayersOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'
import type { Category } from '@/types/database'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (Array.isArray(data)) {
        setCategories(data)
      }
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        name_ar: category.name_ar || '',
        slug: category.slug,
        description: category.description || '',
        is_active: category.is_active
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        name_ar: '',
        slug: '',
        description: '',
        is_active: true
      })
    }
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editingCategory ? 'PUT' : 'POST'
    const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
    
    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        setIsModalOpen(false)
        fetchCategories()
      } else {
        const err = await res.json()
        alert(err.error || 'حدث خطأ ما')
      }
    } catch (err) {
      console.error('Submit error', err)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCategories()
      } else {
        const err = await res.json()
        alert(err.error || 'فشل الحذف')
      }
    } catch (err) {
      console.error('Delete error', err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">إدارة التصنيفات</h1>
          <p className="text-gray-400 mt-1">تنظيم المنتجات في أقسام لتسهيل التصفح.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="cta-glossy flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl"
        >
          <IoAddOutline className="text-xl" />
          إضافة تصنيف جديد
        </button>
      </div>

      <div className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-sm font-black text-gray-400">اسم التصنيف</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400">الرابط (Slug)</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400">الحالة</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">جارٍ التحميل...</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                          <IoLayersOutline className="text-xl" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">{cat.name_ar}</p>
                          <p className="text-[10px] text-gray-500">{cat.name}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">{cat.slug}</td>
                  <td className="px-6 py-4">
                    {cat.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <IoCheckmarkCircleOutline /> نشط
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-xs font-bold">
                        <IoCloseCircleOutline /> معطل
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openModal(cat)} className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all">
                          <IoPencilOutline />
                       </button>
                       <button onClick={() => handleDelete(cat.id)} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                          <IoTrashOutline />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-[36px] border border-white/10 bg-[#0f172a] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white">{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition-colors">
                  <IoCloseOutline className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">الاسم (English)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50"
                      placeholder="e.g. iPhone"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">الاسم (عربي)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name_ar}
                      onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50"
                      placeholder="مثلاً: آيفون"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">الرابط (Slug)</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50"
                    placeholder="iphone-deals"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">الوصف</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-400/50 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                   <input 
                     type="checkbox" 
                     checked={formData.is_active}
                     onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                     className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" 
                   />
                   <label className="text-sm font-bold text-white">تصنيف نشط ومتاح في المتجر</label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-cyan-400/10"
                >
                  {editingCategory ? 'حفظ التعديلات' : 'إنشاء التصنيف'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
