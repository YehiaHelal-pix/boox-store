'use client'
import { useEffect, useState } from 'react'

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
            const max = docHeight - winHeight
            if (max > 0) {
                setProgress((scrollY / max) * 100)
            } else {
                setProgress(0)
            }
        }
        window.addEventListener('scroll', handleScroll)
        // Initial call
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="fixed top-0 left-0 h-1 bg-[var(--neon-cyan)] z-50 transition-all duration-150" style={{ width: `${progress}%` }}></div>
    )
}
