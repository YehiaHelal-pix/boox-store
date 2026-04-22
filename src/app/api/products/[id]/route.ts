import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuthState, requireAdminApiAccess } from '@/lib/auth/admin'
import { logAdminActivity } from '@/lib/admin-activity'
import { buildProductWritePayload, normalizeProductRow, normalizeCondition, slugify } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Category, ProductRow, ProductWriteInput } from '@/types/database'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name_ar', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Category[]
}

async function findProduct(identifier: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier)

  if (isUuid) {
    const byId = await supabaseAdmin.from('products').select('*').eq('id', identifier).maybeSingle()
    if (byId.error) {
      throw new Error(byId.error.message)
    }

    if (byId.data) {
      return byId.data as ProductRow
    }
  }

  const bySlug = await supabaseAdmin.from('products').select('*').eq('slug', identifier).maybeSingle()
  if (bySlug.error) {
    throw new Error(bySlug.error.message)
  }

  return (bySlug.data ?? null) as ProductRow | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const product = await findProduct(id)

    if (!product) {
      return jsonError('المنتج غير موجود', 404)
    }

    const { isAdmin } = await getAdminAuthState()

    if (!isAdmin && (!(product.is_available ?? true) || !(product.is_visible ?? true))) {
      return jsonError('المنتج غير متاح', 404)
    }

    const categories = await getCategories()
    const categoryMap = new Map<string, Category>()
    categories.forEach((category) => {
      categoryMap.set(category.id, category)
      categoryMap.set(category.slug, category)
    })

    return NextResponse.json(normalizeProductRow(product, categoryMap))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireAdminApiAccess()
  if ('response' in access) {
    return access.response
  }

  try {
    const { id } = await params
    const existing = await findProduct(id)

    if (!existing) {
      return jsonError('المنتج غير موجود', 404)
    }

    const body = (await request.json()) as Partial<ProductWriteInput>
    const categories = await getCategories()
    const payload = buildProductWritePayload(
      {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        price: body.price ?? (typeof existing.price === 'number' ? existing.price : Number(existing.price)),
        original_price:
          body.original_price ?? (typeof existing.original_price === 'number' ? existing.original_price : Number(existing.original_price)),
        model: body.model ?? existing.model,
        category: body.category ?? existing.category,
        category_id: body.category_id ?? existing.category_id,
        storage_size: body.storage_size ?? existing.storage_size ?? existing.storage,
        color: body.color ?? existing.color,
        condition: normalizeCondition(body.condition ?? existing.condition),
        battery_health: body.battery_health ?? existing.battery_health,
        grade: body.grade ?? existing.grade,
        images: body.images ?? existing.images ?? [],
        in_stock: body.in_stock ?? existing.in_stock,
        is_featured: body.is_featured ?? existing.is_featured,
        is_visible: body.is_visible ?? existing.is_visible,
        is_available: body.is_available ?? existing.is_available,
        price_on_inquiry: body.price_on_inquiry ?? existing.price_on_inquiry,
        is_tax_exempt: body.is_tax_exempt ?? existing.is_tax_exempt,
        tax_value:
          body.tax_value ?? (typeof existing.tax_value === 'number' ? existing.tax_value : Number(existing.tax_value)),
      },
      categories,
    )

    if (body.name?.trim() && body.name.trim() !== existing.name) {
      payload.slug = slugify(body.name)
    } else {
      payload.slug = existing.slug
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'update_product',
      entityType: 'product',
      entityId: existing.id,
      oldData: existing as unknown as Record<string, unknown>,
      newData: data as unknown as Record<string, unknown>,
    })

    const categoryMap = new Map<string, Category>()
    categories.forEach((category) => {
      categoryMap.set(category.id, category)
      categoryMap.set(category.slug, category)
    })

    return NextResponse.json(normalizeProductRow(data as ProductRow, categoryMap))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireAdminApiAccess()
  if ('response' in access) {
    return access.response
  }

  try {
    const { id } = await params
    const existing = await findProduct(id)

    if (!existing) {
      return jsonError('المنتج غير موجود', 404)
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        is_available: false,
        is_visible: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'soft_delete_product',
      entityType: 'product',
      entityId: existing.id,
      oldData: existing as unknown as Record<string, unknown>,
      newData: data as unknown as Record<string, unknown>,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
