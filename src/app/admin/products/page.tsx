'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import type { Product } from '@/types/product'
import { useToastStore } from '@/components/ui/Toast'
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react'

const categories = [
    { id: 'iphone', name: 'iPhone' },
    { id: 'ipad', name: 'iPad' },
    { id: 'macbook', name: 'MacBook' },
    { id: 'airpods', name: 'AirPods' },
    { id: 'accessories', name: 'إكسسوارات' },
    { id: 'other', name: 'أخرى' },
]

type FormData = {
    name: string
    description: string
    price: string
    original_price: string
    category: string
    in_stock: boolean
    is_featured: boolean
    stock_count: string
    sort_order: string
}

const emptyForm: FormData = {
    name: '', description: '', price: '', original_price: '',
    category: 'iphone', in_stock: true, is_featured: false,
    stock_count: '0', sort_order: '0',
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState<FormData>(emptyForm)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const addToast = useToastStore(s => s.addToast)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const sb = createClient()
        const { data } = await sb.from('products').select('*').order('sort_order').order('created_at', { ascending: false })
        if (data) setProducts(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    const openAdd = () => {
        setEditId(null)
        setForm(emptyForm)
        setImageFile(null)
        setShowModal(true)
    }

    const openEdit = (p: Product) => {
        setEditId(p.id)
        setForm({
            name: p.name,
            description: p.description || '',
            price: p.price.toString(),
            original_price: p.original_price?.toString() || '',
            category: p.category,
            in_stock: p.in_stock,
            is_featured: p.is_featured,
            stock_count: p.stock_count.toString(),
            sort_order: p.sort_order.toString(),
        })
        setImageFile(null)
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.name || !form.price) {
            addToast('يرجى ملء الاسم والسعر', 'error')
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/products', {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(editId ? { id: editId } : {}),
                    name: form.name,
                    description: form.description || null,
                    price: parseFloat(form.price),
                    original_price: form.original_price ? parseFloat(form.original_price) : null,
                    category: form.category,
                    in_stock: form.in_stock,
                    is_featured: form.is_featured,
                    stock_count: parseInt(form.stock_count || '0'),
                    sort_order: parseInt(form.sort_order || '0'),
                })
            })
            if (!res.ok) throw new Error('Failed to save')
            addToast(editId ? 'تم تعديل المنتج' : 'تم إضافة المنتج', 'success')
            setShowModal(false)
            fetchProducts()
        } catch {
            addToast('حدث خطأ أثناء الحفظ', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
        try {
            const res = await fetch('/api/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            if (!res.ok) throw new Error('Failed to delete')
            addToast('تم حذف المنتج', 'success')
            fetchProducts()
        } catch {
            addToast('حدث خطأ أثناء الحذف', 'error')
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-white">إدارة المنتجات</h1>
                <button onClick={openAdd} className="bg-[var(--neon)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 min-h-[44px] cursor-pointer">
                    <Plus size={20} /> إضافة منتج
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--neon)] border-t-transparent rounded-full animate-spin" /></div>
            ) : products.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center text-[var(--text-muted)] text-xl">لا توجد منتجات. أضف أول منتج الآن!</div>
            ) : (
                <div className="overflow-x-auto glass rounded-2xl border border-[var(--border)]">
                    <table className="w-full text-right">
                        <thead className="border-b border-[var(--border)] bg-white/[0.02]">
                            <tr>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4">الصورة</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4">الاسم</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4 hidden md:table-cell">التصنيف</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4">السعر</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4 hidden md:table-cell">المخزون</th>
                                <th className="text-[var(--text-muted)] font-bold text-sm p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b border-[var(--border)] hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="w-14 h-14 bg-[#0a0a14] rounded-xl overflow-hidden relative">
                                            {p.image_url ? <Image src={p.image_url} alt={p.name} fill sizes="56px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[8px]">لا صورة</div>}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-white text-sm max-w-[200px] truncate">{p.name}</td>
                                    <td className="p-4 hidden md:table-cell"><span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[var(--text-muted)] border border-[var(--border)]">{p.category}</span></td>
                                    <td className="p-4 font-bold text-[var(--neon-cyan)]">{p.price.toLocaleString()} ج</td>
                                    <td className="p-4 hidden md:table-cell">{p.in_stock ? <span className="text-green-400 text-sm font-bold">متوفر ({p.stock_count})</span> : <span className="text-red-400 text-sm font-bold">نفد</span>}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 min-w-[40px] min-h-[40px] flex items-center justify-center"><Pencil size={18} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 min-w-[40px] min-h-[40px] flex items-center justify-center"><Trash2 size={18} /></button>
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
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative glass rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--border)]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white">{editId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={20} /></button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-white text-sm">اسم المنتج</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-3 text-white focus:border-[var(--neon-cyan)] focus:outline-none min-h-[44px]" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-white text-sm">الوصف</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-3 text-white focus:border-[var(--neon-cyan)] focus:outline-none resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-white text-sm">السعر</label>
                                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-3 text-white focus:border-[var(--neon-cyan)] focus:outline-none min-h-[44px]" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-white text-sm">السعر الأصلي</label>
                                    <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-3 text-white focus:border-[var(--neon-cyan)] focus:outline-none min-h-[44px]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-white text-sm">التصنيف</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-3 text-white focus:border-[var(--neon-cyan)] focus:outline-none min-h-[44px] appearance-none">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-white text-sm">عدد المخزون</label>
                                    <input type="number" value={form.stock_count} onChange={e => setForm({ ...form, stock_count: e.target.value })} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-3 text-white focus:border-[var(--neon-cyan)] focus:outline-none min-h-[44px]" />
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} className="w-5 h-5 accent-[var(--neon)]" />
                                    <span className="text-white font-medium">متوفر</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-5 h-5 accent-[var(--neon)]" />
                                    <span className="text-white font-medium">مميز</span>
                                </label>
                            </div>
                            <button onClick={handleSave} disabled={saving} className="w-full bg-[var(--neon)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 min-h-[56px] text-lg disabled:opacity-50 mt-4 cursor-pointer">
                                {saving ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={20} /> {editId ? 'حفظ التعديلات' : 'إضافة المنتج'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
