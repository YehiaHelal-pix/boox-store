'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'
import ProductGrid from '@/components/products/ProductGrid'
import ProductSkeleton from '@/components/products/ProductSkeleton'
import { useFavorites } from '@/hooks/useFavorites'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
    const { favorites, isLoaded } = useFavorites()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!isLoaded) return
            if (favorites.length === 0) {
                setProducts([])
                setLoading(false)
                return
            }

            setLoading(true)
            const sb = createClient()
            const { data } = await sb.from('products').select('*').in('id', favorites)
            if (data) setProducts(data)
            setLoading(false)
        }

        fetchFavorites()
    }, [favorites, isLoaded])

    return (
        <div className="min-h-screen py-10 px-4 lg:px-[var(--container)] max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <Heart size={32} className="text-red-500" fill="currentColor" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white">المفضلة</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">المنتجات التي قمت بحفظها للرجوع إليها لاحقاً</p>
                </div>
            </div>

            {!isLoaded || loading ? (
                <ProductSkeleton count={4} />
            ) : products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <div className="glass rounded-[2rem] p-16 text-center border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                        <Heart size={48} className="text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-400">لا توجد منتجات في المفضلة</h2>
                    <p className="text-gray-500">تصفح منتجاتنا وأضف ما يعجبك إلى المفضلة</p>
                </div>
            )}
        </div>
    )
}
