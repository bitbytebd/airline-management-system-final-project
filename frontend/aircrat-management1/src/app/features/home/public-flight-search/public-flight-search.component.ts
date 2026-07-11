import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Flight } from 'src/app/core/models/flight.model';
import { FlightService } from 'src/app/core/services/flight.service';

@Component({
  selector: 'app-public-flight-search',
  templateUrl: './public-flight-search.component.html',
  styleUrls: ['./public-flight-search.component.css']
})
export class PublicFlightSearchComponent implements OnInit {
  flights: Flight[] = [];
  filteredFlights: Flight[] = [];
  loading = true;
  errorMessage = '';

  from = '';
  to = '';
  date = '';
  validationMessage = '';
  minTravelDate = new Date().toISOString().slice(0, 10);

  constructor(
    private flightService: FlightService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.from = params.get('from') || '';
      this.to = params.get('to') || '';
      this.date = params.get('date') || '';
      this.loadFlights();
    });
  }

  loadFlights(): void {
    this.loading = true;
    this.errorMessage = '';
    this.flightService.getAll().subscribe({
      next: flights => {
        this.flights = flights || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.filteredFlights = [];
        this.loading = false;
        this.errorMessage = 'Unable to load public flight options right now.';
      }
    });
  }

  search(): void {
    this.validationMessage = '';
    if (this.from.trim() && this.to.trim() && this.sameAirport(this.from, this.to)) {
      this.validationMessage = 'Origin and destination cannot be the same.';
      return;
    }

    const normalizedDate = this.normalizeDate(this.date);
    if (normalizedDate && normalizedDate < this.minTravelDate) {
      this.validationMessage = 'Departure date cannot be in the past.';
      return;
    }

    const queryParams: { [key: string]: string } = {};
    if (this.from.trim()) queryParams['from'] = this.from.trim();
    if (this.to.trim()) queryParams['to'] = this.to.trim();
    if (normalizedDate) queryParams['date'] = normalizedDate;
    this.router.navigate(['/flights/search'], { queryParams });
  }

  selectFlight(flight: Flight): void {
    if (!flight.id || !this.isBookable(flight)) return;
    this.router.navigate(['/public-booking'], { queryParams: { flightId: flight.id } });
  }

  formatMoney(value?: number): string {
    return '$' + Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  formatDuration(flight: Flight): string {
    const departure = this.parseDeparture(flight);
    const arrival = this.parseArrival(flight);
    if (!departure || !arrival) return 'TBA';
    const minutes = Math.max(0, Math.round((arrival.getTime() - departure.getTime()) / 60000));
    if (!minutes) return 'TBA';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  }

  statusClass(status?: string): string {
    const normalized = (status || 'SCHEDULED').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `status-${normalized}`;
  }

  routeLabel(value?: string): string {
    return (value || 'N/A')
      .replace(/\b[A-Z]{3}\b\s*[-–—]?\s*/g, '')
      .replace(/\(([^)]+)\)/g, '')
      .trim() || value || 'N/A';
  }

  airportCode(value?: string): string {
    const match = (value || '').match(/\b[A-Z]{3}\b/);
    return match ? match[0] : this.routeLabel(value).substring(0, 3).toUpperCase();
  }

  private applyFilters(): void {
    const from = this.normalizeRouteQuery(this.from);
    const to = this.normalizeRouteQuery(this.to);
    const date = this.normalizeDate(this.date);

    this.filteredFlights = this.flights
      .filter(flight => this.isBookable(flight))
      .filter(flight => !from || this.normalizeRouteQuery(flight.origin) === from)
      .filter(flight => !to || this.normalizeRouteQuery(flight.destination) === to)
      .filter(flight => !date || this.normalizeDate(flight.departureDate) === date)
      .sort((a, b) => `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`));
  }

  private isBookable(flight: Flight): boolean {
    const blocked = ['CANCELLED', 'CANCELED', 'LANDED', 'DEPARTED', 'COMPLETED'];
    const status = (flight.status || '').trim().toUpperCase();
    if (blocked.includes(status)) return false;

    const departure = this.parseDeparture(flight);
    if (!departure) return false;
    return departure.getTime() > Date.now() + 30 * 60 * 1000;
  }

  private parseDeparture(flight: Flight): Date | null {
    if (!flight.departureDate || !flight.departureTime) return null;
    const time = flight.departureTime.length === 5 ? `${flight.departureTime}:00` : flight.departureTime;
    const parsed = new Date(`${flight.departureDate}T${time}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private parseArrival(flight: Flight): Date | null {
    if (!flight.arrivalTime) return null;
    const date = flight.arrivalDate || flight.departureDate;
    if (!date) return null;
    const time = flight.arrivalTime.length === 5 ? `${flight.arrivalTime}:00` : flight.arrivalTime;
    const parsed = new Date(`${date}T${time}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private sameAirport(from: string, to: string): boolean {
    return this.normalizeRouteQuery(from) === this.normalizeRouteQuery(to);
  }

  private normalizeRouteQuery(value?: string): string {
    let text = (value || '').trim();
    if (!text) return '';
    if (text.includes(' - ')) {
      text = text.split(' - ').slice(1).join(' - ');
    }
    text = text
      .replace(/\b[A-Z]{3}\b\s*[-–—]?\s*/g, '')
      .replace(/\(([^)]+)\)/g, '')
      .trim();
    return this.normalize(text).replace(/[^a-z0-9]/g, '');
  }

  private normalizeDate(value?: string): string {
    const raw = (value || '').trim();
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const usDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usDate) {
      const month = usDate[1].padStart(2, '0');
      const day = usDate[2].padStart(2, '0');
      return `${usDate[3]}-${month}-${day}`;
    }
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return raw;
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalize(value?: string): string {
    return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
}
