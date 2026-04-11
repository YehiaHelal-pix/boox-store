'use client'
import Link from 'next/link'
import { Home, ShoppingBag, PenTool, RefreshCcw } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
    const pathname = usePathname()

    const links = [
        { href: '/', icon: Home, label: 'الرئيسية' },
        { href: '/products', icon: ShoppingBag, label: 'تسوق' },
        { href: '/maintenance', icon: PenTool, label: 'صيانة' },
        { href: '/trade', icon: RefreshCcw, label: 'استبدال' }
    ]

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full glass border-t border-[var(--border)] py-2 px-4 z-40 pb-[calc(10px+env(safe-area-inset-bottom))] bg-[var(--bg)]/90 backdrop-blur-xl">
            <div className="flex justify-between items-center max-w-sm mx-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/')
                    return (
                        <Link key={link.href} href={link.href} className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] gap-1 transition-colors ${isActive ? 'text-[var(--neon-cyan)]' : 'text-[var(--text-muted)] hover:text-white'}`}>
                            <link.icon size={20} className={isActive ? 'animate-bounce' : ''} />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
