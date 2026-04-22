'use client'

export default function Services() {
  return (
    <section id="services">
      <h2 className="section-title anim-reveal" style={{ textAlign: 'center', marginBottom: '4px' }}>خدماتنا</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '.85rem', marginBottom: 0 }}>كل ما تحتاجه في مكان واحد</p>
      
      <div className="services-grid">
        <div className="service-card anim-reveal" style={{ animationDelay: '.05s' }}>
          <div className="service-icon-wrap" style={{ background: 'rgba(99,102,241,.15)' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6366f1" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M12 18h.01" />
            </svg>
          </div>
          <div className="service-title">بيع أجهزة Apple</div>
          <div className="service-desc">أجهزة أصلية مضمونة بأفضل الأسعار</div>
        </div>
        
        <div className="service-card anim-reveal" style={{ animationDelay: '.1s' }}>
          <div className="service-icon-wrap" style={{ background: 'rgba(34,211,238,.15)' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#22d3ee" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a5 5 0 01-7 7l-4-4a5 5 0 017-7z" />
              <path d="M9 17l-4-4" />
            </svg>
          </div>
          <div className="service-title">صيانة احترافية</div>
          <div className="service-desc">إصلاح سريع مع ضمان على الإصلاح</div>
        </div>
        
        <div className="service-card anim-reveal" style={{ animationDelay: '.15s' }}>
          <div className="service-icon-wrap" style={{ background: 'rgba(168,85,247,.15)' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a855f7" strokeWidth="2">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </div>
          <div className="service-title">استبدال وترقية</div>
          <div className="service-desc">بدّل جهازك القديم بأفضل سعر تقييم</div>
        </div>
        
        <div className="service-card anim-reveal" style={{ animationDelay: '.2s' }}>
          <div className="service-icon-wrap" style={{ background: 'rgba(245,158,11,.15)' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
              <circle cx="17" cy="19" r="1" />
              <circle cx="9" cy="19" r="1" />
            </svg>
          </div>
          <div className="service-title">إكسسوارات Apple</div>
          <div className="service-desc">ملحقات أصلية وعروض حصرية</div>
        </div>
      </div>
    </section>
  )
}
