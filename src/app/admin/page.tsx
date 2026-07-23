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
  IoLayersOutline,
  IoWalletOutline
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
    <div className="space-y-8">
      {/* Welcome Glass Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[32px] overflow-hidden border border-white/5 bg-[#0b0f16]/60 backdrop-blur-md p-8 md:p-10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 rounded-full blur-3xl -z-10"></div>
        
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
          أهلاً بك في لوحة الإدارة 👋
        </h1>
        <p className="text-gray-400 mt-3 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
          مرحباً بك مجدداً! إليك نظرة سريعة ومبسطة على أداء متجر <span className="text-cyan-400 font-bold">Boox Store</span> اليوم. يمكنك إعداد الفواتير، طباعة الإيصالات، وتعديل بيانات المخزن والمحتوى بكل أريحية.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
          className="lg:col-span-2 rounded-[32px] border border-white/5 bg-[#0b0f16]/40 backdrop-blur-md p-6 md:p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">آخر استفسارات العملاء</h2>
              <p className="text-xs text-gray-500 mt-1">آخر 5 طلبات تواصل عبر المتجر</p>
            </div>
            <Link href="/admin/leads" className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:underline">
              عرض الكل <IoArrowForwardOutline className="rotate-180 text-sm" />
            </Link>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                  <IoChatbubblesOutline className="text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">أحمد محمد</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">استفسار عن iPhone 15 Pro Max - 256GB</p>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 justify-end">
                    <IoTimeOutline /> منذ 5 دقائق
                  </span>
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black inline-block">نشط</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div 
          variants={item}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <div className="rounded-[32px] border border-white/5 bg-[#0b0f16]/40 backdrop-blur-md p-6 md:p-8 shadow-xl">
             <h2 className="text-xl font-black text-white mb-6">إجراءات سريعة</h2>
             <div className="grid gap-3">
               <QuickActionLink 
                 href="/admin/accounts" 
                 label="حساباتي وفواتير المحل" 
                 description="إدارة المبيعات، المشتريات، الأقساط وطباعة الفواتير"
                 icon={IoWalletOutline} 
                 color="blue" 
               />
               <QuickActionLink 
                 href="/admin/products/new" 
                 label="إضافة منتج جديد" 
                 description="أدخل تفاصيل ومواصفات المنتج وصوره في المخزن"
                 icon={IoCubeOutline} 
                 color="cyan" 
               />
               <QuickActionLink 
                 href="/admin/homepage" 
                 label="تعديل الصفحة الرئيسية" 
                 description="تحديث البانرات والإعلانات المعروضة للعملاء"
                 icon={IoHomeOutline} 
                 color="purple" 
               />
               <QuickActionLink 
                 href="/admin/categories" 
                 label="إدارة التصنيفات" 
                 description="إضافة وتعديل الأقسام الرئيسية لمنتجات الموقع"
                 icon={IoLayersOutline} 
                 color="emerald" 
               />
             </div>
          </div>

          <div className="rounded-[32px] border border-cyan-400/10 bg-cyan-400/5 p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all duration-500"></div>
            <h3 className="text-md font-black text-white relative z-10">نصيحة اليوم 💡</h3>
            <p className="text-xs text-gray-400 mt-2.5 leading-relaxed relative z-10 font-medium">
              الصور عالية الجودة تزيد من نسبة المبيعات بنسبة 40%. تأكد دائماً من إضافة 3 صور على الأقل وبجودة واضحة لكل منتج جديد تضعه في المخزن.
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
      className="rounded-[32px] border border-white/5 bg-[#0b0f16]/40 backdrop-blur-md p-6 md:p-8 group hover:border-white/10 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-black shadow-lg`}>
          <Icon className="text-xl" />
        </div>
        <span className="text-[10px] font-bold text-gray-500">{trend}</span>
      </div>
      <h3 className="text-gray-400 text-xs font-bold">{title}</h3>
      <p className="text-2xl md:text-3xl font-black text-white mt-1 tracking-tight">{value}</p>
    </motion.div>
  )
}

function QuickActionLink({ href, label, description, icon: Icon, color }: any) {
  const colors: any = {
    cyan: 'bg-cyan-400/5 text-cyan-400 border-cyan-400/10 hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]',
    purple: 'bg-purple-500/5 text-purple-400 border-purple-500/10 hover:bg-purple-500/10 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]',
    emerald: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    blue: 'bg-blue-500/5 text-blue-400 border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]',
  }
  return (
    <Link href={href}>
      <div className={`flex items-start gap-4 p-4.5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${colors[color]} group`}>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 shrink-0">
          <Icon className="text-xl" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-sm block text-white">{label}</span>
          <span className="text-[10px] text-gray-500 font-medium block mt-0.5 leading-normal truncate">{description}</span>
        </div>
      </div>
    </Link>
  )
}
