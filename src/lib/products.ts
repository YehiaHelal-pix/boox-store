import type {
  Category,
  DashboardStats,
  Order,
  OrderRow,
  Product,
  ProductCondition,
  ProductNetwork,
  ProductRow,
  ProductWriteInput,
} from '@/types/database'

export const CATEGORY_LABELS: Record<string, string> = {
  iphone: 'آيفون',
  ipad: 'آيباد',
  macbook: 'ماك بوك',
  accessories: 'إكسسوارات',
  repairs: 'صيانة',
  other: 'أخرى',
}

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: 'جديد',
  like_new: 'شبه جديد',
  good: 'جيد',
  fair: 'مقبول',
}

export const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'] as const
export const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C+', 'C'] as const
export const COLOR_OPTIONS = [
  'أسود',
  'أبيض',
  'فضي',
  'ذهبي',
  'جرافيت',
  'أزرق',
  'أخضر',
  'بنفسجي',
  'وردي',
  'أحمر',
] as const
export const DEFAULT_NETWORK: ProductNetwork = 'unlocked'

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[-\s]+/g, '-')

  return slug || `product-${Date.now()}`
}

export function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toBoolean(value: boolean | null | undefined, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function normalizeImages(images: string[] | null | undefined): string[] {
  if (!Array.isArray(images)) return []
  return images.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

export function normalizeCondition(value: string | null | undefined): ProductCondition {
  if (value === 'new' || value === 'like_new' || value === 'good' || value === 'fair') {
    return value
  }

  if (value === 'excellent') {
    return 'like_new'
  }

  return 'good'
}

export function normalizeProductRow(
  row: ProductRow,
  categoryMap?: Map<string, Category>,
): Product {
  const images = normalizeImages(row.images)
  const categoryKey = row.category ?? 'other'
  const categoryRecord = row.category_id ? categoryMap?.get(row.category_id) ?? categoryMap?.get(categoryKey) ?? null : categoryMap?.get(categoryKey) ?? null

  return {
    ...row,
    price: toNumber(row.price),
    original_price: toNumber(row.original_price),
    tax_value: toNumber(row.tax_value),
    images,
    image_url: images[0] ?? null,
    device_model: row.model,
    model: row.model,
    storage_size: row.storage_size ?? row.storage,
    storage: row.storage_size ?? row.storage,
    category: categoryKey,
    price_on_inquiry: toBoolean(row.price_on_inquiry, false),
    category_name_ar: categoryRecord?.name_ar ?? CATEGORY_LABELS[categoryKey] ?? null,
    category_record: categoryRecord,
    condition: normalizeCondition(row.condition),
    battery_health: row.battery_health ?? null,
    network: row.network ?? DEFAULT_NETWORK,
    in_stock: toBoolean(row.in_stock, true),
    stock_quantity: row.stock_quantity ?? (toBoolean(row.in_stock, true) ? 1 : 0),
    is_featured: toBoolean(row.is_featured, false),
    is_visible: toBoolean(row.is_visible, true),
    is_available: toBoolean(row.is_available, true),
    is_tax_exempt: toBoolean(row.is_tax_exempt, true),
  }
}

export function normalizeOrderRow(row: OrderRow & { products?: Pick<ProductRow, 'name' | 'slug'> | null }): Order {
  return {
    ...row,
    quantity: row.quantity ?? 1,
    total_price: toNumber(row.total_price),
    product_name: row.products?.name ?? null,
    product_slug: row.products?.slug ?? null,
  }
}

export function buildProductWritePayload(input: ProductWriteInput, categories: Category[]): Partial<ProductRow> {
  const images = normalizeImages(input.images)
  const categorySlug = input.category?.trim() || 'other'
  const categoryRecord = categories.find((item) => item.slug === categorySlug)
  const priceOnInquiry = toBoolean(input.price_on_inquiry, false)
  const numericPrice = toNumber(input.price)

  return {
    name: input.name.trim(),
    slug: slugify(input.name),
    description: input.description?.trim() || null,
    price: priceOnInquiry ? 0 : numericPrice ?? 0,
    original_price: toNumber(input.original_price),
    model: input.model?.trim() || 'غير محدد',
    storage: input.storage_size?.trim() || '128GB',
    storage_size: input.storage_size?.trim() || '128GB',
    color: input.color?.trim() || 'أسود',
    color_hex: null,
    condition: normalizeCondition(input.condition),
    battery_health: input.battery_health ?? null,
    network: DEFAULT_NETWORK,
    images,
    in_stock: toBoolean(input.in_stock, true),
    stock_quantity: toBoolean(input.in_stock, true) ? Math.max(images.length > 0 ? 1 : 1, 1) : 0,
    is_featured: toBoolean(input.is_featured, false),
    is_visible: toBoolean(input.is_visible, true),
    warranty_days: 30,
    views_count: 0,
    is_tax_exempt: toBoolean(input.is_tax_exempt, true),
    tax_value: toNumber(input.tax_value),
    category: categorySlug,
    category_id: input.category_id ?? categoryRecord?.id ?? null,
    price_on_inquiry: priceOnInquiry,
    grade: input.grade?.trim() || null,
    is_available: toBoolean(input.is_available, true),
    updated_at: new Date().toISOString(),
  }
}

export function getConditionLabel(condition: ProductCondition): string {
  return CONDITION_LABELS[condition]
}

export function parseSearchValue(value: string | null): string {
  return (value ?? '').trim().toLowerCase()
}

export function matchesSearch(product: Product, search: string): boolean {
  if (!search) return true

  const haystack = [
    product.name,
    product.device_model,
    product.description ?? '',
    product.color,
    product.storage_size,
    product.category_name_ar ?? '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export function normalizeDashboardStats(payload: Record<string, unknown>): DashboardStats {
  return {
    active_products: Number(payload.active_products ?? 0),
    total_products: Number(payload.total_products ?? 0),
    pending_orders: Number(payload.pending_orders ?? 0),
    total_orders: Number(payload.total_orders ?? 0),
    completed_orders: Number(payload.completed_orders ?? 0),
  }
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/[^\d+]/g, '')
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone).replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP || '201113614021'
}

export function buildWhatsAppUrl(product: Pick<Product, 'name' | 'price' | 'price_on_inquiry' | 'category_name_ar'>): string {
  const lines = [
    'السلام عليكم بوكس ستور',
    `أنا مهتم بـ: ${product.name}`,
  ]

  if (!product.price_on_inquiry && typeof product.price === 'number') {
    lines.push(`السعر: ${product.price.toLocaleString('ar-EG')} جنيه`)
  }

  if (product.category_name_ar) {
    lines.push(`الفئة: ${product.category_name_ar}`)
  }

  lines.push('ممكن تفاصيل أكتر؟')
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(lines.join('\n'))}`
}
