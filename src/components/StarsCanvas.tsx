'use client'
import { useEffect, useRef } from 'react'

export default function StarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let rt: ReturnType<typeof setTimeout>

    // ════ FLOATING STARS — بطيئة وهادئة ════ 
    let W: number, H: number, stars: any[] = []

    const CONFIG = {
      count: 40,
      minSize: 0.2,
      maxSize: 1.5,
      minSpeed: 0.02, /* بطيء جداً */
      maxSpeed: 0.12, /* بطيء جداً */
      minOpacity: 0.05,
      maxOpacity: 0.45,
      colors: [
        'rgba(99,102,241,V)',
        'rgba(34,211,238,V)',
        'rgba(168,85,247,V)',
        'rgba(248,250,252,V)',
        'rgba(148,163,184,V)',
      ]
    }

    const r = (a: number, b: number) => Math.random() * (b - a) + a

    function mkStar(fromBottom: boolean) {
      const op = r(CONFIG.minOpacity, CONFIG.maxOpacity)
      const col = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)]
        .replace('V', op.toFixed(2))
      return {
        x: r(0, W),
        y: fromBottom ? r(H * 0.5, H + 20) : r(-20, H),
        size: r(CONFIG.minSize, CONFIG.maxSize),
        speed: r(CONFIG.minSpeed, CONFIG.maxSpeed),
        opacity: op,
        color: col,
        twinkle: r(0, Math.PI * 2),
        twinkleSpeed: r(0.005, 0.02), /* وميض بطيء */
        drift: r(-0.03, 0.03), /* انجراف خفيف */
      }
    }

    function resize() {
      W = canvas!.width = window.innerWidth
      H = canvas!.height = window.innerHeight
      stars = Array.from({ length: CONFIG.count }, () => mkStar(false))
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      stars.forEach((s, i) => {
        s.twinkle += s.twinkleSpeed
        const t = 0.5 + 0.5 * Math.sin(s.twinkle)
        const op = (s.opacity * t).toFixed(2)
        const col = s.color.replace(/[\d.]+\)$/, op + ')')

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.fill()


        s.y -= s.speed
        s.x += s.drift

        if (s.y < -10 || s.x < -10 || s.x > W + 10) {
          stars[i] = mkStar(true)
          if (s.x < -10 || s.x > W + 10) {
            stars[i].x = r(0, W)
            stars[i].y = r(H * 0.3, H)
          }
        }
      })
      animId = window.requestAnimationFrame(draw)
    }

    resize()
    draw()

    const handleResize = () => {
      clearTimeout(rt)
      rt = setTimeout(() => { cancelAnimationFrame(animId); resize(); draw() }, 200)
    }
    
    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId)
      else draw()
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)
    
    return () => { 
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="stars-canvas"
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.6 }}
    />
  )
}
