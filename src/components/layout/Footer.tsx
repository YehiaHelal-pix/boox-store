import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
    return (
        <footer className="mt-20 py-12 border-t border-[var(--border)] glass relative z-10">
            <div className="px-4 lg:px-[var(--container)] max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <Image src="/boox-logo.jpg" alt="Boox Store" width={60} height={60} className="rounded-xl mb-4" style={{ filter: 'invert(1)' }} />
                    <p className="text-[var(--text-muted)] text-sm mb-4 leading-relaxed">
                        متجر Apple الأول في مصر. أجهزة أصلية، صيانة معتمدة، واستبدال بأفضل الأسعار. غايتنا تقديم تجربة بريميوم تليق بك.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-lg mb-2 text-white">روابط سريعة</h4>
                    <Link href="/products" className="text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors w-fit min-h-[44px] flex items-center">المنتجات</Link>
                    <Link href="/maintenance" className="text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors w-fit min-h-[44px] flex items-center">الصيانة</Link>
                    <Link href="/trade" className="text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors w-fit min-h-[44px] flex items-center">الاستبدال</Link>
                </div>
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-lg mb-2 text-white">تواصل معنا</h4>
                    <p className="text-[var(--text-muted)] text-sm flex gap-2 items-center min-h-[44px]">واتساب: {process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'}</p>
                    <p className="text-[var(--text-muted)] text-sm flex gap-2 items-center min-h-[44px]">العنوان: القاهرة، مصر</p>
                </div>
            </div>
            <div className="text-center mt-12 pt-6 border-t border-[var(--border)] text-[var(--text-muted)] text-xs">
                © {new Date().getFullYear()} Boox Store. جميع الحقوق محفوظة.
            </div>
        </footer>
    )
}
