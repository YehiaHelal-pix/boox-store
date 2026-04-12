'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, GitCompare, RefreshCw, Share2 } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useComparison } from '@/hooks/useComparison'

export default function ProductCard({ product }: { product: any }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const { toggleCompare, isComparing } = useComparison()

    return (
        <div className="relative group bg-[#0a0a0a] rounded-[var(--radius)] overflow-hidden border border-white/10 hover:border-[var(--neon-cyan)] transition-all">

            {/* ❤️ Favorite button — top right */}
            <button
                onClick={(e) => { e.preventDefault(); toggleFavorite(product.id) }}
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
            >
                <Heart
                    size={18}
                    className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}
                />
            </button>

            {/* Main card link */}
            <Link href={`/products/${product.slug}`} className="block">
                {/* Product image */}
                <div className="relative h-48 w-full bg-[#050505]">
                    <Image
                        src={product.images?.[0] || '/boox-logo.jpg'}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                </div>

                {/* Product info */}
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-bold text-white truncate" title={product.name}>{product.name}</h3>
                    <p className="text-[var(--neon-cyan)] font-black text-lg mt-1">{product.price.toLocaleString('ar-EG')} جنيه</p>
                    {product.original_price && (
                        <p className="line-through text-gray-400 text-xs">
                            {product.original_price.toLocaleString('ar-EG')} جنيه
                        </p>
                    )}
                    <div className="flex gap-2 mt-2 text-xs text-gray-400">
                        <span className="bg-white/5 py-1 px-2 rounded">🔋 {product.battery_health}%</span>
                        <span className="bg-white/5 py-1 px-2 rounded">💾 {product.storage}</span>
                    </div>
                </div>
            </Link>

            {/* Action buttons below card */}
            <div className="p-3 flex flex-col gap-2 relative z-20">
                {/* Trade-in button */}
                <Link
                    href={`/trade?product=${product.slug}&name=${encodeURIComponent(product.name)}&price=${product.price}`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-white/20 rounded-lg text-sm text-white hover:bg-white/5 transition-colors"
                >
                    <RefreshCw size={14} />
                    استبدل مع جهازك القديم
                </Link>

                {/* Compare + Share row */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product.id); }}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 border rounded-lg text-xs transition-colors ${isComparing(product.id) ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-gray-600 text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        <GitCompare size={13} />
                        قارن
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title: product.name, url: `/products/${product.slug}` })
                            } else {
                                navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`)
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 border border-gray-600 rounded-lg text-xs text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        <Share2 size={13} />
                        شارك
                    </button>
                </div>
            </div>
        </div>
    )
}
