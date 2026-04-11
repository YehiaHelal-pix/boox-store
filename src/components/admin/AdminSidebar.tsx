'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Settings, PenTool, RefreshCcw, FileText, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
    { href: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { href: '/admin/products', icon: Package, label: 'المنتجات' },
    { href: '/admin/customize', icon: Settings, label: 'تخصيص الموقع' },
    { href: '/admin/maintenance', icon: PenTool, label: 'طلبات الصيانة' },
    { href: '/admin/trade', icon: RefreshCcw, label: 'طلبات الاستبدال' },
    { href: '/admin/logs', icon: FileText, label: 'سجل العمليات' },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        const sb = createClient()
        await sb.auth.signOut()
        router.push('/admin/login')
    }

    return (
        <aside className="w-full lg:w-72 glass border-l border-[var(--border)] min-h-screen flex flex-col p-6 gap-4 shrink-0">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[var(--border)]">
                <Image src="/boox-logo.jpg" alt="Boox Store" width={40} height={40} className="rounded-lg" style={{ filter: 'invert(1)' }} />
                <div>
                    <h2 className="font-black text-lg text-white">Boox Admin</h2>
                    <p className="text-[10px] text-[var(--text-muted)]">لوحة الإدارة</p>
                </div>
            </div>
            <nav className="flex flex-col gap-2 flex-grow">
                {links.map(link => {
                    const isActive = pathname === link.href
                    return (
                        <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all min-h-[44px] ${isActive ? 'bg-[var(--neon)] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'}`}>
                            <link.icon size={20} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-auto min-h-[44px] cursor-pointer">
                <LogOut size={20} />
                تسجيل الخروج
            </button>
        </aside>
    )
}
