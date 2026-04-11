'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/Toast'
import { Save, Settings } from 'lucide-react'

type SettingsMap = Record<string, string>

const settingKeys = [
    { key: 'hero_title', label: 'عنوان الهيرو الرئيسي', type: 'text' },
    { key: 'hero_subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'promo_text', label: 'نص شريط العروض', type: 'text' },
    { key: 'promo_enabled', label: 'تفعيل شريط العروض', type: 'toggle' },
    { key: 'whatsapp_number', label: 'رقم الواتساب', type: 'text' },
    { key: 'store_address', label: 'العنوان', type: 'text' },
    { key: 'working_hours', label: 'أوقات العمل', type: 'text' },
]

export default function AdminCustomizePage() {
    const [settings, setSettings] = useState<SettingsMap>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const addToast = useToastStore(s => s.addToast)

    useEffect(() => {
        async function fetchSettings() {
            const sb = createClient()
            const { data } = await sb.from('site_settings').select('*')
            if (data) {
                const map: SettingsMap = {}
                data.forEach(row => {
                    const val = row.value
                    map[row.key] = typeof val === 'string' ? val : JSON.stringify(val)
                })
                setSettings(map)
            }
            setLoading(false)
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const sb = createClient()
            for (const [key, value] of Object.entries(settings)) {
                const jsonValue = key === 'promo_enabled' ? value === 'true' : value
                await sb.from('site_settings').update({ value: JSON.stringify(jsonValue) }).eq('key', key)
            }
            addToast('تم حفظ الإعدادات بنجاح', 'success')
        } catch {
            addToast('حدث خطأ أثناء الحفظ', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--neon)] border-t-transparent rounded-full animate-spin" /></div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Settings className="text-[var(--neon-cyan)]" size={28} />
                    <h1 className="text-3xl font-black text-white">تخصيص الموقع</h1>
                </div>
            </div>

            <div className="glass rounded-[2rem] p-8 border border-[var(--border)] flex flex-col gap-6">
                {settingKeys.map(sk => (
                    <div key={sk.key} className="flex flex-col gap-2">
                        <label className="font-bold text-white">{sk.label}</label>
                        {sk.type === 'toggle' ? (
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={settings[sk.key] === 'true'} onChange={e => setSettings({ ...settings, [sk.key]: e.target.checked ? 'true' : 'false' })} className="w-5 h-5 accent-[var(--neon)]" />
                                <span className="text-[var(--text-muted)]">{settings[sk.key] === 'true' ? 'مفعّل' : 'معطّل'}</span>
                            </label>
                        ) : (
                            <input value={settings[sk.key] || ''} onChange={e => setSettings({ ...settings, [sk.key]: e.target.value })} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-5 py-4 text-white focus:border-[var(--neon-cyan)] focus:outline-none min-h-[50px]" />
                        )}
                    </div>
                ))}
                <button onClick={handleSave} disabled={saving} className="w-full bg-[var(--neon)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 min-h-[56px] text-lg disabled:opacity-50 mt-4 cursor-pointer">
                    {saving ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={20} /> حفظ الإعدادات</>}
                </button>
            </div>
        </div>
    )
}
