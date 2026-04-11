'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/product'

export function useProducts(category?: string) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const sb = createClient()
        let q = sb.from('products').select('*').order('sort_order').order('created_at', { ascending: false })
        if (category && category !== 'all') q = q.eq('category', category)
        const { data, error } = await q
        if (error) setError(error.message)
        else setProducts(data || [])
        setLoading(false)
    }, [category])

    useEffect(() => {
        fetchProducts()
        const sb = createClient()
        const channel = sb.channel('products-rt')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
                if (payload.eventType === 'INSERT') setProducts(p => [payload.new as Product, ...p])
                if (payload.eventType === 'UPDATE') setProducts(p => p.map(x => x.id === payload.new.id ? payload.new as Product : x))
                if (payload.eventType === 'DELETE') setProducts(p => p.filter(x => x.id !== payload.old.id))
            })
            .subscribe()
        return () => { sb.removeChannel(channel) }
    }, [fetchProducts])

    return { products, loading, error, refetch: fetchProducts }
}
