import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { logAdminActivity } from '@/lib/admin-activity'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  const access = await requireAdminApiAccess()
  if ('response' in access) return access.response

  try {
    const { data, error } = await supabaseAdmin
      .from('filter_definitions')
      .select('*, category:categories(name_ar)')
      .order('display_order', { ascending: true })

    if (error) return jsonError(error.message, 500)
    return NextResponse.json(data)
  } catch (error) {
    return jsonError('Internal Server Error', 500)
  }
}

export async function POST(request: NextRequest) {
  const access = await requireAdminApiAccess()
  if ('response' in access) return access.response

  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('filter_definitions')
      .insert(body)
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)
    
    await logAdminActivity({
      action: 'create_filter',
      entityType: 'filter',
      entityId: data.id,
      newData: data,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return jsonError('Internal Server Error', 500)
  }
}
