'use client'
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { items, updateQty, removeItem, total } = useCart()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer animate-in fade-in" onClick={onClose} />
            <div className="relative h-full w-[85vw] md:w-[400px] bg-[#03030a] border-r border-[var(--border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center h-[var(--navbar-h)] bg-[var(--glass)]">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="text-[var(--neon-cyan)]" />
                        <span>سلة المشتريات</span>
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center border border-white/5">
                        <ArrowRight size={20} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
                    {!mounted || items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-6 opacity-70">
                            <div className="w-24 h-24 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--glass)]">
                                <ShoppingCart size={40} className="text-[var(--border)]" />
                            </div>
                            <p className="text-lg">السلة فارغة حالياً</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 glass rounded-[var(--radius)] border border-[var(--border)] relative overflow-hidden group">
                                <div className="relative w-24 h-24 bg-black/20 rounded-lg overflow-hidden shrink-0">
                                    {item.image_url ? (
                                        <Image src={item.image_url} alt={item.name} fill sizes="96px" className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">لا صورة</div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-between flex-grow py-1">
                                    <div className="flex justify-between items-start gap-2 pr-1">
                                        <h3 className="font-bold text-sm leading-snug line-clamp-2">{item.name}</h3>
                                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded p-1.5 transition-colors" title="إزالة">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="font-black text-[var(--neon-cyan)]">{item.price.toLocaleString()} ج</span>
                                        <div className="flex items-center gap-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] p-1 shrink-0">
                                            <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1.5 hover:text-[var(--neon-cyan)] transition-colors rounded-md hover:bg-white/5 disabled:opacity-50 min-w-[30px] flex items-center justify-center">
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1.5 hover:text-[var(--neon-cyan)] transition-colors rounded-md hover:bg-white/5 min-w-[30px] flex items-center justify-center">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {mounted && items.length > 0 && (
                    <div className="p-4 border-t border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_20px_rgba(0,0,0,0.2)] relative z-20">
                        <div className="flex justify-between items-center mb-5 text-lg px-2">
                            <span className="text-[var(--text-muted)] font-medium">الإجمالي</span>
                            <span className="font-black text-2xl text-white">{total().toLocaleString()} <span className="text-sm text-[var(--neon-cyan)]">جنيه</span></span>
                        </div>
                        <button className="w-full bg-[var(--neon)] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all min-h-[56px] text-lg shadow-[0_0_20px_rgba(99,102,241,0.5)] cursor-pointer">
                            إتمام الطلب
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
