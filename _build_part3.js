const fs = require('fs');

const js = `
<script>
// ═══ CONFIG ═══
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const WHATSAPP = '201000000000';
let sup;
try { sup = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch(e) {}

// ═══ MODELS & CATS ═══
const CATS = { iphone:'📱 iPhone', ipad:'📱 iPad', macbook:'💻 MacBook', accessories:'🎧 إكسسوارات', repairs:'🔧 قطع غيار', other:'📦 أخرى' };
const IPHONES = ['iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15 Plus','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14 Plus','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone 13 mini','iPhone 12 Pro Max','iPhone 12 Pro','iPhone 12','iPhone 12 mini','iPhone 11 Pro Max','iPhone 11 Pro','iPhone 11','iPhone XS Max','iPhone XS','iPhone XR','iPhone X','iPhone 8 Plus','iPhone 8','iPhone SE (3rd gen)','iPhone SE (2nd gen)'];
const IPADS = ['iPad Pro 13" M4','iPad Pro 11" M4','iPad Pro 13" M2','iPad Pro 11" M2','iPad Air M2 13"','iPad Air M2 11"','iPad Air (5th gen)','iPad (10th gen)','iPad (9th gen)','iPad mini (6th gen)'];
const MACS = ['MacBook Pro 16" M4 Pro','MacBook Pro 16" M4','MacBook Pro 14" M4 Pro','MacBook Pro 14" M4','MacBook Pro 16" M3 Max','MacBook Pro 14" M3','MacBook Air 15" M3','MacBook Air 13" M3','MacBook Air 15" M2','MacBook Air 13" M2','MacBook Air 13" M1'];
const ACCS = ['AirPods Pro (2nd gen)','AirPods (4th gen)','AirPods Max','Apple Watch Ultra 2','Apple Watch Series 10','Apple Watch SE','Apple Pencil Pro','Magic Keyboard','MagSafe Charger'];
const ALL_MODELS = [...IPHONES,...IPADS,...MACS,...ACCS];

// Loading screen
window.addEventListener('load', () => {
  loadSavedColors();
  populateDropdowns();
  setTimeout(() => {
    const s = document.getElementById('loading-screen');
    if (s) { s.classList.add('fade-out'); setTimeout(() => s.remove(), 500); }
  }, 2500);
});

function populateDropdowns() {
  function addOpts(selId, arr) {
    const el = document.getElementById(selId); if (!el) return;
    arr.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; el.appendChild(o); });
  }
  addOpts('m-model', ALL_MODELS);
  addOpts('t-curr-m', ALL_MODELS);
  addOpts('t-req-m', ALL_MODELS);
  const pCat = document.getElementById('ap-cat');
  if (pCat) Object.entries(CATS).forEach(([k,v]) => { const o = document.createElement('option'); o.value=k; o.textContent=v; pCat.appendChild(o); });
  const pMod = document.getElementById('ap-mod');
  if (pMod) ALL_MODELS.forEach(m => { const o = document.createElement('option'); o.value=m; o.textContent=m; pMod.appendChild(o); });
}

// ═══ CATEGORY PILLS ═══
let allPr = [], curCat = 'all', searchQ = '';
function buildPills() {
  const wrap = document.getElementById('cat-pills'); if (!wrap) return;
  const pills = [{ k: 'all', v: '🌟 الكل' }, ...Object.entries(CATS).map(([k,v]) => ({ k, v }))];
  wrap.innerHTML = pills.map(p =>
    \`<button class="cat-pill\${p.k==='all'?' active':''}" onclick="setCat('\${p.k}',this)">\${p.v}</button>\`
  ).join('');
}
function setCat(c, btn) {
  curCat = c;
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts();
}
buildPills();

// ═══ SEARCH / ISLAND ═══
const diEl = document.getElementById('di');
const sInp = document.getElementById('s-inp');
const sClr = document.getElementById('s-clr');
function expandIsland() {
  diEl.classList.add('expanded');
  setTimeout(() => sInp.focus(), 60);
}
function collapseIsland() {
  if (sInp.value.trim()) return;
  diEl.classList.remove('expanded');
}
diEl.addEventListener('click', () => { if (!diEl.classList.contains('expanded')) expandIsland(); });
sInp.addEventListener('blur', () => setTimeout(collapseIsland, 200));
sInp.addEventListener('input', () => {
  sClr.style.display = sInp.value ? 'flex' : 'none';
  searchQ = sInp.value.toLowerCase();
  renderProducts();
});
sClr.addEventListener('click', () => { sInp.value = ''; sClr.style.display = 'none'; searchQ = ''; renderProducts(); sInp.focus(); });
document.addEventListener('click', e => { if (!document.getElementById('di-wrap').contains(e.target)) collapseIsland(); });

// ═══ PRODUCTS ═══
async function loadProducts() {
  if (!sup) { renderProducts(); return; }
  try {
    const { data, error } = await sup.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    allPr = data || [];
    const cnt = document.getElementById('count-products');
    if (cnt) animCount(cnt, allPr.filter(p => p.in_stock).length);
  } catch(e) { allPr = []; }
  renderProducts();
}

function animCount(el, target) {
  let n = 0; const step = Math.ceil(target / 30);
  const t = setInterval(() => { n = Math.min(n + step, target); el.textContent = n + '+'; if (n >= target) clearInterval(t); }, 40);
}

function renderProducts() {
  const grid = document.getElementById('pr-grid'); if (!grid) return;
  let pr = allPr.filter(p => (curCat === 'all' || p.category === curCat) && (!searchQ || p.name.toLowerCase().includes(searchQ) || (p.device_model||'').toLowerCase().includes(searchQ) || (p.description||'').toLowerCase().includes(searchQ)));
  const ct = document.getElementById('pr-count');
  if (ct) ct.textContent = pr.length + ' منتج';
  if (!pr.length) {
    grid.innerHTML = \`<div class="products-empty"><svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><p>لا توجد منتجات في هذا التصنيف</p></div>\`;
    return;
  }
  grid.innerHTML = pr.map((p, i) => {
    const disc = p.original_price && p.original_price > p.price ? Math.round((1 - p.price / p.original_price) * 100) : 0;
    return \`<div class="product-card" style="animation-delay:\${i * 0.05}s">
      <div class="product-img">
        \${p.image_url ? \`<img src="\${p.image_url}" alt="\${p.name}" loading="lazy" onerror="this.parentElement.style.background='#111'">\` : '<div style="height:100%;display:flex;align-items:center;justify-content:center;opacity:.3"><svg viewBox=\\"0 0 24 24\\" width=\\"48\\" height=\\"48\\" fill=\\"currentColor\\"><path d=\\"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\\"/></svg></div>'}
        \${!p.in_stock ? '<div class="badge-sold">نفذ ❌</div>' : ''}
        \${disc > 0 ? \`<div class="badge-disc">-\${disc}%</div>\` : ''}
        \${p.is_featured ? '<div class="badge-feat">⭐ مميز</div>' : ''}
      </div>
      <div class="product-body">
        <div class="product-name">\${p.name}</div>
        \${p.device_model ? \`<div class="product-model">\${p.device_model}</div>\` : ''}
        <div class="product-prices">
          <span class="product-price">\${Number(p.price).toLocaleString()}$</span>
          \${p.original_price ? \`<span class="product-old">\${Number(p.original_price).toLocaleString()}$</span>\` : ''}
        </div>
        <a href="https://wa.me/\${WHATSAPP}?text=\${encodeURIComponent('السلام عليكم، أريد طلب: ' + p.name)}" target="_blank" class="product-buy\${p.in_stock ? '' : ' disabled'}" \${p.in_stock ? '' : 'aria-disabled="true"'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2 21l1.65-4.75A9 9 0 1012 21H2z"/></svg>
          \${p.in_stock ? 'اطلب الآن' : 'غير متاح'}
        </a>
      </div>
    </div>\`;
  }).join('');
}

// Realtime
function setupRealtime() {
  if (!sup) return;
  try {
    sup.channel('pr').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadProducts()).subscribe();
  } catch(e) {}
}
loadProducts(); setupRealtime();

// ═══ NAV ═══
function gSec(id, btn) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
// auto highlight on scroll
const sections = ['home','products','services','maintenance','trade','contact'];
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
      const active = document.getElementById('bn-' + id);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });
sections.forEach(s => { const el = document.getElementById(s); if (el) observer.observe(el); });

// ═══ IMAGE COMPRESSION ═══
async function compressImg(file) {
  try {
    const bmp = await createImageBitmap(file);
    const cv = document.createElement('canvas');
    let w = bmp.width, h = bmp.height, mx = 900;
    if (w > h) { if (w > mx) { h = h * mx / w; w = mx; } } else { if (h > mx) { w = w * mx / h; h = mx; } }
    cv.width = Math.round(w); cv.height = Math.round(h);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return new Promise(r => cv.toBlob(r, 'image/jpeg', 0.78));
  } catch(e) { return file; }
}

async function uploadImg(bucket, file, prefix, progId) {
  if (!sup) return null;
  const progWrap = document.getElementById(progId);
  const progFill = document.getElementById(progId + '-fill');
  if (progWrap) progWrap.style.display = 'block';
  if (progFill) progFill.style.width = '20%';
  try {
    const blob = await compressImg(file);
    if (progFill) progFill.style.width = '50%';
    const name = prefix + '-' + Date.now() + '.jpg';
    const { error } = await sup.storage.from(bucket).upload(name, blob, { contentType: 'image/jpeg' });
    if (error) throw error;
    if (progFill) progFill.style.width = '100%';
    setTimeout(() => { if (progWrap) progWrap.style.display = 'none'; if (progFill) progFill.style.width = '0'; }, 800);
    return sup.storage.from(bucket).getPublicUrl(name).data.publicUrl;
  } catch(e) {
    if (progWrap) progWrap.style.display = 'none';
    return null;
  }
}

// Preview images
document.getElementById('m-media').addEventListener('change', e => showPrev(e.target.files, 'm-preview'));
document.getElementById('t-media').addEventListener('change', e => showPrev(e.target.files, 't-preview'));
function showPrev(files, previewId) {
  const wrap = document.getElementById(previewId); wrap.innerHTML = '';
  Array.from(files).forEach(f => { const img = document.createElement('img'); img.className = 'upload-thumb'; const url = URL.createObjectURL(f); img.src = url; wrap.appendChild(img); });
}

// ═══ FORMS ═══
async function subMaint() {
  const btn = document.getElementById('m-btn');
  const name = document.getElementById('m-name').value.trim();
  const phone = document.getElementById('m-phone').value.trim();
  const model = document.getElementById('m-model').value;
  const problem = document.getElementById('m-problem').value.trim();
  if (!name || !phone || !model || !problem) { showToast('⚠️ يرجى تعبئة جميع الحقول المطلوبة', 'warn'); return; }
  btn.disabled = true; btn.textContent = 'يتم الإرسال...';
  try {
    let mediaUrls = [];
    const files = document.getElementById('m-media').files;
    for (let i = 0; i < files.length; i++) { const u = await uploadImg('maintenance-media', files[i], 'mt', 'm-prog'); if (u) mediaUrls.push(u); }
    if (sup) {
      const { error } = await sup.from('maintenance_requests').insert([{ customer_name: name, customer_phone: phone, device_model: model, problem_description: problem, extra_notes: document.getElementById('m-notes').value, media_urls: mediaUrls }]);
      if (error) throw error;
    }
    document.getElementById('m-card').style.display = 'none';
    document.getElementById('m-success').style.display = 'flex';
  } catch(e) { showToast('❌ حدث خطأ, حاول مرة أخرى', 'error'); }
  btn.disabled = false; btn.textContent = 'إرسال طلب الصيانة';
}

async function subTrade() {
  const btn = document.getElementById('t-btn');
  const name = document.getElementById('t-name').value.trim();
  const phone = document.getElementById('t-phone').value.trim();
  const cm = document.getElementById('t-curr-m').value;
  const cs = document.getElementById('t-curr-s').value;
  const cc = document.getElementById('t-curr-c').value;
  const rm = document.getElementById('t-req-m').value;
  const rs = document.getElementById('t-req-s').value;
  if (!name || !phone || !cm || !cs || !cc || !rm || !rs) { showToast('⚠️ يرجى تعبئة جميع الحقول', 'warn'); return; }
  btn.disabled = true; btn.textContent = 'يتم الإرسال...';
  try {
    let mediaUrls = [];
    const files = document.getElementById('t-media').files;
    for (let i = 0; i < files.length; i++) { const u = await uploadImg('trade-media', files[i], 'tr', 't-prog'); if (u) mediaUrls.push(u); }
    if (sup) {
      const { error } = await sup.from('trade_requests').insert([{ customer_name: name, customer_phone: phone, current_device_model: cm, current_storage: cs, current_condition: cc, wanted_device_model: rm, wanted_storage: rs, trade_notes: document.getElementById('t-notes').value, media_urls: mediaUrls }]);
      if (error) throw error;
    }
    document.getElementById('t-card').style.display = 'none';
    document.getElementById('t-success').style.display = 'flex';
  } catch(e) { showToast('❌ حدث خطأ, حاول مرة أخرى', 'error'); }
  btn.disabled = false; btn.textContent = 'طلب الاستبدال';
}

function resetForm(prefix) {
  document.getElementById(prefix + '-card').style.display = 'flex';
  document.getElementById(prefix + '-success').style.display = 'none';
  document.getElementById(prefix + '-card').querySelectorAll('input,textarea,select').forEach(el => { if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = ''; });
  document.getElementById(prefix + '-preview').innerHTML = '';
}

// ═══ TOAST ═══
function showToast(msg, type = 'info') {
  const t = document.createElement('div'); t.className = 'toast glass'; t.textContent = msg;
  const colors = { success: 'var(--neon-success)', error: 'var(--neon-danger)', warn: 'var(--neon-warn)', info: 'var(--neon-2)' };
  t.style.cssText = \`color:\${colors[type] || colors.info};border-color:\${colors[type] || colors.info}\`;
  document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

// ═══ COLORS ═══
function uColr(v, val) { document.documentElement.style.setProperty(v, val); }
function sColr() {
  const c = { '--neon-1': document.getElementById('c1').value, '--neon-2': document.getElementById('c2').value, '--neon-3': document.getElementById('c3').value };
  localStorage.setItem('bxc', JSON.stringify(c)); showToast('✅ تم حفظ الألوان', 'success');
}
function rColr() {
  localStorage.removeItem('bxc');
  ['--neon-1','--neon-2','--neon-3'].forEach(v => document.documentElement.style.removeProperty(v));
  document.getElementById('c1').value = '#6366f1'; document.getElementById('c2').value = '#22d3ee'; document.getElementById('c3').value = '#a855f7';
  showToast('↩ استعدت الألوان الافتراضية', 'info');
}
function loadSavedColors() {
  const saved = localStorage.getItem('bxc');
  if (saved) { const c = JSON.parse(saved); Object.entries(c).forEach(([k, v]) => { uColr(k, v); const inp = document.getElementById(k === '--neon-1' ? 'c1' : k === '--neon-2' ? 'c2' : 'c3'); if (inp) inp.value = v; }); }
}

// ═══ ADMIN ═══
function opAdm() {
  if (sessionStorage.getItem('adm') === '1') { document.getElementById('admin-panel').style.display = 'block'; ldAdm(); }
  else { const p = prompt('🔐 كلمة المرور:'); if (p === '1010') { sessionStorage.setItem('adm', '1'); document.getElementById('admin-panel').style.display = 'block'; ldAdm(); } else if (p !== null) showToast('❌ كلمة مرور خاطئة', 'error'); }
}

async function ldAdm() {
  if (!sup) return;
  try {
    const { data } = await sup.from('products').select('*').order('created_at', { ascending: false });
    const list = document.getElementById('adm-list');
    if (!data || !data.length) { list.innerHTML = '<div style="color:var(--text-dim);text-align:center">لا توجد منتجات بعد</div>'; return; }
    list.innerHTML = data.map(p => \`<div class="adm-prod-item"><img class="adm-prod-img" src="\${p.image_url || ''}" onerror="this.style.display='none'"><div style="flex:1"><div style="font-size:.9rem;font-weight:600">\${p.name}</div><div style="font-size:.78rem;color:var(--text-dim)">\${p.price}$ · \${p.in_stock ? '✅ متاح' : '❌ نفذ'}</div></div><button onclick="delProd('\${p.id}')" class="adm-prod-del" aria-label="حذف">🗑️</button></div>\`).join('');
  } catch(e) {}
}

window.delProd = async (id) => {
  if (!confirm('هل تريد حذف هذا المنتج؟')) return;
  try {
    const { error } = await sup.from('products').delete().eq('id', id);
    if (error) throw error; showToast('🗑️ تم الحذف', 'success'); ldAdm(); loadProducts();
  } catch(e) { showToast('❌ فشل الحذف', 'error'); }
};

async function addProd() {
  const name = document.getElementById('ap-name').value.trim();
  const price = document.getElementById('ap-price').value;
  const cat = document.getElementById('ap-cat').value;
  if (!name || !price || !cat) { showToast('⚠️ اسم المنتج، السعر، والتصنيف إلزامية', 'warn'); return; }
  const addBtn = document.querySelector('.btn-adm-primary'); addBtn.disabled = true; addBtn.textContent = 'جاري الحفظ...';
  try {
    let imgUrl = null;
    const imgFile = document.getElementById('ap-img').files[0];
    if (imgFile) imgUrl = await uploadImg('product-images', imgFile, 'pd', 'ap-prog');
    if (!sup) throw new Error('No Supabase');
    const { error } = await sup.from('products').insert([{ name, description: document.getElementById('ap-desc').value, price: parseFloat(price), original_price: parseFloat(document.getElementById('ap-opr').value) || null, category: cat, device_model: document.getElementById('ap-mod').value || null, image_url: imgUrl, in_stock: document.getElementById('ap-stk').checked, is_featured: document.getElementById('ap-feat').checked }]);
    if (error) throw error;
    showToast('✅ تمت إضافة المنتج', 'success');
    ['ap-name','ap-desc','ap-price','ap-opr'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('ap-cat').selectedIndex = 0; document.getElementById('ap-mod').selectedIndex = 0;
    document.getElementById('ap-stk').checked = true; document.getElementById('ap-feat').checked = false;
    ldAdm(); loadProducts();
  } catch(e) { showToast('❌ فشل الحفظ: ' + e.message, 'error'); }
  addBtn.disabled = false; addBtn.textContent = 'حفظ المنتج';
}
</script>
</body>
</html>`;

const existing = fs.readFileSync('c:\\\\Users\\\\HODHOD\\\\Desktop\\\\Boox Store\\\\index.html', 'utf8');
fs.writeFileSync('c:\\\\Users\\\\HODHOD\\\\Desktop\\\\Boox Store\\\\index.html', existing + js, 'utf8');
const final = fs.readFileSync('c:\\\\Users\\\\HODHOD\\\\Desktop\\\\Boox Store\\\\index.html', 'utf8');
console.log('Done! Total chars:', final.length);
