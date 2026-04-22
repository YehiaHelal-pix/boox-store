const fs = require('fs');
const file = 'c:/Users/HODHOD/Desktop/Boox Store/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. ADD PRELOADER HTML
const preloaderHTML = `
  <div id="preloader" class="preloader glass-dark">
    <div class="preloader-content">
      <svg class="apple-loader-svg" viewBox="0 0 384 512" fill="none" stroke="var(--neon-primary)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <path class="apple-path" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
      </svg>
      <div class="preloader-text gradient-text">Boox Store</div>
      <div class="preloader-slogan">تفاح وبالك مرتاح</div>
    </div>
  </div>
`;
// Insert after <body>
html = html.replace('<body>', '<body>\\n' + preloaderHTML);

// 2. CSS ADDITIONS (Preloader, Dynamic Island, Scroll Animations)
// We will replace the old navbar CSS completely with the new Dynamic Island version.
html = html.replace('.navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding-top: env(safe-area-inset-top); background: rgba(3,3,10,0.85); backdrop-filter: blur(32px) saturate(200%); -webkit-backdrop-filter: blur(32px) saturate(200%); border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-xs); padding: calc(env(safe-area-inset-top) + 8px) clamp(12px,4vw,24px) 8px; min-height: 60px; }',
    '.navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding-top: env(safe-area-inset-top); background: transparent; display: flex; align-items: flex-start; justify-content: space-between; padding: calc(env(safe-area-inset-top) + 12px) 24px 12px; pointer-events: none; }\\n.navbar > * { pointer-events: auto; }\\n.navbar-actions { background: rgba(3,3,10,0.6); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); border-radius: 30px; padding: 4px; }');

html = html.replace('.navbar-search { flex: 1; min-width: 120px; max-width: 400px; order: 2; }',
    '.navbar-search { position: absolute; left: 50%; transform: translateX(-50%); width: 220px; max-width: 90vw; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 1001; margin: 0; }\\n.navbar-search::before { content: \\'\\'; position: absolute; top: 50%; right: 16px; transform: translateY(-50%); width: 8px; height: 8px; background: #000; border: 2px solid #333; border-radius: 50%; z-index: 2; pointer-events: none; }\\n.navbar-search:focus-within { width: 380px; }');

html = html.replace('.navbar-search input { width: 100%; height: 38px; background: rgba(255,255,255,0.07); border: 1px solid var(--glass-border); border-radius: var(--radius-full); color: var(--text-primary); padding: 0 16px; font-size: var(--font-sm); outline: none; transition: border-color 0.2s; }',
    '.navbar-search input { width: 100%; height: 44px; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; padding: 0 40px 0 20px; transition: all 0.5s; box-shadow: 0 10px 30px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05); color: #fff; text-align: center; }\\n.navbar-search:focus-within input { border-color: var(--neon-secondary); box-shadow: 0 0 25px rgba(34,211,238,0.3), inset 0 0 10px rgba(34,211,238,0.1); background: rgba(10,10,20,0.95); }');

html = html.replace('@media(max-width:639px) { .navbar-search { order: 10; width: 100%; max-width: 100%; margin-top: 4px; } }',
    '@media(max-width:768px) { .navbar { padding-left: 12px; padding-right: 12px; } .navbar-actions { padding: 2px; } .icon-btn { width: 36px; height: 36px; min-width: 36px; } .navbar-search { position: relative; left: unset; transform: none; width: 100%; order: 10; margin-top: 12px; } .navbar-search:focus-within { width: 100%; } }');

// Add Preloader & Animation CSS
const injectCSS = `
/* ═══════════════ PRELOADER ═══════════════ */
.preloader { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; transition: opacity 0.8s ease, visibility 0.8s; background: #03030a; }
.preloader-content { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.apple-loader-svg { width: 80px; height: 100px; overflow: visible; }
.apple-path { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: draw-apple 2s ease-in-out forwards, neon-pulse 1.5s infinite alternate 2s; }
.preloader-text { font-size: clamp(24px, 5vw, 36px); font-weight: 800; letter-spacing: 2px; opacity: 0; animation: fade-up 1s forwards 1.2s; }
.preloader-slogan { font-size: clamp(14px, 3vw, 18px); color: var(--neon-secondary); opacity: 0; font-weight: 600; text-shadow: 0 0 10px rgba(34,211,238,0.5); animation: fade-up 1s forwards 1.5s; }
@keyframes draw-apple { to { stroke-dashoffset: 0; fill: var(--neon-primary); } }
@keyframes neon-pulse { from { filter: drop-shadow(0 0 5px var(--neon-primary)) drop-shadow(0 0 20px var(--neon-primary)); } to { filter: drop-shadow(0 0 15px var(--neon-secondary)) drop-shadow(0 0 40px var(--neon-secondary)); fill: var(--neon-secondary); stroke: var(--neon-secondary); } }
@keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ═══════════════ SCROLL ANIMATIONS ═══════════════ */
.anim-reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
.anim-reveal.active { opacity: 1; transform: translateY(0); }
`;
html = html.replace('</style>', injectCSS + '\\n</style>');

// 3. ADMIN ACCORDIONS
// Replace loadAdminMaintenance HTML output
const oldMaintenance = `'<div class="admin-request-item"><p><strong>👤</strong> ' + r.customer_name + ' | <strong>📞</strong> ' + r.customer_phone + '</p>' +
        '<p><strong>📱</strong> ' + r.device_model + '</p><p><strong>🔍</strong> ' + r.problem_description + '</p>' +
        (r.extra_notes ? '<p><strong>📝</strong> ' + r.extra_notes + '</p>' : '') + mediaHtml +
        '<p><span class="request-status ' + statusClass + '">' + r.status + '</span> | ' + new Date(r.created_at).toLocaleString('ar-EG') + '</p></div>'`;

const newMaintenance = `'<details class="admin-fieldset" style="margin-bottom:8px;background:var(--glass-bg)"><summary class="admin-legend">🔧 ' + r.device_model + ' - ' + r.customer_name + ' <span class="request-status ' + statusClass + '">' + r.status + '</span></summary><div class="admin-fieldset-content"><p><strong>📞 الموبايل:</strong> ' + r.customer_phone + '</p><p><strong>🔍 المشكلة:</strong> ' + r.problem_description + '</p>' + (r.extra_notes ? '<p><strong>📝 ملاحظات:</strong> ' + r.extra_notes + '</p>' : '') + mediaHtml + '<p style="margin-top:8px;font-size:12px;color:var(--text-muted)">' + new Date(r.created_at).toLocaleString('ar-EG') + '</p></div></details>'`;

html = html.replace(oldMaintenance, newMaintenance);

// Replace loadAdminTrade HTML output
const oldTrade = `'<div class="admin-request-item"><p><strong>👤</strong> ' + r.customer_name + ' | <strong>📞</strong> ' + r.customer_phone + '</p>' +
        '<p><strong>📱 جهازه:</strong> ' + r.current_device_model + ' ' + (r.current_storage || '') + ' | <strong>حالة:</strong> ' + (r.current_condition || '') + '</p>' +
        '<p><strong>✨ يريد:</strong> ' + r.wanted_device_model + ' ' + (r.wanted_storage || '') + '</p>' +
        (r.trade_notes ? '<p><strong>📝</strong> ' + r.trade_notes + '</p>' : '') + mediaHtml +
        '<p><span class="request-status ' + statusClass + '">' + r.status + '</span> | ' + new Date(r.created_at).toLocaleString('ar-EG') + '</p></div>'`;

const newTrade = `'<details class="admin-fieldset" style="margin-bottom:8px;background:var(--glass-bg)"><summary class="admin-legend">🔄 من ' + r.current_device_model + ' ⬅️ لـ ' + r.wanted_device_model + ' <span class="request-status ' + statusClass + '">' + r.status + '</span></summary><div class="admin-fieldset-content"><p><strong>👤 العميل:</strong> ' + r.customer_name + ' | <strong>📞 الموبايل:</strong> ' + r.customer_phone + '</p><p><strong>📱 جهازه:</strong> ' + r.current_device_model + ' ' + (r.current_storage || '') + ' | <strong>الحالة:</strong> ' + (r.current_condition || '') + '</p><p><strong>✨ يريد:</strong> ' + r.wanted_device_model + ' ' + (r.wanted_storage || '') + '</p>' + (r.trade_notes ? '<p><strong>📝 ملاحظات:</strong> ' + r.trade_notes + '</p>' : '') + mediaHtml + '<p style="margin-top:8px;font-size:12px;color:var(--text-muted)">' + new Date(r.created_at).toLocaleString('ar-EG') + '</p></div></details>'`;

html = html.replace(oldTrade, newTrade);

// 4. PRELOADER & SCROLL JS ANIMATIONS
const injectJS = `
  // Preloader hide
  window.addEventListener('load', function() {
    setTimeout(function() {
      var pl = document.getElementById('preloader');
      if (pl) {
        pl.style.opacity = '0';
        setTimeout(function() { pl.style.display = 'none'; }, 800);
      }
    }, 2800);
  });

  // Scroll animations
  var animateEls = document.querySelectorAll('.product-card, .service-card, .section-title, .trade-container');
  animateEls.forEach(function(el) { el.classList.add('anim-reveal'); });
  var animObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  setTimeout(function() {
    document.querySelectorAll('.anim-reveal').forEach(function(el) { animObserver.observe(el); });
  }, 1000);
`;
html = html.replace('// Init\\n  updateCartUI();', injectJS + '\\n\\n  // Init\\n  updateCartUI();');

fs.writeFileSync(file, html, 'utf8');
console.log('Update Script 2 executed successfully.');
