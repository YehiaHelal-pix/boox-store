'use client'
import Link from 'next/link'
import Image from 'next/image'
import CartButton from '../cart/CartButton'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Heart, Scale } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useComparison } from '@/hooks/useComparison'

const CartDrawer = dynamic(() => import('../cart/CartDrawer'), { ssr: false })

export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false)
    const { count: favCount, isLoaded: favLoaded } = useFavorites()
    const { count: compCount, isLoaded: compLoaded } = useComparison()

    return (
        <>
            <nav className="fixed top-0 w-full z-40 glass h-[var(--navbar-h)] flex items-center justify-between px-4 lg:px-[var(--container)] transition-all">
                <div className="flex items-center gap-6">
                    <Link href="/">
                        <Image src="/boox-logo.jpg" alt="Boox Store" width={40} height={40} className="rounded-md" style={{ filter: 'invert(1)' }} />
                    </Link>
                    <div className="hidden md:flex gap-4 font-medium">
                        <Link href="/products" className="hover:text-[var(--neon-cyan)] transition-colors">المنتجات</Link>
                        <Link href="/maintenance" className="hover:text-[var(--neon-cyan)] transition-colors">الصيانة</Link>
                        <Link href="/trade" className="hover:text-[var(--neon-cyan)] transition-colors">الاستبدال</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/compare" className="relative p-2 text-white hover:text-blue-400 transition-colors flex items-center justify-center">
                        <Scale size={24} />
                        {compCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                {compCount}
                            </span>
                        )}
                    </Link>
                    <Link href="/favorites" className="relative p-2 text-white hover:text-red-400 transition-colors flex items-center justify-center">
                        <Heart size={24} />
                        {favCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                {favCount}
                            </span>
                        )}
                    </Link>
                    <CartButton onClick={() => setIsCartOpen(true)} />
                </div>
            </nav>
            {isCartOpen && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
        </>
    )
}
