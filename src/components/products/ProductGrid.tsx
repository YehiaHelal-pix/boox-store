'use client'
import type { Product } from '@/types/database'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl w-full col-span-full min-h-[300px]">
        <div className="text-[var(--text-muted)] text-lg mb-2 font-bold">لا توجد منتجات</div>
        <p className="text-sm text-gray-500">جرّب تغيير الفلاتر أو البحث باسم مختلف</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
