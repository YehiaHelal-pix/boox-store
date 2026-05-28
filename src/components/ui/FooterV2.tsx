import Link from 'next/link'
import Image from 'next/image'
import { IoLogoWhatsapp, IoLogoFacebook, IoLogoInstagram, IoLogoTiktok } from 'react-icons/io5'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'

const SOCIAL_LINKS = [
  { href: 'https://facebook.com/ahmed.m.yahia.2025', icon: IoLogoFacebook, label: 'Facebook', handle: '@ahmed.m.yahia.2025', color: '#1877f2' },
  { href: 'https://instagram.com/ahmed_boox22', icon: IoLogoInstagram, label: 'Instagram', handle: '@ahmed_boox22', color: '#e1306c' },
  { href: 'https://tiktok.com/@boox_store', icon: IoLogoTiktok, label: 'TikTok', handle: '@boox_store', color: '#69c9d0' },
  { href: `https://wa.me/${WHATSAPP}`, icon: IoLogoWhatsapp, label: 'WhatsApp', handle: 'تواصل معنا', color: '#25d366' },
]

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/products', label: 'المنتجات' },
  { href: '/services', label: 'الخدمات' },
]

export default function FooterV2() {
  return (
    <footer
      className="relative z-10 mt-16"
      style={{
        background: 'rgba(5, 7, 15, 0.95)',
        borderTop: '1px solid rgba(34, 211, 238, 0.1)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Col 1: Logo */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/assets/boox-logo-outline.png"
                alt="Boox Store"
                width={40}
                height={44}
                style={{
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(34,211,238,0.6))',
                }}
              />
              <span className="text-xl font-bold">
                <span className="neon-text">BOOX</span>{' '}
                <span className="text-white/50 text-sm">STORE</span>
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              أفضل الأجهزة بأفضل الأسعار. أجهزة Apple أصلية مع ضمان حقيقي في مصر.
            </p>
          </div>

          {/* Col 2: Links */}
          <div>
            <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/50 hover:text-[var(--neon-cyan)] transition-colors text-sm py-1"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-emerald-400 transition-colors text-sm py-1"
              >
                تواصل معنا
              </a>
            </div>
          </div>

          {/* Col 3: Social */}
          <div className="md:col-span-3 lg:col-span-1">
            <h4 className="font-bold text-white mb-6 text-lg">تابعنا</h4>
            <div className="grid grid-cols-2 gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="relative group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{ background: `radial-gradient(circle at center, ${social.color}40 0%, transparent 70%)` }}
                  />
                  <div 
                    className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-300"
                    style={{ color: social.color, boxShadow: `0 0 20px ${social.color}20` }}
                  >
                    <social.icon className="w-5 h-5" />
                  </div>
                  <div className="relative flex flex-col z-10">
                    <span className="text-white font-semibold text-sm">{social.label}</span>
                    <span className="text-white/40 text-[10px] truncate max-w-[100px]">{social.handle}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center text-white/30 text-xs">
          © {new Date().getFullYear()} Boox Store — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  )
}
