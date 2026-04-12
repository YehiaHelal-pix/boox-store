'use client'
import { Share2, Link as LinkIcon, Check } from 'lucide-react'
import { useState } from 'react'
import { useToastStore } from '@/components/ui/Toast'

export default function ShareButton({ title, text }: { title: string, text?: string }) {
    const [copied, setCopied] = useState(false)
    const addToast = useToastStore(s => s.addToast)

    const handleShare = async () => {
        const url = window.location.href
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        } else {
            try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                addToast('تم نسخ الرابط إلى الحافظة', 'success')
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Error copying:', err)
            }
        }
    }

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 text-white glass px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
        >
            {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
            <span className="font-bold">{copied ? 'تم النسخ' : 'مشاركة'}</span>
        </button>
    )
}
