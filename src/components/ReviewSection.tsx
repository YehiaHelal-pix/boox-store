'use client'
import { useState, useEffect } from 'react'
import { Star, Send, User, ThumbsUp } from 'lucide-react'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  helpful: number
}

export default function ReviewSection({ productId, productName }: { productId: string; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const storageKey = `boox_reviews_${productId}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setReviews(JSON.parse(saved))
    } catch {}
  }, [storageKey])

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0'

  const handleSubmit = () => {
    if (!name.trim() || !comment.trim()) return
    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
      helpful: 0
    }
    const updated = [newReview, ...reviews]
    setReviews(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setName(''); setComment(''); setRating(5); setSubmitted(true); setShowForm(false)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const markHelpful = (id: string) => {
    const helpedKey = `boox_helped_${id}`
    if (localStorage.getItem(helpedKey)) return
    const updated = reviews.map(r => r.id === id ? { ...r, helpful: r.helpful + 1 } : r)
    setReviews(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    localStorage.setItem(helpedKey, '1')
  }

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }))

  const ic = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-amber-400/50 focus:bg-amber-400/5 text-sm"

  return (
    <section className="mt-12 pt-8 border-t border-white/5" dir="rtl" style={{ animation: 'fadeInUp 0.6s ease both' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Star size={20} className="text-amber-400 icon-interactive" style={{ animation: 'floatSoft 3s infinite' }} />
          التقييمات والمراجعات
        </h2>
        <button onClick={() => setShowForm(!showForm)}
          className="text-sm font-bold text-amber-400 border border-amber-400/30 px-4 py-2 rounded-xl hover:bg-amber-400/10 transition active:scale-95">
          ✍️ اكتب تقييم
        </button>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 mb-8 p-5 rounded-2xl border border-white/5 bg-white/[0.02]" style={{ animation: 'fadeInScale 0.5s ease both' }}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-black text-white">{avgRating}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={16} className={s <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} />
              ))}
            </div>
            <span className="text-xs text-gray-500">{reviews.length} تقييم</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {ratingBreakdown.map(b => (
              <div key={b.star} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-3">{b.star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="text-gray-500 w-8 text-left">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success message */}
      {submitted && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold text-center" style={{ animation: 'fadeInScale 0.3s ease both' }}>
          ✅ شكراً لك! تم إضافة تقييمك بنجاح
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 p-5 rounded-2xl border border-white/5 bg-[#0a0f18]/80 backdrop-blur-xl space-y-4" style={{ animation: 'fadeInUp 0.4s ease both' }}>
          <div><label className="text-sm font-bold text-gray-400 mb-1 block"><User size={14} className="inline ml-1 icon-interactive" />اسمك</label><input className={ic} value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكريم" /></div>
          <div>
            <label className="text-sm font-bold text-gray-400 mb-2 block">التقييم</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}
                  className="transition-transform hover:scale-125 active:scale-90">
                  <Star size={28} className={s <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} />
                </button>
              ))}
            </div>
          </div>
          <div><label className="text-sm font-bold text-gray-400 mb-1 block">تعليقك</label><textarea className={ic} rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="شاركنا تجربتك مع هذا المنتج..." /></div>
          <button onClick={handleSubmit} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-400 py-3 text-sm font-black text-black transition hover:scale-[1.02] active:scale-95">
            <Send size={16} className="icon-interactive" /> إرسال التقييم
          </button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !showForm ? (
        <div className="text-center py-10 text-gray-500">
          <Star size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <div key={r.id} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition" style={{ animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-black font-bold text-xs">{r.name[0]}</div>
                  <div><div className="text-sm font-bold text-white">{r.name}</div><div className="text-[10px] text-gray-500">{r.date}</div></div>
                </div>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />)}</div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{r.comment}</p>
              <button onClick={() => markHelpful(r.id)} className="mt-2 flex items-center gap-1 text-[11px] text-gray-500 hover:text-amber-400 transition">
                <ThumbsUp size={12} className="icon-interactive" /> مفيد ({r.helpful})
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
