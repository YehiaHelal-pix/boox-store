'use client'

import { IoNotificationsOutline, IoSearchOutline, IoPersonCircleOutline } from 'react-icons/io5'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Topbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null)
    })
  }, [])

  return (
    <header className="h-20 border-b border-white/5 bg-[#06090f]/30 backdrop-blur-md sticky top-0 z-40 px-6 md:px-8 lg:px-10">
      <div className="flex items-center justify-between w-full h-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full hidden md:block">
            <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input 
              type="text" 
              placeholder="بحث في لوحة التحكم..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pr-12 pl-4 text-sm text-white outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <IoNotificationsOutline className="text-2xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#06090f]"></span>
          </button>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <p className="text-xs text-gray-500 font-bold text-left">أدمن المتجر</p>
              <p className="text-sm text-white font-black">{userEmail || 'تحميل...'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 overflow-hidden">
              <IoPersonCircleOutline className="text-3xl" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
