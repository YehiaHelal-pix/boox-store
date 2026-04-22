'use client'
import { useEffect, useState } from 'react'

export default function Preloader() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [fadeLoadingScreen, setFadeLoadingScreen] = useState(false)
  
  const [showPreloader, setShowPreloader] = useState(true)
  const [fadePreloader, setFadePreloader] = useState(false)

  useEffect(() => {
    // Exact timing from index.html
    // loading-screen fades out after 2.5s, removed after 500ms
    const loadingScreenTimer = setTimeout(() => {
      setFadeLoadingScreen(true)
      setTimeout(() => setShowLoadingScreen(false), 500)
    }, 2500)

    // preloader fades out after 2.8s, display none after 800ms
    const preloaderTimer = setTimeout(() => {
      setFadePreloader(true)
      setTimeout(() => setShowPreloader(false), 800)
    }, 2800)

    return () => {
      clearTimeout(loadingScreenTimer)
      clearTimeout(preloaderTimer)
    }
  }, [])

  return (
    <>
      {/* ═══ PRELOADER ═══ */}
      {showPreloader && (
        <div 
          id="preloader" 
          className="preloader glass-dark"
          style={{ opacity: fadePreloader ? '0' : '1', transition: 'opacity 0.8s ease' }}
        >
          <div className="preloader-content">
            <svg className="apple-loader-svg" viewBox="0 0 384 512" fill="none" stroke="var(--neon-primary)" strokeWidth="8"
              strokeLinecap="round" strokeLinejoin="round">
              <path className="apple-path"
                d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <div className="preloader-text gradient-text">Boox Store</div>
            <div className="preloader-slogan">ملك التفاح</div>
          </div>
        </div>
      )}

      {/* ═══ LOADING SCREEN ═══ */}
      {showLoadingScreen && (
        <div id="loading-screen" className={fadeLoadingScreen ? 'fade-out' : ''}>
          <div className="loading-content">
            <svg className="apple-loader-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
              <path className="apple-path"
                d="M150.7 0c-9.4.4-20.6 6.3-27.2 13.7-6 6.7-10.9 16.7-9 26.4 10.2-.4 20.6-6.5 27-13.9 6.1-6.9 10.5-16.8 9.2-26.2z M151 40.3c-15 0-21.3 7.2-31.8 7.2-10.8 0-19-7.1-32-7.1-12.7 0-26.2 7.7-34.8 20.9C40 76 37.3 100.7 49.7 120.8c8.2 13.4 19.2 28.5 33.5 28.6 12.7.1 16.3-8.1 33.7-8.2 17.4-.1 20.7 8.3 33.4 8.1 14.3-.1 25.9-16.7 34.1-30 5.9-9.6 8.1-14.4 12.7-25.2-33.3-12.7-38.6-60-5.8-77.5-8.9-11.2-21.5-16.3-40.3-16.3z"
                fill="none" stroke="url(#ng)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="800" strokeDashoffset="800" />
              <defs>
                <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="nglow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
            <div className="loader-brand">
              <span className="loader-brand-text">Boox Store</span>
              <span className="loader-brand-glow">Boox Store</span>
            </div>
            <div className="loader-progress">
              <div className="loader-progress-fill"></div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
