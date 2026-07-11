export interface Airline {
  id?: number;
  airlineName: string;
  airlineCode: string;
  country: string;
  status: string;
  headquarters?: string;
  alliance?: string;
  fleetSize?: number;
  iataPrefix?: string;
  primaryHub?: string;
  supportEmail?: string;
  supportPhone?: string;
  logoUrl?: string;
}
