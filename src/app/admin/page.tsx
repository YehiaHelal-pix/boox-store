'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, CONDITION_LABELS, GRADE_OPTIONS, STORAGE_OPTIONS } from '@/lib/products'
import type {
  AdminActivityLog,
  Category,
  DashboardStats,
  MaintenanceRequest,
  Order,
  OrderStatus,
  Product,
  ProductCondition,
  TradeRequest,
} from '@/types/database'

type AdminTab = 'dashboard' | 'products' | 'orders' | 'maintenance' | 'trade' | 'settings' | 'logs'
type NoticeType = 'success' | 'error' | 'info'

interface NoticeState {
  type: NoticeType
  message: string
}

interface ProductFormState {
  name: string
  description: string
  price: string
  original_price: string
  category: string
  model: string
  storage_size: string
  color: string
  condition: ProductCondition
  battery_health: string
  grade: string
  price_on_inquiry: boolean
  in_stock: boolean
  is_featured: boolean
  is_visible: boolean
  is_available: boolean
  is_tax_exempt: boolean
  tax_value: string
}

interface SiteConfigForm {
  hero_title: string
  hero_slogan_line1: string
  hero_slogan_line2: string
  hero_stat_products_label: string
  hero_stat_warranty_label: string
  hero_stat_support_label: string
  hero_stat_support_value: string
  hero_stat_warranty_value: string
  whatsapp_number: string
  maps_url: string
  instagram_url: string
  facebook_url: string
  tiktok_url: string
  color_primary: string
  color_secondary: string
  color_accent: string
}

interface AnnouncementForm {
  is_visible: boolean
  text: string
  bg_color: string
  text_color: string
}

const DEFAULT_STATS: DashboardStats = {
  active_products: 0,
  total_products: 0,
  pending_orders: 0,
  total_orders: 0,
  completed_orders: 0,
}
const DEFAULT_PRODUCT_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  category: 'iphone',
  model: '',
  storage_size: '128GB',
  color: 'أسود',
  condition: 'like_new',
  battery_health: '',
  grade: 'A',
  price_on_inquiry: false,
  in_stock: true,
  is_featured: false,
  is_visible: true,
  is_available: true,
  is_tax_exempt: true,
  tax_value: '',
}
const DEFAULT_SITE_CONFIG: SiteConfigForm = {
  hero_title: 'Boox Store',
  hero_slogan_line1: 'أجهزة آبل أصلية بضمان',
  hero_slogan_line2: 'وأسرع خدمة قبل وبعد البيع',
  hero_stat_products_label: 'منتج متاح',
  hero_stat_warranty_label: 'ضمان',
  hero_stat_support_label: 'دعم فوري',
  hero_stat_support_value: '24/7',
  hero_stat_warranty_value: '100%',
  whatsapp_number: '201113614021',
  maps_url: 'https://maps.app.goo.gl/ryLFkd2CCWUFcsxV6',
  instagram_url: 'https://www.instagram.com/ahmed_boox22',
  facebook_url: 'https://www.facebook.com/ahmed.m.yahia.2025',
  tiktok_url: 'https://www.tiktok.com/@boox_store',
  color_primary: '#0ea5e9',
  color_secondary: '#22d3ee',
  color_accent: '#f59e0b',
}
const DEFAULT_ANNOUNCEMENT: AnnouncementForm = {
  is_visible: false,
  text: '',
  bg_color: '#0f172a',
  text_color: '#ffffff',
}
const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'معلق' },
  { value: 'confirmed', label: 'متأكد' },
  { value: 'shipped', label: 'اتشحن' },
  { value: 'delivered', label: 'اتسلم' },
  { value: 'cancelled', label: 'اتلغى' },
]

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [loading, setLoading] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([])
  const [logs, setLogs] = useState<AdminActivityLog[]>([])
  const [siteConfig, setSiteConfig] = useState<SiteConfigForm>(DEFAULT_SITE_CONFIG)
  const [announcement, setAnnouncement] = useState<AnnouncementForm>(DEFAULT_ANNOUNCEMENT)
  const [productForm, setProductForm] = useState<ProductFormState>(DEFAULT_PRODUCT_FORM)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  function showNotice(type: NoticeType, message: string) {
    setNotice({ type, message })
    window.setTimeout(() => {
      setNotice((current) => (current?.message === message ? null : current))
    }, 3500)
  }

  async function adminFetch<T>(path: string, init?: RequestInit) {
    const hasJsonBody = typeof init?.body === 'string'
    const response = await fetch(path, {
      ...init,
      headers: {
        ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    })

    const payload = await parseJson<T | { error?: string }>(response)

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/auth/login?error=session_expired&next=/admin'
      }

      if (response.status === 403) {
        window.location.href = '/auth/forbidden'
      }

      const message = typeof payload === 'object' && payload && 'error' in payload ? payload.error ?? 'فشل التنفيذ' : 'فشل التنفيذ'
      throw new Error(message)
    }

    return payload as T
  }

  async function loadAdminData() {
    setLoading(true)
    try {
      const [statsData, productData, categoryData, orderData, maintenanceData, tradeData, logsData, settingsData, announcementData] =
        await Promise.all([
          adminFetch<DashboardStats>('/api/dashboard/stats'),
          adminFetch<Product[]>('/api/products'),
          adminFetch<Category[]>('/api/categories'),
          adminFetch<Order[]>('/api/orders'),
          adminFetch<MaintenanceRequest[]>('/api/maintenance'),
          adminFetch<TradeRequest[]>('/api/trade'),
          adminFetch<AdminActivityLog[]>('/api/admin/activity'),
          adminFetch<SiteConfigForm>('/api/settings'),
          adminFetch<AnnouncementForm>('/api/announcement'),
        ])

      setStats(statsData)
      setProducts(productData)
      setCategories(categoryData)
      setOrders(orderData)
      setMaintenanceRequests(maintenanceData)
      setTradeRequests(tradeData)
      setLogs(logsData)
      setSiteConfig({ ...DEFAULT_SITE_CONFIG, ...settingsData })
      setAnnouncement({ ...DEFAULT_ANNOUNCEMENT, ...announcementData })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر تحميل لوحة الإدارة'
      showNotice('error', message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAdminData()
  }, [])

  const visibleStoreProducts = useMemo(() => products.filter((product) => product.is_available && product.is_visible), [products])
  const featuredProducts = useMemo(() => products.filter((product) => product.is_featured), [products])
  const productsNeedingAttention = useMemo(
    () => products.filter((product) => !product.in_stock || !product.is_available || !product.is_visible),
    [products],
  )
  const activeRequestsCount = useMemo(
    () =>
      maintenanceRequests.filter((request) => request.status === 'pending' || request.status === 'in_progress').length +
      tradeRequests.filter((request) => request.status === 'pending' || request.status === 'in_progress').length,
    [maintenanceRequests, tradeRequests],
  )
  const estimatedInventoryValue = useMemo(
    () =>
      products.reduce((sum, product) => {
        if (!product.is_available || product.price_on_inquiry || product.price === null) return sum
        return sum + product.price
      }, 0),
    [products],
  )

  async function uploadProductImages() {
    if (selectedFiles.length === 0) return []

    const client = createClient()
    const urls: string[] = []

    for (const file of selectedFiles) {
      const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, '-')}`
      const { error } = await client.storage.from('product-images').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        throw new Error(error.message)
      }

      const { data } = client.storage.from('product-images').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }

    return urls
  }

  async function handleSaveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProduct(true)

    try {
      const images = await uploadProductImages()
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: productForm.price ? Number(productForm.price) : null,
        original_price: productForm.original_price ? Number(productForm.original_price) : null,
        category: productForm.category,
        model: productForm.model,
        storage_size: productForm.storage_size,
        color: productForm.color,
        condition: productForm.condition,
        battery_health: productForm.battery_health ? Number(productForm.battery_health) : null,
        grade: productForm.grade,
        price_on_inquiry: productForm.price_on_inquiry,
        in_stock: productForm.in_stock,
        is_featured: productForm.is_featured,
        is_visible: productForm.is_visible,
        is_available: productForm.is_available,
        is_tax_exempt: productForm.is_tax_exempt,
        tax_value: productForm.tax_value ? Number(productForm.tax_value) : null,
        images,
      }

      await adminFetch<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setProductForm(DEFAULT_PRODUCT_FORM)
      setSelectedFiles([])
      showNotice('success', 'المنتج اتحفظ في قاعدة البيانات بنجاح')
      await loadAdminData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل حفظ المنتج'
      showNotice('error', message)
    } finally {
      setSavingProduct(false)
    }
  }

  async function handleDeleteProduct(productId: string) {
    try {
      await adminFetch<{ success: boolean }>(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      showNotice('success', 'المنتج اتشال من العرض')
      await loadAdminData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل حذف المنتج'
      showNotice('error', message)
    }
  }

  async function handleOrderStatusChange(orderId: string, status: OrderStatus) {
    try {
      await adminFetch<Order>('/api/orders', {
        method: 'PUT',
        body: JSON.stringify({ id: orderId, status }),
      })
      showNotice('success', 'حالة الطلب اتحدثت')
      await loadAdminData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل تحديث الطلب'
      showNotice('error', message)
    }
  }

  async function handleSaveSiteConfig() {
    try {
      await adminFetch<SiteConfigForm>('/api/settings', {
        method: 'POST',
        body: JSON.stringify(siteConfig),
      })
      showNotice('success', 'إعدادات الموقع اتحفظت')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل حفظ الإعدادات'
      showNotice('error', message)
    }
  }

  async function handleSaveAnnouncement() {
    try {
      await adminFetch<AnnouncementForm>('/api/announcement', {
        method: 'POST',
        body: JSON.stringify(announcement),
      })
      showNotice('success', 'الإعلان اتحفظ')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل حفظ الإعلان'
      showNotice('error', message)
    }
  }

  return (
    <div className="admin-shell min-h-screen px-4 py-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <div className="admin-hero mb-6 flex flex-col gap-4 rounded-[32px] p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--neon-cyan)]">Boox Control Center</p>
            <h1 className="mt-2 text-3xl font-black text-white lg:text-5xl">لوحة الإدارة</h1>
            <p className="mt-2 text-sm text-gray-400">إدارة متزامنة للمنتجات والطلبات والصيانة والمحتوى من Supabase.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-gray-300">
              <span className="admin-live-pill">Live DB</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{visibleStoreProducts.length} منتج ظاهر للعميل</span>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-amber-200">{activeRequestsCount} طلب خدمة مفتوح</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['dashboard', 'products', 'orders', 'maintenance', 'trade', 'settings', 'logs'] as AdminTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {{
                  dashboard: 'الإحصائيات',
                  products: 'المنتجات',
                  orders: 'الطلبات',
                  maintenance: 'الصيانة',
                  trade: 'الاستبدال',
                  settings: 'الإعدادات',
                  logs: 'سجل الأدمن',
                }[tab]}
              </button>
            ))}
            <form action="/auth/logout" method="post">
              <button type="submit" className="admin-logout-btn">
                خروج
              </button>
            </form>
          </div>
        </div>

        {notice ? (
          <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : notice.type === 'error'
                ? 'border-red-500/30 bg-red-500/10 text-red-300'
                : 'border-white/10 bg-white/5 text-white'
          }`}>
            {notice.message}
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'منتجات فعالة', value: stats.active_products },
            { label: 'إجمالي المنتجات', value: stats.total_products },
            { label: 'طلبات معلقة', value: stats.pending_orders },
            { label: 'إجمالي الطلبات', value: stats.total_orders },
            { label: 'طلبات مكتملة', value: stats.completed_orders },
          ].map((item) => (
            <div key={item.label} className="admin-stat-card rounded-[28px] p-5">
              <div className="text-sm text-gray-400">{item.label}</div>
              <div className="mt-2 text-3xl font-black text-white">{item.value}</div>
            </div>
          ))}
        </div>

        {loading ? <div className="rounded-3xl border border-white/10 bg-[#0b1018] p-8 text-center text-white">جاري تحميل بيانات الإدارة...</div> : null}

        {!loading && activeTab === 'dashboard' ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="admin-panel-card rounded-[32px] p-6">
              <h2 className="text-xl font-black text-white">ملخص سريع</h2>
              <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                <div className="admin-mini-metric">
                  <span>ظاهر في الموقع</span>
                  <strong>{visibleStoreProducts.length}</strong>
                </div>
                <div className="admin-mini-metric">
                  <span>منتجات مميزة</span>
                  <strong>{featuredProducts.length}</strong>
                </div>
                <div className="admin-mini-metric">
                  <span>طلبات محتاجة متابعة</span>
                  <strong>{orders.filter((order) => order.status === 'pending').length}</strong>
                </div>
                <div className="admin-mini-metric">
                  <span>قيمة المخزون التقريبية</span>
                  <strong>{estimatedInventoryValue.toLocaleString('ar-EG')} ج</strong>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
                أحدث قسم متاح: <strong className="text-white">{categories[0]?.name_ar ?? '—'}</strong>
              </div>
            </div>
            <div className="admin-panel-card rounded-[32px] p-6">
              <h2 className="text-xl font-black text-white">آخر نشاط</h2>
              <div className="mt-4 space-y-3">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-bold text-white">{log.action}</div>
                    <div className="mt-1 text-xs text-gray-400">{new Date(log.performed_at).toLocaleString('ar-EG')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'products' ? (
          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <form onSubmit={handleSaveProduct} className="admin-panel-card rounded-[32px] p-6">
              <h2 className="text-2xl font-black text-white">إضافة منتج جديد</h2>
              <p className="mt-2 text-sm text-gray-400">كل منتج يتم حفظه هنا يظهر مباشرة في واجهة المتجر حسب حالة الظهور والتفعيل.</p>
              <div className="mt-5 space-y-4">
                <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="اسم المنتج" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="وصف المنتج" className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={productForm.price}
                    onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="السعر"
                    disabled={productForm.price_on_inquiry}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none disabled:opacity-40"
                  />
                  <input value={productForm.original_price} onChange={(event) => setProductForm((current) => ({ ...current, original_price: event.target.value }))} placeholder="السعر قبل الخصم" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name_ar}
                      </option>
                    ))}
                  </select>
                  <input value={productForm.model} onChange={(event) => setProductForm((current) => ({ ...current, model: event.target.value }))} placeholder="الموديل" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={productForm.storage_size} onChange={(event) => setProductForm((current) => ({ ...current, storage_size: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                    {STORAGE_OPTIONS.map((storage) => (
                      <option key={storage} value={storage}>
                        {storage}
                      </option>
                    ))}
                  </select>
                  <input value={productForm.color} onChange={(event) => setProductForm((current) => ({ ...current, color: event.target.value }))} placeholder="اللون" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={productForm.condition} onChange={(event) => setProductForm((current) => ({ ...current, condition: event.target.value as ProductCondition }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                    {(Object.entries(CONDITION_LABELS) as Array<[ProductCondition, string]>).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input value={productForm.battery_health} onChange={(event) => setProductForm((current) => ({ ...current, battery_health: event.target.value }))} placeholder="البطارية %" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={productForm.grade} onChange={(event) => setProductForm((current) => ({ ...current, grade: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <input value={productForm.tax_value} onChange={(event) => setProductForm((current) => ({ ...current, tax_value: event.target.value }))} placeholder="قيمة الضريبة" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                </div>
                <label className="block rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-gray-300">
                  صور المنتج
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="mt-3 block w-full text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[var(--neon-cyan)] file:px-4 file:py-2 file:font-bold file:text-black"
                    onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3 text-sm text-white">
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" checked={productForm.price_on_inquiry} onChange={(event) => setProductForm((current) => ({ ...current, price_on_inquiry: event.target.checked }))} />
                    السعر عند الطلب
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" checked={productForm.in_stock} onChange={(event) => setProductForm((current) => ({ ...current, in_stock: event.target.checked }))} />
                    متاح
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" checked={productForm.is_featured} onChange={(event) => setProductForm((current) => ({ ...current, is_featured: event.target.checked }))} />
                    مميز
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" checked={productForm.is_visible} onChange={(event) => setProductForm((current) => ({ ...current, is_visible: event.target.checked }))} />
                    ظاهر في الموقع
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" checked={productForm.is_available} onChange={(event) => setProductForm((current) => ({ ...current, is_available: event.target.checked }))} />
                    مفعل
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" checked={productForm.is_tax_exempt} onChange={(event) => setProductForm((current) => ({ ...current, is_tax_exempt: event.target.checked }))} />
                    معفي من الضريبة
                  </label>
                </div>

                {selectedFiles.length > 0 ? <div className="text-sm text-gray-400">عدد الصور المختارة: {selectedFiles.length}</div> : null}

                <button type="submit" disabled={savingProduct} className="w-full rounded-2xl bg-[var(--neon-cyan)] px-4 py-4 font-black text-black disabled:opacity-60">
                  {savingProduct ? 'جاري رفع الصور وحفظ المنتج...' : 'حفظ المنتج'}
                </button>
              </div>
            </form>

            <div className="admin-panel-card rounded-[32px] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">المنتجات الحالية</h2>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/5 px-3 py-2 text-gray-300">{products.length} إجمالي</span>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-emerald-300">{visibleStoreProducts.length} ظاهر</span>
                  <span className="rounded-full bg-amber-500/10 px-3 py-2 text-amber-200">{productsNeedingAttention.length} يحتاج مراجعة</span>
                </div>
              </div>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="admin-product-row flex flex-col gap-3 rounded-3xl p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} width={64} height={64} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-bold text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">
                          {product.category_name_ar ?? CATEGORY_LABELS[product.category] ?? product.category} • {product.storage_size} • {product.color}
                        </div>
                        <div className="mt-1 text-sm text-[var(--neon-cyan)]">
                          {product.price_on_inquiry || product.price === null ? 'السعر عند الطلب' : `${product.price.toLocaleString('ar-EG')} جنيه`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-2 text-xs font-bold ${product.is_available ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-gray-300'}`}>
                        {product.is_available ? 'مفعل' : 'متوقف'}
                      </span>
                      <span className={`rounded-full px-3 py-2 text-xs font-bold ${product.is_visible ? 'bg-cyan-500/10 text-cyan-200' : 'bg-amber-500/10 text-amber-200'}`}>
                        {product.is_visible ? 'ظاهر' : 'مخفي'}
                      </span>
                      <span className={`rounded-full px-3 py-2 text-xs font-bold ${product.in_stock ? 'bg-indigo-500/10 text-indigo-200' : 'bg-red-500/10 text-red-300'}`}>
                        {product.in_stock ? 'متوفر' : 'نفد'}
                      </span>
                      <button onClick={() => void handleDeleteProduct(product.id)} className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300">
                        إخفاء
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'orders' ? (
          <div className="rounded-[32px] border border-white/10 bg-[#0b1018] p-6">
            <h2 className="text-2xl font-black text-white">إدارة الطلبات</h2>
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="font-bold text-white">{order.customer_name}</div>
                      <div className="text-sm text-gray-400">{order.customer_phone}</div>
                      <div className="mt-1 text-sm text-gray-300">المنتج: {order.product_name ?? 'غير محدد'} • الكمية: {order.quantity}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={order.status}
                        onChange={(event) => void handleOrderStatusChange(order.id, event.target.value as OrderStatus)}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      >
                        {ORDER_STATUS_OPTIONS.map((statusOption) => (
                          <option key={statusOption.value} value={statusOption.value}>
                            {statusOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleString('ar-EG')}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'maintenance' ? (
          <div className="rounded-[32px] border border-white/10 bg-[#0b1018] p-6">
            <h2 className="text-2xl font-black text-white">طلبات الصيانة</h2>
            <div className="mt-5 space-y-4">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="font-bold text-white">{request.customer_name} • {request.device_model}</div>
                  <div className="mt-2 text-sm text-gray-300">{request.issue_description}</div>
                  <div className="mt-2 text-xs text-gray-500">{request.customer_phone} • {request.status}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'trade' ? (
          <div className="rounded-[32px] border border-white/10 bg-[#0b1018] p-6">
            <h2 className="text-2xl font-black text-white">طلبات الاستبدال</h2>
            <div className="mt-5 space-y-4">
              {tradeRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="font-bold text-white">{request.customer_name}</div>
                  <div className="mt-2 text-sm text-gray-300">معاه: {request.device_model} • مطلوب: {request.desired_model ?? 'غير محدد'}</div>
                  <div className="mt-2 text-xs text-gray-500">{request.customer_phone} • {request.status}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'settings' ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[32px] border border-white/10 bg-[#0b1018] p-6">
              <h2 className="text-2xl font-black text-white">إعدادات الموقع</h2>
              <div className="mt-5 space-y-4">
                {(
                  [
                    ['hero_title', 'العنوان الرئيسي'],
                    ['hero_slogan_line1', 'السطر الأول'],
                    ['hero_slogan_line2', 'السطر الثاني'],
                    ['whatsapp_number', 'رقم واتساب'],
                    ['maps_url', 'رابط الخريطة'],
                    ['instagram_url', 'إنستجرام'],
                    ['facebook_url', 'فيسبوك'],
                    ['tiktok_url', 'تيك توك'],
                  ] as Array<[keyof SiteConfigForm, string]>
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm text-gray-400">{label}</label>
                    <input
                      value={siteConfig[key]}
                      onChange={(event) => setSiteConfig((current) => ({ ...current, [key]: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                    />
                  </div>
                ))}
                <button onClick={() => void handleSaveSiteConfig()} className="w-full rounded-2xl bg-[var(--neon-cyan)] px-4 py-4 font-black text-black">
                  حفظ إعدادات الموقع
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#0b1018] p-6">
              <h2 className="text-2xl font-black text-white">شريط الإعلان</h2>
              <div className="mt-5 space-y-4">
                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  <input
                    type="checkbox"
                    checked={announcement.is_visible}
                    onChange={(event) => setAnnouncement((current) => ({ ...current, is_visible: event.target.checked }))}
                  />
                  إظهار الإعلان
                </label>
                <textarea
                  value={announcement.text}
                  onChange={(event) => setAnnouncement((current) => ({ ...current, text: event.target.value }))}
                  placeholder="اكتب نص الإعلان"
                  className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <label className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                    لون الخلفية
                    <input type="color" value={announcement.bg_color} onChange={(event) => setAnnouncement((current) => ({ ...current, bg_color: event.target.value }))} className="mt-3 block h-12 w-full rounded-xl border-0 bg-transparent" />
                  </label>
                  <label className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                    لون الخط
                    <input type="color" value={announcement.text_color} onChange={(event) => setAnnouncement((current) => ({ ...current, text_color: event.target.value }))} className="mt-3 block h-12 w-full rounded-xl border-0 bg-transparent" />
                  </label>
                </div>
                <button onClick={() => void handleSaveAnnouncement()} className="w-full rounded-2xl bg-white px-4 py-4 font-black text-black">
                  حفظ الإعلان
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'logs' ? (
          <div className="rounded-[32px] border border-white/10 bg-[#0b1018] p-6">
            <h2 className="text-2xl font-black text-white">سجل نشاط الأدمن</h2>
            <div className="mt-5 space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="mt-1 text-sm text-gray-400">{log.entity_type ?? 'عام'}</div>
                  <div className="mt-2 text-xs text-gray-500">{new Date(log.performed_at).toLocaleString('ar-EG')}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
