'use client'
import { useEffect, useState } from 'react'

export default function AnnouncementBar() {
  const [data, setData] = useState<{is_visible:boolean,text:string,bg_color:string,text_color:string}|null>(null)

  useEffect(() => {
    fetch('/api/announcement').then(r=>r.json()).then(setData).catch(()=>setData(null))
  }, [])

  if (!data?.is_visible || !data?.text) return null

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      padding: '8px 0',
      backgroundColor: data.bg_color || '#6366f1',
      borderBottom: '1px solid rgba(99,102,241,0.4)',
      boxShadow: '0 0 20px rgba(99,102,241,0.3)',
      zIndex: 99,
      position: 'relative'
    }}>
      <div style={{
        display: 'inline-block',
        whiteSpace: 'nowrap',
        animation: 'marquee-rtl 25s linear infinite',
        fontSize: '14px',
        fontWeight: '600',
        color: data.text_color || '#ffffff',
        paddingRight: '100%'
      }}>
        {data.text} &nbsp;&nbsp;&nbsp;🍎&nbsp;&nbsp;&nbsp; {data.text} &nbsp;&nbsp;&nbsp;🍎&nbsp;&nbsp;&nbsp; {data.text}
      </div>
    </div>
  )
}
