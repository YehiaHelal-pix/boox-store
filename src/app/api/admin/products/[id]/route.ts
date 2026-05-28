import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { logAdminActivity } from '@/lib/admin-activity'
import {
  buildAdminCategoryMap,
  findAdminProduct,
  getAdminProductCategories,
  parseAdminProductFormData,
  removeUploadedProductImages,
} from '@/lib/admin-products'
import { buildProductWritePayload, normalizeCondition, normalizeProductRow, slugify } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductRow } from '@/types/database'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireAdminApiAccess()
  if ('response' in access) {
    return access.response
  }

  let uploadedImagePaths: string[] = []

  try {
    const { id } = await params
    const existing = await findAdminProduct(id)

    if (!existing) {
      return jsonError('المنتج غير موجود', 404)
    }

    const formData = await request.formData()
    const { input, uploadedImagePaths: paths } = await parseAdminProductFormData(formData)
    uploadedImagePaths = paths

    const categories = await getAdminProductCategories()
    const payload = buildProductWritePayload(
      {
        name: input.name?.trim() || existing.name,
        description: input.description ?? existing.description,
        price: input.price ?? (typeof existing.price === 'number' ? existing.price : Number(existing.price)),
        original_price: input.original_price ?? (typeof existing.original_price === 'number' ? existing.original_price : Number(existing.original_price)),
        model: input.model ?? existing.model,
        category: input.category?.trim() || existing.category,
        category_id: input.category_id ?? existing.category_id,
        storage_size: input.storage_size ?? existing.storage_size ?? existing.storage,
        color: input.color ?? existing.color,
        condition: normalizeCondition(input.condition ?? existing.condition),
        battery_health: input.battery_health ?? existing.battery_health,
        grade: input.grade ?? existing.grade,
        images: input.images ?? existing.images ?? [],
        in_stock: input.in_stock ?? existing.in_stock,
        is_featured: input.is_featured ?? existing.is_featured,
        is_visible: input.is_visible ?? existing.is_visible,
        is_available: input.is_available ?? existing.is_available,
        price_on_inquiry: input.price_on_inquiry ?? existing.price_on_inquiry,
        is_tax_exempt: input.is_tax_exempt ?? existing.is_tax_exempt,
        tax_value: input.tax_value ?? (typeof existing.tax_value === 'number' ? existing.tax_value : Number(existing.tax_value)),
      },
      categories,
    )

    payload.slug = input.name?.trim() && input.name.trim() !== existing.name ? slugify(input.name) : existing.slug

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
      throw new Error(error.message)
    }

    await logAdminActivity({
      action: 'update_product',
      entityType: 'product',
      entityId: existing.id,
      oldData: existing as unknown as Record<string, unknown>,
      newData: data as unknown as Record<string, unknown>,
    })

    return NextResponse.json(normalizeProductRow(data as ProductRow, buildAdminCategoryMap(categories)))
  } catch (error) {
    await removeUploadedProductImages(uploadedImagePaths)
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
