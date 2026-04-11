export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    original_price: number | null
                    category: string
                    image_url: string | null
                    in_stock: boolean
                    stock_count: number
                    is_featured: boolean
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price: number
                    original_price?: number | null
                    category?: string
                    image_url?: string | null
                    in_stock?: boolean
                    stock_count?: number
                    is_featured?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    original_price?: number | null
                    category?: string
                    image_url?: string | null
                    in_stock?: boolean
                    stock_count?: number
                    is_featured?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            site_settings: {
                Row: {
                    key: string
                    value: Json
                    updated_at: string | null
                }
                Insert: {
                    key: string
                    value: Json
                    updated_at?: string | null
                }
                Update: {
                    key?: string
                    value?: Json
                    updated_at?: string | null
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    admin_email: string
                    action: string
                    table_name: string | null
                    record_id: string | null
                    old_data: Json | null
                    new_data: Json | null
                    created_at: string | null
                }
            }
            maintenance_requests: {
                Row: {
                    id: string
                    customer_name: string
                    phone: string
                    device_type: string
                    device_model: string
                    issue: string
                    status: string
                    admin_notes: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    customer_name: string
                    phone: string
                    device_type: string
                    device_model: string
                    issue: string
                    status?: string
                    admin_notes?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    customer_name?: string
                    phone?: string
                    device_type?: string
                    device_model?: string
                    issue?: string
                    status?: string
                    admin_notes?: string | null
                    created_at?: string | null
                }
            }
            trade_requests: {
                Row: {
                    id: string
                    customer_name: string
                    phone: string
                    old_device: string
                    old_condition: string
                    desired_device: string
                    status: string
                    admin_notes: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    customer_name: string
                    phone: string
                    old_device: string
                    old_condition: string
                    desired_device: string
                    status?: string
                    admin_notes?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    customer_name?: string
                    phone?: string
                    old_device?: string
                    old_condition?: string
                    desired_device?: string
                    status?: string
                    admin_notes?: string | null
                    created_at?: string | null
                }
            }
        }
    }
}
