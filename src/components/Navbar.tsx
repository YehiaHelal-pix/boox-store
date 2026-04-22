'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const [expanded, setExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function expandSearch() {
    setExpanded(true)
    window.setTimeout(() => inputRef.current?.focus(), 80)
  }

  function collapseSearch() {
    if (searchValue.trim()) return
    setExpanded(false)
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setSearchValue(value)
    window.dispatchEvent(new CustomEvent('boox-search', { detail: value.toLowerCase() }))
  }

  function clearSearch() {
    setSearchValue('')
    window.dispatchEvent(new CustomEvent('boox-search', { detail: '' }))
    inputRef.current?.focus()
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        collapseSearch()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [searchValue])

  return (
    <nav id="navbar" className="glass">
      <div className="nav-logo">
        <Image src="/assets/boox-logo.jpg" alt="Boox Store Logo" width={40} height={40} priority />
      </div>

      <div className="dynamic-island-wrap" id="di-wrap" ref={wrapperRef}>
        <div className="electric-lines">
          <div className="electric-line el-1" />
          <div className="electric-line el-2" />
          <div className="electric-line el-3" />
          <div className="electric-line el-4" />
        </div>

        <div className={`dynamic-island ${expanded ? 'expanded' : ''}`} id="di" onClick={() => !expanded && expandSearch()}>
          <div className="island-collapsed">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)' }}>ابحث</span>
          </div>

          <div className="island-expanded">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              id="s-inp"
              className="island-input"
              placeholder="ابحث عن منتج أو موديل"
              autoComplete="off"
              autoCorrect="off"
              ref={inputRef}
              value={searchValue}
              onChange={handleInput}
              onBlur={() => window.setTimeout(collapseSearch, 180)}
            />
            <button
              id="s-clr"
              className="island-clear"
              aria-label="مسح البحث"
              style={{ display: searchValue ? 'flex' : 'none' }}
              onClick={clearSearch}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
