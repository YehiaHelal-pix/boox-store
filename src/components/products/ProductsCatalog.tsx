'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductGrid from '@/components/products/ProductGrid'
import ProductSkeleton from '@/components/products/ProductSkeleton'
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
    Battery,
    Cpu,
    Smartphone,
    Wifi,
    Trash2,
    Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Constants for filters
const MODELS = ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'Pro', 'Pro Max']
const CONDITIONS = [
    { id: 'excellent', label: 'ممتاز' },
    { id: 'good', label: 'جيد جداً' },
    { id: 'fair', label: 'جيد' }
]
const BATTERIES = [70, 80, 85, 90, 95]
const STORAGES = ['128GB', '256GB', '512GB', '1TB']
const NETWORKS = [
    { id: 'unlocked', label: 'مفتوح' },
    { id: 'vodafone', label: 'فودافون' },
    { id: 'orange', label: 'أورنج' },
    { id: 'etisalat', label: 'اتصالات' },
    { id: 'we', label: 'وي' }
]
const COLORS = [
    { name: 'أسود', hex: '#1a1a1a' },
    { name: 'أبيض', hex: '#f2f2f2' },
    { name: 'ذهبي', hex: '#f5d78e' },
    { name: 'رمادي', hex: '#4a4a4a' },
    { name: 'أزرق', hex: '#4a90d9' },
    { name: 'فضي', hex: '#c0c0c0' },
    { name: 'جرافيت', hex: '#383838' },
    { name: 'وردي', hex: '#ffb6c1' }
]

export default function ProductsCatalog({ initialProducts }: { initialProducts: any[] }) {
    const products = initialProducts;
    const loading = false;
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Helper to get active filters from URL
    const getActive = useCallback((key: string): string[] => {
        const val = searchParams.get(key)
        return val ? val.split(',') : []
    }, [searchParams])

    const activeModels = getActive('model')
    const activeConditions = getActive('condition')
    const activeStorages = getActive('storage')
    const activeNetworks = getActive('network')
    const activeColors = getActive('color')
    const minPrice = Number(searchParams.get('minPrice')) || 0
    const maxPrice = Number(searchParams.get('maxPrice')) || 100000
    const minBattery = Number(searchParams.get('minBattery')) || 0

    // Update URL params
    const updateParams = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === null || value === '' || value === '0') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [searchParams, router, pathname])

    const toggleArrayFilter = (key: string, value: string) => {
        const current = getActive(key)
        const updated = current.includes(value)
            ? current.filter(i => i !== value)
            : [...current, value]
        updateParams(key, updated.length > 0 ? updated.join(',') : null)
    }

    const clearAll = () => {
        router.push(pathname)
        setSearchTerm('')
    }

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            // Search
            if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false

            // Model
            if (activeModels.length > 0 && !activeModels.some(m => p.model?.toLowerCase().includes(m.toLowerCase()))) return false

            // Condition
            if (activeConditions.length > 0 && !activeConditions.includes(p.condition)) return false

            // Storage
            if (activeStorages.length > 0 && !activeStorages.includes(p.storage)) return false

            // Network
            if (activeNetworks.length > 0 && !activeNetworks.includes(p.network)) return false

            // Color
            if (activeColors.length > 0 && !activeColors.includes(p.color)) return false

            // Price
            if (p.price < minPrice || p.price > maxPrice) return false

            // Battery
            if (p.battery_health < minBattery) return false

            return true
        })

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price
            if (sortBy === 'price_desc') return b.price - a.price
            if (sortBy === 'battery') return b.battery_health - a.battery_health
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        return result
    }, [products, debouncedSearch, activeModels, activeConditions, activeStorages, activeNetworks, activeColors, minPrice, maxPrice, minBattery, sortBy])

    const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className={`flex flex-col gap-8 ${isMobile ? 'p-6 pb-20' : 'p-2'}`}>
            {/* Search */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">البحث</label>
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--neon-cyan)] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن جهاز..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-[var(--neon-cyan)] focus:ring-1 focus:ring-[var(--neon-cyan)] outline-none transition-all text-sm"
                    />
                </div>
            </div>

            {/* Price Range */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">السعر (جنيه)</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="من"
                        value={minPrice || ''}
                        onChange={(e) => updateParams('minPrice', e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                    />
                    <input
                        type="number"
                        placeholder="إلى"
                        value={maxPrice === 100000 ? '' : maxPrice}
                        onChange={(e) => updateParams('maxPrice', e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                    />
                </div>
            </div>

            {/* Models */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">الموديل</label>
                <div className="flex flex-wrap gap-2">
                    {MODELS.map(m => (
                        <button
                            key={m}
                            onClick={() => toggleArrayFilter('model', m)}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all border ${activeModels.includes(m)
                                ? 'bg-[var(--neon-cyan)]/20 border-[var(--neon-cyan)] text-[var(--neon-cyan)] font-bold'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">الحالة</label>
                <div className="space-y-2">
                    {CONDITIONS.map(c => (
                        <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeConditions.includes(c.id)}
                                onChange={() => toggleArrayFilter('condition', c.id)}
                                className="hidden"
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeConditions.includes(c.id)
                                ? 'bg-[var(--neon-cyan)] border-[var(--neon-cyan)]'
                                : 'border-white/20 group-hover:border-white/40'
                                }`}>
                                {activeConditions.includes(c.id) && <Check size={14} className="text-black" strokeWidth={4} />}
                            </div>
                            <span className={`text-sm ${activeConditions.includes(c.id) ? 'text-white font-bold' : 'text-gray-400'}`}>{c.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Battery Health */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">صحة البطارية</label>
                <div className="flex flex-wrap gap-2">
                    {BATTERIES.map(b => (
                        <button
                            key={b}
                            onClick={() => updateParams('minBattery', minBattery === b ? null : b.toString())}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all border flex items-center gap-1.5 ${minBattery === b
                                ? 'bg-[var(--neon-cyan)]/20 border-[var(--neon-cyan)] text-[var(--neon-cyan)] font-bold'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                }`}
                        >
                            <Battery size={12} />
                            +{b}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Storage */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">السعة</label>
                <div className="grid grid-cols-2 gap-2">
                    {STORAGES.map(s => (
                        <button
                            key={s}
                            onClick={() => toggleArrayFilter('storage', s)}
                            className={`px-3 py-2 rounded-lg text-xs transition-all border ${activeStorages.includes(s)
                                ? 'bg-white text-black font-bold border-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">اللون</label>
                <div className="flex flex-wrap gap-3">
                    {COLORS.map(c => (
                        <button
                            key={c.name}
                            onClick={() => toggleArrayFilter('color', c.name)}
                            title={c.name}
                            className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${activeColors.includes(c.name) ? 'border-[var(--neon-cyan)] scale-110 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-white/20 hover:border-white/50'
                                }`}
                        >
                            <div className="w-full h-full rounded-full" style={{ backgroundColor: c.hex }} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Network */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-400">الشبكة</label>
                <div className="space-y-2">
                    {NETWORKS.map(n => (
                        <label key={n.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeNetworks.includes(n.id)}
                                onChange={() => toggleArrayFilter('network', n.id)}
                                className="hidden"
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeNetworks.includes(n.id)
                                ? 'bg-[var(--neon-green)] border-[var(--neon-green)]'
                                : 'border-white/20 group-hover:border-white/40'
                                }`}>
                                {activeNetworks.includes(n.id) && <Check size={14} className="text-black" strokeWidth={4} />}
                            </div>
                            <span className={`text-sm ${activeNetworks.includes(n.id) ? 'text-white font-bold' : 'text-gray-400'}`}>{n.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {(searchParams.toString() !== '' || searchTerm !== '') && (
                <button
                    onClick={clearAll}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500/20 transition-all mt-4"
                >
                    <Trash2 size={16} />
                    مسح جميع الفلاتر
                </button>
            )}
        </div>
    )

    const hasFilters = searchParams.toString() !== '' || searchTerm !== ''

    return (
        <div className="w-full">
            <div className="w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl lg:text-5xl font-black text-white mb-2">تصفح المنتجات</h1>
                        <p className="text-[var(--text-muted)]">عرض {filteredProducts.length} من {products.length} منتج متوفر</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex lg:hidden items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white text-sm"
                        >
                            <SlidersHorizontal size={18} />
                            الفلاتر
                        </button>

                        <div className="relative flex-grow md:flex-grow-0 z-10 w-48">
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value)
                                    updateParams('sort', e.target.value)
                                }}
                                className="w-full bg-black border border-white/20 px-4 py-2.5 rounded-xl text-white text-sm outline-none appearance-none pr-10 hover:border-white/40 transition-all focus:border-[var(--neon-cyan)] cursor-pointer"
                            >
                                <option value="newest" className="bg-[#0a0a0a]">الأحدث أولاً</option>
                                <option value="price_asc" className="bg-[#0a0a0a]">السعر: من الأقل</option>
                                <option value="price_desc" className="bg-[#0a0a0a]">السعر: من الأعلى</option>
                                <option value="battery" className="bg-[#0a0a0a]">صحة البطارية</option>
                            </select>
                            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex gap-8 relative">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-28 h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="glass rounded-3xl p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="font-black text-lg text-white">تصفية النتائج</h3>
                                <SlidersHorizontal size={18} className="text-[var(--neon-cyan)]" />
                            </div>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Active Chips */}
                    <div className="flex-grow w-full">
                        {hasFilters && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {activeModels.map(m => (
                                    <span key={m} className="bg-white/10 px-3 py-1 rounded-full text-xs text-white border border-white/5 flex items-center gap-2">
                                        {m}
                                        <button onClick={() => toggleArrayFilter('model', m)}><X size={12} /></button>
                                    </span>
                                ))}
                                {activeConditions.map(c => (
                                    <span key={c} className="bg-white/10 px-3 py-1 rounded-full text-xs text-white border border-white/5 flex items-center gap-2">
                                        الحالة: {CONDITIONS.find(cv => cv.id === c)?.label}
                                        <button onClick={() => toggleArrayFilter('condition', c)}><X size={12} /></button>
                                    </span>
                                ))}
                                {minBattery > 0 && (
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white border border-white/5 flex items-center gap-2">
                                        البطارية: +{minBattery}%
                                        <button onClick={() => updateParams('minBattery', null)}><X size={12} /></button>
                                    </span>
                                )}
                                {hasFilters && (
                                    <button onClick={clearAll} className="text-xs text-[var(--neon-cyan)] hover:underline px-2">مسح الكل</button>
                                )}
                            </div>
                        )}

                        {/* Products Content */}
                        {loading ? (
                            <ProductSkeleton count={12} />
                        ) : filteredProducts.length > 0 ? (
                            <ProductGrid products={filteredProducts} />
                        ) : (
                            <div className="glass rounded-[var(--radius)] py-20 flex flex-col items-center justify-center text-center border border-white/5 mt-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                    <X className="text-gray-500" size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">لا توجد نتائج</h2>
                                <p className="text-gray-400 max-w-sm mb-8">لم نجد أي موديلات تطابق الفلاتر المختارة حالياً. جرب البحث عن شيء آخر.</p>
                                <button onClick={clearAll} className="bg-[var(--neon-cyan)] text-black px-8 py-3 rounded-xl font-bold hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">مسح جميع الفلاتر</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-screen w-full max-w-[320px] bg-[#0a0a0a] border-l border-white/10 z-[101] lg:hidden overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md p-6 border-b border-white/5 flex items-center justify-between z-10">
                                <h3 className="font-black text-xl text-white">الفلاتر</h3>
                                <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <FilterContent isMobile />
                            <div className="fixed bottom-0 right-0 w-full max-w-[320px] p-4 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="bg-[var(--neon-cyan)] text-black font-bold w-full py-4 text-lg rounded-xl"
                                >
                                    إظهار {filteredProducts.length} منتج
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    )
}
