import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { normalizeDashboardStats } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return jsonError('غير مصرح', 401)
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
