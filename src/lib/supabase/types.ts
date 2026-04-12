export type ProductCondition = 'excellent' | 'good' | 'fair'
export type NetworkType = 'unlocked' | 'vodafone' | 'orange' | 'etisalat' | 'we'
export type RequestStatus = 'pending' | 'in_progress' | 'reviewed' | 'completed' | 'cancelled'

export interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    original_price: number | null
    model: string
    storage: string
    color: string
    color_hex: string
    condition: ProductCondition
    battery_health: number
    network: NetworkType
    images: string[]
    in_stock: boolean
    stock_quantity: number
    is_featured: boolean
    is_visible: boolean
    warranty_days: number
    views_count: number
    created_at: string
    updated_at: string
}

export interface ProductFilters {
    models?: string[]
    conditions?: ProductCondition[]
    storages?: string[]
    colors?: string[]
    networks?: NetworkType[]
    minPrice?: number
    maxPrice?: number
    minBattery?: number
    inStock?: boolean
    search?: string
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
    tax_value: number
    has_warranty: boolean
    warranty_months: number
    status: RequestStatus
    offered_price: number | null
    notes: string | null
    created_at: string
    updated_at: string
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
    created_at: string
    updated_at: string
}
