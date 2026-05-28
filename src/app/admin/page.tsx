'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  IoCubeOutline, 
  IoPeopleOutline, 
  IoChatbubblesOutline, 
  IoTrendingUpOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoHomeOutline,
  IoLayersOutline
} from 'react-icons/io5'
import Link from 'next/link'

interface Stats {
  totalProducts: number
  activeLeads: number
  totalCategories: number
  recentInquiries: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeLeads: 0,
    totalCategories: 0,
    recentInquiries: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        const data = await res.json()
        if (!data.error) {
          setStats({
            totalProducts: data.total_products || 0,
            activeLeads: data.active_leads || 0,
            totalCategories: data.total_categories || 0,
            recentInquiries: data.recent_leads || 0
          })
        }
      } catch (err) {
        console.error('Failed to fetch stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-black text-white">أهلاً بك في لوحة الإدارة 👋</h1>
        <p className="text-gray-400 mt-2">إليك نظرة سريعة على أداء متجر Boox اليوم.</p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard 
          title="إجمالي المنتجات" 
          value={stats.totalProducts} 
          icon={IoCubeOutline} 
          color="cyan" 
          trend="+3 منتجات جديدة"
        />
        <StatCard 
          title="طلبات التواصل" 
          value={stats.activeLeads} 
          icon={IoChatbubblesOutline} 
          color="purple" 
          trend="+12 ساعة الأخيرة"
        />
        <StatCard 
          title="التصنيفات" 
          value={stats.totalCategories} 
          icon={IoTrendingUpOutline} 
          color="emerald" 
          trend="مستقر"
        />
        <StatCard 
          title="معدل التحويل" 
          value="4.8%" 
          icon={IoPeopleOutline} 
          color="blue" 
          trend="+0.2% عن الشهر الماضي"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries */}
        <motion.div 
          variants={item}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-sm p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-white">آخر استفسارات العملاء</h2>
              <p className="text-sm text-gray-500 mt-1">آخر 5 طلبات تواصل عبر المتجر</p>
            </div>
            <Link href="/admin/leads" className="flex items-center gap-2 text-sm text-cyan-400 font-bold hover:underline">
              عرض الكل <IoArrowForwardOutline className="rotate-180" />
            </Link>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                  <IoChatbubblesOutline className="text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">أحمد محمد</h3>
                  <p className="text-xs text-gray-500 mt-1">استفسار عن iPhone 15 Pro Max - 256GB</p>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 justify-end">
                    <IoTimeOutline /> منذ 5 دقائق
                  </span>
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black inline-block">نشط</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={item}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <div className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-sm p-8">
             <h2 className="text-xl font-black text-white mb-6">إجراءات سريعة</h2>
             <div className="grid gap-3">
               <QuickActionLink href="/admin/products/new" label="إضافة منتج جديد" icon={IoCubeOutline} color="cyan" />
               <QuickActionLink href="/admin/homepage" label="تعديل الصفحة الرئيسية" icon={IoHomeOutline} color="purple" />
               <QuickActionLink href="/admin/categories" label="إدارة التصنيفات" icon={IoLayersOutline} color="emerald" />
             </div>
          </div>

          <div className="rounded-[32px] border border-cyan-400/10 bg-cyan-400/5 p-8 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all"></div>
            <h3 className="text-lg font-black text-white relative z-10">نصيحة اليوم 💡</h3>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed relative z-10">
              الصور عالية الجودة تزيد من نسبة البيع بنسبة 40%. تأكد من إضافة 3 صور على الأقل لكل منتج جديد.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    cyan: 'from-cyan-400 to-blue-500 shadow-cyan-500/10',
    purple: 'from-fuchsia-500 to-purple-600 shadow-purple-500/10',
    emerald: 'from-emerald-400 to-teal-500 shadow-emerald-500/10',
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/10',
  }

  return (
    <motion.div 
      variants={item}
      className="rounded-[32px] border border-white/5 bg-[#0b0f16]/50 backdrop-blur-sm p-8 group hover:border-white/10 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-black shadow-lg`}>
          <Icon className="text-2xl" />
        </div>
        <span className="text-xs font-bold text-gray-500">{trend}</span>
      </div>
      <h3 className="text-gray-400 text-sm font-bold">{title}</h3>
      <p className="text-3xl font-black text-white mt-1 tracking-tight">{value}</p>
    </motion.div>
  )
}

function QuickActionLink({ href, label, icon: Icon, color }: any) {
  const colors: any = {
    cyan: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${colors[color]}`}>
        <Icon className="text-xl" />
        <span className="font-bold text-sm">{label}</span>
      </div>
    </Link>
  )
}
