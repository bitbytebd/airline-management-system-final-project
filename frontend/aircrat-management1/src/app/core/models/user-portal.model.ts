import { Booking } from './booking.model';
import { LoyaltyAccount, LoyaltyTransaction } from './loyalty.model';
import { Payment } from './payment.model';

export interface OtpRequest {
  phoneNumber: string;
}

export interface OtpVerifyRequest {
  phoneNumber: string;
  otp: string;
}

export interface PortalAccessRequest {
  identifier: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  maskedPhone: string;
  smsSent?: boolean;
  demoMode?: boolean;
  expiresInSeconds: number;
  demoOtp?: string;
}

export interface UserPortalProfile {
  passengerId: number | null;
  passengerName: string;
  email: string;
  phone: string;
  passportNumber: string;
}

export interface UserPortalSummary {
  totalBookings: number;
  confirmedBookings: number;
  upcomingFlights: number;
  totalPaid: number;
  totalSavings: number;
  loyaltyPoints: number;
}

export interface UserPortalDashboard {
  profile: UserPortalProfile;
  summary: UserPortalSummary;
  latestBooking: Booking | null;
  bookings: Booking[];
  payments: Payment[];
  loyaltyAccount: LoyaltyAccount | null;
  loyaltyTransactions: LoyaltyTransaction[];
}
