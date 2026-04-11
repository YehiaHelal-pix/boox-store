import { ShieldCheck, Truck, Wrench, CheckCircle } from 'lucide-react'

export default function TrustBadges() {
    const badges = [
        { icon: ShieldCheck, title: 'ضمان سنة', desc: 'على جميع الأجهزة' },
        { icon: Truck, title: 'توصيل سريع', desc: 'لجميع أنحاء مصر' },
        { icon: Wrench, title: 'صيانة معتمدة', desc: 'بقطع غيار أصلية' },
        { icon: CheckCircle, title: 'أجهزة أصلية', desc: '100% مضمونة' },
    ]

    return (
        <section className="px-4 lg:px-[var(--container)] -mt-16 lg:-mt-24 relative z-20 pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {badges.map((b, i) => (
                    <div key={i} className="glass p-5 rounded-[var(--radius)] flex flex-col items-center text-center gap-3 hover:-translate-y-2 transition-all duration-300 hover:border-[var(--neon-cyan)] hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] group bg-[var(--bg)]/80">
                        <div className="w-14 h-14 rounded-full bg-[var(--neon)]/10 flex items-center justify-center text-[var(--neon-cyan)] mb-1 group-hover:scale-110 transition-transform group-hover:bg-[var(--neon)]/20">
                            <b.icon size={28} />
                        </div>
                        <h4 className="font-bold text-sm md:text-lg text-white">{b.title}</h4>
                        <p className="text-[11px] md:text-sm text-[var(--text-muted)] line-clamp-1 font-medium">{b.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
