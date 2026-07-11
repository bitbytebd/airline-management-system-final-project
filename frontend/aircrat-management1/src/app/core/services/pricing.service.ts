import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Flight } from '../models/flight.model';
import { PricingRule } from '../models/pricing-rule.model';
import { FlightService } from './flight.service';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  constructor(private flightService: FlightService) { }

  getRules(): Observable<PricingRule[]> {
    return this.flightService.getAll().pipe(map(flights => (flights || []).map(f => this.fromFlight(f))));
  }

  updateRule(id: number, rule: Partial<PricingRule>): Observable<Flight> {
    return this.flightService.getById(id).pipe(
      map(flight => ({ ...flight, ...rule } as Flight))
    );
  }

  saveFlightPricing(flight: Flight): Observable<Flight> {
    return this.flightService.update(flight.id!, flight);
  }

  private fromFlight(f: Flight): PricingRule {
    return {
      id: f.id || 0,
      flightNumber: f.flightNumber || '',
      origin: f.origin || '',
      destination: f.destination || '',
      departureDate: f.departureDate || '',
      distance: f.distance || 0,
      economyPrice: f.economyPrice || f.basePrice || 0,
      premiumPrice: f.premiumPrice || 0,
      businessPrice: f.businessPrice || 0,
      firstClassPrice: f.firstClassPrice || 0,
      totalSeats: f.totalSeats || 119,
      status: f.status || 'SCHEDULED'
    };
  }
}
