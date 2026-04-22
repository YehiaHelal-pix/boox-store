import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const defaultAnnouncement = {
  is_visible: false,
  text: 'مرحبًا بيك في Boox Store',
  bg_color: '#0f172a',
  text_color: '#ffffff',
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement')
      .maybeSingle()

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json((data?.value as typeof defaultAnnouncement | null) ?? defaultAnnouncement)
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
    const body = (await request.json()) as typeof defaultAnnouncement
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'announcement', value: body }, { onConflict: 'key' })
      .select('value')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json((data?.value as typeof defaultAnnouncement | null) ?? defaultAnnouncement)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
