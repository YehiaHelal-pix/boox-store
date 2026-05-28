'use client'

import { useState, useEffect, useRef } from 'react'
import { IoClose, IoLogoWhatsapp, IoSend } from 'react-icons/io5'

interface AskBooxProps {
  productId?: string
  productName?: string
}

const QUICK_REPLIES = [
  'كم السعر؟',
  'هل الجهاز متاح؟',
  'ما شروط الضمان؟',
  'هل يوجد تقسيط؟',
  'أريد التواصل مع المبيعات',
]

function AskBooxDrawer({ isOpen, onClose, productId, productName }: AskBooxProps & { isOpen: boolean; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
    if (isOpen) {
      setSent(false)
      setMessage('')
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)

    try {
      // Create lead via API
      const leadData = {
        product_id: productId || null,
        product_name: productName || null,
        customer_message: message,
        source: 'ask_boox',
      }

      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      }).catch(() => {
        // Silently fail - WhatsApp will still open
      })

      // Build WhatsApp message
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'
      const whatsappMsg = encodeURIComponent(
        `مرحباً Boox Store 👋\n${productName ? `أنا مهتم بـ: ${productName}\n` : ''}${message}\nأرجو التواصل معي`
      )
      window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`, '_blank')

      setSent(true)
      window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg: 'تم إرسال طلبك ✅', type: 'success' } }))

      setTimeout(() => onClose(), 1500)
    } catch {
      // Error already handled
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed z-[61] bg-[#0a0a14] border border-white/10 overflow-hidden bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh] lg:bottom-auto lg:top-0 lg:left-0 lg:right-auto lg:w-[420px] lg:h-full lg:rounded-t-none lg:rounded-r-3xl"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <IoLogoWhatsapp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">💬 اسأل بوكس</h3>
              {productName && (
                <p className="text-white/50 text-xs line-clamp-1">{productName}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
            <IoClose className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <div className="text-5xl">✅</div>
            <p className="text-white font-bold text-lg">تم إرسال طلبك!</p>
            <p className="text-white/50 text-sm text-center">سيتم التواصل معك في أقرب وقت عبر واتساب</p>
          </div>
        ) : (
          <div className="flex flex-col p-4 gap-4">
            {/* Quick Replies */}
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => setMessage(reply)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/70 hover:border-[var(--neon-cyan)]/40 hover:text-white hover:bg-[var(--neon-cyan)]/10 transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm resize-none outline-none focus:border-[var(--neon-cyan)]/40 focus:bg-white/8 transition-all placeholder:text-white/30"
              dir="rtl"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="btn-ask-boox disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IoSend className="w-4 h-4" />
              )}
              {sending ? 'جاري الإرسال...' : 'إرسال عبر واتساب'}
            </button>
          </div>
        )}
      </div>

    </>
  )
}

export function AskBooxFloating() {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState<{ productId?: string; productName?: string }>({})

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setContext({ productId: detail?.productId, productName: detail?.productName })
      setIsOpen(true)
    }
    window.addEventListener('open-ask-boox', handler)
    return () => window.removeEventListener('open-ask-boox', handler)
  }, [])

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setContext({}); setIsOpen(true) }}
        className="fixed bottom-24 left-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl lg:bottom-8"
        style={{
          background: 'linear-gradient(135deg, #10B981, #059669)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
        }}
        aria-label="اسأل بوكس"
      >
        <IoLogoWhatsapp className="w-7 h-7 text-white" />
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
          style={{ animation: 'pulseRing 2s ease-out infinite' }}
        />
      </button>

      <AskBooxDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={context.productId}
        productName={context.productName}
      />
    </>
  )
}

export function AskBooxInline({ product }: { product: { id: string; name: string } }) {
  return (
    <button
      type="button"
      className="btn-ask-boox text-base py-3"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent('open-ask-boox', {
            detail: { productId: product.id, productName: product.name },
          })
        )
      }}
    >
      <IoLogoWhatsapp className="w-5 h-5" />
      اسأل بوكس
    </button>
  )
}
