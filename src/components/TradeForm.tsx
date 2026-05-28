'use client'
import { useRef, useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { IPHONE_MODELS, IPAD_MODELS, MACBOOK_MODELS, getStorageForModel, getColorsForModel } from '@/lib/apple-data'
import type { Product } from '@/types/database'
import { Camera, ImagePlus, Send, ArrowLeftRight, Package, AlertCircle } from 'lucide-react'

interface TradeFormProps {
  /** If provided, the customer wants to trade FOR this specific product */
  targetProduct?: Product | null
  /** Show as inline section (services page) vs standalone */
  inline?: boolean
}

const DEVICE_CATEGORIES = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'ipad', label: 'iPad' },
  { value: 'macbook', label: 'MacBook' },
  { value: 'other', label: 'جهاز آخر' },
]

const CONDITION_OPTIONS = [
  { value: 'new_no_active', label: 'جديد (No Active / مغلف)' },
  { value: 'like_new', label: 'كسر الزيرو (ممتاز)' },
  { value: 'used_good', label: 'مستعمل - حالة جيدة' },
  { value: 'used_fair', label: 'مستعمل - حالة مقبولة' },
]

const ACCESSORY_OPTIONS = [
  { value: 'full_box', label: 'بالكرتونة + جميع الملحقات' },
  { value: 'box_only', label: 'بالكرتونة فقط (منغير ملحقات)' },
  { value: 'charger_only', label: 'شاحن فقط' },
  { value: 'none', label: 'منغير أي ملحقات' },
]

const WARRANTY_OPTIONS = [
  { value: 'warranty', label: 'بضمان رسمي' },
  { value: 'receipt', label: 'بمبايعة / فاتورة' },
  { value: 'none', label: 'منغير ضمان أو مبايعة' },
]

const TAX_OPTIONS = [
  { value: 'exempt', label: 'معفى من الضريبة' },
  { value: 'taxable', label: 'عليه ضريبة (غير معفى)' },
]

function getModels(category: string) {
  switch (category) {
    case 'iphone': return IPHONE_MODELS
    case 'ipad': return IPAD_MODELS
    case 'macbook': return MACBOOK_MODELS
    default: return []
  }
}

export default function TradeForm({ targetProduct, inline = true }: TradeFormProps) {
  const [tradeOpen, setTradeOpen] = useState(!inline || !!targetProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [showProgress, setShowProgress] = useState(false)
  const [progressWidth, setProgressWidth] = useState('0%')

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deviceCategory, setDeviceCategory] = useState('iphone')
  const [deviceModel, setDeviceModel] = useState('')
  const [deviceModelManual, setDeviceModelManual] = useState('')
  const [deviceStorage, setDeviceStorage] = useState('')
  const [deviceColor, setDeviceColor] = useState('')
  const [deviceCondition, setDeviceCondition] = useState('')
  const [batteryHealth, setBatteryHealth] = useState('')
  const [accessories, setAccessories] = useState('')
  const [taxStatus, setTaxStatus] = useState('exempt')
  const [warranty, setWarranty] = useState('')
  const [notes, setNotes] = useState('')

  const mediaRef = useRef<HTMLInputElement>(null)
  const mediaCamRef = useRef<HTMLInputElement>(null)

  const isOther = deviceCategory === 'other'
  const models = getModels(deviceCategory)
  const storages = !isOther && deviceModel ? getStorageForModel(deviceCategory, deviceModel) : []
  const colors = !isOther && deviceModel ? getColorsForModel(deviceCategory, deviceModel) : []

  const showToast = (msg: string, type = 'info') => {
    window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls].slice(0, 4))
  }

  async function compressImg(file: File): Promise<Blob> {
    try {
      if (typeof window === 'undefined' || !window.createImageBitmap) return file
      const bmp = await createImageBitmap(file)
      const cv = document.createElement('canvas')
      let w = bmp.width, h = bmp.height, mx = 900
      if (w > h) { if (w > mx) { h = h * mx / w; w = mx; } }
      else { if (h > mx) { w = w * mx / h; h = mx; } }
      cv.width = Math.round(w); cv.height = Math.round(h)
      cv.getContext('2d')?.drawImage(bmp, 0, 0, cv.width, cv.height)
      return await new Promise<Blob>((resolve, reject) => {
        cv.toBlob((blob) => blob ? resolve(blob) : reject(new Error('compress fail')), 'image/jpeg', 0.78)
      })
    } catch { return file }
  }

  const uploadImg = async (supabase: SupabaseClient, file: File, prefix: string) => {
    setShowProgress(true); setProgressWidth('20%')
    try {
      const blob = await compressImg(file); setProgressWidth('50%')
      const name = prefix + '-' + Date.now() + '.jpg'
      const { error } = await supabase.storage.from('trade-media').upload(name, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      setProgressWidth('100%')
      setTimeout(() => { setShowProgress(false); setProgressWidth('0%') }, 800)
      return supabase.storage.from('trade-media').getPublicUrl(name).data.publicUrl
    } catch { setShowProgress(false); return null }
  }

  const buildWhatsAppMessage = (mediaUrls: string[]) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'
    const actualModel = isOther ? deviceModelManual : deviceModel
    const lines = [
      '🔄 *طلب استبدال جهاز - Boox Store*',
      '',
      `👤 *الاسم:* ${customerName}`,
      `📞 *الهاتف:* ${customerPhone}`,
      '',
      '📱 *بيانات جهازك:*',
      `  • الموديل: ${actualModel}`,
      deviceStorage ? `  • المساحة: ${deviceStorage}` : '',
      deviceColor ? `  • اللون: ${deviceColor}` : '',
      `  • الحالة: ${CONDITION_OPTIONS.find(c => c.value === deviceCondition)?.label || deviceCondition}`,
      batteryHealth ? `  • صحة البطارية: ${batteryHealth}%` : '',
      accessories ? `  • الملحقات: ${ACCESSORY_OPTIONS.find(a => a.value === accessories)?.label || accessories}` : '',
      `  • الضريبة: ${TAX_OPTIONS.find(t => t.value === taxStatus)?.label || taxStatus}`,
      warranty ? `  • الضمان: ${WARRANTY_OPTIONS.find(w => w.value === warranty)?.label || warranty}` : '',
      notes ? `  • ملاحظات: ${notes}` : '',
      '',
    ]

    if (targetProduct) {
      lines.push('🎯 *الجهاز المطلوب (من الموقع):*')
      lines.push(`  • ${targetProduct.name}`)
      if (targetProduct.storage_size) lines.push(`  • المساحة: ${targetProduct.storage_size}`)
      if (targetProduct.color) lines.push(`  • اللون: ${targetProduct.color}`)
      if (targetProduct.price && !targetProduct.price_on_inquiry) lines.push(`  • السعر: ${targetProduct.price.toLocaleString('ar-EG')} جنيه`)
      if (targetProduct.image_url) lines.push(`  • صورة: ${targetProduct.image_url}`)
    } else {
      lines.push('🎯 *الجهاز المطلوب:* غير محدد (يرجى الاتفاق)')
    }

    if (mediaUrls.length > 0) {
      lines.push('')
      lines.push('📸 *صور الجهاز:*')
      mediaUrls.forEach((url, i) => lines.push(`  ${i + 1}. ${url}`))
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`
  }

  const handleSubmit = async () => {
    const actualModel = isOther ? deviceModelManual : deviceModel
    if (!customerName || !customerPhone || !actualModel || !deviceCondition) {
      showToast('⚠️ يرجى تعبئة جميع الحقول المطلوبة', 'warn')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const mediaUrls: string[] = []

      const files = mediaRef.current?.files
      const camFiles = mediaCamRef.current?.files
      if (files) { for (let i = 0; i < files.length; i++) { const u = await uploadImg(supabase, files[i], 'tr'); if (u) mediaUrls.push(u) } }
      if (camFiles) { for (let i = 0; i < camFiles.length; i++) { const u = await uploadImg(supabase, camFiles[i], 'trc'); if (u) mediaUrls.push(u) } }

      // Save to database
      await supabase.from('trade_requests').insert([{
        customer_name: customerName,
        customer_phone: customerPhone,
        device_model: `${actualModel}${deviceStorage ? ' - ' + deviceStorage : ''}${deviceColor ? ' - ' + deviceColor : ''}`,
        device_condition: deviceCondition,
        battery_health: batteryHealth ? Number(batteryHealth) : null,
        desired_model: targetProduct ? `${targetProduct.name} - ${targetProduct.storage_size || ''}` : 'غير محدد',
        tax_exempt: taxStatus === 'exempt',
        has_warranty: warranty === 'warranty' || warranty === 'receipt',
        notes: `الملحقات: ${ACCESSORY_OPTIONS.find(a => a.value === accessories)?.label || 'غير محدد'} | الضمان: ${WARRANTY_OPTIONS.find(w => w.value === warranty)?.label || 'غير محدد'} | ${notes}`,
        media_urls: mediaUrls
      }])

      // Open WhatsApp with all details
      const whatsappUrl = buildWhatsAppMessage(mediaUrls)
      window.open(whatsappUrl, '_blank')

      setSuccess(true)
    } catch (e) {
      showToast('❌ حدث خطأ, حاول مرة أخرى', 'error')
    }
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setSuccess(false); setPreviews([])
    setCustomerName(''); setCustomerPhone('')
    setDeviceCategory('iphone'); setDeviceModel(''); setDeviceModelManual('')
    setDeviceStorage(''); setDeviceColor(''); setDeviceCondition('')
    setBatteryHealth(''); setAccessories(''); setTaxStatus('exempt')
    setWarranty(''); setNotes('')
    if (mediaRef.current) mediaRef.current.value = ''
    if (mediaCamRef.current) mediaCamRef.current.value = ''
  }

  // Styled input/select components
  const fieldClass = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400 focus:bg-cyan-400/5 text-sm"
  const labelClass = "text-sm font-bold text-gray-400 mb-1.5 block"

  return (
    <section id="trade-form" className="w-full" dir="rtl">
      {/* Header - clickable to toggle in inline mode */}
      {inline && (
        <h2
          className="text-2xl font-black text-white text-center mb-6 cursor-pointer select-none flex items-center justify-center gap-3"
          onClick={() => setTradeOpen(!tradeOpen)}
        >
          <ArrowLeftRight size={24} className="text-cyan-400" />
          <span>استبدال الجهاز</span>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ transition: 'transform 0.35s ease', transform: tradeOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#22d3ee' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </h2>
      )}

      {/* Target product info banner */}
      {targetProduct && (
        <div className="flex items-center gap-4 p-4 mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 backdrop-blur-xl">
          {targetProduct.image_url && (
            <img src={targetProduct.image_url} alt="" className="w-16 h-16 object-contain rounded-xl bg-white p-1" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-cyan-400 font-bold mb-1">الجهاز الذي تريد الاستبدال معه</div>
            <div className="text-white font-bold truncate">{targetProduct.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{targetProduct.storage_size} • {targetProduct.color}</div>
          </div>
          <div className="text-left shrink-0">
            {targetProduct.price_on_inquiry ? (
              <span className="text-sm font-bold text-emerald-400">اسأل عن السعر</span>
            ) : (
              <span className="text-lg font-black text-white">{targetProduct.price?.toLocaleString('ar-EG')} <small className="text-xs text-gray-400">جنيه</small></span>
            )}
          </div>
        </div>
      )}

      <div style={{ overflow: 'hidden', maxHeight: tradeOpen ? '5000px' : '0', transition: 'max-height 0.5s ease, opacity 0.4s ease', opacity: tradeOpen ? 1 : 0 }}>
        {!success ? (
          <div className="rounded-[24px] border border-white/5 bg-[#0a0f18]/80 p-6 md:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5">

            {/* ── Customer Info ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>الاسم الكامل *</label>
                <input type="text" className={fieldClass} placeholder="اسمك الكريم" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>رقم الهاتف *</label>
                <input type="tel" className={fieldClass} placeholder="01xxxxxxxxx" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              </div>
            </div>

            {/* ── Your Device Section ── */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📱</span>
                <h3 className="text-base font-black text-white">بيانات جهازك الحالي</h3>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className={labelClass}>نوع الجهاز *</label>
                <div className="grid grid-cols-4 gap-2">
                  {DEVICE_CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => { setDeviceCategory(cat.value); setDeviceModel(''); setDeviceStorage(''); setDeviceColor('') }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${deviceCategory === cat.value
                        ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              {isOther ? (
                <div className="mb-4">
                  <label className={labelClass}>اسم الجهاز *</label>
                  <input type="text" className={fieldClass} placeholder="اكتب اسم وموديل جهازك" value={deviceModelManual} onChange={e => setDeviceModelManual(e.target.value)} />
                </div>
              ) : (
                <div className="mb-4">
                  <label className={labelClass}>الموديل *</label>
                  <select className={fieldClass} value={deviceModel} onChange={e => { setDeviceModel(e.target.value); setDeviceStorage(''); setDeviceColor('') }}>
                    <option value="">— اختر الموديل —</option>
                    {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              )}

              {/* Storage & Color */}
              {deviceModel && !isOther && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>المساحة</label>
                    <select className={fieldClass} value={deviceStorage} onChange={e => setDeviceStorage(e.target.value)}>
                      <option value="">— اختر —</option>
                      {storages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>اللون</label>
                    <select className={fieldClass} value={deviceColor} onChange={e => setDeviceColor(e.target.value)}>
                      <option value="">— اختر —</option>
                      {colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Condition & Battery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>حالة الجهاز *</label>
                  <select className={fieldClass} value={deviceCondition} onChange={e => setDeviceCondition(e.target.value)}>
                    <option value="">— اختر الحالة —</option>
                    {CONDITION_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>صحة البطارية (%)</label>
                  <input type="number" min="0" max="100" className={fieldClass} placeholder="مثال: 87" value={batteryHealth} onChange={e => setBatteryHealth(e.target.value)} />
                </div>
              </div>

              {/* Accessories & Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>الملحقات والكرتونة</label>
                  <select className={fieldClass} value={accessories} onChange={e => setAccessories(e.target.value)}>
                    <option value="">— اختر —</option>
                    {ACCESSORY_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>حالة الضريبة</label>
                  <select className={fieldClass} value={taxStatus} onChange={e => setTaxStatus(e.target.value)}>
                    {TAX_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Warranty */}
              <div className="mb-4">
                <label className={labelClass}>الضمان / المبايعة</label>
                <select className={fieldClass} value={warranty} onChange={e => setWarranty(e.target.value)}>
                  <option value="">— اختر —</option>
                  {WARRANTY_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className={labelClass}>ملاحظات (خدوش، كسور، مشاكل)</label>
                <textarea className={fieldClass} rows={3} placeholder="اكتب أي ملاحظات عن الجهاز مثل خدوش أو كسور أو مشاكل تقنية..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              {/* Photos */}
              <div className="mb-4">
                <label className={labelClass}>صور جهازك (اختياري)</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label htmlFor="trade-gallery" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition text-sm font-bold text-gray-400">
                    <ImagePlus size={18} /> المعرض
                  </label>
                  <label htmlFor="trade-camera" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition text-sm font-bold text-gray-400">
                    <Camera size={18} /> الكاميرا
                  </label>
                </div>
                <input type="file" id="trade-gallery" ref={mediaRef} multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                <input type="file" id="trade-camera" ref={mediaCamRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

                {previews.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {previews.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    ))}
                  </div>
                )}

                {showProgress && (
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: progressWidth }} />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-indigo-500 to-cyan-400 py-4 text-base font-black text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span>جارٍ الإرسال...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>إرسال طلب الاستبدال</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-[24px] border border-white/5 bg-[#0a0f18]/80 backdrop-blur-2xl">
            <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 className="text-xl font-black text-white mt-4">تم إرسال طلب الاستبدال! ✅</h3>
            <p className="text-gray-400 mt-2 text-sm">سنقيّم جهازك ونتواصل معك عبر الواتساب قريباً</p>
            <button onClick={resetForm} className="mt-6 bg-white/10 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/20 transition">طلب جديد</button>
          </div>
        )}
      </div>
    </section>
  )
}
