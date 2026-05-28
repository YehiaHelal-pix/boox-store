export function requireEnv(value: string | undefined, name: string) {
  const normalized = value?.replace(/^\uFEFF/, '').trim()

  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return normalized
}

export function getPublicSupabaseEnv() {
  return {
    supabaseUrl: requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}
