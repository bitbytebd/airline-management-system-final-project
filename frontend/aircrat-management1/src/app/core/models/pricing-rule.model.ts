export interface PricingRule {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  distance: number;
  economyPrice: number;
  premiumPrice: number;
  businessPrice: number;
  firstClassPrice: number;
  totalSeats: number;
  status: string;
}

export interface PricingSimulation {
  classType: string;
  baseFare: number;
  demandMultiplier: number;
  loadFactor: number;
  tax: number;
  suggestedFare: number;
  projectedRevenue: number;
}
