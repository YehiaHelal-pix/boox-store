import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminActivityLog } from '@/types/database'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return jsonError('غير مصرح', 401)
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
