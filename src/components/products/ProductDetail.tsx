'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Truck, ArrowRight, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { CONDITION_LABELS } from '@/lib/products'
import AddToCartBtn from './AddToCartBtn'
import CallbackForm from './CallbackForm'
import ReserveForm from './ReserveForm'
import ShareButton from './ShareButton'
import ProductViewTracker from './ProductViewTracker'
import RecentlyViewed from './RecentlyViewed'
import ProductCard from './ProductCard'
import type { ProductCondition } from '@/types/database'

export default function ProductDetail({ product, similar }: { product: any, similar: any[] }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const images = product.images?.length > 0 ? product.images : (product.image_url ? [product.image_url] : [])
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    const discount =
        product.original_price && product.price && product.original_price > product.price
            ? Math.round((1 - product.price / product.original_price) * 100)
            : 0

    return (
        <div className="min-h-screen py-8 px-4 lg:px-8 max-w-7xl mx-auto">
            <ProductViewTracker productId={product.id} />
            <Link href="/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm bg-white/5 border border-white/[0.06] px-4 py-2 rounded-xl w-fit hover:bg-white/10">
                <ArrowRight size={16} /> العودة للمنتجات
            </Link>

            <div className="flex flex-col lg:flex-row gap-8 xl:gap-14">
                {/* Images */}
                <div className="w-full lg:w-1/2">
                    <div className="lg:sticky top-24">
                        <div className="relative rounded-2xl aspect-square bg-gradient-to-br from-[#0c1220] to-[#080e1a] border border-white/[0.06] overflow-hidden group">
                            {images[activeImageIndex] ? (
                                <Image
                                    src={images[activeImageIndex]}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <span className="text-5xl">📱</span>
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <span className="bg-indigo-500/20 backdrop-blur-md text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-500/20">
                                    {CONDITION_LABELS[product.condition as ProductCondition] ?? 'جيد'}
                                </span>
                                {discount > 0 ? (
                                    <span className="bg-red-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                        خصم {discount}%
                                    </span>
                                ) : null}
                            </div>

                            <button
                                onClick={(e) => { e.preventDefault(); toggleFavorite(product.id) }}
                                className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 flex items-center justify-center transition-colors border border-white/10"
                            >
                                <Heart size={20} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white/70'} />
                            </button>

                            {/* Image navigation arrows */}
                            {images.length > 1 ? (
                                <>
                                    <button
                                        onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/60"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImageIndex((i) => (i - 1 + images.length) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/60"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            ) : null}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 ? (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-16 h-16 rounded-xl border overflow-hidden flex-shrink-0 transition-all ${
                                            idx === activeImageIndex
                                                ? 'border-cyan-500 ring-1 ring-cyan-500/30'
                                                : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <Image src={img} alt="" width={64} height={64} className="w-full h-full object-contain bg-[#080c15] p-1" />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Details */}
                <div className="w-full lg:w-1/2 flex flex-col gap-5">
                    <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{product.name}</h1>
                            <div className="flex-shrink-0 mt-1"><ShareButton title={product.name} /></div>
                        </div>

                        {/* Price block */}
                        <div className="bg-gradient-to-r from-cyan-500/5 to-transparent border border-cyan-500/10 rounded-xl px-5 py-4 mt-3">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-cyan-400">{product.price?.toLocaleString('ar-EG') ?? '—'} <span className="text-lg">ج.م</span></span>
                                {product.original_price ? (
                                    <span className="text-lg text-gray-500 line-through">{product.original_price.toLocaleString('ar-EG')} ج.م</span>
                                ) : null}
                            </div>
                            {discount > 0 ? (
                                <span className="text-xs text-red-400 font-bold mt-1 block">وفر {(product.original_price - product.price).toLocaleString('ar-EG')} ج.م</span>
                            ) : null}
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {typeof product.battery_health === 'number' ? (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                                <div className="text-lg font-black text-white">{product.battery_health}%</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">البطارية</div>
                            </div>
                        ) : null}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                            <div className="text-lg font-black text-white">{product.storage || product.storage_size}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">السعة</div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                            <div className="text-lg font-black text-white">{product.color}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">اللون</div>
                        </div>
                        {product.network ? (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                                <div className="text-lg font-black text-white">{product.network}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">الشبكة</div>
                            </div>
                        ) : null}
                    </div>

                    {/* Description */}
                    <div className="border-t border-white/[0.06] pt-4">
                        <h3 className="text-base font-bold text-white mb-2">الوصف</h3>
                        <p className="text-gray-400 leading-relaxed whitespace-pre-wrap text-sm">
                            {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                        </p>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="text-emerald-400" size={20} />
                            </div>
                            <span className="font-bold text-sm text-white">ضمان أصلي</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <Truck className="text-blue-400" size={20} />
                            </div>
                            <span className="font-bold text-sm text-white">توصيل سريع</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-3 mt-2">
                        {product.in_stock ? (
                            <AddToCartBtn product={product} />
                        ) : (
                            <div className="w-full py-4 text-center border border-red-500/30 text-red-400 font-bold rounded-xl bg-red-500/10 text-base">
                                عذراً، هذا المنتج نفد من المخزون
                            </div>
                        )}
                        <Link
                            href={`/trade?product=${product.slug}&name=${encodeURIComponent(product.name)}&price=${product.price}`}
                            className="w-full py-3.5 text-center border border-amber-500/20 text-amber-400 font-bold rounded-xl bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-sm"
                        >
                            🔄 استبدل مع جهازك القديم
                        </Link>
                    </div>

                    {/* Forms */}
                    <div className="flex flex-col gap-6 mt-4 border-t border-white/[0.06] pt-6">
                        <CallbackForm productId={product.id} />
                        <ReserveForm productId={product.id} productName={product.name} />
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similar.length > 0 ? (
                <div className="mt-20">
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-cyan-400 rounded-full" />
                        منتجات مشابهة
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {similar.slice(0, 4).map((p: any) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Recently Viewed */}
            <div className="mt-16">
                <RecentlyViewed excludeId={product.id} />
            </div>
        </div>
    )
}
