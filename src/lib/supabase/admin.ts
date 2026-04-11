import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _admin: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
    if (!_admin) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!url || !key) throw new Error('Supabase admin env vars not set')
        _admin = createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false }
        })
    }
    return _admin
}

// backward compat alias – call as function or use as proxy
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_t, prop) {
        return (getAdminClient() as unknown as Record<string | symbol, unknown>)[prop]
    }
})
