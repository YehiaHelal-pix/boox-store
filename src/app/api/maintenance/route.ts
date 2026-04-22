import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { logAdminActivity } from '@/lib/admin-activity'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { MaintenanceRequest } from '@/types/database'

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
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json((data ?? []) as MaintenanceRequest[])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return jsonError('غير مصرح', 401)
  }

  try {
    const body = (await request.json()) as {
      id?: string
      status?: MaintenanceRequest['status']
      admin_reply?: string
      notes?: string
    }

    if (!body.id) {
      return jsonError('رقم الطلب غير موجود', 400)
    }

    const { data: previous, error: previousError } = await supabaseAdmin
      .from('maintenance_requests')
      .select('*')
      .eq('id', body.id)
      .single()

    if (previousError || !previous) {
      return jsonError('طلب الصيانة غير موجود', 404)
    }

    const { data, error } = await supabaseAdmin
      .from('maintenance_requests')
      .update({
        status: body.status ?? previous.status,
        admin_reply: body.admin_reply ?? previous.admin_reply,
        notes: body.notes ?? previous.notes,
        updated_at: new Date().toISOString(),
        reply_at: body.admin_reply ? new Date().toISOString() : previous.reply_at,
      })
      .eq('id', body.id)
      .select('*')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'update_maintenance_request',
      entityType: 'maintenance_request',
      entityId: body.id,
      oldData: previous as unknown as Record<string, unknown>,
      newData: data as unknown as Record<string, unknown>,
    })

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
