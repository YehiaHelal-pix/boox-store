'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Truck, ArrowRight, Heart, MessageCircle } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { openWhatsAppInquiry } from '@/lib/whatsapp'
import { CONDITION_LABELS } from '@/lib/products'
import AddToCartBtn from './AddToCartBtn'
import CallbackForm from './CallbackForm'
import ReserveForm from './ReserveForm'
import ShareButton from './ShareButton'
import ProductViewTracker from './ProductViewTracker'
import RecentlyViewed from './RecentlyViewed'
import ProductCard from './ProductCard'

import type { Product } from '@/types/database'

export default function ProductDetail({ product, similar }: { product: Product, similar: Product[] }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const tradeParams = new URLSearchParams({
        product: product.slug,
        name: product.name,
    })

    if (product.price !== null) {
        tradeParams.set('price', String(product.price))
    }

    return (
        <div className="min-h-screen py-10 px-4 lg:px-[var(--container)] max-w-7xl mx-auto">
            <ProductViewTracker productId={product.id} />
            <Link href="/products" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-8 transition-colors glass px-4 py-2 rounded-full w-fit hover:bg-white/5">
                <ArrowRight size={18} /> العودة للمنتجات
            </Link>

            <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
                <div className="w-full lg:w-1/2">
                    <div className="glass rounded-[2rem] aspect-square relative bg-gradient-to-tr from-[#0a0a14] to-[#1a1a24] overflow-hidden border-[var(--border)] lg:sticky top-[calc(var(--navbar-h)+2rem)] shadow-2xl shadow-black group">
                        {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8 hover:scale-105 transition-transform duration-700" priority />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] border border-white/5">صورة غير متوفرة</div>
                        )}
                        <div className="absolute top-6 right-6 bg-[var(--glass)] backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10 uppercase tracking-wider text-white shadow-xl">
                            {CONDITION_LABELS[product.condition]}
                        </div>
                        <button
                            onClick={(e) => { e.preventDefault(); toggleFavorite(product.id) }}
                            className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors border border-white/5"
                        >
                            <Heart size={24} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white'} />
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col gap-6 py-2">
                    <div className="pb-6 border-b border-[var(--border)]">
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-white leading-tight tracking-wide">{product.name}</h1>
                            <div className="mt-2 flex-shrink-0"><ShareButton title={product.name} /></div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mt-4">
                            <span className="text-4xl font-black text-[var(--neon-cyan)] block">
                                {product.price_on_inquiry || product.price === null ? 'اسأل على السعر' : `${product.price.toLocaleString('ar-EG')} ج`}
                            </span>
                            {product.original_price && (
                                <span className="text-xl text-[var(--text-muted)] line-through block opacity-70 mt-1 md:mt-0">{product.original_price.toLocaleString('ar-EG')} ج</span>
                            )}
                        </div>
                        <div className="flex gap-3 mt-4 flex-wrap">
                            <span className="bg-white/5 px-3 py-1 rounded-full text-sm text-gray-300 font-medium">بطارية {product.battery_health}%</span>
                            <span className="bg-white/5 px-3 py-1 rounded-full text-sm text-gray-300 font-medium">{product.storage}</span>
                            <span className="bg-white/5 px-3 py-1 rounded-full text-sm text-gray-300 font-medium">{product.color}</span>
                            {product.network && <span className="bg-white/5 px-3 py-1 rounded-full text-sm text-gray-300 font-medium">{product.network}</span>}
                        </div>
                    </div>

                    <div className="py-2">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">الوصف</h3>
                        <p className="text-gray-400 leading-relaxed whitespace-pre-wrap text-base opacity-90">
                            {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                        <div className="flex items-center gap-4 text-white glass p-4 rounded-2xl border border-[var(--border)]">
                            <div className="p-2 bg-[var(--neon)]/10 rounded-xl max-w-fit"><ShieldCheck className="text-[var(--neon-cyan)]" size={24} /></div>
                            <span className="font-bold text-sm">ضمان أصلي</span>
                        </div>
                        <div className="flex items-center gap-4 text-white glass p-4 rounded-2xl border border-[var(--border)]">
                            <div className="p-2 bg-[var(--neon)]/10 rounded-xl max-w-fit"><Truck className="text-[var(--neon-cyan)]" size={24} /></div>
                            <span className="font-bold text-sm">توصيل سريع مجاني</span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        {product.in_stock ? (
                            <>
                                <AddToCartBtn product={product} />
                                <button
                                    onClick={() => openWhatsAppInquiry(product)}
                                    className="w-full bg-[#25d366] text-black font-black py-4 px-8 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform min-h-[56px] text-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.45)] cursor-pointer"
                                >
                                    <MessageCircle size={24} />
                                    اطلب أو استفسر عبر واتساب
                                </button>
                            </>
                        ) : (
                            <div className="w-full py-4 text-center glass border border-red-500/50 text-red-500 font-bold rounded-2xl bg-red-500/10 text-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                عذراً، هذا المنتج نفد من المخزون
                            </div>
                        )}
                        <Link
                            href={`/trade?${tradeParams.toString()}`}
                            className="w-full py-4 text-center glass border border-orange-500/30 text-orange-400 font-bold rounded-2xl bg-orange-500/5 hover:bg-orange-500/10 transition-colors text-lg"
                        >
                            🔄 استبدل مع جهازك القديم واخصم الفارق
                        </Link>
                    </div>

                    <div className="flex flex-col gap-8 mt-6">
                        <CallbackForm productId={product.id} />
                        <ReserveForm productId={product.id} productName={product.name} />
                    </div>
                </div>
            </div>

            {/* Similar Products Section */}
            {similar.length > 0 && (
                <div className="mt-24">
                    <h2 className="text-2xl font-bold text-white mb-6 pr-2 border-r-4 border-[var(--neon-cyan)]">منتجات مشابهة قد تعجبك</h2>
                    <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-6 snap-x">
                        {similar.map(p => (
                            <div key={p.id} className="min-w-[280px] w-[280px] snap-center">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Viewed */}
            <div className="mt-20">
                <RecentlyViewed excludeId={product.id} />
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    )
}
