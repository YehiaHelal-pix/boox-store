'use client'
import { useEffect, useMemo, useState } from 'react'
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
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' },
]

const TAB_CONFIG: Array<{ id: AdminTab; label: string; icon: string }> = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
  { id: 'products', label: 'المنتجات', icon: '📦' },
  { id: 'orders', label: 'الطلبات', icon: '🛒' },
  { id: 'maintenance', label: 'الصيانة', icon: '🔧' },
  { id: 'trade', label: 'الاستبدال', icon: '🔄' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  { id: 'logs', label: 'السجل', icon: '📋' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  shipped: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
  in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  reviewed: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'معلق',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  in_progress: 'قيد التنفيذ',
  reviewed: 'تمت المراجعة',
  completed: 'مكتمل',
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

function InputField({ label, value, onChange, placeholder, type = 'text', disabled = false }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div>
      {label ? <label className="admin-label">{label}</label> : null}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="admin-input"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, children }: {
  label?: string; value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <div>
      {label ? <label className="admin-label">{label}</label> : null}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="admin-input">
        {children}
      </select>
    </div>
  )
}

function CheckboxField({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="admin-checkbox">
      <div className={`admin-checkbox-box ${checked ? 'active' : ''}`}>
        {checked ? <span>✓</span> : null}
      </div>
      <span>{label}</span>
    </label>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  )
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const visibleProducts = useMemo(() => products.filter((product) => product.is_available), [products])

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
      showNotice('success', 'تم حفظ المنتج بنجاح')
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
      showNotice('success', 'تم إخفاء المنتج')
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
      showNotice('success', 'تم تحديث حالة الطلب')
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
      showNotice('success', 'تم حفظ إعدادات الموقع')
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
      showNotice('success', 'تم حفظ الإعلان')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل حفظ الإعلان'
      showNotice('error', message)
    }
  }

  return (
    <div className="admin-layout" dir="rtl">
      {/* Mobile sidebar overlay */}
      {sidebarOpen ? (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      ) : null}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-icon">B</div>
            <div>
              <div className="admin-brand-name">Boox Store</div>
              <div className="admin-brand-role">لوحة الإدارة</div>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'orders' && stats.pending_orders > 0 ? (
                <span className="admin-nav-badge">{stats.pending_orders}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <form action="/auth/logout" method="post">
            <button type="submit" className="admin-logout-btn">
              🚪 تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button onClick={() => setSidebarOpen(true)} className="admin-menu-btn lg:hidden">
            ☰
          </button>
          <div>
            <h1 className="admin-page-title">
              {TAB_CONFIG.find((t) => t.id === activeTab)?.icon}{' '}
              {TAB_CONFIG.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          <button onClick={() => void loadAdminData()} className="admin-refresh-btn" title="تحديث البيانات">
            ↻
          </button>
        </header>

        {/* Notice */}
        {notice ? (
          <div className={`admin-notice ${notice.type}`}>
            <span>{notice.type === 'success' ? '✓' : notice.type === 'error' ? '✕' : 'ℹ'}</span>
            {notice.message}
          </div>
        ) : null}

        {/* Loading */}
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>جاري تحميل البيانات...</span>
          </div>
        ) : null}

        {/* Dashboard Tab */}
        {!loading && activeTab === 'dashboard' ? (
          <div className="admin-content-area">
            <div className="admin-stats-grid">
              <StatCard label="منتجات فعالة" value={stats.active_products} color="bg-emerald-500/20 text-emerald-400" icon="📦" />
              <StatCard label="إجمالي المنتجات" value={stats.total_products} color="bg-blue-500/20 text-blue-400" icon="🏷️" />
              <StatCard label="طلبات معلقة" value={stats.pending_orders} color="bg-amber-500/20 text-amber-400" icon="⏳" />
              <StatCard label="إجمالي الطلبات" value={stats.total_orders} color="bg-purple-500/20 text-purple-400" icon="📋" />
              <StatCard label="طلبات مكتملة" value={stats.completed_orders} color="bg-cyan-500/20 text-cyan-400" icon="✅" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mt-6">
              <div className="admin-card">
                <h3 className="admin-card-title">ملخص سريع</h3>
                <div className="admin-summary-list">
                  <div className="admin-summary-item">
                    <span className="admin-summary-dot bg-emerald-400" />
                    <span>المنتجات المعروضة حالياً</span>
                    <span className="admin-summary-value">{visibleProducts.length}</span>
                  </div>
                  <div className="admin-summary-item">
                    <span className="admin-summary-dot bg-amber-400" />
                    <span>طلبات تحتاج متابعة</span>
                    <span className="admin-summary-value">{orders.filter((o) => o.status === 'pending').length}</span>
                  </div>
                  <div className="admin-summary-item">
                    <span className="admin-summary-dot bg-blue-400" />
                    <span>طلبات صيانة</span>
                    <span className="admin-summary-value">{maintenanceRequests.length}</span>
                  </div>
                  <div className="admin-summary-item">
                    <span className="admin-summary-dot bg-purple-400" />
                    <span>طلبات استبدال</span>
                    <span className="admin-summary-value">{tradeRequests.length}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <h3 className="admin-card-title">آخر نشاط</h3>
                <div className="admin-activity-list">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="admin-activity-item">
                      <div className="admin-activity-dot" />
                      <div>
                        <div className="text-sm font-semibold text-white">{log.action}</div>
                        <div className="text-xs text-gray-500">{new Date(log.performed_at).toLocaleString('ar-EG')}</div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 ? <p className="text-sm text-gray-500">لا يوجد نشاط حتى الآن</p> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Products Tab */}
        {!loading && activeTab === 'products' ? (
          <div className="admin-content-area">
            <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
              {/* Add Product Form */}
              <div className="admin-card">
                <h3 className="admin-card-title">إضافة منتج جديد</h3>
                <form onSubmit={handleSaveProduct} className="admin-form">
                  <InputField value={productForm.name} onChange={(v) => setProductForm((c) => ({ ...c, name: v }))} placeholder="اسم المنتج" />
                  <div>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm((c) => ({ ...c, description: e.target.value }))}
                      placeholder="وصف المنتج"
                      className="admin-input min-h-24 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="السعر"
                      value={productForm.price}
                      onChange={(v) => setProductForm((c) => ({ ...c, price: v }))}
                      placeholder="0"
                      type="number"
                      disabled={productForm.price_on_inquiry}
                    />
                    <InputField
                      label="السعر قبل الخصم"
                      value={productForm.original_price}
                      onChange={(v) => setProductForm((c) => ({ ...c, original_price: v }))}
                      placeholder="0"
                      type="number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="القسم" value={productForm.category} onChange={(v) => setProductForm((c) => ({ ...c, category: v }))}>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>{cat.name_ar}</option>
                      ))}
                    </SelectField>
                    <InputField label="الموديل" value={productForm.model} onChange={(v) => setProductForm((c) => ({ ...c, model: v }))} placeholder="مثال: iPhone 15 Pro" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="السعة" value={productForm.storage_size} onChange={(v) => setProductForm((c) => ({ ...c, storage_size: v }))}>
                      {STORAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </SelectField>
                    <InputField label="اللون" value={productForm.color} onChange={(v) => setProductForm((c) => ({ ...c, color: v }))} placeholder="أسود" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="الحالة" value={productForm.condition} onChange={(v) => setProductForm((c) => ({ ...c, condition: v as ProductCondition }))}>
                      {(Object.entries(CONDITION_LABELS) as Array<[ProductCondition, string]>).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </SelectField>
                    <InputField label="صحة البطارية %" value={productForm.battery_health} onChange={(v) => setProductForm((c) => ({ ...c, battery_health: v }))} placeholder="100" type="number" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="الدرجة" value={productForm.grade} onChange={(v) => setProductForm((c) => ({ ...c, grade: v }))}>
                      {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </SelectField>
                    <InputField label="قيمة الضريبة" value={productForm.tax_value} onChange={(v) => setProductForm((c) => ({ ...c, tax_value: v }))} placeholder="0" type="number" />
                  </div>

                  {/* Image upload */}
                  <div className="admin-file-upload">
                    <div className="admin-file-upload-inner">
                      <span className="text-2xl">📷</span>
                      <span className="text-sm text-gray-400">اسحب الصور هنا أو اضغط للاختيار</span>
                      {selectedFiles.length > 0 ? <span className="text-xs text-cyan-400">{selectedFiles.length} صور مختارة</span> : null}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="admin-toggles-grid">
                    <CheckboxField label="السعر عند الطلب" checked={productForm.price_on_inquiry} onChange={(v) => setProductForm((c) => ({ ...c, price_on_inquiry: v }))} />
                    <CheckboxField label="متاح في المخزن" checked={productForm.in_stock} onChange={(v) => setProductForm((c) => ({ ...c, in_stock: v }))} />
                    <CheckboxField label="منتج مميز" checked={productForm.is_featured} onChange={(v) => setProductForm((c) => ({ ...c, is_featured: v }))} />
                    <CheckboxField label="ظاهر في الموقع" checked={productForm.is_visible} onChange={(v) => setProductForm((c) => ({ ...c, is_visible: v }))} />
                    <CheckboxField label="مفعل" checked={productForm.is_available} onChange={(v) => setProductForm((c) => ({ ...c, is_available: v }))} />
                    <CheckboxField label="معفي من الضريبة" checked={productForm.is_tax_exempt} onChange={(v) => setProductForm((c) => ({ ...c, is_tax_exempt: v }))} />
                  </div>

                  <button type="submit" disabled={savingProduct} className="admin-submit-btn">
                    {savingProduct ? 'جاري الحفظ...' : '+ حفظ المنتج'}
                  </button>
                </form>
              </div>

              {/* Products List */}
              <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="admin-card-title mb-0">المنتجات الحالية</h3>
                  <span className="admin-badge">{products.length} منتج</span>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>المنتج</th>
                        <th>القسم</th>
                        <th>السعر</th>
                        <th>الحالة</th>
                        <th>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="admin-product-cell">
                              <div className="admin-product-thumb">
                                {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>📦</span>}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.storage_size} • {product.color}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-sm text-gray-400">{product.category_name_ar ?? CATEGORY_LABELS[product.category] ?? product.category}</td>
                          <td className="text-sm font-semibold text-cyan-400">
                            {product.price_on_inquiry || product.price === null ? 'عند الطلب' : `${product.price.toLocaleString('ar-EG')} ج.م`}
                          </td>
                          <td>
                            <span className={`admin-status-badge ${product.is_available ? 'active' : 'inactive'}`}>
                              {product.is_available ? 'مفعل' : 'متوقف'}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => void handleDeleteProduct(product.id)} className="admin-action-btn danger">
                              إخفاء
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Orders Tab */}
        {!loading && activeTab === 'orders' ? (
          <div className="admin-content-area">
            <div className="admin-card">
              <h3 className="admin-card-title">إدارة الطلبات</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>العميل</th>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="font-semibold text-white text-sm">{order.customer_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5" dir="ltr">{order.customer_phone}</div>
                        </td>
                        <td className="text-sm text-gray-300">{order.product_name ?? 'غير محدد'}</td>
                        <td className="text-sm text-gray-400">{order.quantity}</td>
                        <td className="text-sm font-semibold text-cyan-400">
                          {order.total_price ? `${order.total_price.toLocaleString('ar-EG')} ج.م` : '—'}
                        </td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => void handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`admin-status-select ${STATUS_COLORS[order.status] ?? ''}`}
                          >
                            {ORDER_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 ? <p className="text-center text-gray-500 py-8">لا توجد طلبات</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Maintenance Tab */}
        {!loading && activeTab === 'maintenance' ? (
          <div className="admin-content-area">
            <div className="admin-card">
              <h3 className="admin-card-title">طلبات الصيانة</h3>
              <div className="admin-requests-grid">
                {maintenanceRequests.map((req) => (
                  <div key={req.id} className="admin-request-card">
                    <div className="admin-request-header">
                      <div>
                        <div className="font-semibold text-white">{req.customer_name}</div>
                        <div className="text-xs text-gray-500 mt-1" dir="ltr">{req.customer_phone}</div>
                      </div>
                      <span className={`admin-status-pill ${STATUS_COLORS[req.status] ?? 'bg-gray-500/15 text-gray-300'}`}>
                        {STATUS_LABELS[req.status] ?? req.status}
                      </span>
                    </div>
                    <div className="admin-request-body">
                      <div className="admin-request-device">🔧 {req.device_model}</div>
                      <p className="text-sm text-gray-400 mt-2">{req.issue_description}</p>
                    </div>
                    <div className="admin-request-footer">
                      <span className="text-xs text-gray-600">{new Date(req.created_at).toLocaleDateString('ar-EG')}</span>
                      {req.estimated_cost ? <span className="text-xs text-cyan-400">التكلفة: {req.estimated_cost} ج.م</span> : null}
                    </div>
                  </div>
                ))}
                {maintenanceRequests.length === 0 ? <p className="text-center text-gray-500 py-8 col-span-full">لا توجد طلبات صيانة</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Trade Tab */}
        {!loading && activeTab === 'trade' ? (
          <div className="admin-content-area">
            <div className="admin-card">
              <h3 className="admin-card-title">طلبات الاستبدال</h3>
              <div className="admin-requests-grid">
                {tradeRequests.map((req) => (
                  <div key={req.id} className="admin-request-card">
                    <div className="admin-request-header">
                      <div>
                        <div className="font-semibold text-white">{req.customer_name}</div>
                        <div className="text-xs text-gray-500 mt-1" dir="ltr">{req.customer_phone}</div>
                      </div>
                      <span className={`admin-status-pill ${STATUS_COLORS[req.status] ?? 'bg-gray-500/15 text-gray-300'}`}>
                        {STATUS_LABELS[req.status] ?? req.status}
                      </span>
                    </div>
                    <div className="admin-request-body">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">معاه:</span>
                        <span className="text-white font-medium">{req.device_model}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="text-gray-400">يريد:</span>
                        <span className="text-cyan-400 font-medium">{req.desired_model ?? 'غير محدد'}</span>
                      </div>
                      {typeof req.battery_health === 'number' ? (
                        <div className="text-xs text-gray-500 mt-2">البطارية: {req.battery_health}%</div>
                      ) : null}
                    </div>
                    <div className="admin-request-footer">
                      <span className="text-xs text-gray-600">{new Date(req.created_at).toLocaleDateString('ar-EG')}</span>
                      {req.offered_price ? <span className="text-xs text-emerald-400">العرض: {req.offered_price} ج.م</span> : null}
                    </div>
                  </div>
                ))}
                {tradeRequests.length === 0 ? <p className="text-center text-gray-500 py-8 col-span-full">لا توجد طلبات استبدال</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Settings Tab */}
        {!loading && activeTab === 'settings' ? (
          <div className="admin-content-area">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="admin-card">
                <h3 className="admin-card-title">إعدادات الموقع</h3>
                <div className="admin-form">
                  {(
                    [
                      ['hero_title', 'العنوان الرئيسي'],
                      ['hero_slogan_line1', 'الشعار - السطر الأول'],
                      ['hero_slogan_line2', 'الشعار - السطر الثاني'],
                      ['whatsapp_number', 'رقم واتساب'],
                      ['maps_url', 'رابط الخريطة'],
                      ['instagram_url', 'إنستجرام'],
                      ['facebook_url', 'فيسبوك'],
                      ['tiktok_url', 'تيك توك'],
                    ] as Array<[keyof SiteConfigForm, string]>
                  ).map(([key, label]) => (
                    <InputField
                      key={key}
                      label={label}
                      value={siteConfig[key]}
                      onChange={(v) => setSiteConfig((c) => ({ ...c, [key]: v }))}
                    />
                  ))}
                  <button onClick={() => void handleSaveSiteConfig()} className="admin-submit-btn">
                    حفظ إعدادات الموقع
                  </button>
                </div>
              </div>

              <div className="admin-card">
                <h3 className="admin-card-title">شريط الإعلان</h3>
                <div className="admin-form">
                  <CheckboxField
                    label="إظهار شريط الإعلان"
                    checked={announcement.is_visible}
                    onChange={(v) => setAnnouncement((c) => ({ ...c, is_visible: v }))}
                  />
                  <div>
                    <label className="admin-label">نص الإعلان</label>
                    <textarea
                      value={announcement.text}
                      onChange={(e) => setAnnouncement((c) => ({ ...c, text: e.target.value }))}
                      placeholder="اكتب نص الإعلان هنا..."
                      className="admin-input min-h-28 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">لون الخلفية</label>
                      <div className="admin-color-pick">
                        <input
                          type="color"
                          value={announcement.bg_color}
                          onChange={(e) => setAnnouncement((c) => ({ ...c, bg_color: e.target.value }))}
                          className="admin-color-input"
                        />
                        <span className="text-sm text-gray-400">{announcement.bg_color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="admin-label">لون النص</label>
                      <div className="admin-color-pick">
                        <input
                          type="color"
                          value={announcement.text_color}
                          onChange={(e) => setAnnouncement((c) => ({ ...c, text_color: e.target.value }))}
                          className="admin-color-input"
                        />
                        <span className="text-sm text-gray-400">{announcement.text_color}</span>
                      </div>
                    </div>
                  </div>

                  {announcement.text ? (
                    <div className="admin-announcement-preview" style={{ background: announcement.bg_color, color: announcement.text_color }}>
                      <span className="text-xs opacity-60 mb-1 block">معاينة:</span>
                      {announcement.text}
                    </div>
                  ) : null}

                  <button onClick={() => void handleSaveAnnouncement()} className="admin-submit-btn secondary">
                    حفظ الإعلان
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Logs Tab */}
        {!loading && activeTab === 'logs' ? (
          <div className="admin-content-area">
            <div className="admin-card">
              <h3 className="admin-card-title">سجل نشاط الأدمن</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الإجراء</th>
                      <th>النوع</th>
                      <th>التاريخ والوقت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="font-medium text-white text-sm">{log.action}</td>
                        <td className="text-sm text-gray-400">{log.entity_type ?? 'عام'}</td>
                        <td className="text-sm text-gray-500">{new Date(log.performed_at).toLocaleString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 ? <p className="text-center text-gray-500 py-8">لا يوجد سجل نشاط</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
