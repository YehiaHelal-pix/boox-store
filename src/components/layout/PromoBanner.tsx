'use client'

export default function PromoBanner() {
    return (
        <div className="bg-[var(--neon)] text-white text-center text-sm py-1 font-medium z-50 relative overflow-hidden whitespace-nowrap min-h-[32px] flex items-center justify-center">
            <div className="inline-block animate-pulse px-4 border-x border-white/20">
                🍏 ضمان سنة | 📦 توصيل سريع | 🔧 صيانة معتمدة
            </div>
        </div>
    )
}
