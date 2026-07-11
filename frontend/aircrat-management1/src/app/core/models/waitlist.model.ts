export type WaitlistStatus = 'WAITING' | 'PRIORITY' | 'NOTIFIED' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface WaitlistEntry {
  id?: number;
  waitlistReference?: string;
  bookingId?: number;
  bookingReference?: string;
  passengerId?: number;
  passengerName: string;
  passengerEmail: string;
  phoneNumber: string;
  flightId?: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  classType: string;
  requestedSeats: number;
  priorityScore?: number;
  loyaltyTier: string;
  fareOffer: number;
  currency: string;
  status: WaitlistStatus;
  notificationChannel: string;
  lastNotifiedAt?: string;
  expiresAt?: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WaitlistStats {
  totalEntries: number;
  activeQueue: number;
  priorityEntries: number;
  confirmedEntries: number;
  requestedSeats: number;
}

export interface OverbookingSummary {
  flightId: number;
  flightNumber: string;
  origin: string;
  destination: string;
  waitlisted: number;
  requestedSeats: number;
  avgPriority: number;
}
