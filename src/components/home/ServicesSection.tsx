import Link from 'next/link'
import { ShoppingBag, PenTool, RefreshCcw } from 'lucide-react'

export default function ServicesSection() {
    const services = [
        { title: 'بيع الأجهزة', desc: 'أحدث أجهزة Apple بأسعار تنافسية وضمان رسمي شامل.', icon: ShoppingBag, href: '/products', color: 'from-blue-500/10 to-[#6366f1]/10', border: 'hover:border-blue-500/50' },
        { title: 'صيانة معتمدة', desc: 'إصلاح جميع الأعطال بأيدي خبراء وقطع أصلية مكفولة.', icon: PenTool, href: '/maintenance', color: 'from-[#6366f1]/10 to-[#a855f7]/10', border: 'hover:border-[#a855f7]/50' },
        { title: 'استبدال وتجديد', desc: 'بدل جهازك القديم بجهاز جديد بسهولة وبأفضل فرق تقييم.', icon: RefreshCcw, href: '/trade', color: 'from-[#a855f7]/10 to-pink-500/10', border: 'hover:border-pink-500/50' }
    ]

    return (
        <section className="py-24 px-4 lg:px-[var(--container)] bg-[var(--glass)] border-y border-[var(--border)] mt-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-white mb-4">خدمات متكاملة تليق بك</h2>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">نوفر لك كل ما تحتاجه في عالم أجهزة Apple تحت سقف واحد بمعايير عالمية</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((s, i) => (
                        <Link key={i} href={s.href} className={`group relative bg-[#0a0a14] border border-[var(--border)] p-10 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 ease-out ${s.border} hover:shadow-2xl hover:shadow-white/5`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="relative z-10 flex flex-col items-center text-center gap-5">
                                <div className="w-24 h-24 rounded-full bg-[var(--glass)] border border-[var(--border)] flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                    <s.icon size={48} className="text-[var(--neon-cyan)] group-hover:text-white transition-colors duration-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-wide">{s.title}</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                                <div className="mt-4 px-6 py-2 rounded-full border border-[var(--border)] text-[var(--neon-cyan)] font-bold group-hover:bg-[var(--neon-cyan)] group-hover:text-black transition-colors duration-300">
                                    تفاصيل أكثر
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
