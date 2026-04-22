'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { normalizeProductRow } from '@/lib/products'
import type { Category, Product, ProductRow } from '@/types/database'
import { useCustomer } from '@/hooks/useCustomer'
import ProductCard from './ProductCard'
import { Clock } from 'lucide-react'

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { customer, isLoaded } = useCustomer()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      if (!isLoaded) return
      const ids = (customer.viewed_products || []).filter((id) => id !== excludeId)

      if (ids.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      const client = createClient()
      const [{ data: productRows }, { data: categories }] = await Promise.all([
        client.from('products').select('*').in('id', ids.slice(0, 6)),
        client.from('categories').select('*').eq('is_active', true),
      ])

      const categoryMap = new Map<string, Category>()
      ;(categories ?? []).forEach((category) => {
        categoryMap.set(category.id, category)
        categoryMap.set(category.slug, category)
      })

      const normalized = ids
        .slice(0, 6)
        .map((id) => (productRows as ProductRow[] | null)?.find((product) => product.id === id))
        .filter((product): product is ProductRow => Boolean(product))
        .map((product) => normalizeProductRow(product, categoryMap))

      setProducts(normalized)
      setLoading(false)
    }

    void fetchRecent()
  }, [customer.viewed_products, excludeId, isLoaded])

  if (!isLoaded || (products.length === 0 && !loading)) return null

  return (
    <section className="mt-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          <Clock size={20} className="text-[var(--neon-cyan)]" />
        </div>
        <h2 className="text-2xl font-bold text-white">شاهدته قريب</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="aspect-[3/4] glass rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
