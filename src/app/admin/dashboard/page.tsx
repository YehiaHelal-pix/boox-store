'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  Package2,
  ShoppingBag,
  Wrench,
  RefreshCcw,
  Settings2,
  ClipboardList,
  LogOut,
  Search,
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  UploadCloud,
  ChevronLeft,
  BellRing
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORY_LABELS, CONDITION_LABELS, GRADE_OPTIONS, STORAGE_OPTIONS } from '@/lib/products'
import {
  IPHONE_MODELS, IPAD_MODELS, MACBOOK_MODELS, WATCH_MODELS,
  ACCESSORY_TYPES, PERIPHERAL_TYPES, DEVICE_CONDITIONS,
  getModelsByCategory, getStorageForModel, getColorsForModel,
} from '@/lib/apple-data'
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

// --- TYPES & CONSTANTS ---
type AdminTab = 'dashboard' | 'products' | 'orders' | 'maintenance' | 'trade' | 'settings' | 'logs'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'معلّق' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' },
]

const ADMIN_NAV: Array<{ key: AdminTab; label: string; icon: LucideIcon }> = [
  { key: 'dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { key: 'products', label: 'إدارة المنتجات', icon: Package2 },
  { key: 'orders', label: 'الطلبات', icon: ShoppingBag },
  { key: 'maintenance', label: 'الصيانة', icon: Wrench },
  { key: 'trade', label: 'الاستبدال', icon: RefreshCcw },
  { key: 'settings', label: 'إعدادات الموقع', icon: Settings2 },
  { key: 'logs', label: 'سجل النشاط', icon: ClipboardList },
]

// --- UI COMPONENTS ---
function SectionShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] border border-white/5 bg-[#0a0f18]/80 p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all ${className}`}>
      {children}
    </div>
  )
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-bold text-gray-400">{label}</label>
      <input
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-[var(--neon-cyan)] focus:bg-[var(--neon-cyan)]/5 disabled:opacity-50"
        {...props}
      />
    </div>
  )
}

function Select({ label, children, ...props }: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-bold text-gray-400">{label}</label>
      <select
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all focus:border-[var(--neon-cyan)] focus:bg-[var(--neon-cyan)]/5"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
      <span className="text-sm font-bold text-gray-300">{label}</span>
      <div className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-[var(--neon-cyan)]' : 'bg-white/10'}`}>
        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'left-1' : 'left-6'}`} />
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

// --- MAIN PAGE ---
export default function PremiumAdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null)

  // Data States
  const [stats, setStats] = useState<DashboardStats>({ active_products: 0, total_products: 0, pending_orders: 0, total_orders: 0, completed_orders: 0 })
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([])
  const [trade, setTrade] = useState<TradeRequest[]>([])
  const [logs, setLogs] = useState<AdminActivityLog[]>([])
  const [siteConfig, setSiteConfig] = useState<any>({})
  const [announcement, setAnnouncement] = useState<any>({})

  // Form States
  const [productForm, setProductForm] = useState<any>({})
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [savingState, setSavingState] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  // Notification System
  const [notifCount, setNotifCount] = useState(0)
  const [lastSeenOrders, setLastSeenOrders] = useState(0)
  const [lastSeenMaint, setLastSeenMaint] = useState(0)
  const [lastSeenTrade, setLastSeenTrade] = useState(0)
  const notifAudioRef = useRef<HTMLAudioElement | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function adminFetch(path: string, options?: RequestInit) {
    const res = await fetch(path, { ...options, cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'حدث خطأ')
    return data
  }

  async function loadData() {
    setLoading(true)
    try {
      const [st, pr, ct, or, mt, tr, lg, sc, an] = await Promise.all([
        adminFetch('/api/dashboard/stats'),
        adminFetch('/api/products'),
        adminFetch('/api/categories'),
        adminFetch('/api/orders'),
        adminFetch('/api/maintenance'),
        adminFetch('/api/trade'),
        adminFetch('/api/admin/activity'),
        adminFetch('/api/settings'),
        adminFetch('/api/announcement'),
      ])
      setStats(st)
      setProducts(pr)
      setCategories(ct)
      setOrders(or)
      setMaintenance(mt)
      setTrade(tr)
      setLogs(lg)
      setSiteConfig(sc)
      setAnnouncement(an)
    } catch (e: any) {
      showToast(e.message, 'error')
    }
    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  // Real-time polling for new requests every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [or, mt, tr] = await Promise.all([
          adminFetch('/api/orders'),
          adminFetch('/api/maintenance'),
          adminFetch('/api/trade'),
        ])
        const newOrders = Array.isArray(or) ? or.length : 0
        const newMaint = Array.isArray(mt) ? mt.length : 0
        const newTrade = Array.isArray(tr) ? tr.length : 0

        const diff = Math.max(0, (newOrders - lastSeenOrders) + (newMaint - lastSeenMaint) + (newTrade - lastSeenTrade))
        if (diff > 0 && lastSeenOrders > 0) {
          setNotifCount(prev => prev + diff)
          // Play notification sound
          try {
            if (!notifAudioRef.current) {
              notifAudioRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19teleWQVZFZm10IBAAAABBAAEAgD4AAIA+AAABAAgAZGF0YQ==')
            }
            notifAudioRef.current.play().catch(() => {})
          } catch {}
          showToast(`🔔 فيه ${diff} طلبات جديدة!`, 'success')
        }
        setLastSeenOrders(newOrders)
        setLastSeenMaint(newMaint)
        setLastSeenTrade(newTrade)
        setOrders(Array.isArray(or) ? or : [])
        setMaintenance(Array.isArray(mt) ? mt : [])
        setTrade(Array.isArray(tr) ? tr : [])
      } catch {}
    }, 30000)

    return () => clearInterval(interval)
  }, [lastSeenOrders, lastSeenMaint, lastSeenTrade])

  // Initialize seen counts
  useEffect(() => {
    setLastSeenOrders(orders.length)
    setLastSeenMaint(maintenance.length)
    setLastSeenTrade(trade.length)
  }, [loading])

  useEffect(() => {
    const tab = searchParams.get('tab') as AdminTab
    if (ADMIN_NAV.some(n => n.key === tab)) setActiveTab(tab)
  }, [searchParams])

  function setTab(tab: AdminTab) {
    setActiveTab(tab)
    router.replace(`/admin/dashboard?tab=${tab}`, { scroll: false })
  }

  const resetForm = () => {
    setEditingProductId(null)
    setExistingImages([])
    setSelectedFiles([])
    setProductForm({
      name: '', description: '', price: '', original_price: '', category: categories[0]?.slug || 'iphone',
      model: '', storage_size: '', color: '', condition: 'like_new', sub_type: '',
      battery_health: '', grade: 'A', price_on_inquiry: false, in_stock: true,
      is_featured: false, is_visible: true, is_available: true, is_tax_exempt: true, tax_value: '',
      installment_available: false
    })
  }

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    try {
      const slug = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `cat-${Date.now()}`
      await adminFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: slug, name_ar: trimmed, slug }),
        headers: { 'Content-Type': 'application/json' }
      })
      showToast(`تم إضافة قسم "${trimmed}" بنجاح`, 'success')
      setNewCategoryName('')
      setShowNewCategory(false)
      await loadData()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  useEffect(() => { if (!editingProductId) resetForm() }, [])

  const handleEdit = (p: Product) => {
    setEditingProductId(p.id)
    setExistingImages(p.images || [])
    setSelectedFiles([])
    setProductForm({
      name: p.name, description: p.description || '', price: p.price ?? '', original_price: p.original_price ?? '',
      category: p.category, model: p.model, storage_size: p.storage_size, color: p.color, condition: p.condition,
      battery_health: p.battery_health ?? '', grade: p.grade ?? 'A', price_on_inquiry: p.price_on_inquiry,
      in_stock: p.in_stock, is_featured: p.is_featured, is_visible: p.is_visible, is_available: p.is_available,
      is_tax_exempt: p.is_tax_exempt, tax_value: p.tax_value ?? '', sub_type: (p as any).sub_type ?? '',
      installment_available: (p as any).installment_available ?? false
    })
    setTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingState(true)
    try {
      const fd = new FormData()
      Object.entries(productForm).forEach(([k, v]) => fd.append(k, String(v)))
      existingImages.forEach(img => fd.append('existingImages', img))
      selectedFiles.forEach(f => fd.append('files', f))

      if (editingProductId) {
        await adminFetch(`/api/admin/products/${editingProductId}`, { method: 'PUT', body: fd })
        showToast('تم تحديث المنتج بنجاح', 'success')
      } else {
        await adminFetch('/api/admin/products', { method: 'POST', body: fd })
        showToast('تم إضافة المنتج بنجاح', 'success')
      }
      resetForm()
      await loadData()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
    setSavingState(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return
    try {
      await adminFetch(`/api/products/${id}`, { method: 'DELETE' })
      showToast('تم حذف المنتج', 'success')
      await loadData()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleSaveSettings = async () => {
    setSavingState(true)
    try {
      await adminFetch('/api/settings', { method: 'POST', body: JSON.stringify(siteConfig), headers: {'Content-Type':'application/json'} })
      await adminFetch('/api/announcement', { method: 'POST', body: JSON.stringify(announcement), headers: {'Content-Type':'application/json'} })
      showToast('تم حفظ الإعدادات بنجاح', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
    setSavingState(false)
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.model?.toLowerCase().includes(productSearch.toLowerCase()))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080e]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-[var(--neon-cyan)]"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#03050a] font-sans text-white selection:bg-[var(--neon-cyan)] selection:text-black" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--neon-cyan)]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--neon)]/10 blur-[120px]"></div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 rounded-full px-6 py-3 shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span className="font-bold text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="relative z-10 w-72 flex-shrink-0 border-l border-white/5 bg-[#070b12]/80 backdrop-blur-3xl hidden lg:flex flex-col">
        <div className="p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--neon)] to-[var(--neon-cyan)] shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight">Boox Admin</h1>
          <p className="mt-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Control Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-8">
          {ADMIN_NAV.map((item) => {
            const active = activeTab === item.key
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`relative flex w-full items-center gap-4 rounded-2xl px-4 py-4 transition-all overflow-hidden group ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {active && <div className="absolute inset-y-0 right-0 w-1 bg-[var(--neon-cyan)] shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>}
                <Icon size={20} className={active ? 'text-[var(--neon-cyan)]' : 'group-hover:text-gray-200'} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <form action="/auth/logout" method="post">
            <button type="submit" className="flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-4 text-red-400 transition hover:bg-red-500/20">
              <LogOut size={18} />
              <span className="font-bold text-sm">تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-[#03050a]/80 px-4 md:px-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--neon)] to-[var(--neon-cyan)] shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Sparkles className="text-white" size={20} />
            </div>
            <h2 className="text-lg md:text-xl font-black">
              {ADMIN_NAV.find(n => n.key === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition relative">
              <BellRing size={18} />
              {notifCount > 0 && <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-[#03050a]"></span>}
            </button>
            <div className="hidden md:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 pl-4 pr-1 py-1">
              <span className="text-sm font-bold text-gray-300 ml-2">المدير العام</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--neon)] to-[var(--neon-cyan)]"></div>
            </div>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}
        <div className="lg:hidden sticky top-20 z-30 bg-[#03050a]/90 backdrop-blur-md border-b border-white/5 overflow-x-auto hide-scrollbar">
          <div className="flex px-4 py-3 gap-2 min-w-max">
            {ADMIN_NAV.map((item) => {
              const active = activeTab === item.key
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${active ? 'bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
                >
                  <Icon size={16} />
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Stat Cards — Vertical Compact */}
              <div className="grid gap-4 grid-cols-2">
                {[
                  { l: 'إجمالي المنتجات', v: stats.total_products, c: 'border-blue-500/30', t: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { l: 'الطلبات المكتملة', v: stats.completed_orders, c: 'border-emerald-500/30', t: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { l: 'الطلبات المعلقة', v: stats.pending_orders, c: 'border-amber-500/30', t: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { l: 'منتجات غير مفعلة', v: stats.total_products - stats.active_products, c: 'border-rose-500/30', t: 'text-rose-400', bg: 'bg-rose-500/10' },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl border ${s.c} ${s.bg} backdrop-blur-md p-5 text-center`}>
                    <div className="text-xs font-bold text-gray-400 mb-2">{s.l}</div>
                    <div className={`text-3xl font-black ${s.t}`}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Recent Activity — Compact Cards */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0f18]/80 backdrop-blur-2xl p-6">
                <h3 className="text-lg font-black mb-5 flex items-center gap-3">
                  <ClipboardList className="text-[var(--neon-cyan)]" size={20} /> أحدث النشاطات
                </h3>
                <div className="space-y-3">
                  {logs.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition group">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-200 truncate">{log.action}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{log.entity_type || 'نظام'} · {new Date(log.performed_at).toLocaleDateString('en-GB')}</div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await adminFetch(`/api/admin/activity/${log.id}`, { method: 'DELETE' })
                            setLogs(prev => prev.filter(l => l.id !== log.id))
                            showToast('تم حذف السجل', 'success')
                          } catch (err: any) { showToast(err.message, 'error') }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition mr-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-center text-gray-500 text-sm py-6">لا توجد نشاطات بعد</p>}
                </div>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black">سجل النشاطات</h3>
                {logs.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm('هل تريد حذف كل سجلات النشاط؟')) return
                      try {
                        await adminFetch('/api/admin/activity', { method: 'DELETE' })
                        setLogs([])
                        showToast('تم مسح كل السجلات', 'success')
                      } catch (err: any) { showToast(err.message, 'error') }
                    }}
                    className="text-xs font-bold bg-red-500/10 text-red-400 px-4 py-2 rounded-full hover:bg-red-500/20 transition"
                  >
                    مسح الكل
                  </button>
                )}
              </div>

              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#0a0f18]/80 backdrop-blur-xl px-5 py-4 hover:border-white/10 transition group">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{log.action}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{log.entity_type || 'نظام'}</span>
                      <span className="text-[11px] text-gray-500 font-mono">{new Date(log.performed_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await adminFetch(`/api/admin/activity/${log.id}`, { method: 'DELETE' })
                        setLogs(prev => prev.filter(l => l.id !== log.id))
                        showToast('تم حذف السجل', 'success')
                      } catch (err: any) { showToast(err.message, 'error') }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition mr-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold"
                    title="حذف"
                  >
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="py-16 text-center text-gray-500 font-bold border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                  لا توجد سجلات نشاط
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="grid gap-8 lg:grid-cols-[450px_minmax(0,1fr)] items-start">
              {/* Add/Edit Form */}
              <SectionShell className="lg:sticky lg:top-28">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black">{editingProductId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                  {editingProductId && (
                    <button onClick={resetForm} className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition">إلغاء التعديل</button>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-5">
                  {/* ── Category Selection + Add New ── */}
                  <div className="space-y-2">
                    <Select label="التصنيف" value={productForm.category} onChange={e => {
                      setProductForm({...productForm, category: e.target.value, model: '', storage_size: '', color: '', sub_type: ''})
                    }}>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name_ar}</option>)}
                    </Select>
                    {!showNewCategory ? (
                      <button type="button" onClick={() => setShowNewCategory(true)} className="text-xs text-[var(--neon-cyan)] font-bold hover:underline flex items-center gap-1">
                        <Plus size={12} /> إضافة قسم جديد
                      </button>
                    ) : (
                      <div className="flex gap-2 items-end">
                        <Input label="اسم القسم الجديد" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="مثال: ساعات" />
                        <button type="button" onClick={handleAddCategory} className="shrink-0 bg-[var(--neon-cyan)] text-black px-4 py-3.5 rounded-2xl text-xs font-black hover:scale-105 transition">إضافة</button>
                        <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryName('') }} className="shrink-0 bg-white/10 text-white px-3 py-3.5 rounded-2xl text-xs font-bold hover:bg-white/20 transition">✕</button>
                      </div>
                    )}
                  </div>

                  {/* ── Dynamic Model/SubType based on Category ── */}
                  {(() => {
                    const cat = productForm.category
                    const isDevice = ['iphone', 'ipad', 'macbook'].includes(cat)
                    const isWatch = cat === 'watches' || cat === 'watch'
                    const isAccessory = cat === 'accessories'
                    const isPeripheral = cat === 'peripherals' || cat === 'ملحقات'

                    const models = getModelsByCategory(cat)
                    const selectedModel = productForm.model || ''
                    const dynamicStorages = isDevice && selectedModel ? getStorageForModel(cat, selectedModel) : []
                    const dynamicColors = isDevice && selectedModel ? getColorsForModel(cat, selectedModel) : []

                    return (
                      <>
                        {/* Device categories: iPhone, iPad, MacBook */}
                        {isDevice && (
                          <>
                            <Select label="الموديل" value={selectedModel} onChange={e => setProductForm({...productForm, model: e.target.value, storage_size: '', color: ''})}>
                              <option value="">— اختر الموديل —</option>
                              {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                            </Select>

                            {selectedModel && (
                              <div className="grid grid-cols-2 gap-4">
                                <Select label="مساحة التخزين" value={productForm.storage_size} onChange={e => setProductForm({...productForm, storage_size: e.target.value})}>
                                  <option value="">— اختر المساحة —</option>
                                  {dynamicStorages.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                                <Select label="اللون" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})}>
                                  <option value="">— اختر اللون —</option>
                                  {dynamicColors.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                              </div>
                            )}
                          </>
                        )}

                        {/* Watches */}
                        {isWatch && (
                          <>
                            <Select label="موديل الساعة" value={selectedModel} onChange={e => {
                              const w = WATCH_MODELS.find(m => m.name === e.target.value)
                              setProductForm({...productForm, model: e.target.value, color: '', storage_size: w?.sizes?.[0] || ''})
                            }}>
                              <option value="">— اختر الموديل —</option>
                              {WATCH_MODELS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                            </Select>
                            {selectedModel && (() => {
                              const w = WATCH_MODELS.find(m => m.name === selectedModel)
                              return (
                                <div className="grid grid-cols-2 gap-4">
                                  <Select label="المقاس" value={productForm.storage_size} onChange={e => setProductForm({...productForm, storage_size: e.target.value})}>
                                    {w?.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                  </Select>
                                  <Select label="اللون" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})}>
                                    <option value="">— اختر —</option>
                                    {w?.colors.map(c => <option key={c} value={c}>{c}</option>)}
                                  </Select>
                                </div>
                              )
                            })()}
                          </>
                        )}

                        {/* Accessories */}
                        {isAccessory && (
                          <>
                            <Select label="نوع الإكسسوار" value={productForm.sub_type || ''} onChange={e => setProductForm({...productForm, sub_type: e.target.value})}>
                              <option value="">— اختر النوع —</option>
                              {ACCESSORY_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </Select>
                            <Input label="الموديل / التسمية" value={productForm.model} onChange={e => setProductForm({...productForm, model: e.target.value})} placeholder="مثال: iPhone 15 Pro Max Case" />
                            <Input label="اللون" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} placeholder="مثال: Clear / Black" />
                          </>
                        )}

                        {/* Peripherals */}
                        {isPeripheral && (
                          <>
                            <Select label="نوع الملحق" value={productForm.sub_type || ''} onChange={e => setProductForm({...productForm, sub_type: e.target.value})}>
                              <option value="">— اختر النوع —</option>
                              {PERIPHERAL_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </Select>
                            <Input label="التسمية / الموديل" value={productForm.model} onChange={e => setProductForm({...productForm, model: e.target.value})} placeholder="اكتب الاسم يدوياً" />
                            <Input label="اللون" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} placeholder="مثال: White" />
                          </>
                        )}

                        {/* Fallback: Other categories */}
                        {!isDevice && !isWatch && !isAccessory && !isPeripheral && (
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="الموديل" value={productForm.model} onChange={e => setProductForm({...productForm, model: e.target.value})} />
                            <Input label="اللون" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} />
                          </div>
                        )}
                      </>
                    )
                  })()}

                  {/* ── Name & Description ── */}
                  <Input label="اسم المنتج (يظهر للعملاء)" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-400">الوصف</label>
                    <textarea rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all focus:border-[var(--neon-cyan)] focus:bg-[var(--neon-cyan)]/5" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                  </div>

                  {/* ── Price ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="السعر" type="number" value={productForm.price} disabled={productForm.price_on_inquiry} onChange={e => setProductForm({...productForm, price: e.target.value})} required={!productForm.price_on_inquiry} />
                    <Input label="السعر القديم (للخصم)" type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} />
                  </div>

                  {/* ── Condition, Grade, Battery ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="حالة الجهاز" value={productForm.condition} onChange={e => setProductForm({...productForm, condition: e.target.value})}>
                      {DEVICE_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </Select>
                    <Select label="الفئة (Grade)" value={productForm.grade} onChange={e => setProductForm({...productForm, grade: e.target.value})}>
                      {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="صحة البطارية (%)" type="number" min="0" max="100" value={productForm.battery_health} onChange={e => setProductForm({...productForm, battery_health: e.target.value})} />
                    <Select label="حالة الضريبة" value={productForm.is_tax_exempt ? 'exempt' : 'taxable'} onChange={e => setProductForm({...productForm, is_tax_exempt: e.target.value === 'exempt', tax_value: e.target.value === 'exempt' ? '' : productForm.tax_value})}>
                      <option value="exempt">معفى من الضريبة</option>
                      <option value="taxable">غير معفى (يخضع للضريبة)</option>
                    </Select>
                  </div>

                  {!productForm.is_tax_exempt && (
                    <Input label="نسبة الضريبة (%)" type="number" value={productForm.tax_value} onChange={e => setProductForm({...productForm, tax_value: e.target.value})} />
                  )}

                  {/* ── Toggles ── */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <Toggle label="متاح للبيع (In Stock)" checked={productForm.in_stock} onChange={v => setProductForm({...productForm, in_stock: v})} />
                    <Toggle label="السعر عند الاستفسار" checked={productForm.price_on_inquiry} onChange={v => setProductForm({...productForm, price_on_inquiry: v})} />
                    <Toggle label="متاح للتقسيط" checked={productForm.installment_available || false} onChange={v => setProductForm({...productForm, installment_available: v})} />
                    <Toggle label="ظاهر في الموقع" checked={productForm.is_visible} onChange={v => setProductForm({...productForm, is_visible: v})} />
                    <Toggle label="منتج مميز (Featured)" checked={productForm.is_featured} onChange={v => setProductForm({...productForm, is_featured: v})} />
                  </div>

                  {/* ── Image Upload ── */}
                  <div className="pt-4 border-t border-white/5">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 transition bg-white/[0.02]">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400 font-bold">اضغط لرفع صور المنتج</p>
                      </div>
                      <input type="file" className="hidden" multiple accept="image/*" onChange={e => setSelectedFiles(Array.from(e.target.files || []))} />
                    </label>
                    {selectedFiles.length > 0 && <p className="text-xs text-[var(--neon-cyan)] mt-2 font-bold text-center">تم اختيار {selectedFiles.length} صور جديدة</p>}
                    
                    {existingImages.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {existingImages.map(img => (
                          <div key={img} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <button type="button" onClick={() => setExistingImages(curr => curr.filter(i => i !== img))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><XCircle size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={savingState} className="w-full mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--neon)] to-[var(--neon-cyan)] py-4 text-base font-black text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                    {savingState ? 'جارٍ الحفظ...' : (editingProductId ? 'حفظ التعديلات' : 'إضافة المنتج للمتجر')}
                  </button>
                </form>
              </SectionShell>

              {/* Product List */}
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    placeholder="ابحث عن منتج بالاسم أو الموديل..."
                    className="w-full rounded-[24px] border border-white/10 bg-white/5 py-4 pl-6 pr-14 text-white outline-none backdrop-blur-md transition-all focus:border-[var(--neon-cyan)] focus:bg-white/10"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/5">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-2">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <ImageIcon className="h-full w-full text-gray-600 p-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white truncate text-lg">{product.name}</h4>
                          <div className="text-sm font-bold text-[var(--neon-cyan)] mt-1">
                            {product.price_on_inquiry ? 'السعر عند الطلب' : `${product.price?.toLocaleString('ar-EG')} جنيه`}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${product.is_visible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-400'}`}>
                              {product.is_visible ? 'مرئي' : 'مخفي'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${product.in_stock ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>
                              {product.in_stock ? 'متوفر' : 'نفد'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                        <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-bold hover:bg-white/20 transition">
                          <Pencil size={14} /> تعديل
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="flex items-center justify-center w-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-gray-500 font-bold border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                      لا توجد منتجات مطابقة للبحث
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <SectionShell>
              <h3 className="text-xl font-black mb-6">الطلبات الحديثة</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="text-gray-400 border-b border-white/5">
                    <tr>
                      <th className="pb-4 font-bold">رقم الطلب</th>
                      <th className="pb-4 font-bold">العميل</th>
                      <th className="pb-4 font-bold">المنتج</th>
                      <th className="pb-4 font-bold">التاريخ</th>
                      <th className="pb-4 font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 font-mono text-gray-500">#{order.id.slice(0,6)}</td>
                        <td className="py-4">
                          <div className="font-bold text-white">{order.customer_name}</div>
                          <div className="text-xs text-gray-500 mt-1">{order.customer_phone}</div>
                        </td>
                        <td className="py-4 font-bold text-[var(--neon-cyan)]">{order.product_name || '—'}</td>
                        <td className="py-4 text-gray-400">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                        <td className="py-4">
                          <select 
                            value={order.status} 
                            onChange={async (e) => {
                              try {
                                await adminFetch('/api/orders', { method: 'PUT', body: JSON.stringify({ id: order.id, status: e.target.value }) })
                                showToast('تم تحديث حالة الطلب', 'success')
                                loadData()
                              } catch(err:any) { showToast(err.message, 'error') }
                            }}
                            className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer hover:bg-white/10 transition"
                          >
                            {ORDER_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">لا توجد طلبات حالياً</td></tr>}
                  </tbody>
                </table>
              </div>
            </SectionShell>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="grid gap-8 lg:grid-cols-2">
              <SectionShell>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black">إعدادات المتجر العامة</h3>
                  <button onClick={handleSaveSettings} disabled={savingState} className="bg-[var(--neon-cyan)] text-black font-black px-6 py-2.5 rounded-full text-sm hover:scale-105 transition disabled:opacity-50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    {savingState ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </button>
                </div>
                <div className="space-y-5">
                  <Input label="العنوان الرئيسي (Hero Title)" value={siteConfig.hero_title || ''} onChange={e => setSiteConfig({...siteConfig, hero_title: e.target.value})} />
                  <Input label="السطر الأول (الشعار)" value={siteConfig.hero_slogan_line1 || ''} onChange={e => setSiteConfig({...siteConfig, hero_slogan_line1: e.target.value})} />
                  <Input label="السطر الثاني" value={siteConfig.hero_slogan_line2 || ''} onChange={e => setSiteConfig({...siteConfig, hero_slogan_line2: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="كلمة الإحصائية الأولى" value={siteConfig.hero_stat_products_label || ''} onChange={e => setSiteConfig({...siteConfig, hero_stat_products_label: e.target.value})} />
                    <Input label="كلمة الإحصائية الثانية" value={siteConfig.hero_stat_warranty_label || ''} onChange={e => setSiteConfig({...siteConfig, hero_stat_warranty_label: e.target.value})} />
                  </div>
                  <div className="border-t border-white/5 pt-5 mt-5"></div>
                  <Input label="رقم الواتساب (للتواصل السريع)" value={siteConfig.whatsapp_number || ''} onChange={e => setSiteConfig({...siteConfig, whatsapp_number: e.target.value})} />
                  <Input label="رابط خرائط جوجل (الفرع)" value={siteConfig.maps_url || ''} onChange={e => setSiteConfig({...siteConfig, maps_url: e.target.value})} />
                  <Input label="رابط إنستجرام" value={siteConfig.instagram_url || ''} onChange={e => setSiteConfig({...siteConfig, instagram_url: e.target.value})} />
                  <Input label="رابط تيك توك" value={siteConfig.tiktok_url || ''} onChange={e => setSiteConfig({...siteConfig, tiktok_url: e.target.value})} />
                  <Input label="رابط فيسبوك" value={siteConfig.facebook_url || ''} onChange={e => setSiteConfig({...siteConfig, facebook_url: e.target.value})} />
                </div>
              </SectionShell>

              <SectionShell>
                <h3 className="text-xl font-black mb-8">شريط الإعلانات العلوي</h3>
                <div className="space-y-5">
                  <Toggle label="تفعيل شريط الإعلانات" checked={announcement.is_visible || false} onChange={v => setAnnouncement({...announcement, is_visible: v})} />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-400">نص الإعلان</label>
                    <textarea rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all focus:border-[var(--neon-cyan)] focus:bg-[var(--neon-cyan)]/5" value={announcement.text || ''} onChange={e => setAnnouncement({...announcement, text: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-400">لون الخلفية</label>
                      <input type="color" className="h-12 w-full rounded-xl cursor-pointer bg-transparent border-0" value={announcement.bg_color || '#000000'} onChange={e => setAnnouncement({...announcement, bg_color: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-400">لون النص</label>
                      <input type="color" className="h-12 w-full rounded-xl cursor-pointer bg-transparent border-0" value={announcement.text_color || '#ffffff'} onChange={e => setAnnouncement({...announcement, text_color: e.target.value})} />
                    </div>
                  </div>
                </div>
              </SectionShell>
            </div>
          )}

          {/* MAINTENANCE & TRADE */}
          {(activeTab === 'maintenance' || activeTab === 'trade') && (
            <SectionShell>
              <h3 className="text-xl font-black mb-6">{activeTab === 'maintenance' ? 'طلبات الصيانة' : 'طلبات الاستبدال'}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(activeTab === 'maintenance' ? maintenance : trade).map((req: any) => (
                  <div key={req.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="font-bold text-white text-lg">{req.customer_name}</div>
                    <div className="text-sm text-[var(--neon-cyan)] mt-1">{req.customer_phone}</div>
                    <div className="mt-4 text-sm text-gray-300 leading-relaxed bg-black/20 rounded-xl p-3 border border-white/5">
                      {activeTab === 'maintenance' ? req.issue_description : `يريد استبدال: ${req.device_model}`}
                    </div>
                    <div className="mt-4 text-xs font-mono text-gray-500">
                      {new Date(req.created_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                ))}
                {(activeTab === 'maintenance' ? maintenance : trade).length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 font-bold">لا توجد طلبات حالياً</div>
                )}
              </div>
            </SectionShell>
          )}

        </div>
      </main>
    </div>
  )
}
