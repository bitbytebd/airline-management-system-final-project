import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LiveMapFlight } from 'src/app/core/models/flight-status.model';
import { TrackingService } from 'src/app/core/services/tracking.service';

interface TrackingKpi {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: string;
}

interface TrackingHealth {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-tracking-overview-dashboard',
  templateUrl: './tracking-overview-dashboard.component.html',
  styleUrls: ['./tracking-overview-dashboard.component.css']
})
export class TrackingOverviewDashboardComponent implements OnInit {
  loading = true;
  kpis: TrackingKpi[] = [];
  healthCards: TrackingHealth[] = [];
  summaryRows: LiveMapFlight[] = [];
  progressRows: LiveMapFlight[] = [];
  errorMessage = '';

  private records: LiveMapFlight[] = [];
  private readonly displayLimit = 8;

  constructor(private trackingService: TrackingService) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.trackingService.getPremiumLive()
      .pipe(catchError(() => {
        this.errorMessage = 'Tracking data is currently unavailable.';
        return of([] as LiveMapFlight[]);
      }))
      .subscribe(records => {
        this.records = records || [];
        this.prepareDashboard();
        this.loading = false;
      });
  }

  statusOf(record: LiveMapFlight): string {
    return this.normalize(record.status || record.flightStatus || 'SCHEDULED');
  }

  modeOf(record: LiveMapFlight): string {
    return this.normalize(record.trackingMode || 'SIMULATED_ROUTE');
  }

  routeOf(record: LiveMapFlight): string {
    return `${record.origin || 'N/A'} to ${record.destination || 'N/A'}`;
  }

  formatPercent(value?: number): string {
    return `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`;
  }

  formatEta(minutes?: number): string {
    if (minutes === null || minutes === undefined || isNaN(Number(minutes))) return 'TBA';
    const total = Math.max(0, Math.round(Number(minutes)));
    if (total < 60) return `${total}m`;
    const days = Math.floor(total / 1440);
    const hours = Math.floor((total % 1440) / 60);
    const mins = total % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (mins || !parts.length) parts.push(`${mins}m`);
    return parts.join(' ');
  }

  formatNumber(value?: number, suffix = ''): string {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${Math.round(Number(value)).toLocaleString('en-US')}${suffix}`;
  }

  statusClass(status?: string): string {
    return `status-${this.normalize(status).toLowerCase().replace(/_/g, '-')}`;
  }

  modeClass(mode?: string): string {
    return `mode-${this.normalize(mode).toLowerCase().replace(/_/g, '-')}`;
  }

  private prepareDashboard(): void {
    const scheduled = this.countByStatus(['SCHEDULED']);
    const enRoute = this.countByStatus(['EN_ROUTE', 'DEPARTED']);
    const approaching = this.countByStatus(['APPROACHING']);
    const landed = this.countByStatus(['LANDED', 'ARRIVED']);
    const simulated = this.records.filter(record => this.modeOf(record) === 'SIMULATED_ROUTE').length;

    this.summaryRows = [...this.records]
      .sort((a, b) => Number(b.progressPercent || 0) - Number(a.progressPercent || 0))
      .slice(0, this.displayLimit);

    this.progressRows = [...this.summaryRows]
      .filter(record => !['LANDED', 'ARRIVED', 'CANCELLED'].includes(this.statusOf(record)))
      .slice(0, this.displayLimit);

    this.kpis = [
      { label: 'Total Tracking Flights', value: String(this.records.length), hint: 'Visible tracking records', icon: 'fas fa-satellite-dish', tone: 'blue' },
      { label: 'Scheduled', value: String(scheduled), hint: 'Awaiting departure', icon: 'fas fa-calendar-check', tone: 'slate' },
      { label: 'En Route', value: String(enRoute), hint: 'Currently moving', icon: 'fas fa-plane-departure', tone: 'emerald' },
      { label: 'Approaching', value: String(approaching), hint: 'Near arrival', icon: 'fas fa-location-arrow', tone: 'cyan' },
      { label: 'Landed', value: String(landed), hint: 'Completed arrivals', icon: 'fas fa-plane-arrival', tone: 'indigo' },
      { label: 'Simulated Routes', value: String(simulated), hint: 'Schedule-based tracking', icon: 'fas fa-route', tone: 'amber' }
    ];

    this.healthCards = [
      { label: 'Average Altitude', value: this.formatNumber(this.average('altitudeFt'), ' ft'), hint: 'From active records', icon: 'fas fa-mountain', tone: 'blue' },
      { label: 'Average Speed', value: this.formatNumber(this.average('speedKmh'), ' km/h'), hint: 'Current movement speed', icon: 'fas fa-tachometer-alt', tone: 'emerald' },
      { label: 'Landing Within 30 Minutes', value: String(this.landingSoonCount()), hint: 'ETA within 30 minutes', icon: 'fas fa-clock', tone: 'amber' },
      { label: 'Missing Coordinates', value: String(this.missingCoordinatesCount()), hint: 'Routes needing coordinates', icon: 'fas fa-map-marker-alt', tone: 'rose' }
    ];
  }

  private countByStatus(statuses: string[]): number {
    return this.records.filter(record => statuses.includes(this.statusOf(record))).length;
  }

  private average(field: 'altitudeFt' | 'speedKmh'): number {
    const values = this.records
      .map(record => Number(record[field] || 0))
      .filter(value => value > 0);
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private landingSoonCount(): number {
    return this.records.filter(record => {
      const eta = Number(record.estimatedLandingMinutes);
      return !isNaN(eta) && eta > 0 && eta <= 30;
    }).length;
  }

  private missingCoordinatesCount(): number {
    return this.records.filter(record => !record.originLatitude || !record.originLongitude || !record.destinationLatitude || !record.destinationLongitude || !record.currentLatitude || !record.currentLongitude).length;
  }

  private normalize(value?: string): string {
    return String(value || 'N/A').trim().toUpperCase().replace(/\s+/g, '_');
  }
}
