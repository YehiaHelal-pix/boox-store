const fs = require('fs');
const file = 'c:/Users/HODHOD/Desktop/Boox Store/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Meta Tags
html = html.replace('<title>Boox Store</title>', '<title>Boox Store | تفاح وبالك مرتاح</title>\\n  <meta property="og:title" content="Boox Store | تفاح وبالك مرتاح 🍎">\\n  <meta property="og:description" content="من بوكس تشتري تفاح وانت بالك مرتاح - أجهزة Apple الأصلية بضمان">');
html = html.replace('<meta name="description" content="Boox Store - متجر أجهزة Apple في مصر">', '<meta name="description" content="Boox Store - من بوكس تشتري تفاح وانت بالك مرتاح. متجرك الأول لأجهزة Apple في مصر. بيع، صيانة، واستبدال.">');

// 2. Hero Section Slogan
const sloganHtml = `
<!-- SLOGAN ANIMATED -->
<div class="hero-slogan-wrap">
  <div class="slogan-line"></div>
  <p class="hero-slogan">
    <span class="slogan-icon"><svg viewBox="0 0 384 512" fill="currentColor" width="22" height="22"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg></span>
    <span class="slogan-text">من بوكس تشتري تفاح</span>
    <span class="slogan-highlight">وانت بالك مرتاح</span>
    <span class="slogan-icon">✨</span>
  </p>
  <div class="slogan-line"></div>
</div>`;
html = html.replace('<p class="hero-subtitle">متجرك الأول لأجهزة Apple في مصر</p>', '<p class="hero-subtitle">متجرك الأول لأجهزة Apple في مصر</p>' + sloganHtml);

// Update pills to add slogan pill
const newPills = `<div class="hero-pills">
          <span class="hero-pill">📱 بيع</span>
          <span class="hero-pill">🔧 صيانة</span>
          <span class="hero-pill">🔄 استبدال</span>
          <span class="hero-pill">⚡ ضمان</span>
          <span class="hero-pill slogan-pill"><svg viewBox="0 0 384 512" fill="currentColor" width="12" height="12" style="display:inline-block;vertical-align:middle;margin-left:4px;margin-bottom:2px;"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg> بالك مرتاح</span>
        </div>`;
html = html.replace(/<div class="hero-pills">.*?<\/div>/s, newPills);

// 3. Slogan & Accordion CSS
const customCss = `
/* ═══════════════ HERO SLOGAN ═══════════════ */
.hero-slogan-wrap { display: flex; align-items: center; gap: 12px; margin: 8px 0; animation: slogan-fade-in 1.2s ease forwards; opacity: 0; animation-delay: 0.6s; }
.slogan-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent); max-width: 80px; }
.hero-slogan { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; font-size: clamp(14px, 3.5vw, 20px); font-weight: 600; white-space: nowrap; }
.slogan-text { color: var(--text-secondary); }
.slogan-highlight { background: linear-gradient(135deg, #6366f1, #22d3ee); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; position: relative; }
.slogan-highlight::after { content: ''; position: absolute; bottom: -3px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #6366f1, #22d3ee); border-radius: 2px; animation: underline-grow 1s ease forwards; animation-delay: 1.2s; transform-origin: right; transform: scaleX(0); }
.slogan-icon { flex-shrink:0; display: inline-flex; align-items: center; animation: icon-bounce 2s ease-in-out infinite; }
.slogan-icon svg { width: clamp(16px, 3vw, 22px); height: auto; }
.slogan-icon:last-child { font-size: clamp(16px, 3vw, 22px); animation-delay: 0.3s; }
@keyframes slogan-fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes underline-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes icon-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.hero-pill.slogan-pill { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.2)); border-color: rgba(99,102,241,0.4); color: #a5b4fc; font-weight: 700; }
@media (max-width: 400px) {
  .slogan-text { display: none; }
  .hero-slogan::before { content: 'تفاح '; color: var(--text-secondary); }
}

/* ═══════════════ ADMIN ACCORDION ═══════════════ */
.admin-fieldset { border: 1px solid var(--glass-border); border-radius: var(--radius-md); margin-bottom: var(--space-md); overflow: hidden; background: rgba(0,0,0,0.2); }
.admin-legend { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.03); color: var(--neon-secondary); font-weight: 700; font-size: var(--font-sm); text-align: right; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; border-bottom: 1px solid transparent; }
.admin-legend:hover { background: rgba(99,102,241,0.1); }
.admin-legend::after { content: '▼'; font-size: 12px; transition: transform 0.3s; color: var(--text-muted); }
.admin-fieldset.open .admin-legend { border-bottom-color: var(--glass-border); }
.admin-fieldset.open .admin-legend::after { transform: rotate(180deg); }
.admin-fieldset-content { padding: 16px; display: none; }
.admin-fieldset.open .admin-fieldset-content { display: block; }
`;
html = html.replace('</style>', customCss + '</style>');

// 4. Transform Add Product Form into Accordions
// We'll surgically inject the accordion HTML into the form
html = html.replace('<div class="form-group">\\n                <label class="form-label">صورة المنتج</label>', '<div class="admin-fieldset open">\\n                <button type="button" class="admin-legend">🖼️ صورة المنتج</button>\\n                <div class="admin-fieldset-content">\\n              <div class="form-group">\\n                <label class="form-label">صورة المنتج</label>');

html = html.replace('</div>\\n              </div>\\n              <div class="form-group"><label class="form-label">اسم المنتج *</label>', '</div>\\n              </div>\\n                </div>\\n              </div>\\n              <div class="admin-fieldset open">\\n                <button type="button" class="admin-legend">📝 البيانات الأساسية</button>\\n                <div class="admin-fieldset-content">\\n              <div class="form-group"><label class="form-label">اسم المنتج *</label>');

html = html.replace('</textarea></div>\\n              <div class="form-row-2">\\n                <div class="form-group"><label class="form-label">السعر الحالي (جنيه) *</label>', '</textarea></div>\\n                </div>\\n              </div>\\n              <div class="admin-fieldset open">\\n                <button type="button" class="admin-legend">💰 الأسعار والتفاصيل</button>\\n                <div class="admin-fieldset-content">\\n              <div class="form-row-2">\\n                <div class="form-group"><label class="form-label">السعر الحالي (جنيه) *</label>');

html = html.replace('</div>\\n              <div class="form-actions">', '</div>\\n                </div>\\n              </div>\\n              <div class="form-actions">');

// Add JS toggle logic for the accordions right before </body>
const accordionJS = `
  // Admin Accordion Logic
  document.querySelectorAll('.admin-legend').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var fieldset = this.parentElement;
      fieldset.classList.toggle('open');
    });
  });
`;
html = html.replace('</script>\\n</body>', accordionJS + '\\n</script>\\n</body>');

fs.writeFileSync(file, html, 'utf8');
console.log('Update Script executed successfully.');
