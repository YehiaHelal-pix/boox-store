'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface HeroConfig {
  hero_title: string
  hero_slogan_line1: string
  hero_slogan_line2: string
  hero_stat_products_label: string
  hero_stat_warranty_label: string
  hero_stat_support_label: string
  hero_stat_support_value: string
  hero_stat_warranty_value: string
}

type StatsEvent = Event & { detail: number }

const DEFAULT_CONFIG: HeroConfig = {
  hero_title: 'Boox Store',
  hero_slogan_line1: 'أجهزة آبل أصلية بضمان',
  hero_slogan_line2: 'وخدمة سريعة ومضمونة',
  hero_stat_products_label: 'منتج متاح',
  hero_stat_warranty_label: 'ضمان',
  hero_stat_support_label: 'دعم فوري',
  hero_stat_support_value: '24/7',
  hero_stat_warranty_value: '100%',
}

export default function Hero() {
  const [displayCount, setDisplayCount] = useState(0)
  const [siteConfig, setSiteConfig] = useState<HeroConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data: Partial<HeroConfig> & { error?: string }) => {
        if (!data.error) {
          setSiteConfig((current) => ({ ...current, ...data }))
        }
      })
      .catch(() => undefined)

    function handleStats(event: Event) {
      const target = (event as StatsEvent).detail
      if (!target) return

      let current = 0
      const step = Math.max(1, Math.ceil(target / 30))
      const timer = window.setInterval(() => {
        current = Math.min(current + step, target)
        setDisplayCount(current)
        if (current >= target) {
          window.clearInterval(timer)
        }
      }, 40)
    }

    window.addEventListener('boox-stats', handleStats)
    return () => window.removeEventListener('boox-stats', handleStats)
  }, [])

  return (
    <section id="home">
      <Image src="/assets/boox-logo.jpg" alt="Boox Store" width={100} height={100} className="hero-logo" priority />
      <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
        <span>{siteConfig.hero_title}</span>
      </h1>
      <div className="hero-slogan-wrap">
        <div className="slogan-line" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '100%' }}>
          <span style={{ whiteSpace: 'normal', textAlign: 'center', display: 'block', width: '100%', fontSize: 'clamp(1rem, 3.5vw, 1.4rem)' }}>
            ✦ {siteConfig.hero_slogan_line1}
          </span>
          <span style={{ whiteSpace: 'normal', textAlign: 'center', display: 'block', width: '100%', fontSize: 'clamp(1rem, 3.5vw, 1.4rem)' }}>
            ✦ {siteConfig.hero_slogan_line2}
          </span>
        </div>
        <div className="slogan-line" />
      </div>

      <div className="hero-stats anim-reveal">
        <div className="hero-stat">
          <strong>{displayCount}</strong>
          <span>{siteConfig.hero_stat_products_label}</span>
        </div>
        <div className="hero-stat">
          <strong>{siteConfig.hero_stat_warranty_value}</strong>
          <span>{siteConfig.hero_stat_warranty_label}</span>
        </div>
        <div className="hero-stat">
          <strong>{siteConfig.hero_stat_support_value}</strong>
          <span>{siteConfig.hero_stat_support_label}</span>
        </div>
      </div>
    </section>
  )
}
