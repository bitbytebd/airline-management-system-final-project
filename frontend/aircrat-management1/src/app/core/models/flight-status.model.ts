export type TrackingFlightStatus =
  'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'EN_ROUTE' | 'APPROACHING' |
  'LANDED' | 'ARRIVED' | 'DELAYED' | 'CANCELLED' | 'DIVERTED' | 'GATE_HOLD';

export interface FlightStatusLog {
  id?: number;
  flightId: number;
  flightNumber: string;
  origin?: string;
  destination?: string;
  scheduledDeparture?: string;
  scheduledArrival?: string;
  actualDeparture?: string;
  actualArrival?: string;
  estimatedArrival?: string;
  flightStatus: TrackingFlightStatus;
  delayMinutes?: number;
  delayReason?: string;
  departureGate?: string;
  arrivalGate?: string;
  terminal?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  altitudeFt?: number;
  speedKmh?: number;
  headingDegree?: number;
  distanceKm?: number;
  remainingDistanceKm?: number;
  distanceRemainingKm?: number;
  estimatedLandingMinutes?: number;
  lastGpsUpdatedAt?: string;
  aircraftIcao?: string;
  aircraftRegistration?: string;
  trackingMode?: string;
  trackingSource?: string;
  lastTrackedAt?: string;
  progressPercent?: number;
  loggedAt?: string;
  loggedBy?: string;
}

export interface TrackingUpdateRequest {
  flightStatus: TrackingFlightStatus;
  delayMinutes?: number;
  delayReason?: string;
  departureGate?: string;
  arrivalGate?: string;
  terminal?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  altitudeFt?: number;
  speedKmh?: number;
  headingDegree?: number;
  distanceKm?: number;
  remainingDistanceKm?: number;
  distanceRemainingKm?: number;
  estimatedLandingMinutes?: number;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  trackingMode?: string;
  trackingSource?: string;
  progressPercent?: number;
  actualDeparture?: string;
  actualArrival?: string;
  estimatedArrival?: string;
}

export interface TrackingAutoCalculateRequest {
  flightId?: number;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  departureTime?: string;
}

export interface LiveMapFlight {
  flightId: number;
  flightNumber: string;
  bookingReferences?: string;
  aircraftIcao?: string;
  aircraftRegistration?: string;
  origin?: string;
  destination?: string;
  flightStatus?: TrackingFlightStatus;
  status?: TrackingFlightStatus;
  currentLatitude: number;
  currentLongitude: number;
  altitudeFt?: number;
  speedKmh?: number;
  headingDegree?: number;
  progressPercent?: number;
  estimatedArrival?: string;
  estimatedLandingMinutes?: number;
  distanceRemainingKm?: number;
  departureGate?: string;
  arrivalGate?: string;
  terminal?: string;
  delayMinutes?: number;
  delayReason?: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  distanceKm?: number;
  remainingDistanceKm?: number;
  trackingMode?: string;
  trackingSource?: string;
  lastTrackedAt?: string;
}
