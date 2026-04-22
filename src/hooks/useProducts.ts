'use client'
import { useCallback, useEffect, useState } from 'react'
import type { Product } from '@/types/database'

export function useProducts(queryString = '') {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products${queryString ? `?${queryString}` : ''}`, {
        cache: 'no-store',
      })

      const payload = (await response.json()) as Product[] | { error?: string }

      if (!response.ok || !Array.isArray(payload)) {
        setProducts([])
        setError(!Array.isArray(payload) ? payload.error ?? 'تعذر تحميل المنتجات' : 'تعذر تحميل المنتجات')
        return
      }

      setProducts(payload)
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'تعذر تحميل المنتجات'
      setProducts([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refresh: fetchProducts }
}
