'use client'

import { useState, useEffect } from 'react'
import type { Category } from '@/types/database'

interface CategoryChipsProps {
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
}

export default function CategoryChipsV2({ selectedSlug, onSelect }: CategoryChipsProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin" style={{ scrollbarWidth: 'none' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* "الكل" chip */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
          selectedSlug === null
            ? 'border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] shadow-[0_0_16px_rgba(34,211,238,0.2)]'
            : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
        }`}
      >
        🌟 الكل
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.slug)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 whitespace-nowrap ${
            selectedSlug === cat.slug
              ? 'border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] shadow-[0_0_16px_rgba(34,211,238,0.2)]'
              : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
          }`}
        >
          {cat.icon && <span className="ml-1">{cat.icon}</span>}
          {cat.name_ar || cat.name}
        </button>
      ))}
    </div>
  )
}
