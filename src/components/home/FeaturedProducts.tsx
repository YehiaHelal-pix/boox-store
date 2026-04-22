'use client'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '../products/ProductGrid'
import ProductSkeleton from '../products/ProductSkeleton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function FeaturedProducts() {
  const { products, loading } = useProducts('featured=1')

  return (
    <section className="py-16 px-4 lg:px-[var(--container)] max-w-7xl mx-auto min-h-[500px]">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">المنتجات المميزة</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon)] rounded-full" />
        </div>
        <Link href="/products" className="text-[var(--neon-cyan)] font-bold flex items-center gap-1 hover:text-white transition-colors group text-lg pb-1">
          عرض الكل <ArrowLeft size={20} className="transform group-hover:-translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <ProductSkeleton count={5} />
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16 glass rounded-3xl text-[var(--text-muted)] text-xl font-medium border-dashed">
          مفيش منتجات مميزة متاحة دلوقتي.
        </div>
      )}
    </section>
  )
}
