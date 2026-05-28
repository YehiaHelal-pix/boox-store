import { createBrowserClient } from '@supabase/ssr'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'

export const createClient = () => {
  const { supabaseAnonKey, supabaseUrl } = getPublicSupabaseEnv()

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
