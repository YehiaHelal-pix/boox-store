'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  IoBagHandleOutline,
  IoConstructOutline,
  IoSwapHorizontalOutline,
  IoHeadsetOutline,
} from 'react-icons/io5'

const services = [
  {
    icon: IoBagHandleOutline,
    title: 'بيع أجهزة Apple',
    description: 'أجهزة أصلية مضمونة بأفضل الأسعار تناسب ميزانيتك.',
    color: 'text-blue-400',
    bg: 'from-blue-500/20 to-blue-500/5',
    border: 'group-hover:border-blue-500/50',
    href: '/products',
  },
  {
    icon: IoConstructOutline,
    title: 'صيانة احترافية',
    description: 'إصلاح سريع مع ضمان على الإصلاح وقطع الغيار.',
    color: 'text-violet-400',
    bg: 'from-violet-500/20 to-violet-500/5',
    border: 'group-hover:border-violet-500/50',
    href: '/services',
  },
  {
    icon: IoSwapHorizontalOutline,
    title: 'استبدال وترقية',
    description: 'بدّل جهازك القديم بأفضل سعر تقييم في السوق.',
    color: 'text-emerald-400',
    bg: 'from-emerald-500/20 to-emerald-500/5',
    border: 'group-hover:border-emerald-500/50',
    href: '/services',
  },
  {
    icon: IoHeadsetOutline,
    title: 'إكسسوارات Apple',
    description: 'ملحقات أصلية وعروض حصرية على جميع الإكسسوارات.',
    color: 'text-amber-400',
    bg: 'from-amber-500/20 to-amber-500/5',
    border: 'group-hover:border-amber-500/50',
    href: '/products',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

export default function Services() {
  return (
    <section id="services" className="py-16 relative" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            خدماتنا
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-[#4A90E2] font-medium"
          >
            كل ما تحتاجه في مكان واحد
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, i) => (
            <motion.div key={i} variants={item} className="h-full">
              <Link href={service.href} className="block h-full">
                <div
                  className={`group neon-card h-full card-glass rounded-2xl p-6 border border-white/10 ${service.border} relative overflow-hidden flex flex-col`}
                >
                  {/* Top highlight gradient */}
                  <div
                    className={`absolute top-0 left-0 w-full h-40 bg-gradient-to-b ${service.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  {/* Animated corner glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/0 group-hover:bg-cyan-500/30 blur-2xl transition-colors duration-500 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-500/0 group-hover:bg-fuchsia-500/30 blur-2xl transition-colors duration-500 pointer-events-none" />

                  <div
                    className={`w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 group-hover:rotate-6 group-hover:border-white/30 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300`}
                  >
                    <service.icon
                      className={`w-7 h-7 ${service.color} group-hover:drop-shadow-[0_0_8px_currentColor] transition-all`}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 relative z-10">
                    {service.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed relative z-10 flex-1">
                    {service.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
