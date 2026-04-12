'use client'
import { useState, useEffect } from 'react'

export function useComparison() {
    const [compareItems, setCompareItems] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const sync = () => {
            const saved = localStorage.getItem('boox_compare')
            if (saved) {
                try { setCompareItems(JSON.parse(saved)) } catch (e) { console.error(e) }
            } else {
                setCompareItems([])
            }
        }
        sync()
        setIsLoaded(true)
        window.addEventListener('boox_compare_changed', sync)
        return () => window.removeEventListener('boox_compare_changed', sync)
    }, [])

    const toggleCompare = (productId: string) => {
        setCompareItems(prev => {
            const isComparing = prev.includes(productId)
            let next = prev
            if (isComparing) {
                next = prev.filter(id => id !== productId)
            } else {
                // Max 2 items to compare at a time
                next = prev.length >= 2 ? [prev[1], productId] : [...prev, productId]
            }
            localStorage.setItem('boox_compare', JSON.stringify(next))
            window.dispatchEvent(new Event('boox_compare_changed'))
            return next
        })
    }

    const removeCompare = (productId: string) => {
        setCompareItems(prev => {
            const next = prev.filter(id => id !== productId)
            localStorage.setItem('boox_compare', JSON.stringify(next))
            window.dispatchEvent(new Event('boox_compare_changed'))
            return next
        })
    }

    const isComparing = (productId: string) => compareItems.includes(productId)

    return { compareItems, toggleCompare, removeCompare, isComparing, count: compareItems.length, isLoaded }
}
