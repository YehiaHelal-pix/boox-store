'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, ChevronLeft } from 'lucide-react'
import type { Product } from '@/types/database'

export default function AlsoViewed({ currentProductId, category }: { currentProductId: string; category?: string }) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // Track view in localStorage
    const viewsKey = 'boox_viewed_products'
    try {
      const saved: string[] = JSON.parse(localStorage.getItem(viewsKey) || '[]')
      if (!saved.includes(currentProductId)) {
        const updated = [currentProductId, ...saved].slice(0, 20)
        localStorage.setItem(viewsKey, JSON.stringify(updated))
      }
    } catch {}

    // Load similar products
    fetch('/api/products')
      .then(r => r.json())
      .then((data: Product[]) => {
        if (!Array.isArray(data)) return
        const similar = data
          .filter(p => p.id !== currentProductId && p.is_visible && p.in_stock)
          .filter(p => category ? p.category === category : true)
          .slice(0, 8)
        setProducts(similar)
      })
      .catch(() => {})
  }, [currentProductId, category])

  if (products.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t border-white/5" dir="rtl" style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Eye size={20} className="text-[var(--neon-cyan)] icon-interactive" style={{ animation: 'floatSoft 3s infinite' }} />
          عملاء شاهدوا أيضاً
        </h2>
        <Link href="/products" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition">
          عرض الكل <ChevronLeft size={14} />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {products.map((p, i) => (
          <Link
            key={p.id}
            href={`/products/${p.slug || p.id}`}
            className="group flex-shrink-0 w-[160px] sm:w-[180px] rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-[var(--neon-1)]/20 transition-all duration-300 hover:-translate-y-1 snap-start"
            style={{ animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}
          >
            <div className="aspect-square bg-white/5 relative overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-xs">لا توجد صورة</div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-xs font-bold text-gray-300 line-clamp-2 mb-1 group-hover:text-white transition-colors leading-relaxed">{p.name}</h3>
              {p.price && !p.price_on_inquiry ? (
                <span className="text-sm font-black text-[var(--neon-cyan)]">{p.price.toLocaleString('ar-EG')} ج</span>
              ) : (
                <span className="text-xs text-emerald-400 font-bold">اسأل عن السعر</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
