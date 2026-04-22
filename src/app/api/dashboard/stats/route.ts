import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { normalizeDashboardStats } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  const access = await requireAdminApiAccess()
  if ('response' in access) {
    return access.response
  }

  try {
    const { data, error } = await supabaseAdmin.from('dashboard_stats').select('*').single()

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json(normalizeDashboardStats((data ?? {}) as Record<string, unknown>))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
