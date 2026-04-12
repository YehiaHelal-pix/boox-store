'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import type { Product, ProductCondition, NetworkType } from '@/lib/supabase/types'
import { useToastStore } from '@/components/ui/Toast'
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff, LayoutGrid } from 'lucide-react'

const conditions: { id: ProductCondition, label: string }[] = [
    { id: 'excellent', label: 'ممتاز' },
    { id: 'good', label: 'جيد جداً' },
    { id: 'fair', label: 'جيد' }
]

const networks: NetworkType[] = ['unlocked', 'vodafone', 'orange', 'etisalat', 'we']

type FormData = {
    name: string
    model: string
    slug: string
    description: string
    price: string
    original_price: string
    storage: string
    color: string
    color_hex: string
    condition: ProductCondition
    battery_health: string
    network: NetworkType
    stock_quantity: string
    in_stock: boolean
    is_featured: boolean
    is_visible: boolean
    images_str: string
}

const emptyForm: FormData = {
    name: '', model: '', slug: '', description: '', price: '', original_price: '',
    storage: '', color: '', color_hex: '#000000', condition: 'excellent',
    battery_health: '100', network: 'unlocked', stock_quantity: '1',
    in_stock: true, is_featured: false, is_visible: true, images_str: ''
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState<FormData>(emptyForm)
    const [saving, setSaving] = useState(false)
    const addToast = useToastStore(s => s.addToast)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const sb = createClient()
        const { data } = await sb.from('products').select('*').order('created_at', { ascending: false })
        if (data) setProducts(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    useEffect(() => {
        if (!editId && form.name) {
            setForm(f => ({ ...f, slug: f.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') }))
        }
    }, [form.name, editId])

    const openAdd = () => {
        setEditId(null)
        setForm(emptyForm)
        setShowModal(true)
    }

    const openEdit = (p: Product) => {
        setEditId(p.id)
        setForm({
            name: p.name,
            model: p.model,
            slug: p.slug,
            description: p.description || '',
            price: p.price.toString(),
            original_price: p.original_price?.toString() || '',
            storage: p.storage,
            color: p.color,
            color_hex: p.color_hex,
            condition: p.condition,
            battery_health: p.battery_health.toString(),
            network: p.network,
            stock_quantity: p.stock_quantity.toString(),
            in_stock: p.in_stock,
            is_featured: p.is_featured,
            is_visible: p.is_visible,
            images_str: (p.images || []).join(', ')
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.name || !form.price || !form.model) {
            addToast('يرجى ملء البيانات الأساسية', 'error')
            return
        }
        setSaving(true)
        try {
            const payload = {
                name: form.name,
                model: form.model,
                slug: form.slug,
                description: form.description || null,
                price: parseFloat(form.price),
                original_price: form.original_price ? parseFloat(form.original_price) : null,
                storage: form.storage,
                color: form.color,
                color_hex: form.color_hex,
                condition: form.condition,
                battery_health: parseInt(form.battery_health),
                network: form.network,
                stock_quantity: parseInt(form.stock_quantity),
                in_stock: form.in_stock,
                is_featured: form.is_featured,
                is_visible: form.is_visible,
                images: form.images_str.split(',').map(s => s.trim()).filter(s => s !== ''),
                updated_at: new Date().toISOString()
            }

            const sb = createClient()
            let error;
            if (editId) {
                ({ error } = await sb.from('products').update(payload).eq('id', editId))
            } else {
                ({ error } = await sb.from('products').insert([payload]))
            }

            if (error) throw error
            addToast(editId ? 'تم تعديل المنتج' : 'تم إضافة المنتج', 'success')
            setShowModal(false)
            fetchProducts()
        } catch (err: any) {
            console.error(err)
            addToast('حدث خطأ أثناء الحفظ', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
        const sb = createClient()
        const { error } = await sb.from('products').delete().eq('id', id)
        if (error) {
            addToast('حدث خطأ أثناء الحذف', 'error')
        } else {
            addToast('تم حذف المنتج', 'success')
            fetchProducts()
        }
    }

    return (
        <div className="pb-10">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <LayoutGrid className="text-[var(--neon-cyan)]" size={32} />
                    <h1 className="text-3xl font-black text-white">إدارة المنتجات</h1>
                </div>
                <button onClick={openAdd} className="bg-[var(--neon)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer">
                    <Plus size={20} /> إضافة منتج جديد
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--neon)] border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="overflow-x-auto glass rounded-2xl border border-white/5 shadow-2xl">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02] text-[var(--text-muted)] text-sm">
                                <th className="p-4">المنتج</th>
                                <th className="p-4">السعر</th>
                                <th className="p-4">الموديل</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-black/40 rounded-xl overflow-hidden relative border border-white/5 shrink-0">
                                                {p.images && p.images.length > 0 ? (
                                                    <Image src={p.images[0]} alt={p.name} fill sizes="64px" className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600">No Image</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-mono truncate">{p.slug}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {!p.is_visible && <span className="flex items-center gap-1 text-[9px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20"><EyeOff size={10} /> مخفي</span>}
                                                    {p.is_featured && <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">مميز</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[var(--neon-cyan)] text-base">{p.price.toLocaleString()} ج</span>
                                            {p.original_price && <span className="text-xs text-gray-500 line-through">{p.original_price.toLocaleString()} ج</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        <div>{p.model}</div>
                                        <div className="text-[10px] text-gray-500">{p.storage} • {p.color}</div>
                                    </td>
                                    <td className="p-4">
                                        {p.in_stock ? (
                                            <span className="inline-flex flex-col">
                                                <span className="text-xs text-green-400 font-bold">متوفر</span>
                                                <span className="text-[10px] text-gray-500">{p.stock_quantity || 0} قطعة</span>
                                            </span>
                                        ) : (
                                            <span className="text-xs text-red-400 font-bold">نفد</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2.5 rounded-xl hover:bg-blue-500/10 text-blue-400 border border-transparent hover:border-blue-500/20 transition-all"><Pencil size={18} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="relative glass rounded-[2.5rem] p-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-3xl font-black text-white">{editId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 transition-all hover:bg-white/10 rounded-full border border-transparent hover:border-white/10"><X size={24} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">اسم المنتج (العنوان)</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="iPhone 15 Pro Max Natural Titanium" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">Slug (للرابط)</label>
                                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="admin-input font-mono text-sm opacity-80" placeholder="iphone-15-pro-max" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">الموديل (مثلاً: iPhone 15 Pro Max)</label>
                                <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="admin-input" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">التخزين (مثلاً: 256GB)</label>
                                <input value={form.storage} onChange={e => setForm({ ...form, storage: e.target.value })} className="admin-input" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">السعر الحالي (جنيه)</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="admin-input text-[var(--neon-cyan)] font-black" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">السعر قبل الخصم (اختياري)</label>
                                <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} className="admin-input opacity-60" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">اللون (بالعربية)</label>
                                <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="admin-input" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">كود اللون (HEX)</label>
                                <div className="flex gap-2">
                                    <input type="color" value={form.color_hex} onChange={e => setForm({ ...form, color_hex: e.target.value })} className="w-12 h-12 bg-transparent border-none p-0 cursor-pointer" />
                                    <input value={form.color_hex} onChange={e => setForm({ ...form, color_hex: e.target.value })} className="admin-input flex-grow font-mono uppercase" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">الحالة</label>
                                <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value as ProductCondition })} className="admin-input appearance-none">
                                    {conditions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">صحة البطارية (%)</label>
                                <input type="number" value={form.battery_health} onChange={e => setForm({ ...form, battery_health: e.target.value })} className="admin-input" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">الشبكة</label>
                                <select value={form.network} onChange={e => setForm({ ...form, network: e.target.value as NetworkType })} className="admin-input appearance-none">
                                    {networks.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400">الكمية في المخزن</label>
                                <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} className="admin-input" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-6">
                            <label className="text-xs font-bold text-gray-400">روابط الصور (مفصولة بفاصلة)</label>
                            <textarea value={form.images_str} onChange={e => setForm({ ...form, images_str: e.target.value })} rows={2} className="admin-input resize-none" placeholder="https://image1.jpg, https://image2.jpg" />
                        </div>

                        <div className="flex flex-col gap-2 mt-6">
                            <label className="text-xs font-bold text-gray-400">الوصف</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="admin-input resize-none" />
                        </div>

                        <div className="flex flex-wrap gap-x-12 gap-y-4 mt-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${form.in_stock ? 'bg-[var(--neon)] border-[var(--neon)]' : 'border-gray-600'}`}>
                                    {form.in_stock && <Save size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} className="hidden" />
                                <span className="text-white font-bold group-hover:text-[var(--neon-cyan)] transition-colors">متاح للبيع</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${form.is_featured ? 'bg-amber-500 border-amber-500' : 'border-gray-600'}`}>
                                    {form.is_featured && <Save size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="hidden" />
                                <span className="text-white font-bold group-hover:text-amber-400 transition-colors">منتج مميز</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${form.is_visible ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                                    {form.is_visible ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} className="hidden" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">مرئي في المتجر</span>
                            </label>
                        </div>

                        <button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all text-xl disabled:opacity-50 mt-10 shadow-2xl shadow-indigo-500/30">
                            {saving ? <span className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={24} /> {editId ? 'حفظ التعديلات النهائية' : 'إضافة المنتج للمتجر'}</>}
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    padding: 0.85rem 1.25rem;
                    color: white;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .admin-input:focus {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--neon-cyan);
                    box-shadow: 0 0 15px rgba(34, 211, 238, 0.1);
                }
            `}</style>
        </div>
    )
}
