export class Flight {
 id?: number; // Java Long -> TS number
  
  flightNumber: string; // Java String
  origin: string;
  destination: string;
  
  // Java LocalDate -> TS string (Format: "YYYY-MM-DD")
  departureDate: string;
  
  // Java LocalTime -> TS string (Format: "HH:mm")
  departureTime: string;
  
  arrivalDate: string;
  arrivalTime: string;
  
  distance: number; // Java Double -> TS number
  status: string;

  // Pricing
  basePrice: number;
  economyPrice: number;
  premiumPrice: number;
  businessPrice: number;
  firstClassPrice: number;
  totalSeats?: number;

  constructor(values: Partial<Flight> = {}) {
    this.id = values.id;
    this.flightNumber = values.flightNumber || '';
    this.origin = values.origin || '';
    this.destination = values.destination || '';
    this.departureDate = values.departureDate || '';
    this.departureTime = values.departureTime || '';
    this.arrivalDate = values.arrivalDate || '';
    this.arrivalTime = values.arrivalTime || '';
    this.distance = values.distance || 0;
    this.status = values.status || 'Scheduled';
    this.basePrice = values.basePrice || 0;
    this.economyPrice = values.economyPrice || 0;
    this.premiumPrice = values.premiumPrice || 0;
    this.businessPrice = values.businessPrice || 0;
    this.firstClassPrice = values.firstClassPrice || 0;
    this.totalSeats = values.totalSeats || 119;
  }
}
