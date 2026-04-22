import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { logAdminActivity } from '@/lib/admin-activity'
import { isValidPhone, normalizeOrderRow, normalizePhone, toNumber } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { OrderRow, OrderStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

const VALID_ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return jsonError('غير مصرح', 401)
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, products(name, slug)')
      .order('created_at', { ascending: false })

    if (error) {
      return jsonError(error.message, 500)
    }

    const orders = ((data ?? []) as Array<OrderRow & { products?: { name: string; slug: string } | null }>).map((row) =>
      normalizeOrderRow(row),
    )

    return NextResponse.json(orders)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      customer_name?: string
      customer_phone?: string
      customer_address?: string
      product_id?: string
      quantity?: number
      total_price?: number
      notes?: string
    }

    if (!body.customer_name?.trim()) {
      return jsonError('الاسم مطلوب', 400)
    }

    if (!body.customer_phone?.trim() || !isValidPhone(body.customer_phone)) {
      return jsonError('رقم الهاتف غير صحيح', 400)
    }

    const quantity = Math.max(1, Number(body.quantity ?? 1))
    const totalPrice = toNumber(body.total_price) ?? null

    const insertPayload = {
      customer_name: body.customer_name.trim(),
      customer_phone: normalizePhone(body.customer_phone),
      customer_address: body.customer_address?.trim() || null,
      product_id: body.product_id ?? null,
      quantity,
      total_price: totalPrice,
      notes: body.notes?.trim() || null,
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(insertPayload)
      .select('*, products(name, slug)')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json(normalizeOrderRow(data as OrderRow & { products?: { name: string; slug: string } | null }), {
      status: 201,
    })
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
      status?: OrderStatus
      notes?: string
    }

    if (!body.id) {
      return jsonError('رقم الطلب غير موجود', 400)
    }

    if (body.status && !VALID_ORDER_STATUSES.includes(body.status)) {
      return jsonError('حالة الطلب غير صحيحة', 400)
    }

    const { data: previous, error: previousError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', body.id)
      .single()

    if (previousError || !previous) {
      return jsonError('الطلب غير موجود', 404)
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: body.status ?? previous.status,
        notes: body.notes?.trim() ?? previous.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select('*, products(name, slug)')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'update_order',
      entityType: 'order',
      entityId: body.id,
      oldData: previous as unknown as Record<string, unknown>,
      newData: data as unknown as Record<string, unknown>,
    })

    return NextResponse.json(normalizeOrderRow(data as OrderRow & { products?: { name: string; slug: string } | null }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
