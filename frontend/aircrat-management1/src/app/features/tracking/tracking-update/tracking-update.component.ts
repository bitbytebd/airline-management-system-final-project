import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Flight } from 'src/app/core/models/flight.model';
import { FlightStatusLog, LiveMapFlight, TrackingFlightStatus, TrackingUpdateRequest } from 'src/app/core/models/flight-status.model';
import { FlightService } from 'src/app/core/services/flight.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-tracking-update',
  templateUrl: './tracking-update.component.html',
  styleUrls: ['./tracking-update.component.css']
})
export class TrackingUpdateComponent implements OnInit {
  flights: Flight[] = [];
  suggestions: Flight[] = [];
  history: FlightStatusLog[] = [];
  latestLog: FlightStatusLog | null = null;
  selectedFlight: Flight | null = null;
  searchText = '';
  showSuggestions = false;
  saving = false;
  calculating = false;
  notice = '';
  routeForm = { origin: '', destination: '', departureDate: '', departureTime: '' };
  statuses: TrackingFlightStatus[] = ['SCHEDULED','BOARDING','DEPARTED','EN_ROUTE','APPROACHING','LANDED','ARRIVED','DELAYED','CANCELLED','DIVERTED','GATE_HOLD'];
  form: TrackingUpdateRequest = { flightStatus: 'SCHEDULED', progressPercent: 0, delayMinutes: 0, terminal: 'Terminal 1', departureGate: 'A12', arrivalGate: 'B08', currentLatitude: 23.8103, currentLongitude: 90.4125, altitudeFt: 0, speedKmh: 0, headingDegree: 0, delayReason: '' };

  constructor(private flightService: FlightService, private trackingService: TrackingService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.flightService.getAll().subscribe(data => {
      this.flights = data || [];
      const id = Number(this.route.snapshot.queryParamMap.get('flightId'));
      this.selectedFlight = id ? this.flights.find(x => x.id === id) || this.flights[0] : this.flights[0];
      if (this.selectedFlight) this.searchText = `${this.selectedFlight.flightNumber} - ${this.selectedFlight.origin} to ${this.selectedFlight.destination}`;
      if (this.selectedFlight) {
        this.patchRouteFormFromFlight(this.selectedFlight);
        this.loadTrackingContext(this.selectedFlight.id);
      }
    });
  }

  refreshSuggestions(): void {
    const q = this.searchText.trim().toLowerCase();
    this.suggestions = q ? this.flights.filter(item =>
      [item.flightNumber, item.origin, item.destination, item.status]
        .some(value => String(value || '').toLowerCase().includes(q))
    ).slice(0, 7) : [];
    this.showSuggestions = this.suggestions.length > 0;
  }
  selectFlight(item: Flight): void {
    this.selectedFlight = item;
    this.searchText = `${item.flightNumber} - ${item.origin} to ${item.destination}`;
    this.showSuggestions = false;
    this.patchRouteFormFromFlight(item);
    this.loadTrackingContext(item.id);
  }
  clearSearch(): void { this.searchText = ''; this.showSuggestions = false; }
  submitUpdate(): void {
    if (!this.selectedFlight?.id) return;
    this.saving = true;
    this.trackingService.fullUpdate(this.selectedFlight.id, this.form).subscribe({
      next: log => {
        this.notice = 'Flight tracking update saved successfully.';
        this.saving = false;
        this.latestLog = log;
        this.loadHistory(this.selectedFlight?.id || 0);
      },
      error: err => { this.notice = err?.error?.error || 'Update failed.'; this.saving = false; }
    });
  }
  quick(status: TrackingFlightStatus): void {
    if (!this.selectedFlight?.id) return;
    this.form.flightStatus = status;
    this.trackingService.quickUpdate(this.selectedFlight.id, status, this.form.delayReason || status).subscribe({
      next: log => {
        this.notice = `${status} quick update published.`;
        this.latestLog = log;
        this.loadHistory(this.selectedFlight?.id || 0);
      },
      error: err => this.notice = err?.error?.error || 'Quick update failed.'
    });
  }
  autoCalculate(): void {
    const route = this.resolveAutoCalculateRoute();
    if (!route.origin || !route.destination) {
      this.notice = 'Select a flight or enter route information first.';
      return;
    }
    this.calculating = true;
    this.routeForm = route;
    this.trackingService.autoCalculate({
      flightId: this.selectedFlight?.id,
      flightNumber: this.selectedFlight?.flightNumber,
      origin: route.origin,
      destination: route.destination,
      departureDate: route.departureDate,
      departureTime: route.departureTime
    }).subscribe({
      next: result => {
        this.patchFormFromAutoCalculate(result);
        this.notice = 'Tracking fields auto-calculated. You can still manually override any field before saving.';
        this.calculating = false;
      },
      error: err => {
        this.notice = err?.error?.error || 'Auto calculation failed for this route.';
        this.calculating = false;
      }
    });
  }
  goList(): void { this.router.navigate(['/tracking']); }
  goStatus(): void { this.router.navigate(['/tracking/status'], { queryParams: this.selectedFlight?.id ? { flightId: this.selectedFlight.id } : {} }); }

  loadTrackingContext(flightId?: number): void {
    if (!flightId) return;
    this.trackingService.getLatest(flightId).subscribe({
      next: log => {
        this.latestLog = log;
        this.patchFormFromLog(log);
      },
      error: () => this.latestLog = null
    });
    this.loadHistory(flightId);
  }

  loadHistory(flightId: number): void {
    if (!flightId) return;
    this.trackingService.getHistory(flightId).subscribe(data => this.history = data || []);
  }

  patchFormFromLog(log: FlightStatusLog): void {
    this.form = {
      ...this.form,
      flightStatus: log.flightStatus || this.form.flightStatus,
      delayMinutes: log.delayMinutes || 0,
      delayReason: log.delayReason || '',
      departureGate: log.departureGate || this.form.departureGate,
      arrivalGate: log.arrivalGate || this.form.arrivalGate,
      terminal: log.terminal || this.form.terminal,
      currentLatitude: log.currentLatitude || this.form.currentLatitude,
      currentLongitude: log.currentLongitude || this.form.currentLongitude,
      originLatitude: log.originLatitude || this.form.originLatitude,
      originLongitude: log.originLongitude || this.form.originLongitude,
      destinationLatitude: log.destinationLatitude || this.form.destinationLatitude,
      destinationLongitude: log.destinationLongitude || this.form.destinationLongitude,
      distanceKm: log.distanceKm || this.form.distanceKm,
      remainingDistanceKm: log.remainingDistanceKm || log.distanceRemainingKm || this.form.remainingDistanceKm,
      distanceRemainingKm: log.distanceRemainingKm || log.remainingDistanceKm || this.form.distanceRemainingKm,
      estimatedLandingMinutes: log.estimatedLandingMinutes || this.form.estimatedLandingMinutes,
      estimatedArrival: log.estimatedArrival || this.form.estimatedArrival,
      trackingMode: log.trackingMode || this.form.trackingMode,
      trackingSource: log.trackingSource || this.form.trackingSource,
      altitudeFt: log.altitudeFt || 0,
      speedKmh: log.speedKmh || 0,
      headingDegree: log.headingDegree || 0,
      progressPercent: log.progressPercent || 0
    };
  }

  patchFormFromAutoCalculate(result: LiveMapFlight): void {
    this.form = {
      ...this.form,
      flightStatus: result.flightStatus || result.status || this.form.flightStatus,
      currentLatitude: this.safeNumber(result.currentLatitude, this.form.currentLatitude),
      currentLongitude: this.safeNumber(result.currentLongitude, this.form.currentLongitude),
      originLatitude: this.safeNumber(result.originLatitude, this.form.originLatitude),
      originLongitude: this.safeNumber(result.originLongitude, this.form.originLongitude),
      destinationLatitude: this.safeNumber(result.destinationLatitude, this.form.destinationLatitude),
      destinationLongitude: this.safeNumber(result.destinationLongitude, this.form.destinationLongitude),
      altitudeFt: this.safeNumber(result.altitudeFt, this.form.altitudeFt),
      speedKmh: this.safeNumber(result.speedKmh, this.form.speedKmh),
      headingDegree: this.safeNumber(result.headingDegree, this.form.headingDegree),
      progressPercent: this.safeNumber(result.progressPercent, this.form.progressPercent),
      distanceKm: this.safeNumber(result.distanceKm, this.form.distanceKm),
      remainingDistanceKm: this.safeNumber(result.remainingDistanceKm || result.distanceRemainingKm, this.form.remainingDistanceKm),
      distanceRemainingKm: this.safeNumber(result.distanceRemainingKm || result.remainingDistanceKm, this.form.distanceRemainingKm),
      estimatedLandingMinutes: this.safeNumber(result.estimatedLandingMinutes, this.form.estimatedLandingMinutes),
      estimatedArrival: result.estimatedArrival || this.form.estimatedArrival,
      trackingMode: result.trackingMode || 'SIMULATED_ROUTE',
      trackingSource: result.trackingSource || 'SIMULATED_ROUTE'
    };
  }

  patchRouteFormFromFlight(flight: Flight): void {
    this.routeForm = {
      origin: flight.origin || '',
      destination: flight.destination || '',
      departureDate: flight.departureDate || '',
      departureTime: flight.departureTime || ''
    };
  }

  resolveAutoCalculateRoute(): { origin: string; destination: string; departureDate: string; departureTime: string } {
    let origin = (this.routeForm.origin || this.selectedFlight?.origin || '').trim();
    let destination = (this.routeForm.destination || this.selectedFlight?.destination || '').trim();
    const combinedRoute = origin.match(/^(.+?)\s+(?:to|->|→|-)\s+(.+)$/i);
    if (combinedRoute && !destination) {
      origin = combinedRoute[1].trim();
      destination = combinedRoute[2].trim();
    }
    if (this.selectedFlight && (!origin || !destination)) {
      origin = this.selectedFlight.origin || origin;
      destination = this.selectedFlight.destination || destination;
    }
    return {
      origin,
      destination,
      departureDate: this.routeForm.departureDate || this.selectedFlight?.departureDate || '',
      departureTime: this.routeForm.departureTime || this.selectedFlight?.departureTime || ''
    };
  }

  safeNumber(value: any, fallback: any): any {
    const parsed = Number(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  previewX(): number { return Math.max(6, Math.min(94, (((this.form.currentLongitude || 0) + 180) / 360) * 100)); }
  previewY(): number { return Math.max(8, Math.min(92, ((90 - (this.form.currentLatitude || 0)) / 180) * 100)); }
  mapX(lng?: number): number { return Math.max(6, Math.min(94, (((lng || 0) + 180) / 360) * 100)); }
  mapY(lat?: number): number { return Math.max(8, Math.min(92, ((90 - (lat || 0)) / 180) * 100)); }
  isValidCoordinate(lat?: number, lng?: number): boolean { return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng); }
  hasPreviewRoute(): boolean {
    return this.isValidCoordinate(this.form.originLatitude, this.form.originLongitude)
      && this.isValidCoordinate(this.form.destinationLatitude, this.form.destinationLongitude);
  }
  previewRoutePath(): string { return this.curvedPath(this.form.originLatitude, this.form.originLongitude, this.form.destinationLatitude, this.form.destinationLongitude); }
  previewTravelledPath(): string { return this.curvedPath(this.form.originLatitude, this.form.originLongitude, this.form.currentLatitude, this.form.currentLongitude); }
  previewRemainingPath(): string { return this.curvedPath(this.form.currentLatitude, this.form.currentLongitude, this.form.destinationLatitude, this.form.destinationLongitude); }
  modeClass(mode?: string): string {
    const value = String(mode || 'MANUAL').toLowerCase().replace('_', '-');
    return value === 'live-api' ? 'live-gps' : value;
  }
  statusClass(status?: string): string { return String(status || '').toLowerCase().replace('_', '-'); }
  formatDate(value?: string): string { return value ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '--'; }
  private curvedPath(fromLat?: number, fromLng?: number, toLat?: number, toLng?: number): string {
    if (!this.isValidCoordinate(fromLat, fromLng) || !this.isValidCoordinate(toLat, toLng)) return '';
    const x1 = this.mapX(fromLng);
    const y1 = this.mapY(fromLat);
    const x2 = this.mapX(toLng);
    const y2 = this.mapY(toLat);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - Math.max(8, Math.min(18, Math.abs(x2 - x1) * .15));
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
}
