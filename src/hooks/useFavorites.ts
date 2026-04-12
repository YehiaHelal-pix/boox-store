'use client'
import { useState, useEffect } from 'react'

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const sync = () => {
            const saved = localStorage.getItem('boox_favorites')
            if (saved) {
                try { setFavorites(JSON.parse(saved)) } catch (e) { console.error(e) }
            } else {
                setFavorites([])
            }
        }
        sync()
        setIsLoaded(true)
        window.addEventListener('boox_favorites_changed', sync)
        return () => window.removeEventListener('boox_favorites_changed', sync)
    }, [])

    const toggleFavorite = (productId: string) => {
        setFavorites(prev => {
            const isFav = prev.includes(productId)
            const next = isFav ? prev.filter(id => id !== productId) : [...prev, productId]
            localStorage.setItem('boox_favorites', JSON.stringify(next))

            // Dispatch custom event for navbar sync
            window.dispatchEvent(new Event('boox_favorites_changed'))
            return next
        })
    }

    const isFavorite = (productId: string) => favorites.includes(productId)

    return { favorites, toggleFavorite, isFavorite, count: favorites.length, isLoaded }
}
