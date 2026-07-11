import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from 'src/app/core/models/booking.model';
import { FlightStatusLog } from 'src/app/core/models/flight-status.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-tracking-status',
  template: `
    <div class="tracking-page">
      <section class="tracking-hero status-hero">
        <div>
          <span class="eyebrow">Passenger Status Board</span>
          <h1>Flight Status</h1>
          <p>Search by flight number or booking reference to view passenger-safe flight status, gate, delay, and live movement details.</p>
          <div class="hero-actions">
            <button type="button" (click)="goList()"><i class="fas fa-list"></i> Live Tracking</button>
          </div>
        </div>
        <div class="hero-panel">
          <span>Selected</span>
          <strong>{{ selected?.flightNumber || 'None' }}</strong>
          <small>{{ selected?.flightStatus || 'Choose a flight' }}</small>
        </div>
      </section>

      <section class="toolbar-card">
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input [(ngModel)]="searchText" (input)="refreshSuggestions()" (focus)="refreshSuggestions()" (keyup.enter)="findPassengerStatus()" placeholder="Search flight number or booking reference / PNR">
          <button type="button" *ngIf="searchText" (click)="clearSearch()"><i class="fas fa-times"></i></button>
          <div class="suggestions" *ngIf="showSuggestions && suggestions.length">
            <button type="button" *ngFor="let item of suggestions" (click)="selectFlight(item)">
              <strong>{{ item.flightNumber }}</strong>
              <span>{{ item.origin }} to {{ item.destination }} | {{ item.flightStatus }}</span>
            </button>
          </div>
        </div>
        <div class="passenger-search-actions">
          <button type="button" (click)="findPassengerStatus()" [disabled]="loadingSearch"><i class="fas fa-ticket-alt"></i> Track Flight</button>
          <span *ngIf="searchMessage">{{ searchMessage }}</span>
        </div>
      </section>

      <main class="status-layout" *ngIf="selected">
        <section class="status-card">
          <div class="route-line">
            <div><small>From</small><strong>{{ selected.origin }}</strong></div>
            <i class="fas fa-plane"></i>
            <div><small>To</small><strong>{{ selected.destination }}</strong></div>
          </div>
          <div class="status-strip">
            <span class="status-pill" [ngClass]="statusClass(selected.flightStatus)">{{ selected.flightStatus }}</span>
            <strong>{{ formatProgress(selected.progressPercent) }} complete</strong>
          </div>
          <div class="progress big"><span [style.width.%]="selected.progressPercent || 0"></span></div>
          <div class="info-grid">
            <article><span>Departure</span><strong>{{ formatSchedule(selected.scheduledDeparture) }}</strong></article>
            <article><span>Arrival</span><strong>{{ formatSchedule(selected.scheduledArrival) }}</strong></article>
            <article><span>Terminal</span><strong>{{ selected.terminal || 'TBA' }}</strong></article>
            <article><span>Departure Gate</span><strong>{{ selected.departureGate || 'TBA' }}</strong></article>
            <article><span>Arrival Gate</span><strong>{{ selected.arrivalGate || 'TBA' }}</strong></article>
            <article><span>Delay</span><strong>{{ selected.delayMinutes || 0 }} min</strong></article>
            <article><span>Speed</span><strong>{{ formatSpeed(selected.speedKmh) }}</strong></article>
            <article><span>Altitude</span><strong>{{ formatAltitude(selected.altitudeFt) }}</strong></article>
            <article><span>Landing Estimate</span><strong>{{ formatDuration(selected.estimatedLandingMinutes) }}</strong></article>
            <article><span>Estimated Arrival</span><strong>{{ formatSchedule(selected.estimatedArrival) }}</strong></article>
          </div>
          <p class="reason"><i class="fas fa-info-circle"></i> {{ selected.delayReason || 'No operational disruption reported.' }}</p>

          <div class="passenger-map" *ngIf="showCurrentLocation(selected); else locationPending">
            <svg class="mini-route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" *ngIf="hasRouteCoordinates(selected)">
              <path class="mini-route-glow" [attr.d]="routePath(selected)"></path>
              <path class="mini-route-active" [attr.d]="travelledPath(selected)"></path>
              <path class="mini-route-pending" [attr.d]="remainingPath(selected)"></path>
            </svg>
            <span class="airport-pin origin" *ngIf="hasRouteCoordinates(selected)" [style.left.%]="mapX(selected.originLongitude)" [style.top.%]="mapY(selected.originLatitude)">
              <b>{{ selected.origin }}</b>
            </span>
            <span class="airport-pin destination" *ngIf="hasRouteCoordinates(selected)" [style.left.%]="mapX(selected.destinationLongitude)" [style.top.%]="mapY(selected.destinationLatitude)">
              <b>{{ selected.destination }}</b>
            </span>
            <div class="map-marker" [style.left.%]="mapX(selected.currentLongitude)" [style.top.%]="mapY(selected.currentLatitude)">
              <i class="fas fa-plane" [style.transform]="'rotate(' + (selected.headingDegree || 0) + 'deg)'"></i>
              <span>{{ selected.flightNumber }}</span>
            </div>
            <span class="tracking-mode-badge" [ngClass]="modeClass(selected.trackingMode)">{{ selected.trackingMode || 'MANUAL' }}</span>
            <div class="map-caption">
              <strong>{{ formatCoordinate(selected.currentLatitude) }}, {{ formatCoordinate(selected.currentLongitude) }}</strong>
              <span>ETA {{ formatDuration(selected.estimatedLandingMinutes) }} | {{ formatProgress(selected.progressPercent) }} complete</span>
            </div>
          </div>
          <ng-template #locationPending>
            <div class="location-empty">
              <i class="fas fa-map-marker-alt"></i>
              <span>Current map location appears after departure when GPS coordinates are available.</span>
            </div>
          </ng-template>
        </section>

        <aside class="history-card">
          <h2>Status History</h2>
          <article *ngFor="let item of history">
            <span class="status-dot" [ngClass]="statusClass(item.flightStatus)"></span>
            <div>
              <strong>{{ item.flightStatus }}</strong>
              <small>{{ formatDate(item.loggedAt) }}</small>
            </div>
          </article>
        </aside>
      </main>
    </div>
  `,
  styleUrls: ['./tracking-status.component.css']
})
export class TrackingStatusComponent implements OnInit {
  logs: FlightStatusLog[] = [];
  history: FlightStatusLog[] = [];
  suggestions: FlightStatusLog[] = [];
  passengerBooking: Booking | null = null;
  selected: FlightStatusLog | null = null;
  searchText = '';
  showSuggestions = false;
  loadingSearch = false;
  searchMessage = '';

  constructor(private trackingService: TrackingService, private bookingService: BookingService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.trackingService.getAll().subscribe(data => {
      this.logs = data || [];
      const id = Number(this.route.snapshot.queryParamMap.get('flightId'));
      this.selected = id ? this.logs.find(x => x.flightId === id) || this.logs[0] : this.logs[0];
      if (this.selected) this.loadHistory(this.selected.flightId);
    });
  }

  refreshSuggestions(): void {
    const q = this.searchText.trim().toLowerCase();
    this.suggestions = q ? this.logs.filter(item =>
      [item.flightNumber, item.origin, item.destination, item.flightStatus]
        .some(value => String(value || '').toLowerCase().includes(q))
    ).slice(0, 6) : [];
    this.showSuggestions = this.suggestions.length > 0;
  }
  selectFlight(item: FlightStatusLog): void { this.selected = item; this.searchText = item.flightNumber; this.showSuggestions = false; this.loadHistory(item.flightId); }
  clearSearch(): void { this.searchText = ''; this.showSuggestions = false; this.searchMessage = ''; this.passengerBooking = null; }
  findPassengerStatus(): void {
    const query = this.searchText.trim();
    if (!query) {
      this.searchMessage = 'Please enter a flight number or booking reference.';
      return;
    }

    const directFlight = this.logs.find(item => String(item.flightNumber || '').toLowerCase() === query.toLowerCase());
    if (directFlight) {
      this.selectFlight(directFlight);
      this.searchMessage = '';
      return;
    }

    this.loadingSearch = true;
    this.bookingService.getByReference(query).subscribe({
      next: booking => {
        this.passengerBooking = booking;
        if (!booking?.flightId) {
          this.loadingSearch = false;
          this.searchMessage = 'Booking found, but flight information is unavailable.';
          return;
        }
        this.trackingService.getLatest(booking.flightId).subscribe({
          next: log => {
            this.selected = this.mergeBookingFallback(log, booking);
            this.searchText = booking.bookingReference || query;
            this.showSuggestions = false;
            this.searchMessage = '';
            this.loadingSearch = false;
            this.loadHistory(booking.flightId);
          },
          error: () => {
            this.selected = this.bookingToScheduledStatus(booking);
            this.history = [];
            this.searchMessage = 'Live tracking update is not available yet. Showing booking schedule.';
            this.loadingSearch = false;
          }
        });
      },
      error: () => {
        this.loadingSearch = false;
        this.searchMessage = 'No flight or booking found for this search.';
      }
    });
  }
  loadHistory(flightId: number): void { this.trackingService.getHistory(flightId).subscribe(data => this.history = data || []); }
  goList(): void { this.router.navigate(['/tracking']); }
  mergeBookingFallback(log: FlightStatusLog, booking: Booking): FlightStatusLog {
    const fallback = this.bookingToScheduledStatus(booking);
    return { ...fallback, ...(log || {}) };
  }
  bookingToScheduledStatus(booking: Booking): FlightStatusLog {
    return {
      flightId: booking.flightId,
      flightNumber: booking.flightNumber,
      origin: booking.origin,
      destination: booking.destination,
      scheduledDeparture: this.combineDateTime(booking.departureDate, booking.departureTime),
      scheduledArrival: this.combineDateTime(booking.departureDate, booking.arrivalTime),
      flightStatus: 'SCHEDULED',
      progressPercent: 0,
      delayMinutes: 0
    };
  }
  combineDateTime(date?: string, time?: string): string {
    if (!date) return '';
    return time ? `${date}T${time}` : date;
  }
  showCurrentLocation(item: FlightStatusLog): boolean {
    return ['DEPARTED','EN_ROUTE','APPROACHING','DELAYED','DIVERTED'].includes(String(item.flightStatus || ''))
      && this.isValidCoordinate(item.currentLatitude, item.currentLongitude);
  }
  isValidCoordinate(lat?: number, lng?: number): boolean { return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng); }
  hasRouteCoordinates(item: FlightStatusLog): boolean {
    return this.isValidCoordinate(item.originLatitude, item.originLongitude) && this.isValidCoordinate(item.destinationLatitude, item.destinationLongitude);
  }
  mapX(lng?: number): number { return Math.max(0, Math.min(100, (((lng || 0) + 180) / 360) * 100)); }
  mapY(lat?: number): number { return Math.max(0, Math.min(100, ((90 - (lat || 0)) / 180) * 100)); }
  routePath(item: FlightStatusLog): string { return this.curvedPath(item.originLatitude, item.originLongitude, item.destinationLatitude, item.destinationLongitude); }
  travelledPath(item: FlightStatusLog): string { return this.curvedPath(item.originLatitude, item.originLongitude, item.currentLatitude, item.currentLongitude); }
  remainingPath(item: FlightStatusLog): string { return this.curvedPath(item.currentLatitude, item.currentLongitude, item.destinationLatitude, item.destinationLongitude); }
  modeClass(mode?: string): string {
    const value = String(mode || 'MANUAL').toLowerCase().replace('_', '-');
    return value === 'live-gps' || value === 'live-api' ? 'live-gps' : value;
  }
  statusClass(status?: string): string { return String(status || '').toLowerCase().replace('_', '-'); }
  formatDuration(minutes?: number): string {
    if (minutes === null || minutes === undefined || isNaN(Number(minutes))) return 'TBA';
    const total = Math.max(0, Math.round(Number(minutes)));
    const days = Math.floor(total / 1440);
    const hours = Math.floor((total % 1440) / 60);
    const mins = total % 60;
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }
  formatAltitude(value?: number): string {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${Math.round(Number(value)).toLocaleString('en-US')} ft`;
  }
  formatSpeed(value?: number): string {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${Math.round(Number(value)).toLocaleString('en-US')} km/h`;
  }
  formatProgress(value?: number): string {
    if (value === null || value === undefined || isNaN(Number(value))) return '0%';
    return `${Math.round(Number(value))}%`;
  }
  formatCoordinate(value?: number): string {
    return typeof value === 'number' && !isNaN(value) ? value.toFixed(4) : 'N/A';
  }
  formatDate(value?: string): string { return value ? new Date(value).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '--'; }
  formatSchedule(value?: string): string { return value ? new Date(value).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : 'TBA'; }
  private curvedPath(fromLat?: number, fromLng?: number, toLat?: number, toLng?: number): string {
    if (!this.isValidCoordinate(fromLat, fromLng) || !this.isValidCoordinate(toLat, toLng)) return '';
    const x1 = this.mapX(fromLng);
    const y1 = this.mapY(fromLat);
    const x2 = this.mapX(toLng);
    const y2 = this.mapY(toLat);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - Math.max(8, Math.min(20, Math.abs(x2 - x1) * .16));
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
}
