import { createClient } from '@/lib/supabase/server'
import { normalizeProductRow } from '@/lib/products'
import ProductCard from './ProductCard'
import { Sparkles } from 'lucide-react'
import type { Category, ProductRow } from '@/types/database'

export default async function SimilarProducts({ category, excludeId }: { category: string; excludeId: string }) {
  const supabase = await createClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', excludeId)
      .eq('is_available', true)
      .eq('is_visible', true)
      .limit(6),
    supabase.from('categories').select('*').eq('is_active', true),
  ])

  if (!products || products.length === 0) return null

  const categoryMap = new Map<string, Category>()
  ;(categories ?? []).forEach((item) => {
    categoryMap.set(item.id, item)
    categoryMap.set(item.slug, item)
  })

  return (
    <section className="mt-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          <Sparkles size={20} className="text-[var(--neon-cyan)]" />
        </div>
        <h2 className="text-2xl font-bold text-white">منتجات مشابهة</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {(products as ProductRow[]).map((product) => (
          <ProductCard key={product.id} product={normalizeProductRow(product, categoryMap)} />
        ))}
      </div>
    </section>
  )
}
