import type { Metadata } from 'next'
import { Cairo, Tajawal } from 'next/font/google'
import './globals.css'
import StarsCanvas from '@/components/StarsCanvas'
import Preloader from '@/components/Preloader'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import ToastContainer from '@/components/Toast'
import ScrollObserver from '@/components/ScrollObserver'
import AnnouncementBar from '@/components/AnnouncementBar'
import { AskBooxFloating } from '@/components/ui/AskBooxButton'
import FooterV2 from '@/components/ui/FooterV2'
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
})
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-tajawal',
})

export const metadata: Metadata = {
  title: 'Boox Store | ملك التفاح 🍎',
  description: 'من بوكس تشتري تفاح وانت بالك مرتاح - أجهزة Apple الأصلية بضمان في مصر',
  keywords: ['Apple', 'iPhone', 'iPad', 'MacBook', 'مصر', 'Boox Store'],
  openGraph: {
    title: 'Boox Store | ملك التفاح 🍎',
    description: 'من بوكس تشتري تفاح وانت بالك مرتاح',
    url: 'https://boox-store.vercel.app',
    siteName: 'Boox Store',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/assets/boox-logo-outline.png" />
      </head>
      <body className={`${cairo.className} ${tajawal.variable}`}>
        <Preloader />
        <div className="ambient-orbs-container">
          <div className="ambient-orb orb-cyan" />
          <div className="ambient-orb orb-violet" />
          <div className="ambient-orb orb-rose" />
        </div>
        <div className="space-grid-pattern" />
        <StarsCanvas />
        <Navbar />
        <AnnouncementBar />
        <main>
          {children}
        </main>
        <FooterV2 />
        <BottomNav />
        <AskBooxFloating />
        <ToastContainer />
        <ScrollObserver />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `}} />
      </body>
    </html>
  )
}
