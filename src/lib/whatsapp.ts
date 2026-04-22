import { buildWhatsAppUrl, CATEGORY_LABELS } from '@/lib/products'

export function openWhatsAppInquiry(product: {
  name: string
  price?: number | null
  price_on_inquiry?: boolean
  category?: string
  category_name_ar?: string | null
}) {
  const url = buildWhatsAppUrl({
    name: product.name,
    price: product.price ?? null,
    price_on_inquiry: product.price_on_inquiry ?? false,
    category_name_ar: product.category_name_ar ?? (product.category ? CATEGORY_LABELS[product.category] ?? product.category : null),
  })

  window.open(url, '_blank', 'noopener,noreferrer')
}
