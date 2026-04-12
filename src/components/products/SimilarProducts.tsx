import { createClient } from '@/lib/supabase/server'
import ProductCard from './ProductCard'
import { Sparkles } from 'lucide-react'

export default async function SimilarProducts({ category, excludeId }: { category: string, excludeId: string }) {
    const supabase = await createClient()
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', excludeId)
        .limit(6)

    if (!products || products.length === 0) return null

    return (
        <section className="mt-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <Sparkles size={20} className="text-[var(--neon-cyan)]" />
                </div>
                <h2 className="text-2xl font-bold text-white">منتجات قد تعجبك أيضاً</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {products.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    )
}
