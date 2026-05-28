'use client'
import { useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { IPHONE_MODELS, IPAD_MODELS, MACBOOK_MODELS } from '@/lib/apple-data'
import { Wrench, Camera, ImagePlus, Send, ChevronDown, Smartphone, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react'

const DEVICE_CATEGORIES = [
  { value: 'iphone', label: 'iPhone', icon: '📱' },
  { value: 'ipad', label: 'iPad', icon: '📟' },
  { value: 'macbook', label: 'MacBook', icon: '💻' },
  { value: 'watch', label: 'Apple Watch', icon: '⌚' },
  { value: 'airpods', label: 'AirPods', icon: '🎧' },
  { value: 'other', label: 'أخرى', icon: '📦' },
]

const PROBLEM_TYPES = [
  'الشاشة مكسورة أو بها خدوش',
  'مشكلة في البطارية (استهلاك سريع / انتفاخ)',
  'مشكلة في الشحن أو منفذ الشحن',
  'مشكلة في الكاميرا (أمامية / خلفية)',
  'مشكلة في السماعة أو المايكروفون',
  'مشكلة في زر الباور أو الأزرار',
  'مشكلة في Face ID / Touch ID',
  'الجهاز لا يعمل نهائياً',
  'مشكلة في الواي فاي أو البلوتوث',
  'مشكلة في الصوت',
  'مشكلة برمجية (تهنيج / ريستارت)',
  'دخول مياه أو سوائل',
  'مشكلة في اللمس (Touch)',
  'مشكلة أخرى',
]

const PARTS_QUALITY = [
  { value: 'original', label: 'قطع أصلية (Original)', desc: 'ضمان أطول وجودة مثل التوكيل' },
  { value: 'oem', label: 'قطع عادية (OEM)', desc: 'جودة جيدة بسعر أقل' },
  { value: 'pulled', label: 'قطع خلع (Pulled)', desc: 'مستخرجة من أجهزة أخرى - ' },
]

const WARRANTY_STATUS = [
  { value: 'apple_warranty', label: 'في ضمان Apple الرسمي' },
  { value: 'store_warranty', label: 'في ضمان المتجر' },
  { value: 'expired', label: 'الضمان منتهي' },
  { value: 'no_warranty', label: 'منغير ضمان' },
]

const OPENED_BEFORE = [
  { value: 'no', label: 'لا، لم يتم فتحه من قبل' },
  { value: 'yes_official', label: 'ايوه، في مركز معتمد' },
  { value: 'yes_unofficial', label: 'ايوه، في مكان غير معتمد' },
  { value: 'unknown', label: 'لا أعلم' },
]

const SELL_INTEREST = [
  { value: 'no', label: 'لا، أريد الصيانة فقط' },
  { value: 'maybe', label: 'ممكن، حسب تكلفة الصيانة' },
  { value: 'yes', label: 'ايوه، أريد بيعه' },
]

function getModels(cat: string) {
  if (cat === 'iphone') return IPHONE_MODELS
  if (cat === 'ipad') return IPAD_MODELS
  if (cat === 'macbook') return MACBOOK_MODELS
  return []
}

export default function MaintenanceForm() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [showProgress, setShowProgress] = useState(false)
  const [progressWidth, setProgressWidth] = useState('0%')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [deviceCat, setDeviceCat] = useState('iphone')
  const [model, setModel] = useState('')
  const [modelManual, setModelManual] = useState('')
  const [problemType, setProblemType] = useState('')
  const [problemDesc, setProblemDesc] = useState('')
  const [partsQuality, setPartsQuality] = useState('')
  const [warrantyStatus, setWarrantyStatus] = useState('')
  const [openedBefore, setOpenedBefore] = useState('')
  const [sellInterest, setSellInterest] = useState('no')

  const mediaRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type = 'info') => {
    window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setPreviews(p => [...p, ...Array.from(e.target.files!).map(f => URL.createObjectURL(f))].slice(0, 6))
  }

  async function compress(file: File): Promise<Blob> {
    try {
      if (typeof window === 'undefined' || !window.createImageBitmap) return file
      const bmp = await createImageBitmap(file)
      const cv = document.createElement('canvas')
      let w = bmp.width, h = bmp.height, mx = 900
      if (w > h) { if (w > mx) { h = h * mx / w; w = mx } } else { if (h > mx) { w = w * mx / h; h = mx } }
      cv.width = Math.round(w); cv.height = Math.round(h)
      cv.getContext('2d')?.drawImage(bmp, 0, 0, cv.width, cv.height)
      return await new Promise<Blob>((res, rej) => cv.toBlob(b => b ? res(b) : rej(), 'image/jpeg', 0.78))
    } catch { return file }
  }

  const upload = async (sb: SupabaseClient, file: File, pre: string) => {
    setShowProgress(true); setProgressWidth('30%')
    try {
      const blob = await compress(file); setProgressWidth('60%')
      const n = pre + '-' + Date.now() + '.jpg'
      const { error } = await sb.storage.from('maintenance-media').upload(n, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      setProgressWidth('100%')
      setTimeout(() => { setShowProgress(false); setProgressWidth('0%') }, 600)
      return sb.storage.from('maintenance-media').getPublicUrl(n).data.publicUrl
    } catch { setShowProgress(false); return null }
  }

  const handleSubmit = async () => {
    const actualModel = ['watch', 'airpods', 'other'].includes(deviceCat) ? modelManual : model
    if (!name || !phone || !actualModel || !problemType) {
      showToast('⚠️ يرجى تعبئة جميع الحقول المطلوبة', 'warn'); return
    }
    setSubmitting(true)
    try {
      const sb = createClient()
      const urls: string[] = []
      for (const input of [mediaRef.current, camRef.current]) {
        if (input?.files) for (let i = 0; i < input.files.length; i++) { const u = await upload(sb, input.files[i], 'mt'); if (u) urls.push(u) }
      }

      await sb.from('maintenance_requests').insert([{
        customer_name: name, customer_phone: phone,
        device_model: actualModel, issue_description: `${problemType}${problemDesc ? ' | ' + problemDesc : ''}`,
        notes: `قطع: ${PARTS_QUALITY.find(p => p.value === partsQuality)?.label || '-'} | ضمان: ${WARRANTY_STATUS.find(w => w.value === warrantyStatus)?.label || '-'} | فتح سابق: ${OPENED_BEFORE.find(o => o.value === openedBefore)?.label || '-'} | بيع: ${SELL_INTEREST.find(s => s.value === sellInterest)?.label || '-'} | عنوان: ${address || '-'}`,
        media_urls: urls
      }])

      // WhatsApp message
      const waPhone = process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'
      const lines = [
        '🔧 *طلب صيانة - Boox Store*', '',
        `👤 *الاسم:* ${name}`, `📞 *الهاتف:* ${phone}`,
        address ? `📍 *العنوان:* ${address}` : '',
        '', `📱 *الجهاز:* ${actualModel}`,
        `⚠️ *المشكلة:* ${problemType}`,
        problemDesc ? `📝 *تفاصيل:* ${problemDesc}` : '',
        partsQuality ? `🔩 *القطع:* ${PARTS_QUALITY.find(p => p.value === partsQuality)?.label}` : '',
        warrantyStatus ? `🛡️ *الضمان:* ${WARRANTY_STATUS.find(w => w.value === warrantyStatus)?.label}` : '',
        openedBefore ? `🔓 *فتح سابق:* ${OPENED_BEFORE.find(o => o.value === openedBefore)?.label}` : '',
        `💰 *بيع الجهاز:* ${SELL_INTEREST.find(s => s.value === sellInterest)?.label}`,
        ...urls.map((u, i) => `📸 صورة ${i + 1}: ${u}`),
      ].filter(Boolean)
      window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
      setSuccess(true)
    } catch { showToast('❌ حدث خطأ, حاول مرة أخرى', 'error') }
    setSubmitting(false)
  }

  const reset = () => {
    setSuccess(false); setPreviews([])
    setName(''); setPhone(''); setAddress(''); setDeviceCat('iphone'); setModel(''); setModelManual('')
    setProblemType(''); setProblemDesc(''); setPartsQuality(''); setWarrantyStatus('')
    setOpenedBefore(''); setSellInterest('no')
    if (mediaRef.current) mediaRef.current.value = ''
    if (camRef.current) camRef.current.value = ''
  }

  const fc = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-amber-400 focus:bg-amber-400/5 text-sm"
  const lc = "text-sm font-bold text-gray-400 mb-1.5 block"
  const models = getModels(deviceCat)
  const needsManual = ['watch', 'airpods', 'other'].includes(deviceCat)

  return (
    <section id="maintenance" className="w-full" dir="rtl">
      <h2 className="text-2xl font-black text-white text-center mb-6 cursor-pointer select-none flex items-center justify-center gap-3 group" onClick={() => setOpen(!open)}>
        <Wrench size={24} className="text-amber-400 transition-transform group-hover:rotate-[20deg] group-active:rotate-45 icon-interactive" style={{ animation: 'floatSoft 3s infinite ease-in-out' }} />
        <span>طلب صيانة</span>
        <ChevronDown size={22} className="text-amber-400 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </h2>

      <div style={{ overflow: 'hidden', maxHeight: open ? '6000px' : '0', transition: 'max-height 0.6s ease, opacity 0.4s ease', opacity: open ? 1 : 0 }}>
        {!success ? (
          <div className="rounded-[24px] border border-white/5 bg-[#0a0f18]/80 p-6 md:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5">

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={lc}>الاسم الكامل *</label><input className={fc} placeholder="اسمك الكريم" value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label className={lc}>رقم الهاتف *</label><input type="tel" className={fc} placeholder="01xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            </div>
            <div><label className={lc}><MapPin size={14} className="inline ml-1 text-amber-400" />العنوان</label><input className={fc} placeholder="المحافظة - المنطقة - الشارع" value={address} onChange={e => setAddress(e.target.value)} /></div>

            {/* Device Section */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={18} className="text-amber-400 animate-pulse" />
                <h3 className="text-base font-black text-white">بيانات الجهاز</h3>
              </div>

              <label className={lc}>نوع الجهاز *</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {DEVICE_CATEGORIES.map((c, i) => (
                  <button key={c.value} type="button" onClick={() => { setDeviceCat(c.value); setModel('') }}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${deviceCat === c.value
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)] scale-105'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:scale-[1.02]'}`}
                    style={{ animation: `fadeInScale 0.3s ease ${i * 0.05}s both` }}>
                    <span className="text-lg transition-transform hover:scale-125" style={{ animation: 'floatSoft 3s infinite ease-in-out' }}>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Model */}
              {needsManual ? (
                <div className="mb-4"><label className={lc}>اسم الجهاز *</label><input className={fc} placeholder="اكتب اسم جهازك" value={modelManual} onChange={e => setModelManual(e.target.value)} /></div>
              ) : (
                <div className="mb-4"><label className={lc}>الموديل *</label>
                  <select className={fc} value={model} onChange={e => setModel(e.target.value)}>
                    <option value="">— اختر الموديل —</option>
                    {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Problem Section */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-rose-400 icon-interactive" style={{ animation: 'floatSoft 2s infinite ease-in-out' }} />
                <h3 className="text-base font-black text-white">ما المشكلة؟</h3>
              </div>

              <label className={lc}>نوع المشكلة *</label>
              <select className={fc + ' mb-4'} value={problemType} onChange={e => setProblemType(e.target.value)}>
                <option value="">— اختر نوع المشكلة —</option>
                {PROBLEM_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <label className={lc}>وصف إضافي للمشكلة (اختياري)</label>
              <textarea className={fc} rows={2} placeholder="اشرح المشكلة بالتفصيل إن أمكن..." value={problemDesc} onChange={e => setProblemDesc(e.target.value)} />
            </div>

            {/* Repair Details */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={18} className="text-cyan-400 icon-interactive" style={{ animation: 'floatSoft 3s infinite ease-in-out 0.5s' }} />
                <h3 className="text-base font-black text-white">تفاصيل الصيانة</h3>
              </div>

              <label className={lc}>جودة قطع الغيار المطلوبة</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {PARTS_QUALITY.map(p => (
                  <button key={p.value} type="button" onClick={() => setPartsQuality(p.value)}
                    className={`p-3 rounded-xl text-right border transition-all ${partsQuality === p.value
                      ? 'bg-cyan-400/10 border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className={`text-sm font-bold ${partsQuality === p.value ? 'text-cyan-300' : 'text-gray-300'}`}>{p.label}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div><label className={lc}><ShieldCheck size={14} className="inline ml-1 text-emerald-400" />حالة الضمان</label>
                  <select className={fc} value={warrantyStatus} onChange={e => setWarrantyStatus(e.target.value)}>
                    <option value="">— اختر —</option>
                    {WARRANTY_STATUS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
                <div><label className={lc}>هل تم فتح الجهاز من قبل؟</label>
                  <select className={fc} value={openedBefore} onChange={e => setOpenedBefore(e.target.value)}>
                    <option value="">— اختر —</option>
                    {OPENED_BEFORE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <label className={lc}>هل تريد بيع الجهاز؟</label>
              <select className={fc + ' mb-4'} value={sellInterest} onChange={e => setSellInterest(e.target.value)}>
                {SELL_INTEREST.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Photos */}
            <div className="pt-4 border-t border-white/5">
              <label className={lc}>📸 صور الجهاز / المشكلة</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <label htmlFor="maint-gallery" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] cursor-pointer hover:bg-white/5 hover:border-amber-400/30 transition text-sm font-bold text-gray-400 active:scale-95">
                  <ImagePlus size={18} className="icon-interactive" /> المعرض
                </label>
                <label htmlFor="maint-camera" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] cursor-pointer hover:bg-white/5 hover:border-amber-400/30 transition text-sm font-bold text-gray-400 active:scale-95">
                  <Camera size={18} className="icon-interactive" /> الكاميرا
                </label>
              </div>
              <input type="file" id="maint-gallery" ref={mediaRef} multiple accept="image/*" className="hidden" onChange={handleFiles} />
              <input type="file" id="maint-camera" ref={camRef} accept="image/*" capture="environment" className="hidden" onChange={handleFiles} />
              {previews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}
              {showProgress && <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: progressWidth }} /></div>}
            </div>

            {/* Submit */}
            <button type="button" disabled={submitting} onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-400 py-4 text-base font-black text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] transition hover:scale-[1.02] active:scale-95 disabled:opacity-50">
              {submitting ? 'جارٍ الإرسال...' : <><Send size={18} className="icon-interactive" style={{ animation: 'floatSoft 2s infinite' }} /> إرسال طلب الصيانة</>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-[24px] border border-white/5 bg-[#0a0f18]/80 backdrop-blur-2xl">
            <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <h3 className="text-xl font-black text-white mt-4">تم إرسال طلب الصيانة! ✅</h3>
            <p className="text-gray-400 mt-2 text-sm">سنتواصل معك عبر الواتساب لتأكيد الموعد والتفاصيل</p>
            <button onClick={reset} className="mt-6 bg-white/10 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/20 transition">طلب جديد</button>
          </div>
        )}
      </div>
    </section>
  )
}
