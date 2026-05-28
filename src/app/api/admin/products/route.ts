import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { logAdminActivity } from '@/lib/admin-activity'
import {
  buildAdminCategoryMap,
  getAdminProductCategories,
  parseAdminProductFormData,
  removeUploadedProductImages,
  resolveUniqueProductSlug,
} from '@/lib/admin-products'
import { buildProductWritePayload, normalizeProductRow } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductRow } from '@/types/database'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  const access = await requireAdminApiAccess()
  if ('response' in access) {
    return access.response
  }

  let uploadedImagePaths: string[] = []

  try {
    const formData = await request.formData()
    const { input, uploadedImagePaths: paths } = await parseAdminProductFormData(formData)
    uploadedImagePaths = paths

    if (!input.name?.trim()) {
      await removeUploadedProductImages(uploadedImagePaths)
      return jsonError('اسم المنتج مطلوب', 400)
    }

    if (!input.category?.trim()) {
      await removeUploadedProductImages(uploadedImagePaths)
      return jsonError('القسم مطلوب', 400)
    }

    if (!input.price_on_inquiry && (input.price === null || input.price === undefined || Number(input.price) < 0)) {
      await removeUploadedProductImages(uploadedImagePaths)
      return jsonError('السعر مطلوب', 400)
    }

    const categories = await getAdminProductCategories()
    const payload = buildProductWritePayload(input, categories)
    payload.slug = await resolveUniqueProductSlug(input.name)
    payload.created_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await logAdminActivity({
      action: 'create_product',
      entityType: 'product',
      entityId: data.id,
      newData: payload as Record<string, unknown>,
    })

    return NextResponse.json(normalizeProductRow(data as ProductRow, buildAdminCategoryMap(categories)), { status: 201 })
  } catch (error) {
    await removeUploadedProductImages(uploadedImagePaths)
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
