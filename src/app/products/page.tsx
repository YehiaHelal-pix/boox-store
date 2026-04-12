import { createClient } from '@/lib/supabase/server'
import ProductsCatalog from '@/components/products/ProductsCatalog'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'تصفح المنتجات | Boox Store',
    description: 'تسوق أحدث منتجات Apple الأصلية بأفضل الأسعار.'
}

export default async function ProductsPage() {
    const supabase = await createClient()
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 lg:px-[var(--container)] max-w-[1400px] mx-auto">
            <ProductsCatalog initialProducts={products || []} />
        </div>
    )
}
