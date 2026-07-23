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
  IoWalletOutline,
  IoCloseOutline
} from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: IoGridOutline },
  { href: '/admin/products', label: 'المنتجات', icon: IoCubeOutline },
  { href: '/admin/categories', label: 'التصنيفات', icon: IoLayersOutline },
  { href: '/admin/filters', label: 'الفلاتر', icon: IoFilterOutline },
  { href: '/admin/homepage', label: 'الصفحة الرئيسية', icon: IoHomeOutline },
  { href: '/admin/leads', label: 'الطلبات والاستفسارات', icon: IoChatbubblesOutline },
  { href: '/admin/accounts', label: 'حساباتي', icon: IoWalletOutline },
]

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-[#06090f] border-l border-white/5 flex flex-col z-50 lg:hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-lg">B</div>
                <div>
                  <h1 className="text-white font-black text-md leading-none">Boox Store</h1>
                  <p className="text-[var(--neon-cyan)] text-[9px] font-bold uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="إغلاق القائمة"
              >
                <IoCloseOutline className="text-2xl" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <div className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                      isActive ? 'text-white bg-white/5 border border-white/10' : 'text-gray-500 hover:text-white'
                    }`}>
                      <item.icon className={`text-xl transition-colors ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                      <span className="font-bold text-sm">{item.label}</span>
                      {isActive && (
                         <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-white/5 space-y-2">
              <Link href="/admin/settings" onClick={onClose}>
                 <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-white transition-colors group">
                    <IoSettingsOutline className="text-xl group-hover:text-cyan-400" />
                    <span className="font-bold text-sm">الإعدادات</span>
                 </div>
              </Link>
              <button 
                onClick={() => {
                  onClose();
                  window.location.assign('/auth/logout');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500/70 hover:text-rose-400 transition-colors group hover:bg-rose-500/5 text-right"
              >
                <IoLogOutOutline className="text-xl" />
                <span className="font-bold text-sm">تسجيل الخروج</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
