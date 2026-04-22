import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { logAdminActivity } from '@/lib/admin-activity'
import {
  buildProductWritePayload,
  normalizeProductRow,
  normalizeCondition,
  parseSearchValue,
  slugify,
} from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Category, ProductRow, ProductWriteInput } from '@/types/database'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function parseListParam(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
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

async function resolveUniqueSlug(baseName: string) {
  const baseSlug = slugify(baseName)
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return baseSlug
  }

  return `${baseSlug}-${Date.now()}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminMode = isAdminRequest(request)
    const categories = await getCategories()
    const categoryMap = new Map<string, Category>()

    categories.forEach((category) => {
      categoryMap.set(category.id, category)
      categoryMap.set(category.slug, category)
    })

    let query = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false })

    if (!adminMode) {
      query = query.eq('is_available', true).eq('is_visible', true)
    }

    const category = searchParams.get('category')
    const search = parseSearchValue(searchParams.get('search'))
    const condition = parseListParam(searchParams.get('condition')).map(normalizeCondition)
    const colors = parseListParam(searchParams.get('color'))
    const storageSizes = parseListParam(searchParams.get('storage'))
    const featured = searchParams.get('featured')
    const minPrice = Number(searchParams.get('min_price') ?? '')
    const maxPrice = Number(searchParams.get('max_price') ?? '')
    const batteryMin = Number(searchParams.get('battery_min') ?? '')

    if (category) query = query.eq('category', category)
    if (condition.length === 1) query = query.eq('condition', condition[0])
    if (condition.length > 1) query = query.in('condition', condition)
    if (colors.length === 1) query = query.eq('color', colors[0])
    if (colors.length > 1) query = query.in('color', colors)
    if (storageSizes.length === 1) query = query.eq('storage_size', storageSizes[0])
    if (storageSizes.length > 1) query = query.in('storage_size', storageSizes)
    if (!Number.isNaN(minPrice)) query = query.gte('price', minPrice)
    if (!Number.isNaN(maxPrice) && maxPrice > 0) query = query.lte('price', maxPrice)
    if (!Number.isNaN(batteryMin) && batteryMin > 0) query = query.gte('battery_health', batteryMin)
    if (featured === '1' || featured === 'true') query = query.eq('is_featured', true)

    const { data, error } = await query

    if (error) {
      return jsonError(error.message, 500)
    }

    const products = ((data ?? []) as ProductRow[])
      .map((row) => normalizeProductRow(row, categoryMap))
      .filter((product) => {
        if (!search) return true
        return [
          product.name,
          product.device_model,
          product.description ?? '',
          product.storage_size,
          product.color,
          product.category_name_ar ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(search)
      })

    return NextResponse.json(products)
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
    const body = (await request.json()) as ProductWriteInput

    if (!body.name?.trim()) {
      return jsonError('اسم المنتج مطلوب', 400)
    }

    if (!body.category?.trim()) {
      return jsonError('القسم مطلوب', 400)
    }

    if (!body.price_on_inquiry && (body.price === null || body.price === undefined || Number(body.price) < 0)) {
      return jsonError('السعر مطلوب', 400)
    }

    const categories = await getCategories()
    const payload = buildProductWritePayload(body, categories)
    payload.slug = await resolveUniqueSlug(body.name)
    payload.created_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return jsonError(error.message, 500)
    }

    await logAdminActivity({
      action: 'create_product',
      entityType: 'product',
      entityId: data.id,
      newData: payload as Record<string, unknown>,
    })

    const categoryMap = new Map<string, Category>()
    categories.forEach((category) => {
      categoryMap.set(category.id, category)
      categoryMap.set(category.slug, category)
    })

    return NextResponse.json(normalizeProductRow(data as ProductRow, categoryMap), { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
