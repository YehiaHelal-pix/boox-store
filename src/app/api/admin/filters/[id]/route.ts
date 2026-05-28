import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { logAdminActivity } from '@/lib/admin-activity'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireAdminApiAccess()
  if ('response' in access) return access.response

  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('filter_definitions')
      .update(body)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)

    await logAdminActivity({
      action: 'update_filter',
      entityType: 'filter',
      entityId: id,
      newData: data,
    })

    return NextResponse.json(data)
  } catch (error) {
    return jsonError('Internal Server Error', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireAdminApiAccess()
  if ('response' in access) return access.response

  try {
    const { error } = await supabaseAdmin
      .from('filter_definitions')
      .delete()
      .eq('id', id)

    if (error) return jsonError(error.message, 500)

    await logAdminActivity({
      action: 'delete_filter',
      entityType: 'filter',
      entityId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return jsonError('Internal Server Error', 500)
  }
}
