'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'
import { useComparison } from '@/hooks/useComparison'
import { Scale, X, Check, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ComparePage() {
    const { compareItems, isLoaded, removeCompare } = useComparison()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCompare = async () => {
            if (!isLoaded) return
            if (compareItems.length === 0) {
                setProducts([])
                setLoading(false)
                return
            }

            setLoading(true)
            const sb = createClient()
            const { data } = await sb.from('products').select('*').in('id', compareItems)
            // Keep the exact order that user added them
            if (data) {
                const sorted = compareItems.map(id => data.find(p => p.id === id)).filter(Boolean) as Product[]
                setProducts(sorted)
            }
            setLoading(false)
        }

        fetchCompare()
    }, [compareItems, isLoaded])

    const specs = [
        { label: 'السعر', render: (p: Product) => <span className="font-bold text-[var(--neon)]">{p.price} ج.م</span> },
        { label: 'الحالة', render: (p: Product) => p.condition || '-' },
        { label: 'المساحة', render: (p: Product) => p.storage || '-' },
        { label: 'البطارية', render: (p: Product) => p.battery_health ? `${p.battery_health}%` : '-' },
        { label: 'موديل الجهاز', render: (p: Product) => p.model || '-' },
        { label: 'الشبكة', render: (p: Product) => p.network || '-' },
        { label: 'متوفر', render: (p: Product) => p.in_stock ? <Check size={20} className="text-green-400 mx-auto" /> : <X size={20} className="text-red-400 mx-auto" /> }
    ]

    return (
        <div className="min-h-screen py-10 px-4 lg:px-[var(--container)] max-w-[1400px] mx-auto overflow-x-hidden">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Scale size={32} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white">مقارنة المنتجات</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">قارن بين مواصفات جهازين لتسهيل الاختيار</p>
                </div>
            </div>

            {!isLoaded || loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : products.length === 0 ? (
                <div className="glass rounded-[2rem] p-16 text-center border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                        <Scale size={48} className="text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-400">لا توجد منتجات للمقارنة</h2>
                    <p className="text-gray-500">اضغط على أيقونة الميزان في صفحة المنتجات لمقارنتها هنا (بحد أقصى جهازين)</p>
                    <Link href="/products" className="bg-[var(--neon-cyan)] text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">تصفح المنتجات</Link>
                </div>
            ) : (
                <div className="overflow-x-auto w-full hide-scrollbar rounded-[2rem] border border-white/10 shadow-2xl bg-[#0a0a0f]/80 backdrop-blur-xl">
                    <table className="w-full text-center table-fixed min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="w-1/3 p-4 bg-white/5 text-gray-400 border-b border-white/10 font-medium whitespace-nowrap">المواصفات</th>
                                {products.map(p => (
                                    <th key={p.id} className="w-1/3 p-4 bg-white/5 border-b border-white/10 relative">
                                        <button onClick={() => removeCompare(p.id)} className="absolute top-4 left-4 p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
                                        <div className="w-24 h-24 mx-auto bg-white/5 rounded-2xl p-2 mb-3 relative overflow-hidden">
                                            {p.images && p.images[0] ? (
                                                <Image src={p.images[0]} alt={p.name} fill className="object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-white/10" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-white text-sm line-clamp-2 min-h-[40px]">{p.name}</h3>
                                    </th>
                                ))}
                                {products.length === 1 && (
                                    <th className="w-1/3 p-4 bg-white/5 border-b border-white/10 border-r border-white/5">
                                        <div className="w-24 h-24 mx-auto rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center mb-3">
                                            <Scale size={24} className="text-gray-600" />
                                        </div>
                                        <Link href="/products" className="text-blue-400 hover:underline text-sm font-bold">أضف منتج آخر</Link>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {specs.map((spec, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 border-b border-white/5 text-gray-400 text-sm font-medium whitespace-nowrap">{spec.label}</td>
                                    {products.map(p => (
                                        <td key={p.id} className="p-4 border-b border-white/5 border-r border-white/5 text-white text-sm">{spec.render(p)}</td>
                                    ))}
                                    {products.length === 1 && <td className="p-4 border-b border-white/5 border-r border-white/5"></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
