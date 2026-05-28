import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'
import { getSupabaseServiceRoleKey } from '@/lib/supabase/server-env'

let adminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    const { supabaseUrl } = getPublicSupabaseEnv()
    const supabaseServiceRoleKey = getSupabaseServiceRoleKey()

    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  return adminClient
}

// Backward-compatible alias for existing imports.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    return (getAdminClient() as unknown as Record<string | symbol, unknown>)[property]
  },
})
