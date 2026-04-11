'use client'
import { create } from 'zustand'

type ToastMessage = { id: string; message: string; type: 'success' | 'error' | 'info' }

interface ToastStore {
    toasts: ToastMessage[]
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void
    removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(7)
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
        setTimeout(() => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })), 3000)
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}))

export function ToastProvider() {
    const toasts = useToastStore(state => state.toasts)
    const removeToast = useToastStore(state => state.removeToast)

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <div key={toast.id} onClick={() => removeToast(toast.id)} className={`px-4 py-3 rounded-lg text-white font-medium shadow-lg transition-all cursor-pointer ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-[#6366f1]'}`}>
                    {toast.message}
                </div>
            ))}
        </div>
    )
}
