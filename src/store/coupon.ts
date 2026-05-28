import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Coupon {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order?: number
  max_uses?: number
  used_count: number
  is_active: boolean
  expires_at?: string
}

interface CouponStore {
  appliedCoupon: Coupon | null
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  getDiscount: (total: number) => number
}

export const useCoupon = create<CouponStore>()(
  persist(
    (set, get) => ({
      appliedCoupon: null,
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),
      getDiscount: (total) => {
        const coupon = get().appliedCoupon
        if (!coupon) return 0
        if (coupon.min_order && total < coupon.min_order) return 0
        if (coupon.discount_type === 'percentage') {
          return Math.round(total * (coupon.discount_value / 100))
        }
        return Math.min(coupon.discount_value, total)
      }
    }),
    { name: 'boox-coupon', version: 1 }
  )
)

// Default coupons (admin can manage these)
export const DEFAULT_COUPONS: Coupon[] = [
  { code: 'BOOX10', discount_type: 'percentage', discount_value: 10, min_order: 500, is_active: true, used_count: 0 },
  { code: 'WELCOME', discount_type: 'fixed', discount_value: 100, min_order: 1000, is_active: true, used_count: 0 },
  { code: 'VIP20', discount_type: 'percentage', discount_value: 20, min_order: 2000, is_active: true, used_count: 0 },
]
