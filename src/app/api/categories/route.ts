import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { logAdminActivity } from '@/lib/admin-activity'
import { slugify } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Category } from '@/types/database'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    let query = supabaseAdmin.from('categories').select('*').order('name_ar', { ascending: true })

    if (!isAdminRequest(request)) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      return jsonError(error.message, 500)
    }

    return NextResponse.json((data ?? []) as Category[])
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
    const body = (await request.json()) as {
      name?: string
      name_ar?: string
      slug?: string
      description?: string
      is_active?: boolean
    }

    if (!body.name?.trim() || !body.name_ar?.trim()) {
      return jsonError('بيانات القسم غير مكتملة', 400)
    }

    const insertPayload = {
      name: body.name.trim(),
      name_ar: body.name_ar.trim(),
      slug: body.slug?.trim() || slugify(body.name),
      description: body.description?.trim() || null,
      is_active: body.is_active ?? true,
    }

    const { data, error } = await supabaseAdmin.from('categories').insert(insertPayload).select('*').single()

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'create_category',
      entityType: 'category',
      entityId: data.id,
      newData: data as unknown as Record<string, unknown>,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
