import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative min-h-[calc(100vh-var(--navbar-h))] flex items-center justify-center overflow-hidden py-10 px-4 md:px-[var(--container)] pb-24">
            <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/10 to-transparent pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl relative z-10 mb-10 md:mb-0">
                <div className="flex flex-col gap-6 text-center lg:text-right pt-10 lg:pt-0">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg">
                        أجهزة Apple الأصلية <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon)]">
                            بأفضل الأسعار
                        </span>
                    </h1>
                    <p className="text-lg md:text-2xl text-[var(--text-muted)] max-w-lg mx-auto lg:mx-0 font-medium">
                        جودة موثوقة | ضمان رسمي | توصيل لكل مصر
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mt-6">
                        <Link href="/products" className="w-full sm:w-auto px-8 py-4 bg-[var(--neon)] text-white rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] min-h-[56px] text-lg">
                            تسوق الآن <ArrowLeft size={20} />
                        </Link>
                        <Link href="/maintenance" className="w-full sm:w-auto px-8 py-4 glass border hover:border-[var(--neon-cyan)] rounded-[2rem] font-bold flex items-center justify-center transition-all min-h-[56px] text-lg hover:text-[var(--neon-cyan)]">
                            طلب صيانة
                        </Link>
                    </div>
                </div>
                <div className="relative w-full aspect-square max-w-md mx-auto xl:max-w-lg">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neon)]/20 to-[var(--neon-cyan)]/20 rounded-full blur-3xl animate-pulse" />
                    <Image src="/boox-logo.jpg" alt="Hero Devices" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-700 rounded-[2rem]" style={{ filter: 'invert(1)' }} priority />
                </div>
            </div>
        </section>
    )
}
