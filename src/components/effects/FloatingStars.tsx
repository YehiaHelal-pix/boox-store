'use client'
import { useEffect, useState } from 'react'

export default function FloatingStars() {
    const [stars, setStars] = useState<{ id: number; left: number; top: number; delay: number }[]>([])

    useEffect(() => {
        const arr = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5
        }))
        setStars(arr)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
            {stars.map(s => (
                <div key={s.id}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}>
                </div>
            ))}
        </div>
    )
}
