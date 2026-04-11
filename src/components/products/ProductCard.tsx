'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import type { Product } from '@/types/product'
import { useToastStore } from '@/components/ui/Toast'
import { Plus } from 'lucide-react'

export default function ProductCard({ product }: { product: Product }) {
    const addItem = useCart(s => s.addItem)
    const addToast = useToastStore(s => s.addToast)

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!product.in_stock) return
        addItem(product)
        addToast('تمت الإضافة للسلة', 'success')
    }

    return (
        <Link href={`/products/${product.id}`} className="group relative flex flex-col glass rounded-[var(--radius)] overflow-hidden transition-all hover:-translate-y-1 hover:border-[var(--neon-cyan)] cursor-pointer">
            <div className="aspect-square w-full relative bg-[#0a0a14] overflow-hidden">
                {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">لا صورة</div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10 uppercase tracking-wider text-[var(--text)]">
                    {product.category}
                </div>
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                        <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">نفد المخزون</span>
                    </div>
                )}
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
            </div>
        </Link>
    )
}
