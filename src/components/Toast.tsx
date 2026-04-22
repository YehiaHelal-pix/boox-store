'use client'
import { useEffect, useState } from 'react'

type ToastProps = {
  id: number
  msg: string
  type: 'success' | 'error' | 'warn' | 'info'
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    const handleToast = (e: any) => {
      const { msg, type } = e.detail
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg, type }])
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }

    window.addEventListener('boox-toast', handleToast)
    return () => window.removeEventListener('boox-toast', handleToast)
  }, [])

  const colors = { 
    success: 'var(--neon-success)', 
    error: 'var(--neon-danger)', 
    warn: 'var(--neon-warn)', 
    info: 'var(--neon-2)' 
  }

  return (
    <>
      {toasts.map(t => (
        <div 
          key={t.id} 
          className="toast glass show" 
          style={{ 
            color: colors[t.type] || colors.info, 
            borderColor: colors[t.type] || colors.info,
            // Toasts stack properly
            bottom: '100px'
          }}
        >
          {t.msg}
        </div>
      ))}
    </>
  )
}
