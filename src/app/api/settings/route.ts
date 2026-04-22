import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'site_config')
      .maybeSingle()

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json((data?.value as Record<string, unknown> | null) ?? {})
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return jsonError('غير مصرح', 401)
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        {
          key: 'site_config',
          value: payload,
        },
        { onConflict: 'key' },
      )
      .select('value')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json((data?.value as Record<string, unknown> | null) ?? {})
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
