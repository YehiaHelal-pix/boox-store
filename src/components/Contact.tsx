'use client'

import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'

interface ContactConfig {
  whatsapp_number: string
  maps_url: string
  instagram_url: string
  facebook_url: string
  tiktok_url: string
}

const DEFAULT_CONFIG: ContactConfig = {
  whatsapp_number: '201113614021',
  maps_url: 'https://maps.app.goo.gl/ryLFkd2CCWUFcsxV6',
  instagram_url: 'https://www.instagram.com/ahmed_boox22',
  facebook_url: 'https://www.facebook.com/ahmed.m.yahia.2025',
  tiktok_url: 'https://www.tiktok.com/@boox_store',
}

function SocialCard({
  href,
  label,
  handle,
  className,
  children,
}: {
  href: string
  label: string
  handle: string
  className: string
  children: ReactNode
}) {
  return (
    <a href={href} className={`social-media-card ${className}`} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
      <span className="social-media-icon">{children}</span>
      <span className="social-media-meta">
        <strong>{label}</strong>
        <small>{handle}</small>
      </span>
    </a>
  )
}

export default function Contact() {
  const [siteConfig, setSiteConfig] = useState<ContactConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data: Partial<ContactConfig> & { error?: string }) => {
        if (!data.error) {
          setSiteConfig((current) => ({ ...current, ...data }))
        }
      })
      .catch(() => undefined)
  }, [])

  return (
    <section id="contact">
      <h2 className="section-title-lg anim-reveal" style={{ animation: 'fadeInDown 0.6s ease both' }}>
        <span className="neon-underline">تواصل معانا</span>
      </h2>

      <div className="contact-cards anim-reveal">
        <a href={`https://wa.me/${siteConfig.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="contact-link-card" style={{ '--hover-color': '#25d366', animation: 'fadeInUp 0.5s ease 0.1s both' } as CSSProperties}>
          <div className="contact-icon-wrap" style={{ animation: 'floatSoft 3s infinite ease-in-out' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#4ADE80" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.5))' }}>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z" />
            </svg>
          </div>
          <div className="contact-info">
            <strong>واتساب</strong>
            <span>رد سريع على الاستفسارات والطلبات</span>
          </div>
        </a>

        <a href={siteConfig.maps_url} target="_blank" rel="noopener noreferrer" className="contact-link-card" style={{ '--hover-color': '#4285f4', animation: 'fadeInUp 0.5s ease 0.2s both' } as CSSProperties}>
          <div className="contact-icon-wrap" style={{ animation: 'floatSoft 3s infinite ease-in-out 0.5s' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#60A5FA" style={{ filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.5))' }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div className="contact-info">
            <strong>الموقع</strong>
            <span>افتح الفرع على الخريطة وشرفنا</span>
          </div>
        </a>
      </div>

      <div className="social-wall anim-reveal">
        <p className="social-wall-title" style={{ animation: 'fadeInDown 0.5s ease both' }}>تابعنا على السوشيال ميديا</p>
        <div className="social-media-grid">
          <SocialCard href={siteConfig.facebook_url} label="Facebook" handle="Boox Store" className="social-card-facebook">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="#60A5FA">
              <path d="M13.6 21v-7.4h2.5l.4-3h-2.9V8.7c0-.9.2-1.5 1.5-1.5h1.6V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3.1z" />
            </svg>
          </SocialCard>

          <SocialCard href={siteConfig.tiktok_url} label="TikTok" handle="@boox_store" className="social-card-tiktok">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="#ffffff" style={{ filter: 'drop-shadow(-1.5px -1px 0 #22d3ee) drop-shadow(1.5px 1px 0 #ef4444)' }}>
              <path d="M15.5 3c.4 1.9 1.5 3.2 3.5 3.7V10c-1.6-.1-2.9-.7-4-1.7v6.3a5.6 5.6 0 1 1-5.1-5.6v2.8a2.8 2.8 0 1 0 2.3 2.8V3h3.3z" />
            </svg>
          </SocialCard>

          <SocialCard href={siteConfig.instagram_url} label="Instagram" handle="@ahmed_boox22" className="social-card-instagram">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#E11D48" strokeWidth="1.9">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
              <circle cx="12" cy="12" r="4.25" />
              <circle cx="17.4" cy="6.6" r="1" fill="#E11D48" stroke="none" />
            </svg>
          </SocialCard>
        </div>
      </div>

      <div className="site-footer-brand anim-reveal">
        <div className="site-footer-brandmark">
          <span className="site-footer-brand-wordmark">Boox Store</span>
          <span className="site-footer-brand-logo">
            <Image src="/assets/boox-logo-outline.png" alt="Boox Store Logo" width={356} height={400} />
          </span>
        </div>
        <p className="site-footer-brand-copy">وجهتك الأولى لأجهزة وخدمات أبل الأصلية في مصر، خدمة سريعة، جودة مضمونة، وأسعار لا تقبل المنافسة.</p>
      </div>

      <div className="site-footer-inline anim-reveal">
        <div className="site-footer-copy">©2026 Boox Store جميع الحقوق محفوظة.</div>
        <div className="site-footer-designer">
          <span className="site-footer-designer-label" style={{ color: '#e0e2eeff', textShadow: '0 0 8px rgba(99,102,241,0.6), 0 0 20px rgba(99,102,241,0.3)', letterSpacing: '0.05em', fontWeight: 600 }}>Designed by</span>
          <span className="site-footer-designer-name">yehia helal</span>
          <a href="https://wa.me/201062028428" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp designer" className="site-footer-whatsapp" title="WhatsApp designer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
