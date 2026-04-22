'use client'
import { useEffect, useState } from 'react'

export default function BottomNav() {
  const [active, setActive] = useState('home')

  useEffect(() => {
    const sections = ['home', 'products', 'services', 'maintenance', 'trade', 'contact']
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setActive(e.target.id)
        }
      })
    }, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' })

    sections.forEach(s => {
      const el = document.getElementById(s)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const gSec = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="bottom-nav glass">
      <button 
        className={`bnav-btn ${active === 'home' ? 'active' : ''}`} 
        id="bn-home" 
        onClick={() => gSec('home')}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span>الرئيسية</span>
        <div className="bnav-indicator"></div>
      </button>
      
      <button 
        className={`bnav-btn ${active === 'products' ? 'active' : ''}`} 
        id="bn-products" 
        onClick={() => gSec('products')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <span>المنتجات</span>
        <div className="bnav-indicator"></div>
      </button>
      
      <button 
        className={`bnav-btn ${active === 'maintenance' ? 'active' : ''}`} 
        id="bn-maintenance" 
        onClick={() => gSec('maintenance')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a5 5 0 01-7 7l-4-4a5 5 0 017-7z" />
          <path d="M9 17l-4-4" />
        </svg>
        <span>صيانة</span>
        <div className="bnav-indicator"></div>
      </button>
      
      <button 
        className={`bnav-btn ${active === 'trade' ? 'active' : ''}`} 
        id="bn-trade" 
        onClick={() => gSec('trade')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4" />
        </svg>
        <span>استبدال</span>
        <div className="bnav-indicator"></div>
      </button>
      
      <button 
        className={`bnav-btn ${active === 'contact' ? 'active' : ''}`} 
        id="bn-contact" 
        onClick={() => gSec('contact')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.08 1.2 2 2 0 012.08 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.09a16 16 0 006.34 6.35l1.34-1.34a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
        <span>تواصل</span>
        <div className="bnav-indicator"></div>
      </button>
    </nav>
  )
}
