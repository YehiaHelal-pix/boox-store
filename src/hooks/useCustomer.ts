'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CustomerData {
    name: string
    phone: string
    last_seen: string
    viewed_products: string[]
    favorite_ids: string[]
}

const CUSTOMER_KEY = 'boox_customer'

export function useCustomer() {
    const [customer, setCustomer] = useState<CustomerData>({
        name: '',
        phone: '',
        last_seen: new Date().toISOString(),
        viewed_products: [],
        favorite_ids: []
    })

    const [sessionId, setSessionId] = useState<string>('')
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        let sid = localStorage.getItem('boox_session_id')
        if (!sid) {
            sid = crypto.randomUUID()
            localStorage.setItem('boox_session_id', sid)
        }
        setSessionId(sid)

        const stored = localStorage.getItem(CUSTOMER_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setCustomer(parsed)
                // Set cookies for server access
                if (parsed.name) document.cookie = `boox_customer_name=${encodeURIComponent(parsed.name)}; path=/; max-age=31536000`
                if (parsed.phone) document.cookie = `boox_customer_phone=${encodeURIComponent(parsed.phone)}; path=/; max-age=31536000`
            } catch (e) {
                console.error('Failed to parse stored customer', e)
            }
        }
        setIsLoaded(true)
    }, [])

    const syncToSupabase = async (sid: string, data: CustomerData) => {
        if (!sid) return
        const sb = createClient()
        await sb.from('customer_sessions').upsert({
            session_id: sid,
            name: data.name,
            phone: data.phone,
            viewed_products: data.viewed_products,
            favorite_ids: data.favorite_ids,
            last_seen: new Date().toISOString()
        }, { onConflict: 'session_id' })
    }

    const saveCustomer = (update: Partial<CustomerData>) => {
        setCustomer(prev => {
            const next = { ...prev, ...update, last_seen: new Date().toISOString() }
            localStorage.setItem(CUSTOMER_KEY, JSON.stringify(next))
            if (next.name) document.cookie = `boox_customer_name=${encodeURIComponent(next.name)}; path=/; max-age=31536000`
            if (next.phone) document.cookie = `boox_customer_phone=${encodeURIComponent(next.phone)}; path=/; max-age=31536000`
            if (sessionId) syncToSupabase(sessionId, next)
            return next
        })
    }

    const clearCustomer = () => {
        const empty: CustomerData = { name: '', phone: '', last_seen: new Date().toISOString(), viewed_products: [], favorite_ids: [] }
        setCustomer(empty)
        localStorage.removeItem(CUSTOMER_KEY)
        document.cookie = 'boox_customer_name=; path=/; max-age=0'
        document.cookie = 'boox_customer_phone=; path=/; max-age=0'
        if (sessionId) syncToSupabase(sessionId, empty)
    }

    return { customer, saveCustomer, clearCustomer, isLoaded, sessionId }
}
