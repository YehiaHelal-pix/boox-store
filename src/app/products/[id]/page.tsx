import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ShieldCheck, Truck, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import AddToCartBtn from '@/components/products/AddToCartBtn'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('name, description').eq('id', id).single()

    if (!data) return { title: 'المنتج غير موجود' }
    return { title: data.name, description: data.description || 'احصل على هذا المنتج الآن من Boox Store' }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single()

    if (!product) notFound()

    return (
        <div className="min-h-screen py-10 px-4 lg:px-[var(--container)] max-w-7xl mx-auto">
            <Link href="/products" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-8 transition-colors glass px-4 py-2 rounded-full w-fit hover:bg-white/5">
                <ArrowRight size={18} /> العودة للمنتجات
            </Link>

            <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
                <div className="w-full lg:w-1/2">
                    <div className="glass rounded-[2rem] aspect-square relative bg-gradient-to-tr from-[#0a0a14] to-[#1a1a24] overflow-hidden border-[var(--border)] lg:sticky top-[calc(var(--navbar-h)+2rem)] shadow-2xl shadow-black">
                        {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8 hover:scale-105 transition-transform duration-700" priority />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">صورة غير متوفرة</div>
                        )}
                        <div className="absolute top-6 right-6 bg-[var(--glass)] backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10 uppercase tracking-wider text-white shadow-xl">
                            {product.category}
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col gap-8 py-2">
                    <div className="pb-8 border-b border-[var(--border)]">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-wide">{product.name}</h1>
                        <div className="flex items-center gap-6">
                            <span className="text-5xl font-black text-[var(--neon-cyan)] block">{product.price.toLocaleString()} ج</span>
                            {product.original_price && (
                                <span className="text-2xl text-[var(--text-muted)] line-through block mt-2 opacity-70">{product.original_price.toLocaleString()} ج</span>
                            )}
                        </div>
                    </div>

                    <div className="py-2">
                        <h3 className="text-xl font-bold text-white mb-4">وصف المنتج</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap text-lg font-medium opacity-90">
                            {product.description || 'وصف المنتج غير متوفر حالياً. ولكن كن واثقاً أننا لا نقدم سوى المنتجات الأصلية عالية الجودة.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                        <div className="flex items-center gap-4 text-white glass p-5 rounded-2xl border border-[var(--border)]">
                            <div className="p-3 bg-[var(--neon)]/10 rounded-xl"><ShieldCheck className="text-[var(--neon-cyan)]" size={28} /></div>
                            <span className="font-bold">ضمان سنة أصلية</span>
                        </div>
                        <div className="flex items-center gap-4 text-white glass p-5 rounded-2xl border border-[var(--border)]">
                            <div className="p-3 bg-[var(--neon)]/10 rounded-xl"><Truck className="text-[var(--neon-cyan)]" size={28} /></div>
                            <span className="font-bold">توصيل سريع مجاني</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        {product.in_stock ? (
                            <AddToCartBtn product={product} />
                        ) : (
                            <div className="w-full py-5 text-center glass border border-red-500/50 text-red-500 font-bold rounded-2xl bg-red-500/10 text-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                عذراً، هذا المنتج نفد من المخزون
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
