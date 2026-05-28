'use client'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  locale?: string
}

export default function CountUp({ end, duration = 1200, suffix = '', locale = 'ar-EG' }: CountUpProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1)
      setVal(Math.round(p * end))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, end, duration])

  return <span ref={ref}>{val.toLocaleString(locale)}{suffix}</span>
}
