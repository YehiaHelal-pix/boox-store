# BOOX STORE — PROJECT ARCHITECTURE REFERENCE
# وثيقة المرجع المعماري الكاملة للوكيل
# ════════════════════════════════════════════
# ⚠️ هذه الوثيقة هي المرجع الوحيد للمشروع
# لا تنحرف عنها تحت أي ظرف

## TECH STACK (ثابت لا يتغير)
- Framework:  Next.js 15 (App Router ONLY — لا Pages Router)
- Language:   TypeScript (strict: true)
- Styling:    Tailwind CSS v4 + CSS Variables (لا Bootstrap / لا Chakra)
- Database:   Supabase PostgreSQL + Realtime
- Auth:       Supabase Auth (JWT) — لا كلمة سر في الكود أبداً
- Storage:    Supabase Storage (bucket: product-images)
- State:      Zustand (cart) + React useState (local)
- Animation:  Framer Motion
- Font:       Tajawal (Google Fonts) — عربي + لاتيني
- Deploy:     Vercel (Edge Network)
- Direction:  RTL (Arabic) — dir="rtl" على html دائماً

## FOLDER STRUCTURE (لا تعدّل هذه البنية)
boox-store/
├── public/
│   ├── boox-logo.jpg          ← اللوجو الرسمي — لا تعدّله
│   ├── manifest.json          ← PWA
│   └── robots.txt
├── src/
│   ├── app/                   ← App Router
│   │   ├── layout.tsx         ← Root Layout (RTL + Font + Navbar + Footer)
│   │   ├── page.tsx           ← الصفحة الرئيسية
│   │   ├── loading.tsx        ← Skeleton
│   │   ├── not-found.tsx      ← 404
│   │   ├── error.tsx          ← Error Boundary
│   │   ├── products/page.tsx           ← كل المنتجات
│   │   ├── products/[id]/page.tsx      ← منتج واحد
│   │   ├── maintenance/page.tsx        ← طلب صيانة
│   │   ├── trade/page.tsx              ← طلب استبدال
│   │   ├── admin/login/page.tsx        ← تسجيل دخول
│   │   ├── admin/layout.tsx            ← Admin Layout
│   │   ├── admin/page.tsx              ← Dashboard
│   │   ├── admin/products/page.tsx     ← إدارة منتجات
│   │   ├── admin/customize/page.tsx    ← تخصيص موقع
│   │   ├── admin/maintenance/page.tsx  ← طلبات صيانة
│   │   ├── admin/trade/page.tsx        ← طلبات استبدال
│   │   ├── admin/logs/page.tsx         ← سجل عمليات
│   │   └── api/
│   │       ├── products/route.ts
│   │       ├── maintenance/route.ts
│   │       └── trade/route.ts
│   ├── components/
│   │   ├── layout/   → Navbar, Footer, PromoBanner, BottomNav
│   │   ├── home/     → HeroSection, TrustBadges, FeaturedProducts, ServicesSection, StatsSection, LocationSection
│   │   ├── products/ → ProductCard, ProductGrid, ProductFilters, ProductModal, ProductSkeleton
│   │   ├── cart/     → CartDrawer, CartItem, CartButton
│   │   ├── forms/    → MaintenanceForm, TradeForm
│   │   ├── admin/    → AdminSidebar, ProductForm, SettingsForm
│   │   ├── effects/  → FloatingStars, NeonCursor, ScrollProgress
│   │   └── ui/       → Button, Badge, Toast, Modal, Skeleton
│   ├── lib/
│   │   ├── supabase/client.ts   ← createBrowserClient
│   │   ├── supabase/server.ts   ← createServerClient (cookies)
│   │   └── supabase/admin.ts    ← createClient (SERVICE_ROLE — server only)
│   ├── hooks/
│   │   ├── useProducts.ts       ← fetch + Realtime
│   │   ├── useCart.ts           ← cart state
│   │   └── useMediaQuery.ts     ← responsive
│   ├── store/
│   │   └── cart.ts              ← Zustand + persist
│   └── types/
│       ├── product.ts
│       ├── database.ts
│       └── maintenance.ts

## DATABASE TABLES (5 جداول — لا تعدّل الأسماء)
1. products            ← المنتجات (مع Realtime)
2. site_settings       ← إعدادات الموقع (key/value JSONB)
3. audit_logs          ← سجل كل العمليات
4. maintenance_requests ← طلبات الصيانة
5. trade_requests      ← طلبات الاستبدال

## SECURITY RULES (غير قابلة للتفاوض)
- Middleware يحمي /admin/* ما عدا /admin/login
- SUPABASE_SERVICE_ROLE_KEY → server فقط (lib/supabase/admin.ts)
- NEXT_PUBLIC_SUPABASE_ANON_KEY → client مسموح
- RLS مفعّل على كل الجداول
- لا كلمة سر ثابتة في أي ملف

## DESIGN SYSTEM (لا تخترق هذه القيم)
- خلفية:    #03030a
- زجاج:     rgba(255,255,255,0.04) + backdrop-filter:blur(24px)
- نيون:     #6366f1 (indigo) | #22d3ee (cyan) | #a855f7 (purple)
- نص:       #f8fafc
- حدود:     rgba(255,255,255,0.08)
- اتجاه:    RTL
- خط:       Tajawal

## RESPONSIVE RULES (موبايل أولاً — ثابت)
- جوال < 640px:  عمودان للمنتجات دائماً
- تابلت ≥ 640px: 3 أعمدة
- ديسك ≥ 1024px: 4 أعمدة
- كبير ≥ 1280px: 5 أعمدة
- Bottom Nav: جوال فقط
- كل الأزرار: min 44×44px
- Safe areas: env(safe-area-inset-*)

## LOGO RULE (قاعدة واحدة لا تتغير)
src="/boox-logo.jpg"
style={{ filter: 'invert(1)' }}
← هذا الوحيد المسموح به — لا تعديل آخر

## EXECUTION ORDER (ترتيب التنفيذ الإلزامي)
STEP 0: SQL في Supabase + إنشاء مستخدم أدمن
STEP 1: Config files (package.json, next.config.ts, tsconfig.json, tailwind.config.ts)
STEP 2: Types + Lib + Hooks + Store
STEP 3: Root layout + globals.css
STEP 4: Pages (بالترتيب: home → products → maintenance → trade)
STEP 5: Admin system (login → layout → dashboard → products → customize → logs)
STEP 6: Components (layout → home → products → cart → effects → ui)
STEP 7: API Routes
STEP 8: vercel.json + manifest.json + robots.txt

## FORBIDDEN (ممنوع تماماً)
❌ لا Bootstrap / لا Chakra / لا Material UI
❌ لا Pages Router (app/ فقط)
❌ لا <img> (next/image فقط)
❌ لا <a href> (next/link فقط)
❌ لا any في TypeScript
❌ لا كلمة سر ثابتة في الكود
❌ لا SERVICE_ROLE في client
❌ لا اختصار أو "...continue..." في الكود
❌ عمود واحد للمنتجات على الجوال = خطأ
