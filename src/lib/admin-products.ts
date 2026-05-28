import { slugify } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Category, ProductRow, ProductWriteInput } from '@/types/database'

function readString(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function readNullableString(formData: FormData, name: string): string | null {
  const value = readString(formData, name)
  return value || null
}

function readBoolean(formData: FormData, name: string, fallback = false): boolean {
  const value = formData.get(name)
  if (typeof value !== 'string') return fallback

  const normalized = value.trim().toLowerCase()
  if (!normalized) return fallback

  return normalized === 'true' || normalized === '1' || normalized === 'on' || normalized === 'yes'
}

function readNumber(formData: FormData, name: string): number | null {
  const value = readString(formData, name)
  if (!value) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function readStringList(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .flatMap((value) => (typeof value === 'string' ? [value.trim()] : []))
    .filter(Boolean)
}

function sanitizeUploadName(fileName: string) {
  const normalized = fileName.normalize('NFKD')
  const extMatch = normalized.match(/\.[a-zA-Z0-9]+$/)
  const extension = extMatch?.[0]?.toLowerCase() ?? '.png'
  const baseName = normalized
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${baseName || 'product-image'}-${Date.now()}-${crypto.randomUUID()}${extension}`
}

export async function getAdminProductCategories() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name_ar', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Category[]
}

export function buildAdminCategoryMap(categories: Category[]) {
  const categoryMap = new Map<string, Category>()

  categories.forEach((category) => {
    categoryMap.set(category.id, category)
    categoryMap.set(category.slug, category)
  })

  return categoryMap
}

export async function findAdminProduct(identifier: string) {
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

export async function resolveUniqueProductSlug(baseName: string) {
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

export async function removeUploadedProductImages(paths: string[]) {
  if (paths.length === 0) return

  const { error } = await supabaseAdmin.storage.from('product-images').remove(paths)

  if (error) {
    console.error('Failed to clean up uploaded product images:', error.message)
  }
}

export async function parseAdminProductFormData(formData: FormData): Promise<{
  input: ProductWriteInput
  uploadedImagePaths: string[]
}> {
  const existingImages = readStringList(formData, 'existingImages')
  const files = formData.getAll('files').filter((value): value is File => value instanceof File && value.size > 0)
  const uploadedImagePaths: string[] = []
  const uploadedImageUrls: string[] = []

  for (const file of files) {
    const objectPath = `products/${sanitizeUploadName(file.name)}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabaseAdmin.storage.from('product-images').upload(objectPath, fileBuffer, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (error) {
      await removeUploadedProductImages(uploadedImagePaths)
      throw new Error(`فشل رفع الصورة ${file.name}: ${error.message}`)
    }

    const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(objectPath)
    uploadedImagePaths.push(objectPath)
    uploadedImageUrls.push(data.publicUrl)
  }

  return {
    input: {
      name: readString(formData, 'name'),
      description: readNullableString(formData, 'description'),
      price: readNumber(formData, 'price'),
      original_price: readNumber(formData, 'original_price'),
      category: readString(formData, 'category'),
      category_id: readNullableString(formData, 'category_id'),
      model: readNullableString(formData, 'model'),
      storage_size: readNullableString(formData, 'storage_size'),
      color: readNullableString(formData, 'color'),
      condition: readNullableString(formData, 'condition') as ProductWriteInput['condition'],
      battery_health: readNumber(formData, 'battery_health'),
      grade: readNullableString(formData, 'grade'),
      price_on_inquiry: readBoolean(formData, 'price_on_inquiry'),
      in_stock: readBoolean(formData, 'in_stock', true),
      is_featured: readBoolean(formData, 'is_featured'),
      is_visible: readBoolean(formData, 'is_visible', true),
      is_available: readBoolean(formData, 'is_available', true),
      is_tax_exempt: readBoolean(formData, 'is_tax_exempt', true),
      tax_value: readNumber(formData, 'tax_value'),
      images: [...existingImages, ...uploadedImageUrls],
    },
    uploadedImagePaths,
  }
}
