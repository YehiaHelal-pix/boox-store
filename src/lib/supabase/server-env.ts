import 'server-only'

import { requireEnv } from '@/lib/supabase/env'

export function getSupabaseServiceRoleKey() {
  return requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY')
}
