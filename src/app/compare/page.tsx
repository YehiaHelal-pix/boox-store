'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Trash2, X, ChevronLeft, Battery, HardDrive, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react'
import { useCompare } from '@/store/compare'
import { useCart } from '@/store/cart'
import { getConditionLabel } from '@/lib/products'
import type { Product } from '@/types/database'
import { motion } from 'framer-motion'

function pushToast(msg: string, type: 'success' | 'error' | 'warn' | 'info') {
  window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
}

export default function ComparePage() {
  const router = useRouter()
  const { items, removeItem, clear } = useCompare()
  const addItem = useCart(s => s.addItem)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="min-h-screen bg-[#05080e]" />

  // Calculate winners for visual highlighting
  const validPrices = items.filter(p => !p.price_on_inquiry && typeof p.price === 'number').map(p => p.price as number)
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : null

  const validBatteries = items.filter(p => typeof p.battery_health === 'number').map(p => p.battery_health as number)
  const highestBattery = validBatteries.length > 0 ? Math.max(...validBatteries) : null

  const specs = [
    { 
      key: 'price', 
      label: '💰 السعر', 
      render: (p: Product) => {
        if (p.price_on_inquiry || !p.price) return <span className="text-gray-400">اسأل عن السعر</span>
        const isWinner = lowestPrice !== null && p.price === lowestPrice && items.length > 1
        return (
          <div className="flex flex-col items-center gap-1">
            <span className={`font-black ${isWinner ? 'text-emerald-400 text-base' : 'text-white'}`}>
              {p.price.toLocaleString('ar-EG')} ج.م
            </span>
            {isWinner && (
              <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold animate-pulse">
                السعر الأوفر 💰
              </span>
            )}
          </div>
        )
      } 
    },
    { 
      key: 'battery_health', 
      label: '🔋 صحة البطارية', 
      render: (p: Product) => {
        if (typeof p.battery_health !== 'number') return <span className="text-gray-500">—</span>
        const isWinner = highestBattery !== null && p.battery_health === highestBattery && items.length > 1
        return (
          <div className="flex flex-col items-center gap-1">
            <span className={`font-black ${isWinner ? 'text-cyan-400 text-base' : 'text-white'}`}>
              {p.battery_health}%
            </span>
            {isWinner && (
              <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-400 font-bold">
                البطارية الأقوى 🔋
              </span>
            )}
          </div>
        )
      } 
    },
    { key: 'condition', label: '✨ الحالة', render: (p: Product) => <span className="font-bold text-gray-200">{getConditionLabel(p.condition)}</span> },
    { key: 'storage_size', label: '💾 المساحة التخزينية', render: (p: Product) => <span className="font-bold text-gray-200">{p.storage_size || '—'}</span> },
    { key: 'color', label: '🎨 اللون الأصلي', render: (p: Product) => <span className="text-gray-300 font-medium">{p.color || '—'}</span> },
    { key: 'model', label: '📋 الموديل الفني', render: (p: Product) => <span className="text-gray-400 text-xs">{p.model || '—'}</span> },
    { key: 'in_stock', label: '📦 حالة التوفر', render: (p: Product) => p.in_stock ? <span className="text-emerald-400 font-bold">✅ متوفر بالمحل</span> : <span className="text-red-400 font-bold">❌ نفد مؤقتًا</span> },
  ]

  return (
    <div className="min-h-screen bg-[#06060c] text-white pb-24 pt-28 font-sans relative overflow-hidden" dir="rtl">
      {/* Visual background enhancements */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-radial-gradient" style={{
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <div className="mx-auto max-w-6xl px-4 relative z-10">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center text-xs text-gray-400 mb-6" style={{ animation: 'fadeInDown 0.4s ease both' }}>
          <button onClick={() => router.push('/')} className="hover:text-white transition">الرئيسية</button>
          <ChevronLeft size={12} className="mx-2 opacity-50" />
          <span className="text-cyan-400 font-bold">مقارنة المواصفات</span>
        </nav>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4" style={{ animation: 'fadeInUp 0.5s ease both' }}>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              <span className="neon-underline">📊 مقارنة الأجهزة الفورية</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">قارن بين مواصفات وحالات أسعار 3 أجهزة آبل جنباً إلى جنب لتختار الأفضل</p>
          </div>
          {items.length > 0 && (
            <button 
              onClick={() => { clear(); pushToast('تم مسح المقارنة', 'info') }} 
              className="text-xs font-bold text-red-400 border border-red-500/20 px-3.5 py-2 rounded-xl hover:bg-red-400/10 transition-all active:scale-95 flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>مسح المقارنة</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-24 glass-card border border-white/10 rounded-[32px] text-center" style={{ animation: 'fadeInScale 0.5s ease both' }}>
            <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">📊</div>
            <h3 className="text-lg text-white font-black">جدول المقارنة فارغ حالياً</h3>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              تصفح الكتالوج واضغط على أيقونة المقارنة (📊) المتاحة في صفحة المنتجات لمقارنة المواصفات فنيًا وسعريًا هنا.
            </p>
            <Link 
              href="/#products" 
              className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black px-6 py-3.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/15"
            >
              تصفح الكتالوج واكتشف الأجهزة
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin glass-card rounded-3xl border border-white/10 shadow-2xl p-2 md:p-4 bg-slate-950/45">
            <table className="w-full min-w-[700px] border-collapse">
              {/* Product Header Cards Row */}
              <thead>
                <tr className="border-b border-white/5">
                  <th className="w-[150px] p-4 text-right text-xs font-black text-gray-400 align-middle">المواصفات الفنية</th>
                  {items.map((p, i) => (
                    <th key={p.id} className="p-4 min-w-[200px] align-top" style={{ animation: `fadeInUp 0.4s ease ${i * 0.1}s both` }}>
                      <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 text-center transition-all duration-300 group">
                        {/* Remove button */}
                        <button 
                          onClick={() => removeItem(p.id)} 
                          className="absolute top-2 left-2 p-1 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                          title="إزالة من المقارنة"
                        >
                          <X size={14} />
                        </button>
                        
                        {/* Image */}
                        <div className="w-24 h-24 mx-auto mb-3 rounded-xl bg-black/20 overflow-hidden flex items-center justify-center p-1 border border-white/5">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-gray-600 text-xs">📷</div>
                          )}
                        </div>
                        
                        {/* Name */}
                        <Link 
                          href={`/products/${p.slug || p.id}`} 
                          className="text-xs font-black text-white hover:text-cyan-400 transition line-clamp-2 leading-relaxed min-h-[36px]"
                        >
                          {p.name}
                        </Link>
                        
                        {/* CTA add to cart */}
                        <button
                          onClick={() => { addItem(p); pushToast('تمت الإضافة للسلة', 'success') }}
                          className="mt-4 w-full text-[10px] font-bold py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <ShoppingBag size={12} />
                          <span>أضف للسلة الفورية</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Specifications Rows */}
              <tbody>
                {specs.map((spec, si) => (
                  <tr key={spec.key} className="border-b border-white/5 hover:bg-white/[0.015] transition-colors">
                    <td className="p-4 text-xs font-bold text-gray-300 text-right align-middle bg-white/[0.01]">{spec.label}</td>
                    {items.map(p => {
                      const val = spec.render(p)
                      return (
                        <td key={p.id} className="p-4 text-center text-xs text-gray-300 font-bold align-middle">
                          {val}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
