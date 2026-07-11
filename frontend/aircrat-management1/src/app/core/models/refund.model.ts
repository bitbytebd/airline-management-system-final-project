// src/app/core/models/refund.model.ts

// ── Enum types matching backend ───────────────────────────────────
export type RefundStatus = 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED';

export type RefundReason =
  | 'PASSENGER_CANCEL'
  | 'FLIGHT_CANCEL'
  | 'FLIGHT_DELAY'
  | 'OVERBOOKING'
  | 'MEDICAL'
  | 'WEATHER'
  | 'DUPLICATE_BOOKING'
  | 'OTHER';

// ── Main Refund Class (Mirrors Refund.java) ────────────────────────
export class Refund {
  id?: number;
  refundReference: string = '';
  bookingId: number = 0;
  bookingReference: string = '';
  passengerId?: number;
  passengerName: string = '';
  passengerEmail: string = '';
  flightNumber: string = '';
  flightRoute: string = '';
  departureDate: string = '';
  classType: string = '';
  originalAmount: number = 0;
  penaltyPercentage: number = 0;
  penaltyAmount: number = 0;
  refundAmount: number = 0;
  paymentMethod: string = '';
  refundReason: RefundReason = 'OTHER';
  reasonNotes: string = '';
  status: RefundStatus = 'PENDING';
  requestedAt: string = '';
  processedAt?: string | null;
  processedBy?: string | null;

  // You can add helper methods here if needed
  constructor(data?: Partial<Refund>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// ── Stats DTO ─────────────────────────────────────────────────────
export class RefundStats {
  pendingCount: number = 0;
  approvedCount: number = 0;
  processedCount: number = 0;
  rejectedCount: number = 0;
  totalRefunded: number = 0;
  totalPenalty: number = 0;
}

// ── Penalty Preview DTO ───────────────────────────────────────────
export class PenaltyPreview {
  bookingId: number = 0;
  bookingReference: string = '';
  passengerName: string = '';
  flightNumber: string = '';
  flightRoute: string = '';
  originalAmount: number = 0;
  penaltyPercentage: number = 0;
  penaltyAmount: number = 0;
  refundAmount: number = 0;
  penaltyReason: string = ''; // Human-readable explanation
}

// ── Request DTOs ──────────────────────────────────────────────────
export class InitiateRefundRequest {
  bookingId: number = 0;
  reason: RefundReason = 'OTHER';
  notes?: string;
}

// ── Booking (used in refund-initiate search result display) ───────
export class BookingForRefund {
  id: number = 0;
  bookingReference: string = '';
  passengerName: string = '';
  email: string = '';
  flightNumber: string = '';
  origin: string = '';
  destination: string = '';
  departureDate: string = '';
  departureTime: string = '';
  classType: string = '';
  seatNumber: string = '';
  totalPrice: number = 0;
  paymentMethod: string = '';
  status: string = '';
}

// ── UI Helper: Status metadata ────────────────────────────────────
export interface StatusMeta {
  color: string;
  bg: string;
  border: string;
  icon: string;
  label: string;
}

export const REFUND_STATUS_META: Record<RefundStatus, StatusMeta> = {
  PENDING:   { color: '#f39c12', bg: 'rgba(243,156,18,.15)',  border: 'rgba(243,156,18,.35)',  icon: 'fa-clock',        label: 'Pending'   },
  APPROVED:  { color: '#00b4d8', bg: 'rgba(0,180,216,.15)',   border: 'rgba(0,180,216,.35)',   icon: 'fa-check-circle', label: 'Approved'  },
  PROCESSED: { color: '#2ed573', bg: 'rgba(46,213,115,.15)',  border: 'rgba(46,213,115,.35)',  icon: 'fa-paper-plane',  label: 'Processed' },
  REJECTED:  { color: '#ff4757', bg: 'rgba(255,71,87,.15)',   border: 'rgba(255,71,87,.35)',   icon: 'fa-times-circle', label: 'Rejected'  },
};

export const REASON_LABELS: Record<RefundReason, string> = {
  PASSENGER_CANCEL:  'Passenger Cancellation',
  FLIGHT_CANCEL:     'Flight Cancelled by Airline',
  FLIGHT_DELAY:      'Significant Flight Delay',
  OVERBOOKING:       'Bumped — Overbooking',
  MEDICAL:           'Medical Emergency',
  WEATHER:           'Weather Disruption',
  DUPLICATE_BOOKING: 'Duplicate Booking',
  OTHER:             'Other Reason',
};