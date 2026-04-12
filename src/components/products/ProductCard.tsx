'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import type { Product } from '@/lib/supabase/types'
import { useToastStore } from '@/components/ui/Toast'
import { Plus, Heart, Scale } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useComparison } from '@/hooks/useComparison'

export default function ProductCard({ product }: { product: Product }) {
    const addItem = useCart(s => s.addItem)
    const addToast = useToastStore(s => s.addToast)
    const { toggleFavorite, isFavorite, isLoaded: favLoaded } = useFavorites()
    const { toggleCompare, isComparing, isLoaded: compLoaded } = useComparison()

    const isFav = favLoaded && isFavorite(product.id)
    const isComp = compLoaded && isComparing(product.id)
    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!product.in_stock) return
        addItem(product)
        addToast('تمت الإضافة للسلة', 'success')
    }

    const mainImage = product.images?.[0] || null

    return (
        <Link href={`/products/${product.id}`} className="group relative flex flex-col glass rounded-[var(--radius)] overflow-hidden transition-all hover:-translate-y-1 hover:border-[var(--neon-cyan)] cursor-pointer">
            <div className="aspect-square w-full relative bg-[#0a0a14] overflow-hidden">
                {mainImage ? (
                    <Image src={mainImage} alt={product.name} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">لا صورة</div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10 uppercase tracking-wider text-[var(--text)]">
                    {product.condition === 'excellent' ? 'ممتاز' : product.condition === 'good' ? 'جيد جداً' : 'جيد'}
                </div>
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                        <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">نفد المخزون</span>
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(product.id)
                    }}
                    className={`absolute top-2 left-2 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isFav ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'}`}
                >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : ''} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleCompare(product.id)
                        addToast(isComp ? 'تمت الإزالة من المقارنة' : 'تمت الإضافة للمقارنة', 'success')
                    }}
                    className={`absolute top-12 left-2 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isComp ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'}`}
                >
                    <Scale size={16} className={isComp ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''} />
                </button>
            </div>
            <div className="p-3 lg:p-4 flex flex-col gap-2 flex-grow justify-between bg-gradient-to-t from-black/40 to-transparent">
                <h3 className="font-bold text-sm lg:text-base line-clamp-1 truncate text-white" title={product.name}>{product.name}</h3>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col justify-center">
                        <span className="text-[var(--neon-cyan)] font-black text-sm lg:text-base leading-none block pt-1">{product.price.toLocaleString()} ج</span>
                        {product.original_price && (
                            <span className="text-[var(--text-muted)] line-through text-[10px] lg:text-xs leading-none mt-1">{product.original_price.toLocaleString()} ج</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!product.in_stock}
                        className="w-10 h-10 rounded-full bg-[var(--glass)] border border-[var(--border)] flex items-center justify-center transition-all hover:bg-[var(--neon)] hover:border-transparent hover:text-white hover:scale-110 disabled:opacity-50 disabled:pointer-events-none z-20 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                        aria-label="أضف للسلة"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.location.href = `/trade?product=${product.slug}&name=${encodeURIComponent(product.name)}&price=${product.price}`
                    }}
                    className="w-full mt-2 bg-transparent border border-white/20 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-sm cursor-pointer z-20"
                >
                    🔄 استبدل مع جهازك القديم
                </button>
            </div>
        </Link>
    )
}
