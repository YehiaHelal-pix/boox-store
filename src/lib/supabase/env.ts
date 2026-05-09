function readEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY' | 'SUPABASE_SERVICE_ROLE_KEY') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
export const supabaseAnonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

export function getServiceRoleKey() {
  return readEnv('SUPABASE_SERVICE_ROLE_KEY')
}
