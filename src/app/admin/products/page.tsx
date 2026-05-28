'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoAddOutline, 
  IoSearchOutline, 
  IoFilterOutline, 
  IoEllipsisHorizontal,
  IoPencilOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoCubeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoStarOutline,
  IoStar
} from 'react-icons/io5'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  category_name_ar: string
  price: number
  original_price?: number
  image_url: string
  in_stock: boolean
  is_featured: boolean
  is_visible: boolean
  created_at: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.category_name_ar.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'all' || p.category_name_ar === filterCategory
    return matchesSearch && matchesCategory
  })

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
        setShowDeleteModal(null)
      }
    } catch (err) {
      console.error('Failed to delete product', err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">إدارة المنتجات</h1>
          <p className="text-gray-400 mt-1">تعديل، إضافة أو حذف المنتجات من المتجر.</p>
        </div>
        <Link href="/admin/products/new">
          <button className="cta-glossy flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl">
            <IoAddOutline className="text-xl" />
            إضافة منتج جديد
          </button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-[24px] border border-white/5 bg-[#0b0f16]/40 backdrop-blur-sm">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو القسم..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-sm text-white outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <IoFilterOutline className="text-gray-500" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-cyan-400/50 transition-colors appearance-none"
          >
            <option value="all" className="bg-[#0b0f16]">كل الأقسام</option>
            {/* Categories would be dynamically loaded here */}
            <option value="iPhone" className="bg-[#0b0f16]">آيفون</option>
            <option value="iPad" className="bg-[#0b0f16]">آيباد</option>
            <option value="MacBook" className="bg-[#0b0f16]">ماك بوك</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-sm font-black text-gray-400">المنتج</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400">القسم</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400">السعر</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">التوفر</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-center">مميز</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
                          <p className="text-gray-500 text-sm font-bold">جارٍ تحميل المنتجات...</p>
                       </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                   <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-50">
                          <IoCubeOutline className="text-6xl text-gray-600" />
                          <p className="text-gray-500 text-sm font-bold">لا توجد منتجات تطابق البحث</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden flex items-center justify-center p-1 group-hover:border-cyan-400/30 transition-colors">
                            <Image 
                              src={p.image_url || '/placeholder.png'} 
                              alt={p.name} 
                              width={40} 
                              height={40} 
                              className="object-contain drop-shadow-lg"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{p.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">ID: {p.id.split('-')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400">
                          {p.category_name_ar}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-sm text-cyan-400">
                        {p.price.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {p.in_stock ? (
                            <IoCheckmarkCircleOutline className="text-emerald-400 text-xl" />
                          ) : (
                            <IoCloseCircleOutline className="text-rose-500 text-xl" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {p.is_featured ? (
                            <IoStar className="text-amber-400 text-lg" />
                          ) : (
                            <IoStarOutline className="text-white/10 text-lg" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                           <Link href={`/products/${p.id}`} target="_blank" className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="معاينة">
                              <IoEyeOutline />
                           </Link>
                           <Link href={`/admin/products/${p.id}`} className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all" title="تعديل">
                              <IoPencilOutline />
                           </Link>
                           <button 
                             onClick={() => setShowDeleteModal(p.id)}
                             className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" 
                             title="حذف"
                           >
                              <IoTrashOutline />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs font-bold text-gray-500">
           <p>عرض {filteredProducts.length} من أصل {products.length} منتج</p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 border border-white/5 disabled:opacity-30 cursor-not-allowed">
                 <IoChevronForwardOutline className="rotate-180" />
              </button>
              <div className="flex items-center gap-1">
                 <span className="w-8 h-8 rounded-lg bg-cyan-400 text-black flex items-center justify-center">١</span>
              </div>
              <button className="p-2 rounded-lg bg-white/5 border border-white/5 disabled:opacity-30 cursor-not-allowed">
                 <IoChevronBackOutline className="rotate-180" />
              </button>
           </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)}></div>
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative w-full max-w-sm rounded-[32px] border border-white/10 bg-[#0f172a] p-8 shadow-2xl text-center"
           >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-6">
                 <IoTrashOutline className="text-3xl" />
              </div>
              <h3 className="text-xl font-black text-white">هل أنت متأكد؟</h3>
              <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                لا يمكن التراجع عن هذه العملية بعد إتمامها. سيتم حذف المنتج نهائياً من قاعدة البيانات.
              </p>
              <div className="mt-8 flex gap-3">
                 <button 
                   onClick={() => handleDelete(showDeleteModal)}
                   className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl transition-colors"
                 >
                   نعم، احذف المنتج
                 </button>
                 <button 
                   onClick={() => setShowDeleteModal(null)}
                   className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl border border-white/5 transition-colors"
                 >
                   تراجع
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  )
}
