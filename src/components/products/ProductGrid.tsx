'use client'
import type { Product } from '@/types/product'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl w-full col-span-full min-h-[300px]">
                <div className="text-[var(--text-muted)] text-lg mb-2 font-bold">لا توجد منتجات</div>
                <p className="text-sm text-gray-500">جرب تغيير التصنيف أو خيارات البحث</p>
            </div>
        )
    }

    return (
        <div className="products-grid w-full">
            {products.map(p => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    )
}
