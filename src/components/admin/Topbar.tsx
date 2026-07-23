'use client'

import { IoNotificationsOutline, IoSearchOutline, IoPersonCircleOutline, IoMenuOutline } from 'react-icons/io5'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null)
    })
  }, [])

  return (
    <header className="h-20 border-b border-white/5 bg-[#06090f]/30 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 lg:px-10">
      <div className="flex items-center justify-between w-full h-full max-w-7xl mx-auto">
        
        {/* Left/Start Side: Mobile menu icon and search on larger screens */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="p-2 -mr-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all lg:hidden"
            aria-label="القائمة"
          >
            <IoMenuOutline className="text-2xl" />
          </button>

          <div className="relative max-w-md w-full hidden md:block">
            <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input 
              type="text" 
              placeholder="بحث في لوحة التحكم..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pr-12 pl-4 text-sm text-white outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>
        </div>

        {/* Center Side: Logo and brand name (Visible on mobile/tablet only) */}
        <div className="flex items-center gap-2 lg:hidden flex-1 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-sm">B</div>
          <span className="text-white font-black text-sm">Boox Store</span>
        </div>

        {/* Right Side: Icons, Profile */}
        <div className="flex items-center gap-2 md:gap-6 flex-1 lg:flex-initial justify-end">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <IoNotificationsOutline className="text-2xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#06090f]"></span>
          </button>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <p className="text-[10px] text-gray-500 font-bold text-left leading-none">أدمن المتجر</p>
              <p className="text-xs text-white font-black mt-1 leading-none">{userEmail || 'تحميل...'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 overflow-hidden">
              <IoPersonCircleOutline className="text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
