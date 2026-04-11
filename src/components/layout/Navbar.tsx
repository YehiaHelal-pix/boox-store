'use client'
import Link from 'next/link'
import Image from 'next/image'
import CartButton from '../cart/CartButton'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const CartDrawer = dynamic(() => import('../cart/CartDrawer'), { ssr: false })

export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false)

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
                    <CartButton onClick={() => setIsCartOpen(true)} />
                </div>
            </nav>
            {isCartOpen && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
        </>
    )
}
