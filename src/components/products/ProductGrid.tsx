'use client'
import type { Product } from '@/types/database'
import ProductCardV2 from '@/components/ui/ProductCardV2'

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="ppc-empty-state">
        <div className="ppc-empty-icon">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h3 className="ppc-empty-title">لا توجد منتجات</h3>
        <p className="ppc-empty-text">جرّب تغيير الفلاتر أو البحث باسم مختلف</p>
      </div>
    )
  }

  return (
    <div className="premium-products-grid">
      {products.map((product) => (
        <ProductCardV2 key={product.id} product={product} />
      ))}
    </div>
  )
}
