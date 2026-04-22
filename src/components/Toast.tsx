'use client'
import { useEffect, useState } from 'react'

type ToastProps = {
  id: number
  msg: string
  type: 'success' | 'error' | 'warn' | 'info'
}

type ToastEvent = Event & {
  detail: {
    msg: string
    type: ToastProps['type']
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as ToastEvent).detail
      const id = Date.now()
      setToasts((current) => [...current, { id, msg: detail.msg, type: detail.type }])

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 3000)
    }

    window.addEventListener('boox-toast', handleToast)
    return () => window.removeEventListener('boox-toast', handleToast)
  }, [])

  const colors = {
    success: 'var(--neon-success)',
    error: 'var(--neon-danger)',
    warn: 'var(--neon-warn)',
    info: 'var(--neon-2)',
  }

  return (
    <>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast glass show"
          style={{
            color: colors[toast.type] ?? colors.info,
            borderColor: colors[toast.type] ?? colors.info,
            bottom: '100px',
          }}
        >
          {toast.msg}
        </div>
      ))}
    </>
  )
}
