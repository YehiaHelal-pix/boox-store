import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminActivityLog } from '@/types/database'

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
    const { data, error } = await supabaseAdmin
      .from('admin_activity_log')
      .select('*')
      .order('performed_at', { ascending: false })
      .limit(50)

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json((data ?? []) as AdminActivityLog[])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
