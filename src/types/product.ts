export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    original_price: number | null
    category: 'iphone' | 'ipad' | 'macbook' | 'airpods' | 'accessories' | 'other'
    image_url: string | null
    in_stock: boolean
    stock_count: number
    is_featured: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

export type ProductCategory = Product['category']
export interface CartItem extends Product { quantity: number }
