'use client'
import { useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const ALL_MODELS = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini', 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini', 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X', 'iPhone 8 Plus', 'iPhone 8', 'iPhone SE (3rd gen)', 'iPhone SE (2nd gen)',
  'iPad Pro 13" M4', 'iPad Pro 11" M4', 'iPad Pro 13" M2', 'iPad Pro 11" M2', 'iPad Air M2 13"', 'iPad Air M2 11"', 'iPad Air (5th gen)', 'iPad (10th gen)', 'iPad (9th gen)', 'iPad mini (6th gen)',
  'MacBook Pro 16" M4 Pro', 'MacBook Pro 16" M4', 'MacBook Pro 14" M4 Pro', 'MacBook Pro 14" M4', 'MacBook Pro 16" M3 Max', 'MacBook Pro 14" M3', 'MacBook Air 15" M3', 'MacBook Air 13" M3', 'MacBook Air 15" M2', 'MacBook Air 13" M2', 'MacBook Air 13" M1',
  'AirPods Pro (2nd gen)', 'AirPods (4th gen)', 'AirPods Max', 'Apple Watch Ultra 2', 'Apple Watch Series 10', 'Apple Watch SE', 'Apple Pencil Pro', 'Magic Keyboard', 'MagSafe Charger'
]

export default function MaintenanceForm() {
  const [maintOpen, setMaintOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [progressWidth, setProgressWidth] = useState('0%')
  const [showProgress, setShowProgress] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const modelRef = useRef<HTMLSelectElement>(null)
  const probRef = useRef<HTMLTextAreaElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const mediaRef = useRef<HTMLInputElement>(null)
  const mediaCamRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type = 'info') => {
    window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }

  // Exact compression logic
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
        cv.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'))
            return
          }
          resolve(blob)
        }, 'image/jpeg', 0.78)
      })
    } catch {
      return file
    }
  }

  const uploadImg = async (supabase: SupabaseClient, file: File, prefix: string) => {
    setShowProgress(true)
    setProgressWidth('20%')
    try {
      const blob = await compressImg(file)
      setProgressWidth('50%')
      const name = prefix + '-' + Date.now() + '.jpg'
      const { error } = await supabase.storage.from('maintenance-media').upload(name, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      setProgressWidth('100%')
      setTimeout(() => { setShowProgress(false); setProgressWidth('0%') }, 800)
      return supabase.storage.from('maintenance-media').getPublicUrl(name).data.publicUrl
    } catch {
      setShowProgress(false)
      return null
    }
  }

  const handleSubmit = async () => {
    const name = nameRef.current?.value.trim()
    const phone = phoneRef.current?.value.trim()
    const model = modelRef.current?.value
    const problem = probRef.current?.value.trim()
    
    if (!name || !phone || !model || !problem) {
      showToast('⚠️ يرجى تعبئة جميع الحقول المطلوبة', 'warn')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const mediaUrls: string[] = []
      
      const files = mediaRef.current?.files
      const camFiles = mediaCamRef.current?.files
      
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const u = await uploadImg(supabase, files[i], 'mt')
          if (u) mediaUrls.push(u)
        }
      }
      if (camFiles) {
        for (let i = 0; i < camFiles.length; i++) {
          const u = await uploadImg(supabase, camFiles[i], 'mtc')
          if (u) mediaUrls.push(u)
        }
      }

      const { error } = await supabase.from('maintenance_requests').insert([{
        customer_name: name,
        customer_phone: phone,
        device_model: model,
        issue_description: problem,
        notes: notesRef.current?.value || '',
        media_urls: mediaUrls
      }])

      if (error) throw error
      setSuccess(true)
    } catch (e) {
      showToast('❌ حدث خطأ, حاول مرة أخرى', 'error')
    }
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setSuccess(false)
    setPreviews([])
    if (nameRef.current) nameRef.current.value = ''
    if (phoneRef.current) phoneRef.current.value = ''
    if (modelRef.current) modelRef.current.value = ''
    if (probRef.current) probRef.current.value = ''
    if (notesRef.current) notesRef.current.value = ''
    if (mediaRef.current) mediaRef.current.value = ''
    if (mediaCamRef.current) mediaCamRef.current.value = ''
  }

  return (
    <section id="maintenance" className="form-section">
      <h2 
        className="section-title-lg anim-reveal" 
        onClick={() => setMaintOpen(!maintOpen)}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
      >
        🔧 <span>طلب صيانة</span>
        <svg 
          viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'transform 0.35s ease', transform: maintOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--neon-2)' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </h2>
      
      <div 
        id="maint-body"
        style={{
          overflow: 'hidden', 
          maxHeight: maintOpen ? '2000px' : '0', 
          transition: 'maxHeight 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease', 
          opacity: maintOpen ? 1 : 0
        }}
      >
        {!success ? (
          <div className="form-card" id="m-card">
            <div className="form-row">
              <div className="field-wrap">
                <label className="field-label">الاسم</label>
                <input type="text" ref={nameRef} className="fi" placeholder="اسمك الكريم" required />
              </div>
              <div className="field-wrap">
                <label className="field-label">رقم الهاتف</label>
                <input type="tel" ref={phoneRef} className="fi" placeholder="+20 xxx xxxx xxx" required />
              </div>
            </div>
            <div className="field-wrap">
              <label className="field-label">الجهاز</label>
              <select ref={modelRef} className="fi" required defaultValue="">
                <option value="" disabled>اختر الجهاز</option>
                {ALL_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="field-wrap">
              <label className="field-label">وصف المشكلة</label>
              <textarea ref={probRef} className="fi" placeholder="اوصف المشكلة بالتفصيل..." required></textarea>
            </div>
            <div className="field-wrap">
              <label className="field-label">ملاحظات إضافية (اختياري)</label>
              <textarea ref={notesRef} className="fi" placeholder="أي معلومات إضافية..."></textarea>
            </div>
            <div className="field-wrap">
              <label className="field-label">صور المشكلة (اختياري)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <label htmlFor="m-media" className="upload-btn" style={{ margin: 0 }}>🖼️ المعرض</label>
                <label htmlFor="m-camera" className="upload-btn" style={{ margin: 0, background: 'rgba(255,255,255,0.08)' }}>📸 الكاميرا</label>
              </div>
              <input type="file" id="m-media" ref={mediaRef} multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <input type="file" id="m-camera" ref={mediaCamRef} accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
              
              <div className="upload-preview" id="m-preview">
                {previews.map((url, i) => (
                  <img key={i} src={url} className="upload-thumb" alt="Preview" />
                ))}
              </div>
              
              <div className="progress-bar-wrap" id="m-prog" style={{ display: showProgress ? 'block' : 'none' }}>
                <div className="progress-bar-fill" id="m-prog-fill" style={{ width: progressWidth }}></div>
              </div>
            </div>
            
            <button type="button" className="btn-submit" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'يتم الإرسال...' : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  إرسال طلب الصيانة
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="form-success" id="m-success" style={{ display: 'flex' }}>
            <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>تم إرسال طلبك بنجاح!</h3>
            <p style={{ color: 'var(--text-dim)' }}>سنتواصل معك قريباً على الرقم المُدخل</p>
            <button onClick={resetForm} className="btn-submit" style={{ marginTop: '8px' }}>طلب جديد</button>
          </div>
        )}
      </div>
    </section>
  )
}
