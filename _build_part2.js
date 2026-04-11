const fs = require('fs');

const part2 = `
<!-- ═══ LOADING SCREEN ═══ -->
<div id="loading-screen">
  <div class="loading-content">
    <svg class="apple-loader-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
      <path class="apple-path" d="M150.7 0c-9.4.4-20.6 6.3-27.2 13.7-6 6.7-10.9 16.7-9 26.4 10.2-.4 20.6-6.5 27-13.9 6.1-6.9 10.5-16.8 9.2-26.2z M151 40.3c-15 0-21.3 7.2-31.8 7.2-10.8 0-19-7.1-32-7.1-12.7 0-26.2 7.7-34.8 20.9C40 76 37.3 100.7 49.7 120.8c8.2 13.4 19.2 28.5 33.5 28.6 12.7.1 16.3-8.1 33.7-8.2 17.4-.1 20.7 8.3 33.4 8.1 14.3-.1 25.9-16.7 34.1-30 5.9-9.6 8.1-14.4 12.7-25.2-33.3-12.7-38.6-60-5.8-77.5-8.9-11.2-21.5-16.3-40.3-16.3z" fill="none" stroke="url(#ng)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="800" stroke-dashoffset="800"/>
      <defs>
        <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="50%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#a855f7"/></linearGradient>
        <filter id="nglow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
    </svg>
    <div class="loader-brand"><span class="loader-brand-text">Boox Store</span><span class="loader-brand-glow">Boox Store</span></div>
    <div class="loader-progress"><div class="loader-progress-fill"></div></div>
  </div>
</div>

<!-- ═══ NAVBAR ═══ -->
<nav id="navbar" class="glass">
  <div class="nav-logo"><img src="./assets/boox-logo.jpg" alt="Boox Store Logo"></div>
  <div class="dynamic-island-wrap" id="di-wrap">
    <div class="electric-lines"><div class="electric-line el-1"></div><div class="electric-line el-2"></div><div class="electric-line el-3"></div><div class="electric-line el-4"></div></div>
    <div class="dynamic-island" id="di">
      <div class="island-collapsed"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><path d="m21 21-4.35-4.35"/></svg><span style="font-size:13px;color:rgba(255,255,255,.4)">بحث...</span></div>
      <div class="island-expanded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><path d="m21 21-4.35-4.35"/></svg><input type="search" id="s-inp" class="island-input" placeholder="ابحث عن منتج، موديل، تصنيف..." autocomplete="off" autocorrect="off"><button id="s-clr" class="island-clear" aria-label="مسح">✕</button></div>
    </div>
  </div>
  <button onclick="opAdm()" class="admin-btn" aria-label="Admin Panel"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a6 6 0 00-12 0v2H4v14h16V8h-2zm-8 0V6a2 2 0 114 0v2H8z"/></svg></button>
</nav>

<!-- ═══ MAIN ═══ -->
<main>

  <!-- ═ HERO ═ -->
  <section id="home">
    <img src="./assets/boox-logo.jpg" alt="Boox Store" class="hero-logo">
    <h1 class="hero-title"><span>Boox Store</span></h1>
    <p class="hero-slogan">"من بوكس تشتري تفاح وانت بالك مرتاح"</p>
    <div class="hero-stats">
      <div class="stat-item"><div class="stat-num" id="count-products">0</div><div class="stat-lbl">منتج متاح</div></div>
      <div class="stat-item"><div class="stat-num">100%</div><div class="stat-lbl">ضمان أصالة</div></div>
      <div class="stat-item"><div class="stat-num">24/7</div><div class="stat-lbl">دعم فوري</div></div>
    </div>
    <div class="cat-pills-wrap" id="cat-pills"></div>
  </section>

  <!-- ═ PRODUCTS ═ -->
  <section id="products">
    <div class="section-header"><h2 class="section-title">🛍️ منتجاتنا</h2><span id="pr-count" style="color:var(--text-dim);font-size:.85rem;"></span></div>
    <div class="products-grid" id="pr-grid"><div class="products-loading"><div class="spinner"></div></div></div>
  </section>

  <!-- ═ SERVICES ═ -->
  <section id="services">
    <h2 class="section-title" style="text-align:center;margin-bottom:4px;">خدماتنا</h2>
    <p style="text-align:center;color:var(--text-dim);font-size:.85rem;margin-bottom:0">كل ما تحتاجه في مكان واحد</p>
    <div class="services-grid">
      <div class="service-card" style="animation-delay:.05s"><div class="service-icon-wrap" style="background:rgba(99,102,241,.15)"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6366f1" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg></div><div class="service-title">بيع أجهزة Apple</div><div class="service-desc">أجهزة أصلية مضمونة بأفضل الأسعار</div></div>
      <div class="service-card" style="animation-delay:.1s"><div class="service-icon-wrap" style="background:rgba(34,211,238,.15)"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a5 5 0 01-7 7l-4-4a5 5 0 017-7z"/><path d="M9 17l-4-4"/></svg></div><div class="service-title">صيانة احترافية</div><div class="service-desc">إصلاح سريع مع ضمان على الإصلاح</div></div>
      <div class="service-card" style="animation-delay:.15s"><div class="service-icon-wrap" style="background:rgba(168,85,247,.15)"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a855f7" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4"/></svg></div><div class="service-title">استبدال وترقية</div><div class="service-desc">بدّل جهازك القديم بأفضل سعر تقييم</div></div>
      <div class="service-card" style="animation-delay:.2s"><div class="service-icon-wrap" style="background:rgba(245,158,11,.15)"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17"/><circle cx="17" cy="19" r="1"/><circle cx="9" cy="19" r="1"/></svg></div><div class="service-title">إكسسوارات Apple</div><div class="service-desc">ملحقات أصلية وعروض حصرية</div></div>
    </div>
  </section>

  <!-- ═ MAINTENANCE ═ -->
  <section id="maintenance" class="form-section">
    <h2 class="section-title-lg">🔧 <span>طلب صيانة</span></h2>
    <div class="form-card" id="m-card">
      <div class="form-row">
        <div class="field-wrap"><label class="field-label">الاسم</label><input type="text" id="m-name" class="fi" placeholder="اسمك الكريم" required></div>
        <div class="field-wrap"><label class="field-label">رقم الهاتف</label><input type="tel" id="m-phone" class="fi" placeholder="+20 xxx xxxx xxx" required></div>
      </div>
      <div class="field-wrap"><label class="field-label">الجهاز</label><select id="m-model" class="fi" required><option value="" disabled selected>اختر الجهاز</option></select></div>
      <div class="field-wrap"><label class="field-label">وصف المشكلة</label><textarea id="m-problem" class="fi" placeholder="اوصف المشكلة بالتفصيل..." required></textarea></div>
      <div class="field-wrap"><label class="field-label">ملاحظات إضافية (اختياري)</label><textarea id="m-notes" class="fi" placeholder="أي معلومات إضافية..."></textarea></div>
      <div class="field-wrap">
        <label class="field-label">صور المشكلة (اختياري)</label>
        <label for="m-media" class="upload-btn">📷 اختر صور &nbsp;<span style="font-size:.75rem;color:var(--text-dim)">(يمكن اختيار أكثر من صورة)</span></label>
        <input type="file" id="m-media" multiple accept="image/*" capture="environment" style="display:none">
        <div class="upload-preview" id="m-preview"></div>
        <div class="progress-bar-wrap" id="m-prog"><div class="progress-bar-fill" id="m-prog-fill"></div></div>
      </div>
      <button type="button" class="btn-submit" id="m-btn" onclick="subMaint()">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        إرسال طلب الصيانة
      </button>
    </div>
    <div class="form-success" id="m-success">
      <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <h3>تم إرسال طلبك بنجاح!</h3>
      <p style="color:var(--text-dim)">سنتواصل معك قريباً على الرقم المُدخل</p>
      <button onclick="resetForm('m')" class="btn-submit" style="margin-top:8px">طلب جديد</button>
    </div>
  </section>

  <!-- ═ TRADE ═ -->
  <section id="trade" class="form-section">
    <h2 class="section-title-lg">🔄 <span>استبدال الجهاز</span></h2>
    <div class="form-card" id="t-card">
      <div class="form-row">
        <div class="field-wrap"><label class="field-label">الاسم</label><input type="text" id="t-name" class="fi" placeholder="اسمك الكريم" required></div>
        <div class="field-wrap"><label class="field-label">رقم الهاتف</label><input type="tel" id="t-phone" class="fi" placeholder="+20 xxx xxxx xxx" required></div>
      </div>
      <div class="field-wrap"><label class="field-label">🔻 جهازك الحالي</label><select id="t-curr-m" class="fi" required><option value="" disabled selected>اختر جهازك الحالي</option></select></div>
      <div class="form-row">
        <div class="field-wrap"><label class="field-label">التخزين الحالي</label><select id="t-curr-s" class="fi" required><option value="" disabled selected>التخزين</option><option>64GB</option><option>128GB</option><option>256GB</option><option>512GB</option><option>1TB</option></select></div>
        <div class="field-wrap"><label class="field-label">حالة الجهاز</label><select id="t-curr-c" class="fi" required><option value="" disabled selected>الحالة</option><option>ممتاز</option><option>جيد جداً</option><option>جيد</option><option>مقبول</option></select></div>
      </div>
      <div class="field-wrap"><label class="field-label">🔺 الجهاز المطلوب</label><select id="t-req-m" class="fi" required><option value="" disabled selected>اختر الجهاز المطلوب</option></select></div>
      <div class="field-wrap"><label class="field-label">تخزين المطلوب</label><select id="t-req-s" class="fi" required><option value="" disabled selected>التخزين</option><option>128GB</option><option>256GB</option><option>512GB</option><option>1TB</option></select></div>
      <div class="field-wrap"><label class="field-label">ملاحظات (اختياري)</label><textarea id="t-notes" class="fi" placeholder="أي تفاصيل إضافية..."></textarea></div>
      <div class="field-wrap">
        <label class="field-label">صور جهازك الحالي (اختياري)</label>
        <label for="t-media" class="upload-btn">📷 إرفاق صور الجهاز</label>
        <input type="file" id="t-media" multiple accept="image/*" capture="environment" style="display:none">
        <div class="upload-preview" id="t-preview"></div>
        <div class="progress-bar-wrap" id="t-prog"><div class="progress-bar-fill" id="t-prog-fill"></div></div>
      </div>
      <button type="button" class="btn-submit" id="t-btn" onclick="subTrade()">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4"/></svg>
        طلب الاستبدال
      </button>
    </div>
    <div class="form-success" id="t-success">
      <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <h3>تم إرسال طلب الاستبدال!</h3>
      <p style="color:var(--text-dim)">سنقيّم جهازك ونتواصل معك قريباً</p>
      <button onclick="resetForm('t')" class="btn-submit" style="margin-top:8px">طلب جديد</button>
    </div>
  </section>

  <!-- ═ CONTACT ═ -->
  <section id="contact">
    <h2 class="section-title-lg">📍 <span>تواصل معنا</span></h2>

    <div class="contact-cards">
      <a href="https://wa.me/201000000000" target="_blank" class="contact-link-card" style="--hover-color:#25d366">
        <div class="contact-icon-wrap" style="background:rgba(37,211,102,.15)"><svg viewBox="0 0 24 24" width="26" height="26" fill="#25d366"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z"/></svg></div>
        <div class="contact-info"><strong>واتساب</strong><span>تواصل فوري مع خدمة العملاء</span></div>
        <span class="contact-arrow">→</span>
      </a>
      <a href="https://maps.app.goo.gl/ryLFkd2CCWUFcsxV6" target="_blank" class="contact-link-card" style="--hover-color:#4285f4">
        <div class="contact-icon-wrap" style="background:rgba(66,133,244,.15)"><svg viewBox="0 0 24 24" width="26" height="26" fill="#4285f4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>
        <div class="contact-info"><strong>موقعنا</strong><span>افتحنا على خريطة Google</span></div>
        <span class="contact-arrow">→</span>
      </a>
    </div>

    <!-- Social Wall -->
    <div class="social-wall">
      <p class="social-wall-title">تابعنا على وسائل التواصل</p>
      <div class="social-grid">

        <!-- Instagram -->
        <a href="#" class="social-card sc-ig" target="_blank">
          <div class="social-icon-wrap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </div>
          <div class="social-name">Instagram</div>
          <div class="social-handle">@booxstore</div>
        </a>

        <!-- TikTok -->
        <a href="#" class="social-card sc-tt" target="_blank">
          <div class="social-icon-wrap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
          </div>
          <div class="social-name">TikTok</div>
          <div class="social-handle">@booxstore</div>
        </a>

        <!-- Facebook -->
        <a href="#" class="social-card sc-fb" target="_blank">
          <div class="social-icon-wrap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </div>
          <div class="social-name">Facebook</div>
          <div class="social-handle">Boox Store</div>
        </a>

        <!-- WhatsApp -->
        <a href="https://wa.me/201000000000" class="social-card sc-wa" target="_blank">
          <div class="social-icon-wrap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.457 3.42 1.26 4.88L2 22l5.25-1.38A10 10 0 1012 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.273-.42c.13-.199.106-.44-.055-.589l-1.395-1.354c-.146-.142-.349-.147-.51-.007-.48.417-1.053 1.116-1.157 1.852-.104.736.17 1.68.87 2.717 1.268 1.885 2.907 3.413 4.763 4.224 1.018.443 1.875.574 2.608.446.733-.128 1.758-.717 2.006-1.41.248-.693.248-1.286.173-1.41-.075-.124-.273-.199-.57-.348z"/></svg>
          </div>
          <div class="social-name">WhatsApp</div>
          <div class="social-handle">تواصل الآن</div>
        </a>

        <!-- YouTube -->
        <a href="#" class="social-card sc-yt" target="_blank">
          <div class="social-icon-wrap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
          </div>
          <div class="social-name">YouTube</div>
          <div class="social-handle">@booxstore</div>
        </a>

        <!-- Google Maps -->
        <a href="https://maps.app.goo.gl/ryLFkd2CCWUFcsxV6" class="social-card sc-gm" target="_blank">
          <div class="social-icon-wrap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </div>
          <div class="social-name">موقعنا</div>
          <div class="social-handle">Google Maps</div>
        </a>

      </div>
    </div>
  </section>

  <footer>
    <div class="footer-logo"><img src="./assets/boox-logo.jpg" alt="Logo"></div>
    <p class="footer-tagline">Boox Store © 2026 · من بوكس تشتري تفاح وانت بالك مرتاح</p>
  </footer>

</main>

<!-- ═══ BOTTOM NAV ═══ -->
<nav class="bottom-nav glass">
  <button class="bnav-btn active" id="bn-home" onclick="gSec('home',this)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>الرئيسية</span><div class="bnav-indicator"></div></button>
  <button class="bnav-btn" id="bn-products" onclick="gSec('products',this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span>المنتجات</span><div class="bnav-indicator"></div></button>
  <button class="bnav-btn" id="bn-maintenance" onclick="gSec('maintenance',this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a5 5 0 01-7 7l-4-4a5 5 0 017-7z"/><path d="M9 17l-4-4"/></svg><span>صيانة</span><div class="bnav-indicator"></div></button>
  <button class="bnav-btn" id="bn-trade" onclick="gSec('trade',this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4"/></svg><span>استبدال</span><div class="bnav-indicator"></div></button>
  <button class="bnav-btn" id="bn-contact" onclick="gSec('contact',this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.08 1.2 2 2 0 012.08 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.09a16 16 0 006.34 6.35l1.34-1.34a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg><span>تواصل</span><div class="bnav-indicator"></div></button>
</nav>

<!-- ═══ ADMIN PANEL ═══ -->
<div id="admin-panel">
  <div class="admin-header">
    <h2 style="font-size:1.2rem;font-weight:900">🔐 لوحة الأدمن</h2>
    <button onclick="document.getElementById('admin-panel').style.display='none'" class="adm-close">✕ إغلاق</button>
  </div>

  <!-- Colors -->
  <div class="adm-section">
    <h3>🎨 تخصيص الألوان</h3>
    <div class="clr-row">
      <div class="clr-item"><span>أساسي</span><input type="color" id="c1" value="#6366f1" oninput="uColr('--neon-1',this.value)"></div>
      <div class="clr-item"><span>ثانوي</span><input type="color" id="c2" value="#22d3ee" oninput="uColr('--neon-2',this.value)"></div>
      <div class="clr-item"><span>ثالث</span><input type="color" id="c3" value="#a855f7" oninput="uColr('--neon-3',this.value)"></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn-adm-ghost" onclick="rColr()">↩ إعادة تعيين</button>
      <button class="btn-adm-primary" onclick="sColr()">💾 حفظ الألوان</button>
    </div>
  </div>

  <!-- Add Product -->
  <div class="adm-section">
    <h3>➕ إضافة منتج</h3>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:4px">
      <input type="text" id="ap-name" class="fi" placeholder="اسم المنتج *" required>
      <textarea id="ap-desc" class="fi" placeholder="الوصف"></textarea>
      <div class="adm-grid-2">
        <input type="number" id="ap-price" class="fi" placeholder="السعر ($) *" required>
        <input type="number" id="ap-opr" class="fi" placeholder="السعر الأصلي ($)">
      </div>
      <select id="ap-cat" class="fi" required><option value="" disabled selected>التصنيف *</option></select>
      <select id="ap-mod" class="fi"><option value="">الموديل (اختياري)</option></select>
      <label for="ap-img" class="upload-btn">📷 صورة المنتج</label>
      <input type="file" id="ap-img" accept="image/*" capture="environment" style="display:none">
      <div class="progress-bar-wrap" id="ap-prog"><div class="progress-bar-fill" id="ap-prog-fill"></div></div>
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0">
        <input type="checkbox" id="ap-stk" checked style="width:auto">
        <label for="ap-stk" style="font-size:.9rem">متوفر بالمخزون</label>
        <input type="checkbox" id="ap-feat" style="width:auto;margin-right:16px">
        <label for="ap-feat" style="font-size:.9rem">منتج مميز</label>
      </div>
      <button onclick="addProd()" class="btn-adm-primary">حفظ المنتج</button>
    </div>
  </div>

  <!-- Product List -->
  <div class="adm-section">
    <h3>📦 المنتجات الحالية</h3>
    <div id="adm-list" style="display:flex;flex-direction:column;gap:10px;margin-top:12px"><div style="color:var(--text-dim);text-align:center;padding:20px">يتم التحميل...</div></div>
  </div>
</div>`;

const existing = fs.readFileSync('c:\\\\Users\\\\HODHOD\\\\Desktop\\\\Boox Store\\\\index.html', 'utf8');
fs.writeFileSync('c:\\\\Users\\\\HODHOD\\\\Desktop\\\\Boox Store\\\\index.html', existing + part2, 'utf8');
console.log('Part 2 appended successfully');
