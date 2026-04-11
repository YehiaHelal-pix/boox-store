export default function StatsSection() {
    const stats = [
        { value: '+1000', label: 'عميل نعتز به' },
        { value: '5', label: 'أعوام من التميز' },
        { value: '98%', label: 'مستوى الرضا' },
        { value: '24/7', label: 'دعم وخدمة' },
    ]

    return (
        <section className="py-20 px-4 lg:px-[var(--container)] relative overflow-hidden backdrop-blur-sm mt-10">
            <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/5 to-transparent z-0" />
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 relative z-10">
                {stats.map((s, i) => (
                    <div key={i} className="flex flex-col items-center justify-center text-center p-6 glass rounded-3xl hover:border-[var(--neon-purple)] transition-colors group">
                        <span className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[var(--neon-cyan)] mb-3 drop-shadow-lg group-hover:scale-105 transition-transform">
                            {s.value}
                        </span>
                        <span className="text-[var(--text-muted)] font-bold text-lg md:text-xl">{s.label}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}
