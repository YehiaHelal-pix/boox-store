'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import ProductGrid from './ProductGrid'
import ProductSkeleton from './ProductSkeleton'
import { CONDITION_LABELS, STORAGE_OPTIONS, matchesSearch, toNumber } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'
import type { Category, Product, ProductCondition } from '@/types/database'

const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS) as Array<[ProductCondition, string]>

function parseList(value: string | null): string[] {
  if (!value) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export default function ProductsCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { products, loading } = useProducts()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch('/api/categories', { cache: 'no-store' })
      const payload = (await response.json()) as Category[] | { error?: string }
      if (response.ok && Array.isArray(payload)) {
        setCategories(payload)
      }
    }

    void loadCategories()
  }, [])

  const activeCategory = searchParams.get('category') ?? ''
  const activeCondition = parseList(searchParams.get('condition'))
  const activeColors = parseList(searchParams.get('color'))
  const activeStorages = parseList(searchParams.get('storage'))
  const activeSearch = searchParams.get('search') ?? ''
  const activeMinPrice = Number(searchParams.get('min_price') ?? 0)
  const activeMaxPrice = Number(searchParams.get('max_price') ?? 250000)
  const activeBattery = Number(searchParams.get('battery_min') ?? 0)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const maxCatalogPrice = useMemo(() => {
    const prices = products.map((product) => toNumber(product.price) ?? 0)
    return Math.max(250000, ...prices)
  }, [products])

  const availableColors = useMemo(() => Array.from(new Set(products.map((product) => product.color))).filter(Boolean), [products])

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())

    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }

  function toggleParamValue(key: string, value: string) {
    const current = parseList(searchParams.get(key))
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    setParam(key, next.length > 0 ? next.join(',') : null)
  }

  function clearAll() {
    router.replace(pathname, { scroll: false })
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory && product.category !== activeCategory) return false
      if (activeCondition.length > 0 && !activeCondition.includes(product.condition)) return false
      if (activeColors.length > 0 && !activeColors.includes(product.color)) return false
      if (activeStorages.length > 0 && !activeStorages.includes(product.storage_size)) return false
      if ((product.price ?? 0) < activeMinPrice) return false
      if ((product.price ?? 0) > activeMaxPrice) return false
      if ((product.battery_health ?? 0) < activeBattery) return false
      if (!matchesSearch(product, activeSearch.toLowerCase())) return false
      return true
    })
  }, [products, activeCategory, activeCondition, activeColors, activeStorages, activeMinPrice, activeMaxPrice, activeBattery, activeSearch])

  const activeChips = [
    activeCategory
      ? {
          key: `category:${activeCategory}`,
          label: categories.find((item) => item.slug === activeCategory)?.name_ar ?? activeCategory,
          onRemove: () => setParam('category', null),
        }
      : null,
    ...activeCondition.map((condition) => ({
      key: `condition:${condition}`,
      label: CONDITION_LABELS[condition as ProductCondition],
      onRemove: () => toggleParamValue('condition', condition),
    })),
    ...activeColors.map((color) => ({
      key: `color:${color}`,
      label: color,
      onRemove: () => toggleParamValue('color', color),
    })),
    ...activeStorages.map((storage) => ({
      key: `storage:${storage}`,
      label: storage,
      onRemove: () => toggleParamValue('storage', storage),
    })),
    activeSearch
      ? {
          key: 'search',
          label: `بحث: ${activeSearch}`,
          onRemove: () => setParam('search', null),
        }
      : null,
    activeMinPrice > 0 || activeMaxPrice < maxCatalogPrice
      ? {
          key: 'price',
          label: `السعر: ${activeMinPrice} - ${activeMaxPrice}`,
          onRemove: () => {
            setParam('min_price', null)
            setParam('max_price', null)
          },
        }
      : null,
    activeBattery > 0
      ? {
          key: 'battery',
          label: `البطارية +${activeBattery}%`,
          onRemove: () => setParam('battery_min', null),
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>

  const FilterPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`space-y-5 ${mobile ? 'p-4' : ''}`}>
      {/* Search */}
      <div>
        <label className="catalog-filter-label">بحث</label>
        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={activeSearch}
            onChange={(event) => setParam('search', event.target.value || null)}
            placeholder="اسم المنتج أو الموديل..."
            className="catalog-filter-input pr-9"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="catalog-filter-label">القسم</label>
        <div className="space-y-1">
          <button
            onClick={() => setParam('category', null)}
            className={`catalog-filter-option ${!activeCategory ? 'active' : ''}`}
          >
            <span>كل الأقسام</span>
            <span className="catalog-filter-count">{products.length}</span>
          </button>
          {categories.map((category) => {
            const count = products.filter((p) => p.category === category.slug).length
            return (
              <button
                key={category.id}
                onClick={() => setParam('category', category.slug)}
                className={`catalog-filter-option ${activeCategory === category.slug ? 'active' : ''}`}
              >
                <span>{category.name_ar}</span>
                <span className="catalog-filter-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="catalog-filter-label">الحالة</label>
        <div className="space-y-1">
          {CONDITION_OPTIONS.map(([value, label]) => (
            <label key={value} className="catalog-filter-check">
              <div className={`catalog-check-box ${activeCondition.includes(value) ? 'active' : ''}`}>
                {activeCondition.includes(value) ? <span>✓</span> : null}
              </div>
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      {availableColors.length > 0 ? (
        <div>
          <label className="catalog-filter-label">اللون</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => toggleParamValue('color', color)}
                className={`catalog-color-pill ${activeColors.includes(color) ? 'active' : ''}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Storage */}
      <div>
        <label className="catalog-filter-label">السعة</label>
        <div className="flex flex-wrap gap-2">
          {STORAGE_OPTIONS.map((storage) => (
            <button
              key={storage}
              onClick={() => toggleParamValue('storage', storage)}
              className={`catalog-color-pill ${activeStorages.includes(storage) ? 'active' : ''}`}
            >
              {storage}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="catalog-filter-label mb-0">السعر</label>
          <span className="text-xs text-gray-500 font-semibold">
            {activeMinPrice.toLocaleString('ar-EG')} - {activeMaxPrice.toLocaleString('ar-EG')} ج.م
          </span>
        </div>
        <div className="space-y-2">
          <input type="range" min={0} max={maxCatalogPrice} step={1000} value={activeMinPrice} onChange={(event) => setParam('min_price', event.target.value)} className="catalog-range" />
          <input type="range" min={0} max={maxCatalogPrice} step={1000} value={activeMaxPrice} onChange={(event) => setParam('max_price', event.target.value)} className="catalog-range" />
        </div>
      </div>

      {/* Battery */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="catalog-filter-label mb-0">صحة البطارية</label>
          <span className="text-xs text-gray-500 font-semibold">{activeBattery}%+</span>
        </div>
        <input type="range" min={0} max={100} step={1} value={activeBattery} onChange={(event) => setParam('battery_min', event.target.value === '0' ? null : event.target.value)} className="catalog-range" />
      </div>

      {/* Clear all */}
      <button onClick={clearAll} className="catalog-clear-btn">
        مسح كل الفلاتر
      </button>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold mb-1">Boox Store</p>
          <h1 className="text-2xl font-black text-white md:text-4xl">كل منتجات آبل المتاحة</h1>
          <p className="mt-1 text-sm text-gray-500">{filteredProducts.length} منتج</p>
        </div>

        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white lg:hidden hover:bg-white/10 transition-colors"
        >
          <SlidersHorizontal size={16} />
          الفلاتر
          {activeChips.length > 0 ? (
            <span className="bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{activeChips.length}</span>
          ) : null}
        </button>
      </div>

      {/* Active chips */}
      {activeChips.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-white transition-colors px-2">
            مسح الكل
          </button>
        </div>
      ) : null}

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0c1220] to-[#0a0f1a] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Filter size={16} className="text-cyan-400" />
                <span className="font-bold text-sm">تصفية المنتجات</span>
              </div>
              {activeChips.length > 0 ? (
                <button onClick={clearAll} className="text-xs text-cyan-400 hover:underline">مسح</button>
              ) : null}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Products */}
        <div>
          {loading ? <ProductSkeleton count={8} /> : <ProductGrid products={filteredProducts as Product[]} />}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isMobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-filter backdrop-blur-sm lg:hidden" onClick={() => setIsMobileFiltersOpen(false)}>
          <div
            className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-[#0a0f1a] border-l border-white/[0.06]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-[#0a0f1a] border-b border-white/[0.06] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <SlidersHorizontal size={16} className="text-cyan-400" />
                <span className="font-bold text-sm">تصفية المنتجات</span>
              </div>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <FilterPanel mobile />
            <div className="sticky bottom-0 p-4 bg-[#0a0f1a] border-t border-white/[0.06]">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 font-bold text-white text-sm"
              >
                عرض {filteredProducts.length} منتج
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
