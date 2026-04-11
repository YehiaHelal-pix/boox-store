import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <h2 className="text-5xl font-bold mb-4 text-[var(--neon-cyan)]">404</h2>
            <p className="text-xl mb-8">عذراً، الصفحة غير موجودة</p>
            <Link href="/" className="px-6 py-3 bg-[var(--neon)] text-white rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center font-bold hover:opacity-90 transition-opacity cursor-pointer">
                العودة للرئيسية
            </Link>
        </div>
    )
}
