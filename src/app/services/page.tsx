'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

const ALL_MODELS = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini', 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini', 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X', 'iPhone 8 Plus', 'iPhone 8', 'iPhone SE (3rd gen)', 'iPhone SE (2nd gen)',
  'iPad Pro 13" M4', 'iPad Pro 11" M4', 'iPad Pro 13" M2', 'iPad Pro 11" M2', 'iPad Air M2 13"', 'iPad Air M2 11"', 'iPad Air (5th gen)', 'iPad (10th gen)', 'iPad (9th gen)', 'iPad mini (6th gen)',
  'MacBook Pro 16" M4 Pro', 'MacBook Pro 16" M4', 'MacBook Pro 14" M4 Pro', 'MacBook Pro 14" M4', 'MacBook Pro 16" M3 Max', 'MacBook Pro 14" M3', 'MacBook Air 15" M3', 'MacBook Air 13" M3', 'MacBook Air 15" M2', 'MacBook Air 13" M2', 'MacBook Air 13" M1',
  'AirPods Pro (2nd gen)', 'AirPods (4th gen)', 'AirPods Max', 'Apple Watch Ultra 2', 'Apple Watch Series 10', 'Apple Watch SE'
]

const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB']
const CONDITION_OPTIONS = ['كالجديد تماماً (بدون خدوش)', 'ممتاز (خدوش بسيطة جداً)', 'جيد (خدوش واضحة)', 'مقبول (يحتاج صيانة خفيفة)']

type ServiceType = 'trade' | 'maintenance' | 'shipping'
type Product = { id: string, name: string, price: number, image_url: string }

function pushToast(msg: string, type: 'success' | 'error' | 'warn') {
  window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
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
      cv.toBlob((blob) => {
        if (!blob) reject(new Error('Compression failed'))
        else resolve(blob)
      }, 'image/jpeg', 0.78)
    })
  } catch {
    return file
  }
}

async function uploadImg(supabase: SupabaseClient, file: File, prefix: string) {
  try {
    const blob = await compressImg(file)
    const name = `${prefix}-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('trade-media').upload(name, blob, { contentType: 'image/jpeg' })
    if (error) throw error
    return supabase.storage.from('trade-media').getPublicUrl(name).data.publicUrl
  } catch {
    return null
  }
}

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<ServiceType>('trade')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [storeProducts, setStoreProducts] = useState<Product[]>([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [deviceModel, setDeviceModel] = useState('')
  const [description, setDescription] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [showProgress, setShowProgress] = useState(false)
  const [progressWidth, setProgressWidth] = useState('0%')

  const [storageSize, setStorageSize] = useState('')
  const [condition, setCondition] = useState('')
  const [targetProductMode, setTargetProductMode] = useState<'store'|'custom'>('store')
  const [selectedStoreProductId, setSelectedStoreProductId] = useState('')
  const [customDesiredModel, setCustomDesiredModel] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStoreProducts(data.filter(p => p.is_visible && p.in_stock))
      })
      .catch(() => {})
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    setMediaFiles(prev => [...prev, ...files])
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls])
  }

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setName(''); setPhone(''); setDeviceModel(''); setDescription(''); setShippingAddress('')
    setStorageSize(''); setCondition(''); setTargetProductMode('store'); setSelectedStoreProductId(''); setCustomDesiredModel('')
    setMediaFiles([]); setPreviews([]); setSuccessMsg('')
  }

  const submitMaintenance = async () => {
    if (!name || !phone || !deviceModel || !description) {
      pushToast('يرجى تعبئة الحقول المطلوبة', 'warn'); return
    }
    setIsSubmitting(true)
    setShowProgress(true)
    setProgressWidth('30%')
    try {
      const supabase = createClient()
      const mediaUrls: string[] = []
      for (const file of mediaFiles) {
        const u = await uploadImg(supabase, file, 'mt')
        if (u) mediaUrls.push(u)
      }
      setProgressWidth('70%')
      const { error } = await supabase.from('maintenance_requests').insert([{
        customer_name: name, customer_phone: phone, device_model: deviceModel, issue_description: description, notes: '', media_urls: mediaUrls
      }])
      if (error) throw error
      setProgressWidth('100%')
      setSuccessMsg('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.')
    } catch {
      pushToast('حدث خطأ أثناء الإرسال', 'error')
    }
    setIsSubmitting(false)
    setTimeout(() => { setShowProgress(false); setProgressWidth('0%') }, 800)
  }

  const submitTrade = async () => {
    if (!name || !phone || !deviceModel || !condition || !storageSize) {
      pushToast('يرجى تعبئة الحقول المطلوبة', 'warn'); return
    }
    let desiredDevice = ''
    if (targetProductMode === 'store') {
      const sp = storeProducts.find(p => p.id === selectedStoreProductId)
      if (!sp) { pushToast('اختر المنتج المطلوب الترقية إليه', 'warn'); return }
      desiredDevice = `[من المتجر] ${sp.name} - ${sp.price} ج`
    } else {
      if (!customDesiredModel) { pushToast('يرجى كتابة الجهاز المطلوب', 'warn'); return }
      desiredDevice = customDesiredModel
    }

    setIsSubmitting(true)
    setShowProgress(true)
    setProgressWidth('30%')
    try {
      const supabase = createClient()
      const mediaUrls: string[] = []
      for (const file of mediaFiles) {
        const u = await uploadImg(supabase, file, 'tr')
        if (u) mediaUrls.push(u)
      }
      setProgressWidth('70%')
      const { error } = await supabase.from('trade_requests').insert([{
        customer_name: name, customer_phone: phone, device_model: `${deviceModel} - ${storageSize}`, device_condition: condition, desired_model: desiredDevice, notes: '', media_urls: mediaUrls
      }])
      if (error) throw error
      setProgressWidth('100%')
      setSuccessMsg('تم إرسال طلب الاستبدال! سنقيّم جهازك ونتواصل معك.')
    } catch {
      pushToast('حدث خطأ أثناء الإرسال', 'error')
    }
    setIsSubmitting(false)
    setTimeout(() => { setShowProgress(false); setProgressWidth('0%') }, 800)
  }

  const submitShipping = async () => {
    if (!name || !phone || !description || !shippingAddress) {
      pushToast('يرجى تعبئة الحقول المطلوبة', 'warn'); return
    }
    setIsSubmitting(true)
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          customer_address: shippingAddress,
          notes: `[طلب منتج خاص من صفحة الخدمات]: ${description}`
        })
      })
      
      const lines = [
        'السلام عليكم Boox Store', 'طلب منتج خاص جديد:', '',
        `👤 الاسم: ${name}`, `📞 رقم الهاتف: ${phone}`, `📍 اللوكيشن/العنوان: ${shippingAddress}`,
        `🛍️ المنتج المطلوب: ${description}`
      ]
      window.open(`https://wa.me/201113614021?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
      setSuccessMsg('تم تسجيل طلبك وتحويلك للواتساب بنجاح.')
    } catch {
      pushToast('حدث خطأ أثناء الإرسال', 'error')
    }
    setIsSubmitting(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === 'maintenance') submitMaintenance()
    else if (activeTab === 'trade') submitTrade()
    else submitShipping()
  }

  return (
    <div id="home" className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pb-20 relative overflow-hidden" dir="rtl">
      
      <div className="absolute inset-0 pointer-events-none z-0">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99, 102, 241, .12), transparent)' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-[800px] mx-auto px-4 pt-8">
        
        {/* EXACT Homepage Hero Logo & Title */}
        <div className="text-center mb-8">
          <Image 
            src="/assets/boox-logo-outline.png" 
            alt="Boox Store Logo" 
            width={120} height={120} 
            className="hero-logo mx-auto"
            priority
          />
          <h1 className="hero-title mt-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
            خدمات <span>Boox Store</span>
          </h1>
          <Link href="/" className="inline-flex items-center gap-1 text-[13px] text-[var(--text-dim)] hover:text-[var(--neon-1)] transition-colors mt-2" style={{ textDecoration: 'none' }}>
            العودة للرئيسية
          </Link>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
          {[
            { id: 'trade', label: 'استبدال الجهاز' },
            { id: 'maintenance', label: 'طلب صيانة' },
            { id: 'shipping', label: 'طلب منتج خاص' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as ServiceType); resetForm() }}
              style={{
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'var(--neon-1)' : 'var(--glass-border)'}`,
                color: activeTab === tab.id ? 'var(--neon-1)' : 'var(--text-dim)',
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.id ? '0 0 16px rgba(99, 102, 241, 0.2)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* The Exact Form Card from the Homepage */}
        <div className="form-card" style={{ margin: '0 auto', opacity: 1, maxHeight: '2000px', transform: 'none' }}>
          {!successMsg ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-row">
                <div className="field-wrap">
                  <label className="field-label">الاسم</label>
                  <input type="text" className="fi" placeholder="اسمك الكريم" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="field-wrap">
                  <label className="field-label">رقم الهاتف</label>
                  <input type="tel" className="fi" placeholder="+20 xxx xxxx xxx" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>

              {(activeTab === 'trade' || activeTab === 'maintenance') && (
                <>
                  <div className="field-wrap">
                    <label className="field-label">🔻 جهازك الحالي</label>
                    <select className="fi" value={deviceModel} onChange={e => setDeviceModel(e.target.value)} required>
                      <option value="" disabled>اختر جهازك الحالي</option>
                      {ALL_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="other">أخرى</option>
                    </select>
                  </div>

                  {activeTab === 'trade' && (
                    <div className="form-row">
                      <div className="field-wrap">
                        <label className="field-label">التخزين الحالي</label>
                        <select className="fi" value={storageSize} onChange={e => setStorageSize(e.target.value)} required>
                          <option value="" disabled>التخزين</option>
                          {STORAGE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="field-wrap">
                        <label className="field-label">حالة الجهاز</label>
                        <select className="fi" value={condition} onChange={e => setCondition(e.target.value)} required>
                          <option value="" disabled>الحالة</option>
                          <option>ممتاز</option>
                          <option>جيد جداً</option>
                          <option>جيد</option>
                          <option>مقبول</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'maintenance' && (
                    <div className="field-wrap">
                      <label className="field-label">وصف المشكلة</label>
                      <textarea className="fi" placeholder="اوصف المشكلة بالتفصيل..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'trade' && (
                <div className="field-wrap">
                  <label className="field-label">🔺 الجهاز المطلوب</label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <button type="button" className="upload-btn" onClick={() => setTargetProductMode('store')} style={{ margin: 0, background: targetProductMode === 'store' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: targetProductMode === 'store' ? 'var(--neon-1)' : 'var(--text-dim)', border: `1px solid ${targetProductMode === 'store' ? 'var(--neon-1)' : 'transparent'}` }}>من المتجر</button>
                    <button type="button" className="upload-btn" onClick={() => setTargetProductMode('custom')} style={{ margin: 0, background: targetProductMode === 'custom' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: targetProductMode === 'custom' ? 'var(--neon-1)' : 'var(--text-dim)', border: `1px solid ${targetProductMode === 'custom' ? 'var(--neon-1)' : 'transparent'}` }}>كتابة يدوي</button>
                  </div>

                  {targetProductMode === 'store' ? (
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      {storeProducts.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>جاري التحميل...</p>
                      ) : (
                        storeProducts.map(prod => (
                          <label key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${selectedStoreProductId === prod.id ? 'var(--neon-1)' : 'var(--glass-border)'}`, background: selectedStoreProductId === prod.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)' }}>
                            <input type="radio" style={{ display: 'none' }} checked={selectedStoreProductId === prod.id} onChange={() => setSelectedStoreProductId(prod.id)} />
                            {prod.image_url ? <img src={prod.image_url} style={{ width: '40px', height: '40px', objectFit: 'contain' }} alt="" /> : <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>}
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{prod.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--neon-1)', marginTop: '4px' }}>{prod.price.toLocaleString('ar-EG')} ج</div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  ) : (
                    <textarea className="fi" placeholder="اكتب الموديل والمساحة المطلوبة..." value={customDesiredModel} onChange={e => setCustomDesiredModel(e.target.value)} required></textarea>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <>
                  <div className="field-wrap">
                    <label className="field-label">المنتج المطلوب</label>
                    <textarea className="fi" placeholder="المنتج بالتفصيل..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                  </div>
                  <div className="field-wrap">
                    <label className="field-label">عنوان الشحن</label>
                    <input type="text" className="fi" placeholder="المحافظة - المنطقة - الشارع" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required />
                  </div>
                </>
              )}

              {(activeTab === 'trade' || activeTab === 'maintenance') && (
                <div className="field-wrap">
                  <label className="field-label">صور الجهاز أو المشكلة (اختياري)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                    <label className="upload-btn" style={{ margin: 0 }}>
                      🖼️ المعرض
                      <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                    <label className="upload-btn" style={{ margin: 0, background: 'rgba(255,255,255,0.08)' }}>
                      📸 الكاميرا
                      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                  </div>
                  
                  <div className="upload-preview">
                    {previews.map((url, i) => (
                      <div key={url} style={{ position: 'relative', display: 'inline-block', marginRight: '8px' }}>
                        <img src={url} className="upload-thumb" alt="Preview" />
                        <button type="button" onClick={() => removeFile(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'red', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="progress-bar-wrap" style={{ display: showProgress ? 'block' : 'none' }}>
                    <div className="progress-bar-fill" style={{ width: progressWidth }}></div>
                  </div>
                </div>
              )}

              <button type="button" className="btn-submit" disabled={isSubmitting} onClick={handleSubmit} style={{ marginTop: '10px' }}>
                {isSubmitting ? 'يتم الإرسال...' : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    {activeTab === 'trade' ? 'طلب الاستبدال' : activeTab === 'maintenance' ? 'إرسال طلب الصيانة' : 'تأكيد طلب الشحن'}
                  </>
                )}
              </button>

            </div>
          ) : (
            <div className="form-success" style={{ display: 'flex' }}>
              <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3>تم إرسال طلبك بنجاح!</h3>
              <p style={{ color: 'var(--text-dim)' }}>{successMsg}</p>
              <button onClick={resetForm} className="btn-submit" style={{ marginTop: '8px' }}>طلب جديد</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
