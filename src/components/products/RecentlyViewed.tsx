'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'
import { useCustomer } from '@/hooks/useCustomer'
import ProductCard from './ProductCard'
import { Clock } from 'lucide-react'

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
    const { customer, isLoaded } = useCustomer()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecent = async () => {
            if (!isLoaded) return
            const ids = (customer.viewed_products || []).filter(id => id !== excludeId)

            if (ids.length === 0) {
                setProducts([])
                setLoading(false)
                return
            }

            setLoading(true)
            const sb = createClient()
            const { data } = await sb.from('products').select('*').in('id', ids.slice(0, 6))
            if (data) {
                // Keep order of ids
                const sorted = ids.slice(0, 6).map(id => data.find(p => p.id === id)).filter(Boolean) as Product[]
                setProducts(sorted)
            }
            setLoading(false)
        }

        fetchRecent()
    }, [customer.viewed_products, isLoaded, excludeId])

    if (!isLoaded || (products.length === 0 && !loading)) return null

    return (
        <section className="mt-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <Clock size={20} className="text-[var(--neon-cyan)]" />
                </div>
                <h2 className="text-2xl font-bold text-white">المنتجات التي شاهدتها مؤخراً</h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] glass rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </section>
    )
}
