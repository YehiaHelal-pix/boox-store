'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Smartphone, Shield, Zap, Sparkles, BarChart3 } from 'lucide-react'

interface HeroConfig {
  hero_title: string
  hero_slogan_line1: string
  hero_slogan_line2: string
  hero_stat_products_label: string
  hero_stat_warranty_label: string
  hero_stat_support_label: string
  hero_stat_support_value: string
  hero_stat_warranty_value: string
}

type StatsEvent = Event & { detail: number }

const DEFAULT_CONFIG: HeroConfig = {
  hero_title: 'Boox Store',
  hero_slogan_line1: 'من بوكس تشتري تفاح وانت بالك مرتاح',
  hero_slogan_line2: 'أجهزة آبل أصلية بضمان حقيقي وفحص فني شامل',
  hero_stat_products_label: 'منتج متاح حاليًا',
  hero_stat_warranty_label: 'ضمان حقيقي',
  hero_stat_support_label: 'دعم فني متواصل',
  hero_stat_support_value: '24/7',
  hero_stat_warranty_value: '100%',
}

export default function Hero() {
  const [displayCount, setDisplayCount] = useState(0)
  const [siteConfig, setSiteConfig] = useState<HeroConfig>(DEFAULT_CONFIG)
  const sectionRef = useRef<HTMLElement>(null)

  // Subtle scroll parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const logoY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  useEffect(() => {
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data: Partial<HeroConfig> & { error?: string }) => {
        if (!data.error) {
          setSiteConfig((current) => ({ ...current, ...data }))
        }
      })
      .catch(() => undefined)

    function handleStats(event: Event) {
      const target = (event as StatsEvent).detail
      if (!target) return

      let current = 0
      const step = Math.max(1, Math.ceil(target / 30))
      const timer = window.setInterval(() => {
        current = Math.min(current + step, target)
        setDisplayCount(current)
        if (current >= target) {
          window.clearInterval(timer)
        }
      }, 40)
    }

    window.addEventListener('boox-stats', handleStats)
    return () => window.removeEventListener('boox-stats', handleStats)
  }, [])

  return (
    <section 
      id="home" 
      ref={sectionRef} 
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 px-4 md:px-8 border-b border-white/5"
      dir="rtl"
    >
      {/* Space Spotlight Background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(99, 102, 241, 0.15) 0%, rgba(34, 211, 238, 0.05) 45%, transparent 75%)'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-[2px]" />
      </motion.div>

      {/* Main Centered Content */}
      <motion.div 
        style={{ y: contentY }}
        className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center z-10 relative"
      >
        {/* Floating Spec Badge 1 (Top Left area) */}
        <div className="absolute top-10 left-10 hidden md:flex p-3 rounded-2xl glass border border-white/10 shadow-lg items-center gap-2 animate-bounce" style={{ animationDuration: '4.5s' }}>
          <div className="p-1 rounded-lg bg-cyan-400/10 text-cyan-400">
            <Zap size={14} />
          </div>
          <div className="text-right">
            <div className="text-[9px] text-gray-400 font-bold">صحة البطارية</div>
            <div className="text-[11px] font-black text-white">100% كسر زيرو</div>
          </div>
        </div>

        {/* Floating Spec Badge 2 (Top Right area) */}
        <div className="absolute top-12 right-12 hidden md:flex p-3 rounded-2xl glass border border-white/10 shadow-lg items-center gap-2 animate-bounce" style={{ animationDuration: '5.5s', animationDelay: '-1.5s' }}>
          <div className="p-1 rounded-lg bg-emerald-400/10 text-emerald-400">
            <Shield size={14} />
          </div>
          <div className="text-right">
            <div className="text-[9px] text-gray-400 font-bold">الضمان الحقيقي</div>
            <div className="text-[11px] font-black text-white">مضمون ومعتمد</div>
          </div>
        </div>

        {/* Main Logo Outline (Floating and glowing with the beautiful original hero-logo style!) */}
        <motion.div 
          style={{ y: logoY }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="select-none mb-6 mt-4"
        >
          <Image
            src="/assets/boox-logo-outline.png"
            alt="شعار Boox Store الرئيسي الموهج"
            width={356}
            height={400}
            className="hero-logo"
            priority
          />
        </motion.div>



        {/* Brand Name Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            {siteConfig.hero_title}
          </span>
        </h1>

        {/* INJECTED NEON PULSATING GLOW SLOGAN (As requested by the user!) */}
        <h2 className="neon-injected-text text-2xl md:text-4xl font-extrabold tracking-wide mb-6 leading-relaxed px-4">
          من بوكس تشتري تفاح وانت بالك مرتاح 🍎
        </h2>


        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-6 sm:w-auto">
          <Link 
            href="/#products" 
            className="text-center bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.03] border border-white/10 flex items-center justify-center gap-2"
          >
            <span>تصفح الكتالوج 📱</span>
          </Link>
          
          <Link 
            href="/compare" 
            className="text-center glass hover:bg-white/5 border border-white/10 text-gray-200 hover:text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-2"
          >
            <BarChart3 size={18} className="text-cyan-400" />
            <span>مقارنة الأجهزة 📊</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Counter Section (Centered & Floating) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-4xl mx-auto mt-16 md:mt-24 grid grid-cols-3 gap-2 md:gap-6 p-4 md:p-5 rounded-[24px] glass border border-white/10 z-10 shadow-2xl"
      >
        {/* Stat item 1 */}
        <div className="flex flex-col items-center justify-center text-center p-2 border-l border-white/5">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 text-lg md:text-3xl font-black mb-1">
            {displayCount > 0 ? `+${displayCount}` : 'أجهزة متوفرة'}
          </div>
          <div className="text-[9px] md:text-xs text-gray-400 font-bold">
            {siteConfig.hero_stat_products_label}
          </div>
        </div>

        {/* Stat item 2 */}
        <div className="flex flex-col items-center justify-center text-center p-2 border-l border-white/5">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-lg md:text-3xl font-black mb-1">
            {siteConfig.hero_stat_warranty_value}
          </div>
          <div className="text-[9px] md:text-xs text-gray-400 font-bold">
            {siteConfig.hero_stat_warranty_label}
          </div>
        </div>

        {/* Stat item 3 */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-lg md:text-3xl font-black mb-1">
            {siteConfig.hero_stat_support_value}
          </div>
          <div className="text-[9px] md:text-xs text-gray-400 font-bold">
            {siteConfig.hero_stat_support_label}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
