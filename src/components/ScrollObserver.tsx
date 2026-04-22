'use client'
import { useEffect } from 'react'

export default function ScrollObserver() {
  useEffect(() => {
    // Exact logic from index.html
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
          animObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    // Need slight delay to wait for React to mount children
    const timer = setTimeout(() => {
      document.querySelectorAll('.anim-reveal').forEach((el) => {
        animObserver.observe(el)
      })
    }, 1000)

    return () => {
      clearTimeout(timer)
      animObserver.disconnect()
    }
  }, [])

  return null
}
