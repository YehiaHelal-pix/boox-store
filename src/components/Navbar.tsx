'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const [expanded, setExpanded] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const expandIsland = () => {
    setExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  const collapseIsland = () => {
    if (searchVal.trim()) return
    setExpanded(false)
  }

  const handleBlur = () => {
    setTimeout(collapseIsland, 200)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchVal(val)
    // Dispatch custom event for ProductsGrid to filter
    window.dispatchEvent(new CustomEvent('boox-search', { detail: val.toLowerCase() }))
  }

  const handleClear = () => {
    setSearchVal('')
    window.dispatchEvent(new CustomEvent('boox-search', { detail: '' }))
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        collapseIsland()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [searchVal])

  const openAdmin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin'
    }
  }

  return (
    <nav id="navbar" className="glass">
      <div className="nav-logo">
        <Image src="/assets/boox-logo.jpg" alt="Boox Store Logo" width={40} height={40} priority />
      </div>
      <div className="dynamic-island-wrap" id="di-wrap" ref={wrapRef}>
        <div className="electric-lines">
          <div className="electric-line el-1"></div>
          <div className="electric-line el-2"></div>
          <div className="electric-line el-3"></div>
          <div className="electric-line el-4"></div>
        </div>
        <div 
          className={`dynamic-island ${expanded ? 'expanded' : ''}`} 
          id="di"
          onClick={() => { if (!expanded) expandIsland() }}
        >
          <div className="island-collapsed">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)' }}>بحث...</span>
          </div>
          <div className="island-expanded">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1"
              strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input 
              type="search" 
              id="s-inp" 
              className="island-input" 
              placeholder="ابحث عن منتج، موديل، تصنيف..."
              autoComplete="off" 
              autoCorrect="off"
              ref={inputRef}
              value={searchVal}
              onChange={handleInput}
              onBlur={handleBlur}
            />
            <button 
              id="s-clr" 
              className="island-clear" 
              aria-label="مسح"
              style={{ display: searchVal ? 'flex' : 'none' }}
              onClick={handleClear}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      <button onClick={openAdmin} className="admin-btn" aria-label="Admin Panel">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a6 6 0 00-12 0v2H4v14h16V8h-2zm-8 0V6a2 2 0 114 0v2H8z" />
        </svg>
      </button>
    </nav>
  )
}
