'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number | null
  price_on_inquiry: boolean
  category: string
  description: string
  in_stock: boolean
  image_url: string
  images: string[]
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:'Cairo,sans-serif',fontSize:'1.5rem'}}>
      ⏳ جاري التحميل...
    </div>
  )

  if (!product || (product as any).error) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',fontFamily:'Cairo,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'4rem'}}>😕</div>
      <div style={{fontSize:'1.5rem'}}>المنتج غير موجود</div>
      <button onClick={() => router.push('/')} style={{padding:'0.75rem 2rem',background:'#6366f1',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontSize:'1rem',fontFamily:'Cairo,sans-serif'}}>
        العودة للرئيسية
      </button>
    </div>
  )

  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean)

  const WHATSAPP = '201113614021'
  const msg = encodeURIComponent(
    `السلام عليكم بوكس ستور 👋\nأنا مهتم بـ: ${product.name}` +
    (!product.price_on_inquiry && product.price ? `\nالسعر: ${product.price.toLocaleString('ar-EG')} جنيه` : '') +
    (product.category ? `\nالفئة: ${product.category}` : '') +
    `\nممكن تساعدني؟`
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'white',padding:'1.5rem 1rem',fontFamily:'Cairo,sans-serif',direction:'rtl'}}>
      <div style={{maxWidth:'960px',margin:'0 auto'}}>
        
        <button onClick={() => router.back()} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'white',padding:'0.5rem 1.25rem',borderRadius:'8px',cursor:'pointer',marginBottom:'1.5rem',fontSize:'0.95rem',fontFamily:'Cairo,sans-serif'}}>
          ← رجوع
        </button>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'2rem'}}>
          
          {/* Images */}
          <div>
            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'16px',overflow:'hidden',aspectRatio:'1',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {allImages[activeImg] ? (
                <img src={allImages[activeImg]} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              ) : (
                <span style={{fontSize:'5rem'}}>📱</span>
              )}
            </div>
            {allImages.length > 1 && (
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                {allImages.map((img,i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{width:'65px',height:'65px',border:`2px solid ${i===activeImg?'#6366f1':'rgba(255,255,255,0.1)'}`,borderRadius:'8px',overflow:'hidden',cursor:'pointer',padding:0,background:'rgba(255,255,255,0.04)'}}>
                    <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <h1 style={{fontSize:'clamp(1.4rem,4vw,2rem)',fontWeight:'800',margin:0,lineHeight:1.3}}>{product.name}</h1>
            
            <span style={{display:'inline-block',padding:'0.3rem 1rem',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'999px',fontSize:'0.85rem',width:'fit-content'}}>
              {product.category}
            </span>

            <div style={{fontWeight:'700',color:product.in_stock?'#4ade80':'#f87171',fontSize:'1rem'}}>
              {product.in_stock ? '✅ متاح' : '❌ غير متاح حالياً'}
            </div>

            {!product.price_on_inquiry && product.price && (
              <div style={{fontSize:'clamp(1.5rem,4vw,2.2rem)',fontWeight:'900',color:'#818cf8'}}>
                {product.price.toLocaleString('ar-EG')} <span style={{fontSize:'1rem',fontWeight:'400'}}>جنيه</span>
              </div>
            )}

            {product.description && (
              <p style={{color:'rgba(255,255,255,0.65)',lineHeight:'1.8',margin:0,fontSize:'0.95rem'}}>
                {product.description}
              </p>
            )}

            <a href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.6rem',padding:'1rem 1.5rem',background:'linear-gradient(135deg,#25D366,#128C7E)',color:'white',borderRadius:'12px',fontWeight:'800',fontSize:'1.05rem',textDecoration:'none',boxShadow:'0 0 25px rgba(37,211,102,0.35)',fontFamily:'Cairo,sans-serif',marginTop:'auto'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              اسأل بوكس 🍎
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
