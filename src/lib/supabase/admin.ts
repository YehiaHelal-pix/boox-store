import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getServiceRoleKey, supabaseUrl } from '@/lib/supabase/env'

let _admin: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(supabaseUrl, getServiceRoleKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  return _admin
}

// backward compat alias – call as function or use as proxy
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getAdminClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
