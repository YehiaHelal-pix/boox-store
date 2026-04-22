'use client'
import { useEffect, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from './ProductCard'

type EventWithDetail = Event & { detail: string }

export default function ProductsGrid() {
  const { products, loading, error } = useProducts()
  const [curCat, setCurCat] = useState('all')
  const [searchQ, setSearchQ] = useState('')

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

  useEffect(() => {
    if (!loading) {
      const available = products.filter((product) => product.is_available && product.is_visible).length
      window.dispatchEvent(new CustomEvent('boox-stats', { detail: available }))
    }
  }, [products, loading])

  const filtered = products.filter((product) => {
    const matchCat = curCat === 'all' || product.category === curCat
    const haystack = [product.name, product.device_model, product.description ?? '', product.color, product.storage_size]
      .join(' ')
      .toLowerCase()
    const matchSearch = !searchQ || haystack.includes(searchQ)

    return matchCat && matchSearch
  })

  return (
    <section id="products">
      <div className="section-header">
        <h2 className="section-title">منتجاتنا</h2>
        <span id="pr-count" style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
          {filtered.length} منتج متاح
        </span>
      </div>
      <div className="products-grid" id="pr-grid">
        {loading ? (
          <div className="products-loading">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="products-empty">
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p>مفيش منتجات مطابقة للبحث الحالي</p>
          </div>
        ) : (
          filtered.map((product, index) => <ProductCard key={product.id} p={product} index={index} />)
        )}
      </div>
    </section>
  )
}
