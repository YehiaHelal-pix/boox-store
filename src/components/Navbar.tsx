'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard } from 'lucide-react'
import CartButton from '@/components/cart/CartButton'
import { createClient } from '@/lib/supabase/client'

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false })

export default function Navbar() {
  const [expanded, setExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search autocomplete state
  const [products, setProducts] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])

  // Load products once client-side for fast instant search matching
  useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, price, price_on_inquiry, images')
          .eq('is_available', true)
        if (data) setProducts(data)
      } catch (err) {
        console.error('Failed to load search autocomplete data:', err)
      }
    }
    loadProducts()
  }, [])

  // Filter suggestions instantly on type
  useEffect(() => {
    if (!searchValue.trim()) {
      setSuggestions([])
      return
    }
    const term = searchValue.toLowerCase().trim()
    const matches = products.filter(p => 
      p.name?.toLowerCase().includes(term) ||
      p.slug?.toLowerCase().includes(term)
    ).slice(0, 5)
    setSuggestions(matches)
  }, [searchValue, products])

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
    <>
      <nav id="navbar" className="glass">
        <div className="boox-navbar-row">
          {/* Right Side: Small Logo */}
          <div className="navbar-side-item navbar-side-right">
            <Link href="/" className="nav-logo-link" aria-label="Boox Store">
              <span className="nav-logo-shell">
                <Image src="/assets/boox-logo-outline.png" alt="Boox Store Logo" width={356} height={400} priority />
              </span>
              <span className="nav-logo-wordmark">Boox Store</span>
            </Link>
          </div>

          {/* Center: Search Bar (Absolute Centered) */}
          <div className="navbar-center-search">
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
                  <button id="s-clr" className="island-clear" aria-label="مسح البحث" style={{ display: searchValue ? 'flex' : 'none' }} onClick={clearSearch}>
                    ×
                  </button>
                </div>
              </div>

              {/* Autocomplete Dropdown */}
              {expanded && suggestions.length > 0 && (
                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-[300px] sm:w-[360px] md:w-[420px] p-3 rounded-2xl glass border border-white/10 shadow-2xl z-50 text-right overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="text-xs text-cyan-400 font-bold mb-2 pr-1">✨ الاقتراحات السريعة:</div>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((p) => (
                      <Link 
                        key={p.id} 
                        href={`/products/${p.slug || p.id}`}
                        onClick={() => {
                          setSearchValue('')
                          setExpanded(false)
                          window.dispatchEvent(new CustomEvent('boox-search', { detail: '' }))
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-white/5">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs text-gray-500">📷</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-right" dir="rtl">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {p.price_on_inquiry ? 'السعر عند الطلب' : `${p.price?.toLocaleString('ar-EG')} جنيه`}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Left Side: Settings & Cart */}
          <div className="navbar-side-item navbar-side-left">
            <Link href="/products" className="admin-link group" title="كل المنتجات">
              <svg 
                className="w-5 h-5 text-white/70 group-hover:text-cyan-400 transition-colors" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
              <span className="hidden sm:inline group-hover:text-cyan-400 transition-colors">الكتالوج</span>
            </Link>
            <Link
              href="/admin/login"
              className="admin-btn navbar-neon-icon navbar-icon-btn"
              data-action="admin"
              aria-label="لوحة الإدارة"
              title="لوحة الإدارة"
            >
              <LayoutDashboard size={18} />
            </Link>
            <CartButton onClick={() => setCartOpen(true)} />
          </div>
        </div>
      </nav>

      {cartOpen ? <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} /> : null}
    </>
  )
}
