import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/products/ProductDetail'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single()

    if (!data) return { title: 'المنتج غير موجود' }
    return { title: data.name, description: data.description || 'احصل على هذا المنتج الآن من Boox Store' }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch main product
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_visible', true)
        .single()

    if (!product) notFound()

    // Fetch similar products (same model family, different slug)
    const modelFamily = product.model?.split(' ')?.[0] || 'iPhone' // simple fallback
    const { data: similar } = await supabase
        .from('products')
        .select('*')
        .ilike('model', `%${modelFamily}%`)
        .neq('slug', slug)
        .eq('is_visible', true)
        .limit(6)

    // Increment view count
    try {
        await supabase.rpc('increment_views', { product_id: product.id })
    } catch {
        // ignore if function doesn't exist
    }

    return <ProductDetail product={product} similar={similar || []} />
}
