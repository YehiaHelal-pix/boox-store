'use client'

import Link from 'next/link'
import { IoArrowBackOutline, IoWalletOutline } from 'react-icons/io5'

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black shadow-lg">
            <IoWalletOutline className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">حساباتي وفواتير المحل</h1>
            <p className="text-gray-400 mt-1">إدارة ومتابعة فواتير المبيعات والمشتريات والأقساط</p>
          </div>
        </div>
        <Link href="/admin" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold text-sm">
          <span>الرجوع للوحة التحكم</span>
          <IoArrowBackOutline className="text-lg rotate-180" />
        </Link>
      </div>

      {/* Frame Container */}
      <div className="w-full h-[calc(100vh-260px)] md:h-[calc(100vh-220px)] rounded-2xl md:rounded-[32px] overflow-hidden border border-white/5 bg-[#0b0f16]/50 backdrop-blur-md relative">
        <iframe
          src="/api/admin/accounts-html"
          className="w-full h-full border-none bg-transparent"
          title="حساباتي وفواتير المحل"
        />
      </div>
    </div>
  )
}
