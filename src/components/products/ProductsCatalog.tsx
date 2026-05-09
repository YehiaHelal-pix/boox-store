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
    <div className={`space-y-6 ${mobile ? 'p-4' : ''}`}>
      <div className="space-y-2">
        <label className="text-sm text-gray-400">بحث باسم المنتج</label>
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={activeSearch}
            onChange={(event) => setParam('search', event.target.value || null)}
            placeholder="اكتب اسم المنتج"
            className="w-full rounded-xl bg-white/5 border border-white/10 py-3 pr-9 pl-3 text-white outline-none focus:border-[var(--neon-cyan)]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">القسم</label>
        <select
          value={activeCategory}
          onChange={(event) => setParam('category', event.target.value || null)}
          className="w-full rounded-xl bg-white/5 border border-white/10 py-3 px-3 text-white outline-none"
        >
          <option value="">كل الأقسام</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name_ar}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">الحالة</label>
        <div className="space-y-2">
          {CONDITION_OPTIONS.map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 text-sm text-white cursor-pointer">
              <input type="checkbox" checked={activeCondition.includes(value)} onChange={() => toggleParamValue('condition', value)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">اللون</label>
        <div className="grid grid-cols-2 gap-2">
          {availableColors.map((color) => (
            <label key={color} className="flex items-center gap-2 text-sm text-white cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <input type="checkbox" checked={activeColors.includes(color)} onChange={() => toggleParamValue('color', color)} />
              {color}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">السعة</label>
        <div className="grid grid-cols-2 gap-2">
          {STORAGE_OPTIONS.map((storage) => (
            <label key={storage} className="flex items-center gap-2 text-sm text-white cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <input type="checkbox" checked={activeStorages.includes(storage)} onChange={() => toggleParamValue('storage', storage)} />
              {storage}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>السعر</span>
          <span>
            {activeMinPrice} - {activeMaxPrice}
          </span>
        </div>
        <input type="range" min={0} max={maxCatalogPrice} step={1000} value={activeMinPrice} onChange={(event) => setParam('min_price', event.target.value)} className="w-full" />
        <input type="range" min={0} max={maxCatalogPrice} step={1000} value={activeMaxPrice} onChange={(event) => setParam('max_price', event.target.value)} className="w-full" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>صحة البطارية</span>
          <span>{activeBattery}%</span>
        </div>
        <input type="range" min={0} max={100} step={1} value={activeBattery} onChange={(event) => setParam('battery_min', event.target.value === '0' ? null : event.target.value)} className="w-full" />
      </div>

      <button onClick={clearAll} className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20">
        مسح الكل
      </button>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-8 lg:px-[var(--container)] max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--neon-cyan)]">Boox Store</p>
          <h1 className="text-3xl font-black text-white md:text-5xl">كل منتجات آبل المتاحة</h1>
          <p className="mt-2 text-[var(--text-muted)]">{filteredProducts.length} منتج متاح</p>
        </div>

        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white lg:hidden"
        >
          <SlidersHorizontal size={18} />
          الفلاتر
        </button>
      </div>

      {activeChips.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15"
            >
              {chip.label}
              <X size={14} />
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block rounded-3xl border border-white/10 bg-[#0d1117] p-5 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Filter size={18} className="text-[var(--neon-cyan)]" />
              <span className="font-bold">الفلاتر</span>
            </div>
          </div>
          <FilterPanel />
        </aside>

        <div className="rounded-3xl border border-white/10 bg-[#090d13] p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:p-6">
          {loading ? <ProductSkeleton count={8} /> : <ProductGrid products={filteredProducts as Product[]} />}
        </div>
      </div>

      {isMobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#0a0a0a] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <SlidersHorizontal size={18} className="text-[var(--neon-cyan)]" />
                <span className="font-bold">الفلاتر</span>
              </div>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="rounded-full border border-white/10 p-2 text-white">
                <X size={18} />
              </button>
            </div>
            <FilterPanel mobile />
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-xl bg-[var(--neon-cyan)] px-4 py-3 font-bold text-black"
            >
              عرض {filteredProducts.length} منتج
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
