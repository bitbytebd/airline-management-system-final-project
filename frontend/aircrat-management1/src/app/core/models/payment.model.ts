// ═══════════════════════════════════════════════════════════════════
// FILE: src/app/core/models/payment.model.ts
// Mirrors Payment.java entity and PaymentDTO exactly
// ═══════════════════════════════════════════════════════════════════

// ── Enums matching backend ────────────────────────────────────────
export type PaymentStatus =
  | 'PENDING' | 'PROCESSING' | 'COMPLETED'
  | 'FAILED'  | 'REFUNDED'   | 'CANCELLED' | 'PARTIAL';

export type PaymentPurpose = 'BOOKING_PAYMENT' | 'EXPENSE_PAYMENT';

export type PaymentMethod =
  | 'CREDIT_CARD' | 'DEBIT_CARD'  | 'BANK_TRANSFER'
  | 'BKASH'       | 'NAGAD'       | 'ROCKET'
  | 'CASH'        | 'LOYALTY_POINTS' | 'ONLINE_PAYMENT';

// ── Main Payment interface (mirrors Payment.java) ─────────────────
export interface Payment {
  id:                   number;
  paymentReference:     string;        // PAY-20250510-ABCD
  paymentPurpose?:      PaymentPurpose;
  bookingId:            number | null;
  bookingReference:     string | null;
  expenseId?:           number | null;
  expenseReference?:    string | null;
  passengerId:          number | null;
  passengerName:        string | null;
  passengerEmail:       string | null;
  flightNumber:         string | null;
  flightRoute:          string | null;
  baseFare:             number;
  taxAmount:            number;
  discountAmount:       number;
  loyaltyDiscount:      number;
  couponDiscount:       number;
  totalAmount:          number;
  amount?:              number;
  currency:             string;
  paymentMethod:        PaymentMethod;
  gatewayName:          string | null;
  cardLastFour:         string | null;
  cardBrand:            string | null;
  mobileNumber:         string | null;
  bankName:             string | null;
  accountNumber:        string | null;
  transactionReference: string | null;
  gatewayResponseCode:  string | null;
  gatewayMessage:       string | null;
  status:               PaymentStatus;
  paymentStatus?:       string | null;
  failureReason:        string | null;
  retryCount:           number;
  couponCode:           string | null;
  loyaltyPointsUsed:    number;
  initiatedAt:          string | null;
  completedAt:          string | null;
  paidAt?:              string | null;
  createdAt:            string;
  createdBy:            string | null;
  notes:                string | null;
}

// ── Stats DTO (matches PaymentDTO.PaymentStats) ───────────────────
export interface PaymentStats {
  totalRevenue:    number;
  monthlyRevenue:  number;
  dailyRevenue:    number;
  completedCount:  number;
  pendingCount:    number;
  failedCount:     number;
  refundedCount:   number;
  totalCount:      number;
}

// ── Request DTO (matches PaymentDTO.ProcessRequest) ───────────────
export interface ProcessPaymentRequest {
  bookingId:           number;
  paymentMethod:       PaymentMethod;
  gatewayName?:        string;
  cardLastFour?:       string;
  cardBrand?:          string;
  mobileNumber?:       string;
  bankName?:           string;
  couponCode?:         string;
  loyaltyPointsToUse?: number;
  notes?:              string;
}

export interface ProcessExpensePaymentRequest {
  paymentMethod: PaymentMethod;
  paidAmount: number;
  transactionReference?: string;
  notes?: string;
}

// ── UI Metadata ───────────────────────────────────────────────────
export interface StatusMeta {
  label:    string;
  color:    string;
  bg:       string;
  border:   string;
  icon:     string;
  glow:     string;
}

export interface MethodMeta {
  label:    string;
  icon:     string;
  color:    string;
  gradient: string;
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  PENDING:    { label:'Pending',    color:'#f39c12', bg:'rgba(243,156,18,.15)', border:'rgba(243,156,18,.3)', icon:'fa-clock',          glow:'rgba(243,156,18,.25)' },
  PROCESSING: { label:'Processing', color:'#00b4d8', bg:'rgba(0,180,216,.15)', border:'rgba(0,180,216,.3)',  icon:'fa-circle-notch',   glow:'rgba(0,180,216,.25)'  },
  COMPLETED:  { label:'Completed',  color:'#2ed573', bg:'rgba(46,213,115,.15)',border:'rgba(46,213,115,.3)', icon:'fa-check-circle',   glow:'rgba(46,213,115,.25)' },
  FAILED:     { label:'Failed',     color:'#ff4757', bg:'rgba(255,71,87,.15)', border:'rgba(255,71,87,.3)',  icon:'fa-times-circle',   glow:'rgba(255,71,87,.25)'  },
  REFUNDED:   { label:'Refunded',   color:'#a29bfe', bg:'rgba(162,155,254,.15)',border:'rgba(162,155,254,.3)',icon:'fa-undo-alt',      glow:'rgba(162,155,254,.25)'},
  CANCELLED:  { label:'Cancelled',  color:'#8a9db5', bg:'rgba(138,157,181,.12)',border:'rgba(138,157,181,.25)',icon:'fa-ban',          glow:'rgba(138,157,181,.15)'},
  PARTIAL:    { label:'Partial',    color:'#fd9644', bg:'rgba(253,150,68,.15)', border:'rgba(253,150,68,.3)', icon:'fa-adjust',        glow:'rgba(253,150,68,.25)' },
};

export const PAYMENT_METHOD_META: Record<PaymentMethod, MethodMeta> = {
  CREDIT_CARD:     { label:'Credit Card',     icon:'fa-credit-card',     color:'#00b4d8', gradient:'linear-gradient(135deg,#00b4d8,#0077b6)' },
  DEBIT_CARD:      { label:'Debit Card',      icon:'fa-credit-card',     color:'#2ed573', gradient:'linear-gradient(135deg,#2ed573,#00b09b)' },
  BANK_TRANSFER:   { label:'Bank Transfer',   icon:'fa-university',      color:'#a29bfe', gradient:'linear-gradient(135deg,#a29bfe,#6c5ce7)' },
  BKASH:           { label:'bKash',           icon:'fa-mobile-alt',      color:'#ff4757', gradient:'linear-gradient(135deg,#e91e8c,#c2185b)' },
  NAGAD:           { label:'Nagad',           icon:'fa-mobile-alt',      color:'#fd9644', gradient:'linear-gradient(135deg,#fd9644,#e67e22)' },
  ROCKET:          { label:'Rocket',          icon:'fa-mobile-alt',      color:'#a29bfe', gradient:'linear-gradient(135deg,#8e44ad,#6c3483)' },
  CASH:            { label:'Cash',            icon:'fa-money-bill-wave', color:'#ffd700', gradient:'linear-gradient(135deg,#ffd700,#f39c12)' },
  LOYALTY_POINTS:  { label:'Loyalty Points',  icon:'fa-star',            color:'#ffd700', gradient:'linear-gradient(135deg,#ffd700,#f39c12)' },
  ONLINE_PAYMENT:  { label:'Online Payment',  icon:'fa-globe',           color:'#00b4d8', gradient:'linear-gradient(135deg,#00b4d8,#0077b6)' },
};
