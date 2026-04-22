'use client'
import { useState, useEffect, useRef } from 'react'

const CATS = {
  iphone: '📱 iPhone',
  ipad: '📱 iPad',
  macbook: '💻 MacBook',
  accessories: '🎧 إكسسوارات',
  repairs: '🔧 قطع غيار',
  other: '📦 أخرى'
}

const ALL_MODELS = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini', 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini', 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X', 'iPhone 8 Plus', 'iPhone 8', 'iPhone SE (3rd gen)', 'iPhone SE (2nd gen)',
  'iPad Pro 13" M4', 'iPad Pro 11" M4', 'iPad Pro 13" M2', 'iPad Pro 11" M2', 'iPad Air M2 13"', 'iPad Air M2 11"', 'iPad Air (5th gen)', 'iPad (10th gen)', 'iPad (9th gen)', 'iPad mini (6th gen)',
  'MacBook Pro 16" M4 Pro', 'MacBook Pro 16" M4', 'MacBook Pro 14" M4 Pro', 'MacBook Pro 14" M4', 'MacBook Pro 16" M3 Max', 'MacBook Pro 14" M3', 'MacBook Air 15" M3', 'MacBook Air 13" M3', 'MacBook Air 15" M2', 'MacBook Air 13" M2', 'MacBook Air 13" M1',
  'AirPods Pro (2nd gen)', 'AirPods (4th gen)', 'AirPods Max', 'Apple Watch Ultra 2', 'Apple Watch Series 10', 'Apple Watch SE', 'Apple Pencil Pro', 'Magic Keyboard', 'MagSafe Charger'
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [products, setProducts] = useState<any[]>([])
  
  const [activeTab, setActiveTab] = useState<'products' | 'customize' | 'maintenance' | 'trade' | 'logs'>('products')
  const [announcement, setAnnouncement] = useState({
    is_visible: false, text: '', bg_color: '#6366f1', text_color: '#ffffff'
  })
  const [maintenanceReqs, setMaintenanceReqs] = useState<any[]>([])
  const [tradeReqs, setTradeReqs] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [priceType, setPriceType] = useState<'fixed' | 'inquiry'>('fixed')
  const [price, setPrice] = useState('')

  const [siteConfig, setSiteConfig] = useState<any>({
    hero_title: 'Boox Store',
    hero_slogan_line1: 'من بوكس تشتري تفاح',
    hero_slogan_line2: 'وانت بالك مرتاح',
    whatsapp_number: '201113614021',
    color_primary: '#6366f1',
    color_secondary: '#22d3ee',
    color_accent: '#a855f7',
    maps_url: 'https://maps.app.goo.gl/ryLFkd2CCWUFcsxV6',
    instagram_url: 'https://www.instagram.com/ahmed_boox22',
    facebook_url: 'https://www.facebook.com/ahmed.m.yahia.2025',
    tiktok_url: 'https://www.tiktok.com/@boox_store'
  })

  // Form refs
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const oprRef = useRef<HTMLInputElement>(null)
  const catRef = useRef<HTMLSelectElement>(null)
  const modRef = useRef<HTMLSelectElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const imgCamRef = useRef<HTMLInputElement>(null)
  const stkRef = useRef<HTMLInputElement>(null)
  const featRef = useRef<HTMLInputElement>(null)
  const batRef = useRef<HTMLInputElement>(null)
  const taxExRef = useRef<HTMLInputElement>(null)
  const taxValRef = useRef<HTMLInputElement>(null)

  const [isAdding, setIsAdding] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('0%')
  const [showProgress, setShowProgress] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])

  const handleMultipleImages = () => {
    const files = imgRef.current?.files || imgCamRef.current?.files
    if (!files) return
    const arr = Array.from(files).map(f => URL.createObjectURL(f))
    setPreviews(arr)
  }

  const showToast = (msg: string, type = 'info') => {
    window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('adm') === '1') {
        setAuthed(true)
        loadProducts()
        loadSettings()
        loadMaintenance()
        loadTrade()
        loadAnnouncement()
      }
    }
  }, [])

  const loadAnnouncement = async () => {
    try {
      const res = await fetch('/api/announcement')
      const d = await res.json()
      setAnnouncement({
        is_visible: d.is_visible || false,
        text: d.text || '',
        bg_color: d.bg_color || '#6366f1',
        text_color: d.text_color || '#ffffff'
      })
    } catch (e) {
      console.error(e)
    }
  }

  const saveAnnouncement = async () => {
    try {
      const res = await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      })
      if (res.ok) showToast('✅ تم حفظ الإعلان!', 'success')
      else showToast('❌ حدث خطأ', 'error')
    } catch (e: any) {
      showToast('❌ حدث خطأ: ' + e.message, 'error')
    }
  }

  const loadMaintenance = async () => {
    try {
      const res = await fetch('/api/maintenance')
      const data = await res.json()
      setMaintenanceReqs(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadTrade = async () => {
    try {
      const res = await fetch('/api/trade')
      const data = await res.json()
      setTradeReqs(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data && !data.error) {
        setSiteConfig((prev: any) => ({ ...prev, ...data }))
        if (data.color_primary) document.documentElement.style.setProperty('--neon-1', data.color_primary)
        if (data.color_secondary) document.documentElement.style.setProperty('--neon-2', data.color_secondary)
        if (data.color_accent) document.documentElement.style.setProperty('--neon-3', data.color_accent)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const saveSettings = async (section: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfig)
      })
      if (!res.ok) throw new Error('Failed to save settings')
      showToast(`✅ تم حفظ ${section} بنجاح`, 'success')
      
      if (section === 'الألوان') {
        document.documentElement.style.setProperty('--neon-1', siteConfig.color_primary)
        document.documentElement.style.setProperty('--neon-2', siteConfig.color_secondary)
        document.documentElement.style.setProperty('--neon-3', siteConfig.color_accent)
      }
    } catch (e: any) {
      showToast('❌ فشل الحفظ: ' + e.message, 'error')
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pass === 'Boox@Admin2026' || pass === '1010') {
      sessionStorage.setItem('adm', '1')
      setAuthed(true)
      loadProducts()
    } else {
      showToast('❌ كلمة مرور خاطئة', 'error')
    }
  }

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      showToast('فشل تحميل المنتجات', 'error')
    }
  }


  const delProd = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Delete failed')
      showToast('🗑️ تم الحذف بنجاح', 'success')
      loadProducts()
    } catch (e: any) {
      showToast('❌ خطأ: ' + e.message, 'error')
    }
  }

  const addProd = async () => {
    const name = nameRef.current?.value.trim()
    const cat = catRef.current?.value
    
    if (!name || (priceType === 'fixed' && !price) || !cat) {
      showToast('⚠️ اسم المنتج، السعر، والتصنيف إلزامية', 'warn')
      return
    }

    setIsAdding(true)
    try {
      let uploadedUrls: string[] = []
      const files = imgRef.current?.files
      if (files && files.length > 0) {
        const { createClient } = await import('@/lib/supabase/client')
        const sup = createClient()
        
        setShowProgress(true)
        
        for (let i = 0; i < files.length; i++) {
          const imgFile = files[i]
          let blob: Blob = imgFile
          if (typeof window.createImageBitmap !== 'undefined') {
            const bmp = await createImageBitmap(imgFile)
            const cv = document.createElement('canvas')
            let w = bmp.width, h = bmp.height, mx = 900
            if (w > h) { if (w > mx) { h = h * mx / w; w = mx; } } 
            else { if (h > mx) { w = w * mx / h; h = mx; } }
            cv.width = Math.round(w); cv.height = Math.round(h)
            cv.getContext('2d')?.drawImage(bmp, 0, 0, cv.width, cv.height)
            blob = await new Promise<Blob>((r) => cv.toBlob(b => r(b!), 'image/jpeg', 0.78))
          }

          setUploadProgress(`${Math.round(((i + 0.5) / files.length) * 100)}%`)
          
          const imgName = `pd-${Date.now()}-${i}.jpg`
          const { error } = await sup.storage.from('product-images').upload(imgName, blob, { contentType: 'image/jpeg' })
          if (error) {
            console.error("Storage upload error:", error)
            throw error
          }
          const url = sup.storage.from('product-images').getPublicUrl(imgName).data.publicUrl
          uploadedUrls.push(url)
          setUploadProgress(`${Math.round(((i + 1) / files.length) * 100)}%`)
        }
        setTimeout(() => setShowProgress(false), 800)
      }

      const oprRaw = oprRef.current?.value
      const opr = oprRaw && !isNaN(parseFloat(oprRaw)) ? parseFloat(oprRaw) : null
      const mod = modRef.current?.value || null

      const payload = {
        name,
        description: descRef.current?.value || '',
        price: priceType === 'fixed' ? Number(price) : null,
        price_on_inquiry: priceType === 'inquiry',
        original_price: opr,
        category: cat,
        device_model: mod,
        image_url: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
        images: uploadedUrls.slice(1),
        in_stock: stkRef.current?.checked ?? true,
        is_featured: featRef.current?.checked ?? false,
        battery_health: batRef.current?.value ? parseInt(batRef.current.value) : null,
        is_tax_exempt: taxExRef.current?.checked ?? true,
        tax_value: taxValRef.current?.value ? parseFloat(taxValRef.current.value) : null
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create product')
      
      showToast('✅ تمت إضافة المنتج', 'success')
      
      // reset
      if (nameRef.current) nameRef.current.value = ''
      if (descRef.current) descRef.current.value = ''
      setPriceType('fixed')
      setPrice('')
      if (oprRef.current) oprRef.current.value = ''
      if (catRef.current) catRef.current.selectedIndex = 0
      if (modRef.current) modRef.current.selectedIndex = 0
      if (stkRef.current) stkRef.current.checked = true
      if (featRef.current) featRef.current.checked = false
      if (imgRef.current) imgRef.current.value = ''
      if (imgCamRef.current) imgCamRef.current.value = ''
      if (batRef.current) batRef.current.value = ''
      if (taxExRef.current) taxExRef.current.checked = true
      if (taxValRef.current) taxValRef.current.value = ''
      setPreviews([])

      loadProducts()
    } catch (e: any) {
      showToast('❌ فشل الحفظ: ' + e.message, 'error')
      setShowProgress(false)
    }
    setIsAdding(false)
  }

  if (!authed) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🔐 لوحة الأدمن</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="fi"
            required
            autoFocus
          />
          <button type="submit" className="btn-adm-primary">دخول</button>
        </form>
      </div>
    )
  }

  return (
    <div id="admin-panel" style={{ display: 'block', position: 'static', minHeight: '100vh', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-header">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>🔐 لوحة الأدمن</h2>
        <button onClick={() => window.location.href = '/'} className="adm-close">✕ العودة للمتجر</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '0 20px', overflowX: 'auto', marginBottom: '16px' }}>
        <button className={activeTab === 'products' ? 'btn-adm-primary' : 'btn-adm-ghost'} onClick={() => setActiveTab('products')} style={{ whiteSpace: 'nowrap' }}>📦 المنتجات</button>
        <button className={activeTab === 'customize' ? 'btn-adm-primary' : 'btn-adm-ghost'} onClick={() => setActiveTab('customize')} style={{ whiteSpace: 'nowrap' }}>🎨 تخصيص الموقع</button>
        <button className={activeTab === 'maintenance' ? 'btn-adm-primary' : 'btn-adm-ghost'} onClick={() => setActiveTab('maintenance')} style={{ whiteSpace: 'nowrap' }}>🔧 طلبات الصيانة</button>
        <button className={activeTab === 'trade' ? 'btn-adm-primary' : 'btn-adm-ghost'} onClick={() => setActiveTab('trade')} style={{ whiteSpace: 'nowrap' }}>🔁 طلبات الاستبدال</button>
        <button className={activeTab === 'logs' ? 'btn-adm-primary' : 'btn-adm-ghost'} onClick={() => setActiveTab('logs')} style={{ whiteSpace: 'nowrap' }}>📋 سجل العمليات</button>
      </div>

      {activeTab === 'customize' && (
        <>
          <div className="adm-section">
            <h3 style={{ marginBottom: '12px' }}>🏠 تخصيص الهيرو</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '.85rem' }}>العنوان الرئيسي</label>
              <input className="fi" value={siteConfig.hero_title || ''} onChange={e => setSiteConfig({...siteConfig, hero_title: e.target.value})} />
              <label style={{ fontSize: '.85rem' }}>السطر الأول من الشعار</label>
              <input className="fi" value={siteConfig.hero_slogan_line1 || ''} onChange={e => setSiteConfig({...siteConfig, hero_slogan_line1: e.target.value})} />
              <label style={{ fontSize: '.85rem' }}>السطر الثاني من الشعار</label>
              <input className="fi" value={siteConfig.hero_slogan_line2 || ''} onChange={e => setSiteConfig({...siteConfig, hero_slogan_line2: e.target.value})} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '.85rem' }}>تسمية المنتجات</label>
                  <input className="fi" value={siteConfig.hero_stat_products_label || ''} onChange={e => setSiteConfig({...siteConfig, hero_stat_products_label: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '.85rem' }}>تسمية الضمان</label>
                  <input className="fi" value={siteConfig.hero_stat_warranty_label || ''} onChange={e => setSiteConfig({...siteConfig, hero_stat_warranty_label: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '.85rem' }}>قيمة الضمان</label>
                  <input className="fi" value={siteConfig.hero_stat_warranty_value || ''} onChange={e => setSiteConfig({...siteConfig, hero_stat_warranty_value: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '.85rem' }}>تسمية الدعم</label>
                  <input className="fi" value={siteConfig.hero_stat_support_label || ''} onChange={e => setSiteConfig({...siteConfig, hero_stat_support_label: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '.85rem' }}>قيمة الدعم</label>
                  <input className="fi" value={siteConfig.hero_stat_support_value || ''} onChange={e => setSiteConfig({...siteConfig, hero_stat_support_value: e.target.value})} />
                </div>
              </div>
              <button className="btn-adm-primary" style={{ marginTop: '4px' }} onClick={() => saveSettings('الهيرو')}>💾 حفظ الهيرو</button>
            </div>
          </div>

          <div className="adm-section">
            <h3 style={{ marginBottom: '12px' }}>📞 معلومات التواصل</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '.85rem' }}>رقم واتساب (بدون +)</label>
              <input className="fi" value={siteConfig.whatsapp_number || ''} onChange={e => setSiteConfig({...siteConfig, whatsapp_number: e.target.value})} placeholder="201113614021" />
              <label style={{ fontSize: '.85rem' }}>رابط خريطة جوجل</label>
              <input className="fi" value={siteConfig.maps_url || ''} onChange={e => setSiteConfig({...siteConfig, maps_url: e.target.value})} />
              <label style={{ fontSize: '.85rem' }}>رابط إنستاجرام</label>
              <input className="fi" value={siteConfig.instagram_url || ''} onChange={e => setSiteConfig({...siteConfig, instagram_url: e.target.value})} />
              <label style={{ fontSize: '.85rem' }}>رابط فيسبوك</label>
              <input className="fi" value={siteConfig.facebook_url || ''} onChange={e => setSiteConfig({...siteConfig, facebook_url: e.target.value})} />
              <label style={{ fontSize: '.85rem' }}>رابط تيكتوك</label>
              <input className="fi" value={siteConfig.tiktok_url || ''} onChange={e => setSiteConfig({...siteConfig, tiktok_url: e.target.value})} />
              <button className="btn-adm-primary" style={{ marginTop: '4px' }} onClick={() => saveSettings('التواصل')}>💾 حفظ التواصل</button>
            </div>
          </div>

          <div className="adm-section">
            <h3>🎨 تخصيص الألوان</h3>
            <div className="clr-row">
              <div className="clr-item"><span>أساسي</span><input type="color" value={siteConfig.color_primary || '#6366f1'} onChange={e => setSiteConfig({...siteConfig, color_primary: e.target.value})} /></div>
              <div className="clr-item"><span>ثانوي</span><input type="color" value={siteConfig.color_secondary || '#22d3ee'} onChange={e => setSiteConfig({...siteConfig, color_secondary: e.target.value})} /></div>
              <div className="clr-item"><span>ثالث</span><input type="color" value={siteConfig.color_accent || '#a855f7'} onChange={e => setSiteConfig({...siteConfig, color_accent: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button className="btn-adm-primary" onClick={() => saveSettings('الألوان')}>💾 حفظ الألوان</button>
            </div>
          </div>

          <div className="adm-section" style={{marginTop:'1rem'}}>
            <h3 style={{marginBottom:'1rem'}}>📢 خط الإعلانات المتحرك</h3>
            <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem',cursor:'pointer'}}>
              <input type="checkbox" checked={announcement.is_visible}
                onChange={e => setAnnouncement(p=>({...p,is_visible:e.target.checked}))} />
              <span style={{ fontSize: '.85rem' }}>إظهار خط الإعلانات</span>
            </label>
            <textarea value={announcement.text}
              onChange={e => setAnnouncement(p=>({...p,text:e.target.value}))}
              placeholder="اكتب نص الإعلان هنا... مثال: 🔥 عرض خاص على iPhone 15"
              rows={3} className="fi" style={{width:'100%',marginBottom:'1rem'}} />
            <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap'}}>
              <label style={{ fontSize: '.85rem' }}>لون الخلفية: <input type="color" value={announcement.bg_color}
                onChange={e => setAnnouncement(p=>({...p,bg_color:e.target.value}))} /></label>
              <label style={{ fontSize: '.85rem' }}>لون النص: <input type="color" value={announcement.text_color}
                onChange={e => setAnnouncement(p=>({...p,text_color:e.target.value}))} /></label>
            </div>
            <button onClick={saveAnnouncement} className="btn-adm-primary" style={{ marginTop: '4px' }}>💾 حفظ الإعلان</button>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <>
          <div className="adm-section">
            <h3>➕ إضافة منتج</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              <input type="text" ref={nameRef} className="fi" placeholder="اسم المنتج *" required />
              <textarea ref={descRef} className="fi" placeholder="الوصف"></textarea>
              <div style={{marginBottom:'1rem'}}>
                <label style={{display:'block',marginBottom:'0.5rem',fontWeight:'600'}}>السعر</label>
                <div style={{display:'flex',gap:'1rem',marginBottom:'0.75rem'}}>
                  <label style={{cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                    <input type="radio" name="priceType" value="fixed"
                      checked={priceType === 'fixed'}
                      onChange={() => setPriceType('fixed')} />
                    سعر محدد
                  </label>
                  <label style={{cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                    <input type="radio" name="priceType" value="inquiry"
                      checked={priceType === 'inquiry'}
                      onChange={() => setPriceType('inquiry')} />
                    اسأل بوكس (بدون سعر)
                  </label>
                </div>
                {priceType === 'fixed' && (
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="السعر بالجنيه *"
                    className="fi"
                  />
                )}
              </div>
              <input type="number" ref={oprRef} className="fi" placeholder="السعر الأصلي ($)" />
              <select ref={catRef} className="fi" required defaultValue="">
                <option value="" disabled>التصنيف *</option>
                {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select ref={modRef} className="fi" defaultValue="">
                <option value="">الموديل (اختياري)</option>
                {ALL_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <div className="adm-grid-2">
                <input type="number" ref={batRef} className="fi" placeholder="🔋 نسبة البطارية (%)" min="1" max="100" />
                <div className="fi" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)' }}>
                  <input type="checkbox" ref={taxExRef} defaultChecked style={{ width: 'auto' }} />
                  <label style={{ fontSize: '.8rem' }}>معفي من الضريبة</label>
                </div>
              </div>
              <input type="number" ref={taxValRef} className="fi" placeholder="💰 قيمة الضريبة (إذا وجد)" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <div style={{ fontSize: '.85rem', color: 'var(--text-dim)', marginBottom: '4px' }}>📷 صورة المنتج:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label htmlFor="ap-img-gal" className="upload-btn" style={{ margin: 0, fontSize: '.85rem' }}>🖼️ المعرض</label>
                  <label htmlFor="ap-img-cam" className="upload-btn" style={{ margin: 0, fontSize: '.85rem', background: 'rgba(255,255,255,0.08)' }}>📸 الكاميرا</label>
                </div>
              </div>
              <input type="file" id="ap-img-gal" ref={imgRef} accept="image/*" multiple onChange={handleMultipleImages} style={{ display: 'none' }} />
              <input type="file" id="ap-img-cam" ref={imgCamRef} accept="image/*" capture="environment" multiple onChange={handleMultipleImages} style={{ display: 'none' }} />
              
              {previews.length > 0 && (
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'8px'}}>
                  {previews.map((p,i) => (
                    <img key={i} src={p} alt="" style={{width:'60px',height:'60px',objectFit:'cover',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.1)'}} />
                  ))}
                </div>
              )}
              
              <div className="progress-bar-wrap" style={{ display: showProgress ? 'block' : 'none' }}>
                <div className="progress-bar-fill" style={{ width: uploadProgress }}></div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                <input type="checkbox" ref={stkRef} defaultChecked style={{ width: 'auto' }} />
                <label style={{ fontSize: '.9rem' }}>متوفر بالمخزون</label>
                <input type="checkbox" ref={featRef} style={{ width: 'auto', marginRight: '16px' }} />
                <label style={{ fontSize: '.9rem' }}>منتج مميز</label>
              </div>
              <button onClick={addProd} disabled={isAdding} className="btn-adm-primary">
                {isAdding ? 'جاري الحفظ...' : 'حفظ المنتج'}
              </button>
            </div>
          </div>

          <div className="adm-section pb-20">
            <h3>📦 المنتجات الحالية</h3>
            <div id="adm-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {(Array.isArray(products) ? products : []).length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>لا توجد منتجات بعد</div>
              ) : (
                (Array.isArray(products) ? products : []).map(p => (
                  <div key={p.id} className="adm-prod-item">
                    <img 
                      className="adm-prod-img" 
                      src={p.image_url || ''} 
                      onError={(e) => (e.target as HTMLElement).style.display = 'none'} 
                      alt={p.name}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.9rem', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>
                        {p.price}$ · {p.in_stock ? '✅ متاح' : '❌ نفذ'} {p.battery_health ? `· 🔋 ${p.battery_health}%` : ''}
                      </div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-dim)' }}>
                        {p.is_tax_exempt ? '🏷️ معفي من الضريبة' : `💰 ضريبة: ${p.tax_value}$`}
                      </div>
                    </div>
                    <button onClick={() => delProd(p.id)} className="adm-prod-del" aria-label="حذف">🗑️</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'maintenance' && (
        <div className="adm-section pb-20">
          <h3>🔧 طلبات الصيانة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {maintenanceReqs.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>لا توجد طلبات صيانة</div>
            ) : (
              maintenanceReqs.map(r => (
                <div key={r.id} className="adm-prod-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
                   <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{r.customer_name} - {r.device_type}</div>
                   <div style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{r.issue_description}</div>
                   <div style={{ fontSize: '.75rem', color: 'var(--neon-2)', marginTop: '8px', padding: '4px 8px', background: 'rgba(34,211,238,0.1)', borderRadius: '4px' }}>
                     الحالة: {r.status} | الهاتف: {r.phone_number} | التاريخ: {new Date(r.created_at).toLocaleDateString('ar-EG')}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'trade' && (
        <div className="adm-section pb-20">
          <h3>🔁 طلبات الاستبدال</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
             {tradeReqs.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>لا توجد طلبات استبدال</div>
             ) : (
                tradeReqs.map(r => (
                  <div key={r.id} className="adm-prod-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
                     <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{r.customer_name} يطلب {r.target_device}</div>
                     <div style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>جهازه: {r.device_to_trade} (حالة: {r.device_condition})</div>
                     <div style={{ fontSize: '.75rem', color: 'var(--neon-3)', marginTop: '8px', padding: '4px 8px', background: 'rgba(168,85,247,0.1)', borderRadius: '4px' }}>
                       الحالة: {r.status} | الهاتف: {r.phone_number} | التاريخ: {new Date(r.created_at).toLocaleDateString('ar-EG')}
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="adm-section pb-20">
          <h3>📋 سجل العمليات</h3>
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>قريباً...</div>
        </div>
      )}
    </div>
  )
}
