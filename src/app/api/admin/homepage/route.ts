import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { logAdminActivity } from '@/lib/admin-activity'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const access = await requireAdminApiAccess()
  if ('response' in access) return access.response

  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_sections')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const access = await requireAdminApiAccess()
  if ('response' in access) return access.response

  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const { data, error } = await supabaseAdmin
      .from('homepage_sections')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAdminActivity({
      action: 'update_homepage_section',
      entityType: 'homepage_section',
      entityId: id,
      newData: data,
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
