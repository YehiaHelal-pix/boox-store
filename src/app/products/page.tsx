'use client'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFilters from '@/components/products/ProductFilters'
import ProductSkeleton from '@/components/products/ProductSkeleton'

export default function ProductsPage() {
    const [category, setCategory] = useState('all')
    const { products, loading } = useProducts(category)

    return (
        <div className="min-h-screen py-10 px-4 lg:px-[var(--container)] max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-wide">المنتجات</h1>
                    <p className="text-[var(--text-muted)] text-lg">تصفح أحدث أجهزة وإكسسوارات Apple الأصلية.</p>
                </div>
                <div className="w-full md:w-auto">
                    <ProductFilters activeCategory={category} onSelectCategory={setCategory} />
                </div>
            </div>

            {loading ? <ProductSkeleton count={10} /> : <ProductGrid products={products} />}
        </div>
    )
}
