'use client'
import { useEffect } from 'react'
import { useCustomer } from '@/hooks/useCustomer'

export default function ProductViewTracker({ productId }: { productId: string }) {
    const { customer, saveCustomer, isLoaded } = useCustomer()

    useEffect(() => {
        if (!isLoaded) return

        const currentViewed = customer.viewed_products || []
        if (!currentViewed.includes(productId)) {
            const nextViewed = [productId, ...currentViewed].slice(0, 10) // Keep last 10
            saveCustomer({ viewed_products: nextViewed })
        } else {
            // Move to top
            const nextViewed = [productId, ...currentViewed.filter(id => id !== productId)].slice(0, 10)
            saveCustomer({ viewed_products: nextViewed })
        }
    }, [productId, isLoaded])

    return null
}
