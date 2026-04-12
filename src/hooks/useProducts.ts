'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const sb = createClient()
        // We fetch all visible and in-stock products as filtering is client-side
        const { data, error } = await sb
            .from('products')
            .select('*')
            .eq('is_visible', true)
            .eq('in_stock', true)
            .order('created_at', { ascending: false })

        if (error) setError(error.message)
        else setProducts(data || [])
        setLoading(false)
    }, [])

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
