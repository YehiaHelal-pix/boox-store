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
  if ('response' in access) {
    return access.response
  }

  try {
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(body)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'update_category',
      entityType: 'category',
      entityId: id,
      newData: data as unknown as Record<string, unknown>,
    })

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireAdminApiAccess()
  if ('response' in access) {
    return access.response
  }

  try {
    // Check if products are linked
    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (countError) throw countError
    if (count && count > 0) {
      return jsonError('لا يمكن حذف القسم لأنه يحتوي على منتجات مرتبطة به', 400)
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'delete_category',
      entityType: 'category',
      entityId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
