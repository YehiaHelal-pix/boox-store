import type { Metadata, Viewport } from 'next'
import { Tajawal } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import PromoBanner from '@/components/layout/PromoBanner'
import { ToastProvider } from '@/components/ui/Toast'
import FloatingStars from '@/components/effects/FloatingStars'
import ScrollProgress from '@/components/effects/ScrollProgress'

const tajawal = Tajawal({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '700', '800', '900'] })

export const metadata: Metadata = {
    title: { default: 'Boox Store | متجر Apple الأول في مصر', template: '%s | Boox Store' },
    description: 'أجهزة Apple الأصلية — بيع وصيانة واستبدال بأفضل الأسعار في مصر',
    keywords: ['iPhone مصر', 'iPad', 'MacBook', 'Apple Store Egypt', 'صيانة Apple', 'Boox Store'],
    openGraph: {
        title: 'Boox Store',
        description: 'متجر Apple الأول في مصر',
        images: [{ url: '/boox-logo.jpg' }],
        locale: 'ar_EG',
        type: 'website',
    },
    manifest: '/manifest.json',
    robots: { index: true, follow: true },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: '#03030a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ar" dir="rtl" className={tajawal.className}>
            <body className="antialiased min-h-screen flex flex-col">
                <ScrollProgress />
                <FloatingStars />
                <PromoBanner />
                <Navbar />
                <main className="flex-grow pt-[var(--navbar-h)]">
                    {children}
                </main>
                <Footer />
                <BottomNav />
                <ToastProvider />
            </body>
        </html>
    )
}
