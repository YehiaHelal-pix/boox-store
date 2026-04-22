'use client'
import { useState } from 'react'

const CATS = {
  iphone: '📱 iPhone',
  ipad: '📱 iPad',
  macbook: '💻 MacBook',
  accessories: '🎧 إكسسوارات',
  repairs: '🔧 قطع غيار',
  other: '📦 أخرى'
}

export default function CategoryPills() {
  const [curCat, setCurCat] = useState('all')

  const setCat = (c: string) => {
    setCurCat(c)
    window.dispatchEvent(new CustomEvent('boox-category', { detail: c }))
  }

  const pills = [{ k: 'all', v: '🌟 الكل' }, ...Object.entries(CATS).map(([k, v]) => ({ k, v }))]

  return (
    <div className="cat-pills-wrap" id="cat-pills">
      {pills.map(p => (
        <button
          key={p.k}
          className={`cat-pill ${p.k === curCat ? 'active' : ''}`}
          onClick={() => setCat(p.k)}
          style={{ whiteSpace: 'nowrap' }}
        >
          {p.v}
        </button>
      ))}
    </div>
  )
}
