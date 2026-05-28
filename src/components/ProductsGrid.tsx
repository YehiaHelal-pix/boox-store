'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from './ProductCard'
import { Sliders, X, RefreshCw } from 'lucide-react'

type EventWithDetail = Event & { detail: string }

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ProductsGrid() {
  const { products, loading, error } = useProducts()
  const [curCat, setCurCat] = useState('all')
  const [searchQ, setSearchQ] = useState('')
  const { ref: gridRef, inView } = useInView({ triggerOnce: true, threshold: 0.05 })

  // E-commerce Filters State
  const [priceFilter, setPriceFilter] = useState<number>(75000)
  const [batteryFilter, setBatteryFilter] = useState<number>(75)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedStorages, setSelectedStorages] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Listen to external triggers (Categories pills, Navbar Search)
  useEffect(() => {
    const handleCat = (event: Event) => setCurCat((event as EventWithDetail).detail)
    const handleSearch = (event: Event) => setSearchQ(((event as EventWithDetail).detail || '').toLowerCase())

    window.addEventListener('boox-category', handleCat)
    window.addEventListener('boox-search', handleSearch)

    return () => {
      window.removeEventListener('boox-category', handleCat)
      window.removeEventListener('boox-search', handleSearch)
    }
  }, [])

  // Auto-dispatch product stats count on products loaded
  useEffect(() => {
    if (!loading) {
      const available = products.filter((product) => product.is_available && product.is_visible).length
      window.dispatchEvent(new CustomEvent('boox-stats', { detail: available }))
    }
  }, [products, loading])

  // Combine category selection, text search and e-commerce sliders
  const filtered = products.filter((product) => {
    const matchCat = curCat === 'all' || product.category === curCat
    
    const haystack = [product.name, product.device_model, product.description ?? '', product.color, product.storage_size]
      .join(' ')
      .toLowerCase()
    const matchSearch = !searchQ || haystack.includes(searchQ)

    // Battery health filter (ignore accessories or items without battery health)
    const matchBattery = !product.battery_health || product.battery_health >= batteryFilter

    // Condition / Grade filter
    const matchCondition = selectedConditions.length === 0 || selectedConditions.includes(product.condition)

    // Storage filter
    const matchStorage = selectedStorages.length === 0 || 
      selectedStorages.some(s => product.storage_size?.toLowerCase().includes(s.toLowerCase()))

    // Price filter (ignore price if on inquiry)
    const matchPrice = product.price_on_inquiry || product.price === null || product.price <= priceFilter

    return matchCat && matchSearch && matchBattery && matchCondition && matchStorage && matchPrice
  })

  const resetFilters = () => {
    setPriceFilter(75000)
    setBatteryFilter(75)
    setSelectedConditions([])
    setSelectedStorages([])
  }

  const FilterPanelContent = ({ isMobile = false }) => (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Reset Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Sliders size={16} className="text-cyan-400" />
          <span>تصفية النتائج</span>
        </h3>
        <button 
          onClick={resetFilters}
          className="text-[11px] text-gray-400 hover:text-cyan-400 transition flex items-center gap-1 font-bold"
        >
          <RefreshCw size={10} />
          <span>مسح الفلاتر</span>
        </button>
      </div>

      {/* Price Slider */}
      <div>
        <label className="text-xs font-bold text-gray-300 block mb-2.5">💰 الحد الأقصى للسعر:</label>
        <input 
          type="range" 
          min={5000} 
          max={90000} 
          step={1000}
          value={priceFilter}
          onChange={e => setPriceFilter(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-bold">
          <span>5,000 ج</span>
          <span className="text-cyan-400">{priceFilter.toLocaleString('ar-EG')} ج.م</span>
        </div>
      </div>

      {/* Battery Health Slider */}
      <div>
        <label className="text-xs font-bold text-gray-300 block mb-2.5">🔋 صحة البطارية الأدنى:</label>
        <input 
          type="range" 
          min={75} 
          max={100} 
          value={batteryFilter}
          onChange={e => setBatteryFilter(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-bold">
          <span>75%</span>
          <span className="text-cyan-400">{batteryFilter}%</span>
        </div>
      </div>

      {/* Condition Checklist */}
      <div>
        <label className="text-xs font-bold text-gray-300 block mb-3">✨ حالة الجهاز:</label>
        <div className="flex flex-col gap-2.5">
          {[
            { key: 'new', label: 'جديد (مغلف)' },
            { key: 'like_new', label: 'كسر زيرو (ممتاز)' },
            { key: 'good', label: 'مستعمل (حالة جيدة)' },
            { key: 'fair', label: 'مستعمل (مقبول)' }
          ].map(item => {
            const checked = selectedConditions.includes(item.key)
            return (
              <label key={item.key} className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-400 hover:text-white font-medium transition-colors">
                <input 
                  type="checkbox" 
                  checked={checked}
                  onChange={() => {
                    setSelectedConditions(prev => 
                      checked ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )
                  }}
                  className="rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                />
                <span>{item.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Storage Size Pills */}
      <div>
        <label className="text-xs font-bold text-gray-300 block mb-3">💾 سعة التخزين المتاحة:</label>
        <div className="flex flex-wrap gap-2">
          {['64GB', '128GB', '256GB', '512GB', '1TB'].map(size => {
            const active = selectedStorages.includes(size)
            return (
              <button
                key={size}
                onClick={() => {
                  setSelectedStorages(prev => 
                    active ? prev.filter(s => s !== size) : [...prev, size]
                  )
                }}
                className={`py-1.5 px-3.5 rounded-xl border text-[11px] font-bold transition-all duration-200 ${
                  active
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                    : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <section id="products" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-24" dir="rtl">
      {/* Segment Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/5">
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-black text-white">
            <span className="neon-underline">🛍️ الكتالوج الرئيسي</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">استكشف أفضل أجهزة آبل المتوفرة بمصر بأسعار لا تقبل المنافسة</p>
        </div>
        <div className="glass px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-400 self-start md:self-auto border border-white/5">
          {filtered.length} جهاز جاهز للشراء
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Panel (Desktop sidebar - width 1 column) */}
        <aside className="hidden lg:block lg:col-span-1 glass-card p-6 rounded-3xl border border-white/10 sticky top-24">
          <FilterPanelContent />
        </aside>

        {/* Products Grid (Width 3 columns) */}
        <div className="lg:col-span-3" ref={gridRef}>
          {loading ? (
            <div className="products-loading flex items-center justify-center py-24">
              <div className="spinner w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="products-empty text-center py-20 glass rounded-3xl border border-white/5">
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="products-empty flex flex-col items-center justify-center gap-4 py-24 glass rounded-3xl border border-white/5">
              <div className="text-5xl opacity-40">🔍</div>
              <p className="text-base text-gray-400 font-black">عفوًا! لا توجد منتجات مطابقة للتصفية</p>
              <p className="text-xs text-gray-500">حاول تقليل فلاتر البحث أو تغيير الكود</p>
              <button 
                onClick={resetFilters}
                className="mt-2 text-xs font-bold bg-cyan-400/10 border border-cyan-400/25 px-4 py-2 rounded-xl text-cyan-400 hover:bg-cyan-400/20 transition-all"
              >
                إلغاء الفلاتر
              </button>
            </div>
          ) : (
            <motion.div
              className="products-grid"
              id="pr-grid"
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'show' : 'hidden'}
            >
              {filtered.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard p={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Filter Button (Mobile Screen only) */}
      <div className="lg:hidden fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-5 py-4 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 border border-white/15 text-white text-xs font-black shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Sliders size={14} />
          <span>تصفية الأجهزة</span>
        </button>
      </div>

      {/* Mobile Glass Drawer Modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden" dir="rtl">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black"
            />
            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-[85vw] max-w-[340px] h-full bg-[#070714] border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="absolute top-4 left-4 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
                <div className="mt-8">
                  <FilterPanelContent isMobile={true} />
                </div>
              </div>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-8 bg-cyan-400 text-black font-black text-xs py-3.5 rounded-2xl shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/25 transition-all duration-300"
              >
                تطبيق فلاتر التصفية ({filtered.length})
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
