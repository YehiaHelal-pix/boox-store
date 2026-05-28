export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair'
export type ProductNetwork = 'unlocked' | 'vodafone' | 'orange' | 'etisalat' | 'we'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type RequestStatus = 'pending' | 'in_progress' | 'reviewed' | 'completed' | 'cancelled'

export interface Category {
  id: string
  name: string
  name_ar: string | null
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  name_en: string | null
  icon: string | null
  display_order: number | null
}

export interface ProductRow {
  id: string
  name: string
  slug: string
  description: string | null
  price: number | string | null
  original_price: number | string | null
  model: string
  storage: string
  color: string
  color_hex: string | null
  condition: ProductCondition
  battery_health: number | null
  network: ProductNetwork | null
  images: string[] | null
  in_stock: boolean | null
  stock_quantity: number | null
  is_featured: boolean | null
  is_visible: boolean | null
  warranty_days: number | null
  views_count: number | null
  created_at: string
  updated_at: string
  is_tax_exempt: boolean | null
  tax_value: number | string | null
  category: string | null
  category_id: string | null
  price_on_inquiry: boolean | null
  storage_size: string | null
  grade: string | null
  is_available: boolean | null
  name_ar: string | null
  brand: string | null
  model_year: number | null
  short_description: string | null
  full_description: string | null
  highlights: string[] | null
  internal_price: number | null
  price_hidden: boolean | null
  discount_percentage: number | null
  sim_type: string | null
  region: string | null
  face_id_status: boolean | null
  screen_condition: string | null
  body_condition: string | null
  processor: string | null
  ram: string | null
  battery_cycles: number | null
  screen_size: string | null
  network_type: string | null
  is_new_arrival: boolean | null
  is_best_seller: boolean | null
  show_on_homepage: boolean | null
  homepage_section: string | null
  display_order: number | null
  badge_text: string | null
  badge_color: string | null
  specs: any | null
  in_the_box: string[] | null
  meta_title: string | null
  meta_description: string | null
  internal_notes: string | null
  purchase_price: number | null
}

export interface Product extends Omit<ProductRow, 'price' | 'original_price' | 'tax_value' | 'images'> {
  price: number | null
  original_price: number | null
  tax_value: number | null
  images: string[]
  image_url: string | null
  device_model: string
  storage_size: string
  category: string
  price_on_inquiry: boolean
  category_name_ar: string | null
  category_record: Category | null
  in_stock: boolean
  is_featured: boolean
  is_visible: boolean
  is_available: boolean
  is_tax_exempt: boolean
  stock_quantity: number
}

export interface OrderRow {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string | null
  product_id: string | null
  quantity: number | null
  total_price: number | string | null
  status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Order extends Omit<OrderRow, 'quantity' | 'total_price'> {
  quantity: number
  total_price: number | null
  product_name: string | null
  product_slug: string | null
}

export interface AdminActivityLog {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  performed_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  email: string | null
  is_active: boolean
  created_at: string
}

export interface DashboardStats {
  active_products: number
  total_products: number
  pending_orders: number
  total_orders: number
  completed_orders: number
}

export interface MaintenanceRequest {
  id: string
  customer_name: string
  customer_phone: string
  device_model: string
  issue_description: string
  status: RequestStatus
  estimated_cost: number | null
  notes: string | null
  admin_reply: string | null
  reply_at: string | null
  media_urls: string[]
  created_at: string
  updated_at: string
}

export interface TradeRequest {
  id: string
  customer_name: string
  customer_phone: string
  device_model: string
  device_condition: string
  battery_health: number | null
  desired_model: string | null
  tax_exempt: boolean
  tax_value: number | null
  has_warranty: boolean
  warranty_months: number
  status: RequestStatus
  offered_price: number | null
  notes: string | null
  admin_reply: string | null
  reply_at: string | null
  media_urls: string[]
  created_at: string
  updated_at: string
}

export interface ProductWriteInput {
  name: string
  description?: string | null
  price?: number | null
  original_price?: number | null
  model?: string | null
  category?: string | null
  category_id?: string | null
  storage_size?: string | null
  color?: string | null
  condition?: ProductCondition | null
  battery_health?: number | null
  grade?: string | null
  images?: string[] | null
  in_stock?: boolean | null
  is_featured?: boolean | null
  is_visible?: boolean | null
  is_available?: boolean | null
  price_on_inquiry?: boolean | null
  is_tax_exempt?: boolean | null
  tax_value?: number | null
}

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  display_order: number | null
  is_primary: boolean | null
  created_at: string
}

export type FilterDefinition = {
  id: string
  category_id: string | null
  field_name: string
  label_ar: string
  filter_type: 'select' | 'multi_select' | 'range' | 'boolean' | 'chips' | null
  filter_options: any | null
  display_order: number | null
  is_active: boolean | null
}

export type HomepageSection = {
  id: string
  section_key: string
  title_ar: string | null
  subtitle_ar: string | null
  display_order: number | null
  is_active: boolean | null
  config: any | null
}

export type Lead = {
  id: string
  product_id: string | null
  product_name: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_message: string | null
  source: string | null
  status: 'new' | 'contacted' | 'deal_done' | 'no_deal' | 'follow_up' | null
  admin_notes: string | null
  created_at: string
}

