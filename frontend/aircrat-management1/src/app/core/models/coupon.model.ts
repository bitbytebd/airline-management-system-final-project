export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface Coupon {
  id?: number;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumBookingAmount: number;
  maximumDiscountAmount: number;
  currency: string;
  applicableRoute: string;
  applicableCabin: string;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  status: CouponStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  discountAmount: number;
  finalAmount: number;
  coupon?: Coupon;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  expiringSoon: number;
}

export const emptyCoupon = (): Coupon => ({
  code: '',
  title: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minimumBookingAmount: 100,
  maximumDiscountAmount: 75,
  currency: 'USD',
  applicableRoute: 'ALL',
  applicableCabin: 'ALL',
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  usageLimit: 500,
  usedCount: 0,
  status: 'ACTIVE'
});
