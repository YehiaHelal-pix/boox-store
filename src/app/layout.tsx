import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
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
      <body className={cairo.className}>{children}</body>
    </html>
  )
}
