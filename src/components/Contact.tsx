'use client'
import type { CSSProperties } from 'react'
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
      <h2 className="section-title-lg anim-reveal">
        <span>تواصل معانا</span>
      </h2>

      <div className="contact-cards anim-reveal">
        <a href={`https://wa.me/${siteConfig.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="contact-link-card" style={{ '--hover-color': '#25d366' } as CSSProperties}>
          <div className="contact-icon-wrap" style={{ background: 'rgba(37,211,102,.15)' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#25d366">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z" />
            </svg>
          </div>
          <div className="contact-info">
            <strong>واتساب</strong>
            <span>رد سريع على الاستفسارات والطلبات</span>
          </div>
          <span className="contact-arrow">→</span>
        </a>

        <a href={siteConfig.maps_url} target="_blank" rel="noopener noreferrer" className="contact-link-card" style={{ '--hover-color': '#4285f4' } as CSSProperties}>
          <div className="contact-icon-wrap" style={{ background: 'rgba(66,133,244,.15)' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#4285f4">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div className="contact-info">
            <strong>الموقع</strong>
            <span>افتح الفرع على الخريطة</span>
          </div>
          <span className="contact-arrow">→</span>
        </a>
      </div>

      <div className="social-wall anim-reveal">
        <p className="social-wall-title">تابعنا على السوشيال ميديا</p>
        <div className="social-grid">
          <a href={siteConfig.instagram_url} className="social-card sc-ig" target="_blank" rel="noopener noreferrer">
            <div className="social-name">Instagram</div>
            <div className="social-handle">@booxstore</div>
          </a>
          <a href={siteConfig.tiktok_url} className="social-card sc-tt" target="_blank" rel="noopener noreferrer">
            <div className="social-name">TikTok</div>
            <div className="social-handle">@booxstore</div>
          </a>
          <a href={siteConfig.facebook_url} className="social-card sc-fb" target="_blank" rel="noopener noreferrer">
            <div className="social-name">Facebook</div>
            <div className="social-handle">Boox Store</div>
          </a>
        </div>
      </div>
    </section>
  )
}
