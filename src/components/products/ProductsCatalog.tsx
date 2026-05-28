'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search, SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutGrid, Sparkles } from 'lucide-react'
import Image from 'next/image'
import ProductGrid from './ProductGrid'
import ProductSkeleton from './ProductSkeleton'
import { CONDITION_LABELS, STORAGE_OPTIONS, matchesSearch, toNumber } from '@/lib/products'
import { useProducts } from '@/hooks/useProducts'
import type { Category, Product, ProductCondition } from '@/types/database'

const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS) as Array<[ProductCondition, string]>

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث أولاً' },
  { value: 'price_asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'price_desc', label: 'السعر: من الأعلى للأقل' },
  { value: 'name', label: 'الاسم' },
] as const

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
  const [sortBy, setSortBy] = useState<string>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid')

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    condition: true,
    color: false,
    storage: true,
    price: false,
    battery: false,
  })

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

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
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

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        break
      case 'price_desc':
        result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        break
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        break
      default:
        break
    }

    return result
  }, [products, activeCategory, activeCondition, activeColors, activeStorages, activeMinPrice, activeMaxPrice, activeBattery, activeSearch, sortBy])

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
          label: `السعر: ${activeMinPrice.toLocaleString('ar-EG')} - ${activeMaxPrice.toLocaleString('ar-EG')}`,
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

  const FilterSection = ({ title, sectionKey, children }: { title: string; sectionKey: string; children: React.ReactNode }) => (
    <div className="catalog-filter-section">
      <button
        className="catalog-filter-header"
        onClick={() => toggleSection(sectionKey)}
      >
        <span>{title}</span>
        <ChevronDown size={16} className={`catalog-filter-chevron ${expandedSections[sectionKey] ? 'open' : ''}`} />
      </button>
      {expandedSections[sectionKey] && <div className="catalog-filter-body">{children}</div>}
    </div>
  )

  const FilterPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`catalog-filters-inner ${mobile ? 'mobile' : ''}`}>
      {/* Search */}
      <div className="catalog-search-box">
        <Search size={16} className="catalog-search-icon" />
        <input
          value={activeSearch}
          onChange={(event) => setParam('search', event.target.value || null)}
          placeholder="ابحث عن منتج..."
          className="catalog-search-input"
        />
        {activeSearch && (
          <button onClick={() => setParam('search', null)} className="catalog-search-clear">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="القسم" sectionKey="category">
        <div className="catalog-filter-chips">
          <button
            className={`catalog-chip ${!activeCategory ? 'active' : ''}`}
            onClick={() => setParam('category', null)}
          >
            الكل
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`catalog-chip ${activeCategory === category.slug ? 'active' : ''}`}
              onClick={() => setParam('category', activeCategory === category.slug ? null : category.slug)}
            >
              {category.name_ar}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="الحالة" sectionKey="condition">
        <div className="catalog-filter-checks">
          {CONDITION_OPTIONS.map(([value, label]) => (
            <label key={value} className="catalog-check-label">
              <input
                type="checkbox"
                checked={activeCondition.includes(value)}
                onChange={() => toggleParamValue('condition', value)}
                className="catalog-check-input"
              />
              <span className="catalog-check-box" />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Storage */}
      <FilterSection title="السعة" sectionKey="storage">
        <div className="catalog-filter-chips compact">
          {STORAGE_OPTIONS.map((storage) => (
            <button
              key={storage}
              className={`catalog-chip ${activeStorages.includes(storage) ? 'active' : ''}`}
              onClick={() => toggleParamValue('storage', storage)}
            >
              {storage}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="اللون" sectionKey="color">
        <div className="catalog-filter-chips compact">
          {availableColors.map((color) => (
            <button
              key={color}
              className={`catalog-chip ${activeColors.includes(color) ? 'active' : ''}`}
              onClick={() => toggleParamValue('color', color)}
            >
              {color}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="السعر" sectionKey="price">
        <div className="catalog-range-section">
          <div className="catalog-range-labels">
            <span>{activeMinPrice.toLocaleString('ar-EG')} ج</span>
            <span>{activeMaxPrice.toLocaleString('ar-EG')} ج</span>
          </div>
          <input type="range" min={0} max={maxCatalogPrice} step={1000} value={activeMinPrice} onChange={(event) => setParam('min_price', event.target.value)} className="catalog-range" />
          <input type="range" min={0} max={maxCatalogPrice} step={1000} value={activeMaxPrice} onChange={(event) => setParam('max_price', event.target.value)} className="catalog-range" />
        </div>
      </FilterSection>

      {/* Battery */}
      <FilterSection title="صحة البطارية" sectionKey="battery">
        <div className="catalog-range-section">
          <div className="catalog-range-labels">
            <span>الحد الأدنى</span>
            <span className="catalog-range-value">{activeBattery}%</span>
          </div>
          <input type="range" min={0} max={100} step={1} value={activeBattery} onChange={(event) => setParam('battery_min', event.target.value === '0' ? null : event.target.value)} className="catalog-range" />
        </div>
      </FilterSection>

      {/* Clear */}
      {activeChips.length > 0 && (
        <button onClick={clearAll} className="catalog-clear-btn">
          <X size={14} />
          مسح جميع الفلاتر
        </button>
      )}
    </div>
  )

  return (
    <div className="catalog-page" dir="rtl">
      {/* ── Hero Banner ── */}
      <div className="catalog-hero">
        <div className="catalog-hero-bg" />
        <div className="catalog-hero-content">
          <div className="flex justify-center mb-4">
            <Image 
              src="/assets/boox-logo-outline.png" 
              alt="Boox Store Logo" 
              width={120} height={120} 
              className="hero-logo"
            />
          </div>
          <h1 className="catalog-hero-title">
            اكتشف عالم <span className="catalog-hero-accent">Apple</span>
          </h1>
          <p className="catalog-hero-subtitle">
            أحدث أجهزة آبل الأصلية بأفضل الأسعار في مصر ● ضمان حقيقي ● توصيل سريع
          </p>
          <div className="catalog-hero-stats">
            <div className="catalog-stat">
              <span className="catalog-stat-num">{products.length}</span>
              <span className="catalog-stat-label">منتج متاح</span>
            </div>
            <div className="catalog-stat-divider" />
            <div className="catalog-stat">
              <span className="catalog-stat-num">{categories.length}</span>
              <span className="catalog-stat-label">فئة</span>
            </div>
            <div className="catalog-stat-divider" />
            <div className="catalog-stat">
              <span className="catalog-stat-num">30</span>
              <span className="catalog-stat-label">يوم ضمان</span>
            </div>
          </div>
        </div>
      </div>

      <div className="catalog-container">
        {/* ── Toolbar ── */}
        <div className="catalog-toolbar">
          <div className="catalog-toolbar-right">
            <span className="catalog-results-count">
              {loading ? '...' : `${filteredProducts.length} منتج`}
            </span>
            {activeChips.length > 0 && (
              <div className="catalog-active-chips">
                {activeChips.map((chip) => (
                  <button key={chip.key} onClick={chip.onRemove} className="catalog-active-chip">
                    {chip.label}
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="catalog-toolbar-left">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="catalog-sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="catalog-view-toggle">
              <button
                className={`catalog-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`catalog-view-btn ${viewMode === 'compact' ? 'active' : ''}`}
                onClick={() => setViewMode('compact')}
              >
                <Grid3X3 size={16} />
              </button>
            </div>
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="catalog-mobile-filter-btn"
            >
              <SlidersHorizontal size={16} />
              فلترة
            </button>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="catalog-layout">
          {/* Sidebar Filters */}
          <aside className="catalog-sidebar">
            <div className="catalog-sidebar-header">
              <Filter size={18} className="catalog-sidebar-icon" />
              <span>تصفية المنتجات</span>
            </div>
            <FilterPanel />
          </aside>

          {/* Products Area */}
          <div className={`catalog-products ${viewMode === 'compact' ? 'compact-view' : ''}`}>
            {loading ? <ProductSkeleton count={8} /> : <ProductGrid products={filteredProducts as Product[]} />}
          </div>
        </div>
      </div>

      {/* ── Mobile Filters Drawer ── */}
      {isMobileFiltersOpen && (
        <div className="catalog-mobile-overlay" onClick={() => setIsMobileFiltersOpen(false)}>
          <div className="catalog-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-mobile-drawer-header">
              <div className="catalog-mobile-drawer-title">
                <SlidersHorizontal size={18} />
                <span>تصفية المنتجات</span>
              </div>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="catalog-mobile-close">
                <X size={20} />
              </button>
            </div>
            <div className="catalog-mobile-drawer-body">
              <FilterPanel mobile />
            </div>
            <div className="catalog-mobile-drawer-footer">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="catalog-mobile-apply"
              >
                عرض {filteredProducts.length} منتج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
