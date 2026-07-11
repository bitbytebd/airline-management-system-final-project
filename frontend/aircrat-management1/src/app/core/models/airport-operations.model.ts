export interface SpecialAssistanceRequest {
  id?: number;
  requestReference?: string;
  bookingId?: number;
  bookingReference?: string;
  passengerName?: string;
  passengerEmail?: string;
  passengerPhone?: string;
  flightNumber?: string;
  route?: string;
  departureDate?: string;
  services?: string;
  priority?: string;
  contactPreference?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
}

export interface BaggageSupportCase {
  id?: number;
  caseReference?: string;
  bookingId?: number;
  bookingReference?: string;
  passengerName?: string;
  passengerEmail?: string;
  flightNumber?: string;
  route?: string;
  departureDate?: string;
  issueType?: string;
  checkedBags?: number;
  checkedWeightKg?: number;
  cabinWeightKg?: number;
  allowanceKg?: number;
  excessKg?: number;
  estimatedFee?: number;
  status?: string;
  notes?: string;
  createdAt?: string;
}

export interface BoardingPassRecord {
  id?: number;
  passReference?: string;
  bookingId?: number;
  bookingReference?: string;
  passengerName?: string;
  flightNumber?: string;
  route?: string;
  departureDate?: string;
  departureTime?: string;
  boardingTime?: string;
  gate?: string;
  seatNumber?: string;
  zone?: string;
  classType?: string;
  status?: string;
  issuedAt?: string;
}
