const fs = require('fs');

const part1 = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Boox Store - من بوكس تشتري تفاح وانت بالك مرتاح</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#03030a;--bg2:#070714;--glass:rgba(255,255,255,0.04);--glass2:rgba(255,255,255,0.07);
  --glass-border:rgba(255,255,255,0.08);--blur:blur(20px) saturate(160%);
  --neon-1:#6366f1;--neon-2:#22d3ee;--neon-3:#a855f7;
  --neon-success:#22c55e;--neon-danger:#ef4444;--neon-warn:#f59e0b;
  --text:#f1f5f9;--text-dim:#64748b;--radius:16px;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Cairo',system-ui,sans-serif;overflow-x:hidden;min-height:100vh}

/* ── SCROLLBAR ── */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--neon-1);border-radius:4px}

/* ── GLASS ── */
.glass{background:var(--glass);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--glass-border)}

/* ── LOADING SCREEN ── */
#loading-screen{position:fixed;inset:0;z-index:9999;background:#03030a;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease,visibility .5s ease}
#loading-screen.fade-out{opacity:0;visibility:hidden;pointer-events:none}
.loading-content{display:flex;flex-direction:column;align-items:center;gap:24px}
.apple-loader-svg{width:clamp(80px,18vw,140px)}
.apple-path{animation:draw-apple 1.8s ease forwards}
@keyframes draw-apple{0%{stroke-dashoffset:800;opacity:.3}20%{opacity:1}100%{stroke-dashoffset:0}}
.loader-brand{position:relative;font-size:clamp(24px,6vw,42px);font-weight:900;letter-spacing:4px;opacity:0;animation:brand-appear .6s ease forwards 1.6s}
.loader-brand-text{position:relative;z-index:2;background:linear-gradient(135deg,#6366f1,#22d3ee,#a855f7);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.loader-brand-glow{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,#6366f1,#22d3ee,#a855f7);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:blur(12px);opacity:.7}
.loader-progress{width:clamp(120px,28vw,200px);height:2px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden;opacity:0;animation:brand-appear .3s ease forwards 1.7s}
.loader-progress-fill{height:100%;background:linear-gradient(90deg,#6366f1,#22d3ee);animation:progress-fill .8s ease forwards 1.7s;width:0}
@keyframes brand-appear{to{opacity:1}}
@keyframes progress-fill{to{width:100%}}

/* ── NAVBAR ── */
#navbar{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;padding:10px 16px;gap:12px;border-bottom:1px solid rgba(255,255,255,.05)}
.nav-logo img{width:38px;height:38px;border-radius:10px;filter:invert(1);object-fit:contain}

/* ── DYNAMIC ISLAND ── */
.dynamic-island-wrap{position:relative;display:flex;align-items:center;justify-content:center;flex:1;max-width:400px;margin:0 auto;z-index:10}
.dynamic-island{position:relative;background:rgba(0,0,0,.9);border-radius:30px;border:1px solid rgba(99,102,241,.35);cursor:pointer;transition:all .4s cubic-bezier(.34,1.56,.64,1);box-shadow:0 0 0 1px rgba(99,102,241,.2),0 0 15px rgba(99,102,241,.15),inset 0 1px 0 rgba(255,255,255,.05);width:120px;height:36px;overflow:visible}
.dynamic-island.expanded{width:min(320px,78vw);height:44px;border-radius:22px;border-color:rgba(99,102,241,.7);box-shadow:0 0 0 1px rgba(99,102,241,.5),0 0 40px rgba(99,102,241,.3),inset 0 1px 0 rgba(255,255,255,.1)}
.island-collapsed{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;padding:0 14px;color:rgba(255,255,255,.45);font-size:13px}
.island-expanded{display:none;align-items:center;gap:8px;height:100%;padding:0 14px}
.dynamic-island.expanded .island-collapsed{display:none}
.dynamic-island.expanded .island-expanded{display:flex}
.island-input{flex:1;background:none;border:none;outline:none;color:var(--text);font-family:'Cairo',sans-serif;font-size:14px;direction:rtl;min-width:0}
.island-input::placeholder{color:rgba(255,255,255,.3)}
.island-clear{color:rgba(255,255,255,.4);font-size:11px;width:20px;height:20px;display:none;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.12);transition:all .2s;flex-shrink:0;cursor:pointer}
.island-clear:hover{background:rgba(255,255,255,.22);color:#fff}

/* Electric lines */
.electric-lines{position:absolute;inset:-20px;pointer-events:none;z-index:-1}
.electric-line{position:absolute;border-radius:2px;opacity:0}
.el-1{top:0;left:20%;height:1px;width:60%;background:linear-gradient(90deg,transparent,#6366f1,transparent);animation:electric-h 3s ease-in-out infinite 0s}
.el-2{bottom:0;left:20%;height:1px;width:60%;background:linear-gradient(90deg,transparent,#22d3ee,transparent);animation:electric-h 3s ease-in-out infinite 1.5s}
.el-3{left:0;top:20%;width:1px;height:60%;background:linear-gradient(180deg,transparent,#a855f7,transparent);animation:electric-v 2.5s ease-in-out infinite .5s}
.el-4{right:0;top:20%;width:1px;height:60%;background:linear-gradient(180deg,transparent,#22d3ee,transparent);animation:electric-v 2.5s ease-in-out infinite 2s}
@keyframes electric-h{0%,100%{opacity:0;transform:scaleX(.3) translateX(-20px)}30%,70%{opacity:.9;transform:scaleX(1) translateX(0)}50%{opacity:1}}
@keyframes electric-v{0%,100%{opacity:0;transform:scaleY(.3) translateY(-10px)}30%,70%{opacity:.9;transform:scaleY(1) translateY(0)}50%{opacity:1}}
.dynamic-island.expanded~.electric-lines .electric-line{animation-duration:1.2s}

/* admin icon */
.admin-btn{color:rgba(255,255,255,.6);transition:color .2s;padding:4px}
.admin-btn:hover{color:#fff}

/* ── BOTTOM NAV ── */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-around;padding:8px 0 max(16px,env(safe-area-inset-bottom)) 0;z-index:90;border-top:1px solid rgba(255,255,255,.06);border-top-left-radius:20px;border-top-right-radius:20px}
.bnav-btn{display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--text-dim);transition:all .25s;font-size:10px;padding:4px 12px;border-radius:12px;position:relative}
.bnav-btn svg{transition:all .25s;width:22px;height:22px}
.bnav-btn.active{color:var(--neon-1)}
.bnav-btn.active svg{filter:drop-shadow(0 0 8px var(--neon-1))}
.bnav-btn::before{content:'';position:absolute;bottom:-2px;width:4px;height:4px;border-radius:50%;background:var(--neon-1);opacity:0;transition:.25s}
.bnav-btn.active::before{opacity:1}
.bnav-btn:active{transform:scale(.9)}

/* ── MAIN ── */
main{padding-top:72px;padding-bottom:90px}
section{scroll-margin-top:72px}

/* ── HERO ── */
#home{text-align:center;padding:48px 16px 32px;position:relative;overflow:hidden}
#home::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(99,102,241,.12),transparent);pointer-events:none}
.hero-logo{width:clamp(80px,18vw,120px);border-radius:22px;filter:invert(1);margin-bottom:16px;animation:hero-pop .8s cubic-bezier(.34,1.56,.64,1);box-shadow:0 0 40px rgba(99,102,241,.3),0 0 80px rgba(99,102,241,.1)}
@keyframes hero-pop{0%{opacity:0;transform:scale(.5) translateY(20px)}100%{opacity:1;transform:none}}
.hero-title{font-size:clamp(1.8rem,5vw,3rem);font-weight:900;margin-bottom:8px;animation:hero-text .8s ease .2s both}
@keyframes hero-text{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.hero-title span{background:linear-gradient(135deg,var(--neon-1),var(--neon-2),var(--neon-3));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.hero-slogan{color:var(--text-dim);font-size:clamp(.9rem,2.5vw,1.15rem);margin-bottom:28px;animation:hero-text .8s ease .4s both}
.hero-stats{display:flex;gap:20px;justify-content:center;margin-bottom:28px;animation:hero-text .8s ease .5s both;flex-wrap:wrap}
.stat-item{text-align:center}
.stat-num{font-size:1.4rem;font-weight:900;background:linear-gradient(135deg,var(--neon-1),var(--neon-2));-webkit-background-clip:text;color:transparent}
.stat-lbl{font-size:.75rem;color:var(--text-dim)}

/* ── CATEGORY PILLS ── */
.cat-pills-wrap{overflow-x:auto;white-space:nowrap;padding:4px 16px 12px;animation:hero-text .8s ease .6s both;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.cat-pills-wrap::-webkit-scrollbar{display:none}
.cat-pill{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:24px;font-size:.85rem;font-weight:600;border:1px solid var(--glass-border);color:var(--text-dim);margin-left:8px;transition:all .3s cubic-bezier(.34,1.56,.64,1);cursor:pointer;white-space:nowrap}
.cat-pill:hover{border-color:rgba(99,102,241,.4);color:var(--text);transform:translateY(-2px)}
.cat-pill.active{background:rgba(99,102,241,.15);border-color:var(--neon-1);color:var(--neon-1);box-shadow:0 0 16px rgba(99,102,241,.2);transform:none}
.cat-pill .pill-icon{font-size:1rem}

/* ── PRODUCTS GRID ── */
#products{padding:16px}
.section-header{display:flex;align-items:center;justify-content:space-between;padding:0 0 16px;max-width:1200px;margin:0 auto}
.section-title{font-size:1.2rem;font-weight:700}
.products-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:1200px;margin:0 auto}
@media(min-width:640px){.products-grid{grid-template-columns:repeat(3,1fr)}}
@media(min-width:1024px){.products-grid{grid-template-columns:repeat(4,1fr);gap:20px}}
.product-card{background:var(--glass);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--glass-border);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:all .3s cubic-bezier(.34,1.56,.64,1);animation:card-in .5s ease both;cursor:default}
@keyframes card-in{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.product-card:hover{border-color:rgba(99,102,241,.45);box-shadow:0 0 0 1px rgba(99,102,241,.3),0 0 24px rgba(99,102,241,.15),0 12px 40px rgba(0,0,0,.5);transform:translateY(-6px)}
.product-img{height:150px;background:rgba(0,0,0,.4);position:relative;overflow:hidden}
.product-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.product-card:hover .product-img img{transform:scale(1.06)}
.badge-sold{position:absolute;top:8px;right:8px;background:rgba(239,68,68,.85);padding:3px 8px;border-radius:8px;font-size:11px;backdrop-filter:blur(8px)}
.badge-disc{position:absolute;top:8px;left:8px;background:rgba(99,102,241,.85);padding:3px 8px;border-radius:8px;font-size:11px;backdrop-filter:blur(8px)}
.badge-feat{position:absolute;bottom:8px;left:8px;background:rgba(245,158,11,.85);padding:3px 8px;border-radius:8px;font-size:11px;backdrop-filter:blur(8px)}
.product-body{padding:12px;flex:1;display:flex;flex-direction:column;gap:6px}
.product-name{font-size:.9rem;font-weight:700;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.product-model{font-size:.75rem;color:var(--text-dim)}
.product-prices{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.product-price{font-size:1rem;font-weight:900;color:var(--neon-2)}
.product-old{font-size:.8rem;color:var(--text-dim);text-decoration:line-through}
.product-buy{display:flex;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg,var(--neon-1),var(--neon-3));color:#fff;font-family:'Cairo',sans-serif;font-weight:700;font-size:.85rem;padding:9px 12px;border-radius:12px;margin-top:auto;transition:all .2s;text-decoration:none;border:none;cursor:pointer;width:100%}
.product-buy:hover{box-shadow:0 0 24px rgba(99,102,241,.5);transform:translateY(-1px)}
.product-buy:disabled,.product-buy.disabled{opacity:.4;pointer-events:none}

.products-empty{grid-column:1/-1;text-align:center;padding:60px 16px;color:var(--text-dim)}
.products-empty svg{opacity:.3;margin-bottom:16px}
.products-loading{grid-column:1/-1;display:flex;justify-content:center;padding:60px;color:var(--text-dim)}
.spinner{width:40px;height:40px;border:3px solid rgba(99,102,241,.2);border-top-color:var(--neon-1);border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── SERVICES ── */
#services{padding:40px 16px;max-width:1200px;margin:0 auto}
.services-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:24px}
@media(min-width:640px){.services-grid{grid-template-columns:repeat(4,1fr)}}
.service-card{background:var(--glass);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--glass-border);border-radius:16px;padding:24px 16px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;transition:all .35s cubic-bezier(.34,1.56,.64,1);cursor:default;animation:card-in .5s ease both}
.service-card:hover{transform:translateY(-6px) scale(1.02)}
.service-icon-wrap{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:4px;transition:.3s}
.service-title{font-weight:700;font-size:.95rem}
.service-desc{font-size:.8rem;color:var(--text-dim);line-height:1.5}

/* ── FORM SECTIONS ── */
.form-section{padding:40px 16px;max-width:700px;margin:0 auto}
.section-title-lg{font-size:1.4rem;font-weight:900;margin-bottom:24px;text-align:center}
.section-title-lg span{background:linear-gradient(135deg,var(--neon-1),var(--neon-3));-webkit-background-clip:text;color:transparent}
.form-card{background:var(--glass);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--glass-border);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:16px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field-label{font-size:.8rem;color:var(--text-dim);margin-bottom:6px;display:block}
.field-wrap{display:flex;flex-direction:column}
.fi{font-family:'Cairo',sans-serif;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:var(--text);padding:12px 14px;border-radius:10px;width:100%;outline:none;transition:all .25s;font-size:.9rem;direction:rtl}
.fi:focus{border-color:var(--neon-1);background:rgba(99,102,241,.08);box-shadow:0 0 0 3px rgba(99,102,241,.15)}
select.fi option{background:#0d0d1a}
textarea.fi{min-height:90px;resize:vertical}
.upload-btn{display:flex;align-items:center;justify-content:center;gap:10px;background:rgba(255,255,255,.04);border:1.5px dashed rgba(255,255,255,.15);border-radius:10px;padding:16px;cursor:pointer;transition:.25s;color:var(--text-dim);font-family:'Cairo',sans-serif;font-size:.9rem;width:100%}
.upload-btn:hover{border-color:var(--neon-1);color:var(--text)}
.upload-preview{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.upload-thumb{width:60px;height:60px;border-radius:8px;object-fit:cover;border:1px solid var(--glass-border)}
.btn-submit{font-family:'Cairo',sans-serif;font-size:1rem;font-weight:700;background:linear-gradient(135deg,var(--neon-1),var(--neon-3));color:#fff;padding:14px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:10px;letter-spacing:.5px;box-shadow:0 0 24px rgba(99,102,241,.3);transition:all .25s;cursor:pointer;width:100%;border:none}
.btn-submit:hover{box-shadow:0 0 40px rgba(99,102,241,.5);transform:translateY(-2px)}
.btn-submit:active{transform:scale(.97)}
.btn-submit:disabled{opacity:.5;pointer-events:none}
.form-success{text-align:center;padding:32px;display:none;flex-direction:column;align-items:center;gap:16px}
.form-success svg{animation:success-pop .5s cubic-bezier(.34,1.56,.64,1)}
@keyframes success-pop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:none}}
.form-success h3{font-size:1.1rem;font-weight:700;color:var(--neon-success)}

/* ── CONTACT ── */
#contact{padding:40px 16px;max-width:700px;margin:0 auto;text-align:center}
.contact-cards{display:flex;flex-direction:column;gap:14px;margin-top:28px}
.contact-link-card{display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:16px;background:var(--glass);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--glass-border);transition:all .3s cubic-bezier(.34,1.56,.64,1);text-decoration:none;color:inherit;cursor:pointer}
.contact-link-card:hover{transform:translateX(-4px);border-color:var(--hover-color,var(--neon-1));box-shadow:0 0 24px color-mix(in srgb,var(--hover-color,var(--neon-1)) 20%,transparent)}
.contact-icon-wrap{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.contact-info{text-align:right;flex:1}
.contact-info strong{display:block;font-weight:700}
.contact-info span{font-size:.8rem;color:var(--text-dim)}
.contact-arrow{color:var(--text-dim);font-size:1.1rem}

/* ── SOCIAL ICONS WALL ── */
.social-wall{margin-top:28px;background:var(--glass);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--glass-border);border-radius:20px;padding:24px}
.social-wall-title{font-size:.85rem;color:var(--text-dim);margin-bottom:20px;text-align:center}
.social-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}

.social-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .35s cubic-bezier(.34,1.56,.64,1);text-decoration:none;color:inherit;position:relative;overflow:hidden}
.social-card::before{content:'';position:absolute;inset:0;opacity:0;transition:.3s}
.social-card:hover{transform:translateY(-6px);border-color:var(--sc-glow)}
.social-card:hover::before{opacity:1}
.social-card:hover .social-icon-wrap{transform:scale(1.15) rotate(-5deg)}
.social-icon-wrap{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;transition:.35s;position:relative;z-index:1}
.social-name{font-size:.82rem;font-weight:700;position:relative;z-index:1}
.social-handle{font-size:.72rem;color:var(--text-dim);position:relative;z-index:1}

/* Instagram */
.sc-ig{--sc-glow:#e1306c}
.sc-ig::before{background:radial-gradient(ellipse at center,rgba(225,48,108,.12),transparent 70%)}
.sc-ig:hover{box-shadow:0 0 40px rgba(225,48,108,.2)}
.sc-ig .social-icon-wrap{background:linear-gradient(135deg,#405de6,#5851db,#833ab4,#c13584,#e1306c,#fd1d1d,#f56040,#f77737,#fcaf45)}

/* TikTok */
.sc-tt{--sc-glow:#69c9d0}
.sc-tt::before{background:radial-gradient(ellipse at center,rgba(105,201,208,.1),transparent 70%)}
.sc-tt:hover{box-shadow:0 0 40px rgba(105,201,208,.2)}
.sc-tt .social-icon-wrap{background:linear-gradient(135deg,#010101,#1a1a2e)}

/* Facebook */
.sc-fb{--sc-glow:#1877f2}
.sc-fb::before{background:radial-gradient(ellipse at center,rgba(24,119,242,.12),transparent 70%)}
.sc-fb:hover{box-shadow:0 0 40px rgba(24,119,242,.2)}
.sc-fb .social-icon-wrap{background:linear-gradient(135deg,#1877f2,#0a5fc4)}

/* WhatsApp */
.sc-wa{--sc-glow:#25d366}
.sc-wa::before{background:radial-gradient(ellipse at center,rgba(37,211,102,.12),transparent 70%)}
.sc-wa:hover{box-shadow:0 0 40px rgba(37,211,102,.2)}
.sc-wa .social-icon-wrap{background:linear-gradient(135deg,#25d366,#128c7e)}

/* YouTube */
.sc-yt{--sc-glow:#ff0000}
.sc-yt::before{background:radial-gradient(ellipse at center,rgba(255,0,0,.12),transparent 70%)}
.sc-yt:hover{box-shadow:0 0 40px rgba(255,0,0,.2)}
.sc-yt .social-icon-wrap{background:linear-gradient(135deg,#ff0000,#cc0000)}

/* Maps */
.sc-gm{--sc-glow:#4285f4}
.sc-gm::before{background:radial-gradient(ellipse at center,rgba(66,133,244,.12),transparent 70%)}
.sc-gm:hover{box-shadow:0 0 40px rgba(66,133,244,.2)}
.sc-gm .social-icon-wrap{background:linear-gradient(135deg,#4285f4,#34a853)}

/* ── FOOTER ── */
footer{text-align:center;padding:32px 16px;border-top:1px solid rgba(255,255,255,.05)}
.footer-logo img{width:44px;border-radius:12px;filter:invert(1);opacity:.5}
.footer-tagline{color:var(--text-dim);font-size:.82rem;margin-top:12px}

/* ── TOAST ── */
.toast{position:fixed;bottom:96px;left:50%;transform:translateX(-50%) translateY(20px);z-index:99999;padding:12px 24px;border-radius:24px;font-family:'Cairo',sans-serif;font-weight:700;font-size:.9rem;opacity:0;transition:all .35s;pointer-events:none;white-space:nowrap}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ── ADMIN PANEL ── */
#admin-panel{position:fixed;inset:0;background:var(--bg);z-index:10000;overflow-y:auto;padding:24px;display:none;animation:panel-in .3s ease}
@keyframes panel-in{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
.admin-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--glass-border)}
.adm-close{background:rgba(255,255,255,.08);padding:10px 18px;border-radius:10px;font-family:'Cairo',sans-serif;font-weight:700;color:var(--text);transition:.2s}
.adm-close:hover{background:rgba(255,255,255,.15)}
.adm-section{background:var(--glass);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--glass-border);border-radius:16px;padding:20px;margin-bottom:20px}
.adm-section h3{margin-bottom:16px;font-size:1rem;font-weight:700}
.adm-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.adm-prod-item{display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
.adm-prod-img{width:44px;height:44px;border-radius:8px;object-fit:cover;background:#111}
.adm-prod-del{color:var(--neon-danger);font-size:1.1rem;margin-right:auto;transition:.2s;padding:4px}
.adm-prod-del:hover{transform:scale(1.2)}
.btn-adm-primary{font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:700;background:linear-gradient(135deg,var(--neon-1),var(--neon-3));color:#fff;padding:12px 20px;border-radius:10px;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;cursor:pointer;transition:all .2s;box-shadow:0 0 20px rgba(99,102,241,.3);border:none}
.btn-adm-primary:hover{box-shadow:0 0 32px rgba(99,102,241,.5)}
.btn-adm-ghost{font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:700;background:rgba(255,255,255,.07);color:var(--text);padding:12px 20px;border-radius:10px;width:100%;cursor:pointer;transition:.2s;border:none}
.btn-adm-ghost:hover{background:rgba(255,255,255,.12)}
.progress-bar-wrap{height:4px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden;display:none}
.progress-bar-fill{height:100%;background:linear-gradient(90deg,var(--neon-1),var(--neon-2));width:0;transition:width .3s}

/* color pickers */
.clr-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.clr-item{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:.75rem;color:var(--text-dim)}
.clr-item input[type=color]{-webkit-appearance:none;border:none;padding:0;width:44px;height:44px;border-radius:12px;cursor:pointer;background:none}
.clr-item input[type=color]::-webkit-color-swatch-wrapper{padding:0;border-radius:12px}
.clr-item input[type=color]::-webkit-color-swatch{border:none;border-radius:12px}

/* tab indicator for bottom nav */
.bnav-indicator{position:absolute;bottom:0;width:24px;height:3px;background:var(--neon-1);border-radius:2px 2px 0 0;opacity:0;transition:.25s;box-shadow:0 0 8px var(--neon-1)}
.bnav-btn.active .bnav-indicator{opacity:1}
</style>
</head>
<body>`;

fs.writeFileSync('c:\\\\Users\\\\HODHOD\\\\Desktop\\\\Boox Store\\\\index.html', part1, 'utf8');
console.log('Part 1 written:', part1.length, 'chars');
