'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Contact() {
  const [siteConfig, setSiteConfig] = useState<any>({
    whatsapp_number: '201113614021',
    maps_url: 'https://maps.app.goo.gl/ryLFkd2CCWUFcsxV6',
    instagram_url: 'https://www.instagram.com/ahmed_boox22',
    facebook_url: 'https://www.facebook.com/ahmed.m.yahia.2025',
    tiktok_url: 'https://www.tiktok.com/@boox_store'
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSiteConfig((prev: any) => ({ ...prev, ...data }))
        }
      })
      .catch(console.error)
  }, [])

  return (
    <>
      <section id="contact">
        <h2 className="section-title-lg anim-reveal">📍 <span>تواصل معنا</span></h2>

        <div className="contact-cards anim-reveal">
          <a href={`https://wa.me/${siteConfig.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="contact-link-card" style={{ '--hover-color': '#25d366' } as React.CSSProperties}>
            <div className="contact-icon-wrap" style={{ background: 'rgba(37,211,102,.15)' }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="#25d366">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z" />
              </svg>
            </div>
            <div className="contact-info"><strong>واتساب</strong><span>تواصل فوري مع خدمة العملاء</span></div>
            <span className="contact-arrow">→</span>
          </a>
          
          <a href={siteConfig.maps_url} target="_blank" rel="noopener noreferrer" className="contact-link-card" style={{ '--hover-color': '#4285f4' } as React.CSSProperties}>
            <div className="contact-icon-wrap" style={{ background: 'rgba(66,133,244,.15)' }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="#4285f4">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="contact-info"><strong>موقعنا</strong><span>افتحنا على خريطة Google</span></div>
            <span className="contact-arrow">→</span>
          </a>
        </div>

        <div className="social-wall anim-reveal">
          <p className="social-wall-title">تابعنا على وسائل التواصل</p>
          <div className="social-grid">
            <a href={siteConfig.instagram_url} className="social-card sc-ig" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div className="social-name">Instagram</div>
              <div className="social-handle">@booxstore</div>
            </a>

            <a href={siteConfig.tiktok_url} className="social-card sc-tt" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </div>
              <div className="social-name">TikTok</div>
              <div className="social-handle">@booxstore</div>
            </a>

            <a href={siteConfig.facebook_url} className="social-card sc-fb" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="social-name">Facebook</div>
              <div className="social-handle">Boox Store</div>
            </a>

            <a href={`https://wa.me/${siteConfig.whatsapp_number}`} className="social-card sc-wa" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z" />
                </svg>
              </div>
              <div className="social-name">WhatsApp</div>
              <div className="social-handle">تواصل الآن</div>
            </a>

            <a href="#" className="social-card sc-yt" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                </svg>
              </div>
              <div className="social-name">YouTube</div>
              <div className="social-handle">@booxstore</div>
            </a>

            <a href={siteConfig.maps_url} className="social-card sc-gm" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div className="social-name">موقعنا</div>
              <div className="social-handle">Google Maps</div>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">
          <Image src="/assets/boox-logo.jpg" alt="Logo" width={50} height={50} />
        </div>
        <p className="footer-tagline">Boox Store © 2026 · جميع الحقوق محفوظة</p>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: '0.95rem', textShadow: '0 0 10px var(--neon-2), 0 0 20px var(--neon-1)', color: '#fff', letterSpacing: '0.5px' }}>
            Website Designed by Yehia Helal
          </span>
          <a href="https://wa.me/201062028428?text=أريد%20تصميم%20موقع" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', color: '#aaa', fontSize: '0.85rem', transition: 'color 0.3s ease' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#25d366" style={{ filter: 'drop-shadow(0 0 8px rgba(37,211,102,0.6))' }}>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z" />
            </svg>
            <span style={{ fontWeight: 500 }}>تواصل مع مصمم الموقع</span>
          </a>
        </div>
      </footer>
    </>
  )
}
