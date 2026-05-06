function readEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY' | 'SUPABASE_SERVICE_ROLE_KEY') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const getSupabaseUrl = () => readEnv('NEXT_PUBLIC_SUPABASE_URL')
export const getSupabaseAnonKey = () => readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const getSupabaseServiceRoleKey = () => readEnv('SUPABASE_SERVICE_ROLE_KEY')
