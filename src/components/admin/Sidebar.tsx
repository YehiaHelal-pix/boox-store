'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  IoGridOutline, 
  IoCubeOutline, 
  IoLayersOutline, 
  IoFilterOutline, 
  IoHomeOutline, 
  IoChatbubblesOutline,
  IoLogOutOutline,
  IoSettingsOutline,
  IoWalletOutline
} from 'react-icons/io5'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: IoGridOutline },
  { href: '/admin/products', label: 'المنتجات', icon: IoCubeOutline },
  { href: '/admin/categories', label: 'التصنيفات', icon: IoLayersOutline },
  { href: '/admin/filters', label: 'الفلاتر', icon: IoFilterOutline },
  { href: '/admin/homepage', label: 'الصفحة الرئيسية', icon: IoHomeOutline },
  { href: '/admin/leads', label: 'الطلبات والاستفسارات', icon: IoChatbubblesOutline },
  { href: '/admin/accounts', label: 'حساباتي', icon: IoWalletOutline },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 hidden lg:flex flex-col h-screen sticky top-0 border-l border-white/5 bg-[#06090f]/50 backdrop-blur-xl z-50">
      <div className="p-8 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-xl">B</div>
          <div>
            <h1 className="text-white font-black text-lg leading-none">Boox Store</h1>
            <p className="text-[var(--neon-cyan)] text-[10px] font-bold uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-white'
              }`}>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`text-xl relative z-10 transition-colors ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                <span className="font-bold text-sm relative z-10">{item.label}</span>
                {isActive && (
                   <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                   />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-2">
        <Link href="/admin/settings">
           <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-500 hover:text-white transition-colors group">
              <IoSettingsOutline className="text-xl group-hover:text-cyan-400" />
              <span className="font-bold text-sm">الإعدادات</span>
           </div>
        </Link>
        <button 
          onClick={() => window.location.assign('/auth/logout')}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-rose-500/70 hover:text-rose-400 transition-colors group hover:bg-rose-500/5"
        >
          <IoLogOutOutline className="text-xl" />
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}
