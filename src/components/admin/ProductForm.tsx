'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoSaveOutline, 
  IoArrowBackOutline,
  IoInformationCircleOutline,
  IoImageOutline,
  IoBuildOutline,
  IoCashOutline,
  IoEyeOutline,
  IoSearchOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Category, ProductRow } from '@/types/database'

interface ProductFormProps {
  initialData?: Partial<ProductRow>
  categories: Category[]
  mode: 'create' | 'edit'
}

const tabs = [
  { id: 'basic', label: 'معلومات أساسية', icon: IoInformationCircleOutline },
  { id: 'images', label: 'الصور', icon: IoImageOutline },
  { id: 'specs', label: 'المواصفات', icon: IoBuildOutline },
  { id: 'price', label: 'السعر والتوفر', icon: IoCashOutline },
  { id: 'visibility', label: 'الظهور', icon: IoEyeOutline },
  { id: 'seo', label: 'SEO', icon: IoSearchOutline },
]

export default function ProductForm({ initialData, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({
    name: '',
    name_ar: '',
    slug: '',
    category_id: '',
    brand: 'Apple',
    model: '',
    model_year: new Date().getFullYear(),
    short_description: '',
    full_description: '',
    images: [],
    storage_size: '',
    battery_health: 100,
    condition: 'new',
    color: '',
    network_type: 'unlocked',
    sim_type: 'Physical SIM + eSIM',
    region: 'Global',
    face_id_status: true,
    screen_condition: 'Excellent',
    body_condition: 'Excellent',
    processor: '',
    ram: '',
    battery_cycles: 0,
    screen_size: '',
    highlights: [],
    in_the_box: ['الجهاز', 'كابل الشحن'],
    price: 0,
    original_price: 0,
    internal_price: 0,
    purchase_price: 0,
    price_hidden: false,
    discount_percentage: 0,
    is_available: true,
    in_stock: true,
    warranty_days: 365,
    is_featured: false,
    is_new_arrival: true,
    is_best_seller: false,
    show_on_homepage: true,
    homepage_section: 'latest',
    display_order: 0,
    badge_text: '',
    badge_color: '#06b6d4',
    meta_title: '',
    meta_description: '',
    internal_notes: '',
    ...initialData
  })

  const [files, setFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    // Also remove from files if it's a new one
    // (Simplification: logic to track which index is file vs existing URL)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const submissionData = new FormData()
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((item: any) => submissionData.append(key, item))
      } else {
        submissionData.append(key, String(formData[key]))
      }
    })

    files.forEach(file => submissionData.append('files', file))
    
    // Track existing images that weren't deleted
    imagePreviews.forEach(url => {
      if (url.startsWith('http')) submissionData.append('existingImages', url)
    })

    try {
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const res = await fetch(url, {
        method,
        body: submissionData
      })

      if (res.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'حدث خطأ أثناء حفظ المنتج')
      }
    } catch (err) {
      console.error('Submit error', err)
      alert('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors">
            <IoArrowBackOutline className="text-xl rotate-180" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">{mode === 'create' ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h1>
            <p className="text-gray-400 mt-1">{formData.name || 'أدخل بيانات المنتج'}</p>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="cta-glossy flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <IoSaveOutline className="text-xl" />
          )}
          {mode === 'create' ? 'حفظ المنتج الجديد' : 'حفظ التعديلات'}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                isActive ? 'text-cyan-400 border-cyan-400 bg-cyan-400/5' : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-xl p-8 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="اسم المنتج (English)" name="name" value={formData.name} onChange={handleChange} placeholder="iPhone 15 Pro Max" required />
                <FormField label="اسم المنتج (عربي)" name="name_ar" value={formData.name_ar} onChange={handleChange} placeholder="أيفون 15 برو ماكس" />
                <FormField label="Slug (الرابط)" name="slug" value={formData.slug} onChange={handleChange} placeholder="iphone-15-pro-max" />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-400">التصنيف</label>
                  <select 
                    name="category_id" 
                    value={formData.category_id} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-400/50 transition-colors appearance-none"
                  >
                    <option value="">اختر التصنيف...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                    ))}
                  </select>
                </div>
                <FormField label="الماركة" name="brand" value={formData.brand} onChange={handleChange} />
                <FormField label="الموديل" name="model" value={formData.model} onChange={handleChange} />
                <FormField label="سنة الموديل" name="model_year" type="number" value={formData.model_year} onChange={handleChange} />
                <div className="md:col-span-2">
                   <label className="text-sm font-bold text-gray-400 block mb-2">وصف قصير</label>
                   <textarea 
                     name="short_description" 
                     value={formData.short_description} 
                     onChange={handleChange}
                     rows={3}
                     className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-400/50 transition-colors resize-none"
                   />
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-8">
                <div 
                  className="border-2 border-dashed border-white/10 rounded-[32px] p-12 text-center hover:border-cyan-400/30 transition-colors cursor-pointer group"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                  <div className="w-20 h-20 rounded-full bg-cyan-400/10 flex items-center justify-center mx-auto mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                    <IoImageOutline className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-black text-white">رفع صور المنتج</h3>
                  <p className="text-gray-500 mt-2">اسحب الصور هنا أو اضغط للاختيار. يمكنك اختيار أكثر من صورة.</p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/5 bg-white/5">
                        <img src={url} alt={`Preview ${i}`} className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <button type="button" onClick={() => removeImage(i)} className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                              <IoTrashOutline />
                           </button>
                        </div>
                        {i === 0 && (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-cyan-400 text-black text-[10px] font-black uppercase">الأساسية</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="المساحة (Storage)" name="storage_size" value={formData.storage_size} onChange={handleChange} placeholder="256GB" />
                <FormField label="صحة البطارية (%)" name="battery_health" type="number" value={formData.battery_health} onChange={handleChange} />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-400">الحالة</label>
                  <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-400/50">
                    <option value="new">جديد (New)</option>
                    <option value="like_new">كسر زيرو (Like New)</option>
                    <option value="good">جيد جداً (Good)</option>
                    <option value="fair">مقبول (Fair)</option>
                  </select>
                </div>
                <FormField label="اللون" name="color" value={formData.color} onChange={handleChange} />
                <FormField label="نوع الشبكة" name="network_type" value={formData.network_type} onChange={handleChange} />
                <FormField label="نوع الشريحة" name="sim_type" value={formData.sim_type} onChange={handleChange} />
                <FormField label="المنطقة (Region)" name="region" value={formData.region} onChange={handleChange} />
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-gray-400">Face ID</label>
                   <select name="face_id_status" value={String(formData.face_id_status)} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-400/50">
                      <option value="true">يعمل (Working)</option>
                      <option value="false">لا يعمل (Not Working)</option>
                   </select>
                </div>
                <FormField label="حالة الشاشة" name="screen_condition" value={formData.screen_condition} onChange={handleChange} />
                <FormField label="حالة الجسم" name="body_condition" value={formData.body_condition} onChange={handleChange} />
                <FormField label="المعالج" name="processor" value={formData.processor} onChange={handleChange} />
                <FormField label="الرام" name="ram" value={formData.ram} onChange={handleChange} />
                <FormField label="عدد دورات الشحن" name="battery_cycles" type="number" value={formData.battery_cycles} onChange={handleChange} />
                <FormField label="حجم الشاشة" name="screen_size" value={formData.screen_size} onChange={handleChange} />
              </div>
            )}

            {activeTab === 'price' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="سعر البيع الحالي (EGP)" name="price" type="number" value={formData.price} onChange={handleChange} required />
                <FormField label="السعر القديم (للعرض فقط)" name="original_price" type="number" value={formData.original_price} onChange={handleChange} />
                <FormField label="السعر الداخلي (الخاص بنا)" name="internal_price" type="number" value={formData.internal_price} onChange={handleChange} />
                <FormField label="سعر الشراء (للحسابات فقط)" name="purchase_price" type="number" value={formData.purchase_price} onChange={handleChange} />
                <FormField label="نسبة الخصم (%)" name="discount_percentage" type="number" value={formData.discount_percentage} onChange={handleChange} />
                <FormField label="عدد أيام الضمان" name="warranty_days" type="number" value={formData.warranty_days} onChange={handleChange} />
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <input type="checkbox" name="price_hidden" checked={formData.price_hidden} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" />
                   <label className="text-sm font-bold text-white">إخفاء السعر (السعر عند الطلب)</label>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" />
                   <label className="text-sm font-bold text-white">المنتج متاح حالياً</label>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <input type="checkbox" name="in_stock" checked={formData.in_stock} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" />
                   <label className="text-sm font-bold text-white">متوفر في المخزون</label>
                </div>
              </div>
            )}

            {activeTab === 'visibility' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" />
                   <label className="text-sm font-bold text-white">تمييز المنتج (Featured)</label>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <input type="checkbox" name="is_new_arrival" checked={formData.is_new_arrival} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" />
                   <label className="text-sm font-bold text-white">وصل حديثاً (New Arrival)</label>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <input type="checkbox" name="is_best_seller" checked={formData.is_best_seller} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" />
                   <label className="text-sm font-bold text-white">الأكثر مبيعاً (Best Seller)</label>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <input type="checkbox" name="show_on_homepage" checked={formData.show_on_homepage} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-400 focus:ring-0" />
                   <label className="text-sm font-bold text-white">عرض في الصفحة الرئيسية</label>
                </div>
                <FormField label="قسم الصفحة الرئيسية" name="homepage_section" value={formData.homepage_section} onChange={handleChange} />
                <FormField label="ترتيب العرض" name="display_order" type="number" value={formData.display_order} onChange={handleChange} />
                <FormField label="نص الشارة (Badge Text)" name="badge_text" value={formData.badge_text} onChange={handleChange} placeholder="مثلاً: خصم لفترة محدودة" />
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-gray-400 block">لون الشارة</label>
                   <div className="flex gap-4 items-center">
                      <input type="color" name="badge_color" value={formData.badge_color} onChange={handleChange} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer" />
                      <span className="text-sm font-bold text-white font-mono uppercase">{formData.badge_color}</span>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <FormField label="عنوان الـ SEO (Meta Title)" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="أدخل عنوان الصفحة لمحركات البحث" />
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-gray-400 block mb-2">وصف الـ SEO (Meta Description)</label>
                   <textarea 
                     name="meta_description" 
                     value={formData.meta_description} 
                     onChange={handleChange}
                     rows={4}
                     className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-400/50 transition-colors resize-none"
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-gray-400 block mb-2">ملاحظات داخلية (للموظفين فقط)</label>
                   <textarea 
                     name="internal_notes" 
                     value={formData.internal_notes} 
                     onChange={handleChange}
                     rows={4}
                     className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-400/50 transition-colors resize-none"
                   />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </form>
  )
}

function FormField({ label, name, value, onChange, type = 'text', placeholder = '', required = false }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-400 block">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-400/50 transition-colors"
      />
    </div>
  )
}
