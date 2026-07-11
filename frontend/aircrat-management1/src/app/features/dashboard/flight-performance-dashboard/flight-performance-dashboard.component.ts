import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking } from 'src/app/core/models/booking.model';
import { Flight } from 'src/app/core/models/flight.model';
import { LiveMapFlight } from 'src/app/core/models/flight-status.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { FlightService } from 'src/app/core/services/flight.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

Chart.register(...registerables);

interface PerformanceKpi {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: string;
}

interface RouteSummary {
  route: string;
  count: number;
}

interface FlightRow {
  flightNumber: string;
  route: string;
  departureDate: string;
  status: string;
  bookings: number;
  progress: number;
  eta: string;
}

interface TrackingSummaryRow {
  flightNumber: string;
  route: string;
  status: string;
  trackingMode: string;
  progress: number;
}

@Component({
  selector: 'app-flight-performance-dashboard',
  templateUrl: './flight-performance-dashboard.component.html',
  styleUrls: ['./flight-performance-dashboard.component.css']
})
export class FlightPerformanceDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('routePerformanceChart') routePerformanceChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusDistributionChart') statusDistributionChart?: ElementRef<HTMLCanvasElement>;

  loading = true;
  kpis: PerformanceKpi[] = [];
  tableRows: FlightRow[] = [];
  trackingRows: TrackingSummaryRow[] = [];

  private flights: Flight[] = [];
  private bookings: Booking[] = [];
  private liveFlights: LiveMapFlight[] = [];
  private routeSummaries: RouteSummary[] = [];
  private statusSummary = new Map<string, number>();
  private charts: Chart[] = [];
  private viewReady = false;

  constructor(
    private flightService: FlightService,
    private bookingService: BookingService,
    private trackingService: TrackingService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    setTimeout(() => this.renderCharts());
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadDashboard(): void {
    this.loading = true;
    this.destroyCharts();
    forkJoin({
      flights: this.flightService.getAll().pipe(catchError(() => of([] as Flight[]))),
      bookings: this.bookingService.getAll().pipe(catchError(() => of([] as Booking[]))),
      liveFlights: this.trackingService.getPremiumLive().pipe(catchError(() => of([] as LiveMapFlight[])))
    }).subscribe(data => {
      this.flights = data.flights || [];
      this.bookings = data.bookings || [];
      this.liveFlights = data.liveFlights || [];
      this.prepareDashboard();
      this.loading = false;
      setTimeout(() => this.renderCharts());
    });
  }

  formatDate(value?: string): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  formatEta(minutes?: number): string {
    if (minutes === null || minutes === undefined || isNaN(Number(minutes))) return 'TBA';
    const mins = Math.max(0, Math.round(Number(minutes)));
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }

  statusClass(status?: string): string {
    return `status-${String(status || 'na').toLowerCase().replace(/_/g, '-')}`;
  }

  formatPercent(value?: number): string {
    return `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`;
  }

  private prepareDashboard(): void {
    const statuses = this.combinedStatuses();
    const activeStatuses = ['EN_ROUTE', 'APPROACHING', 'DEPARTED'];
    const scheduledFlights = statuses.filter(row => row.status === 'SCHEDULED' || row.status === 'SCHEDULED').length;
    const activeFlights = statuses.filter(row => activeStatuses.includes(row.status)).length;
    const delayedFlights = statuses.filter(row => row.status === 'DELAYED').length;
    const landedFlights = statuses.filter(row => ['LANDED', 'ARRIVED'].includes(row.status)).length;
    const occupancy = this.averageOccupancy();

    this.routeSummaries = this.buildRouteSummaries();
    this.statusSummary = this.buildStatusSummary(statuses);
    this.tableRows = this.buildTableRows().slice(0, 10);
    this.trackingRows = [...this.liveFlights]
      .sort((a, b) => Number(b.progressPercent || 0) - Number(a.progressPercent || 0))
      .slice(0, 5)
      .map(row => ({
        flightNumber: row.flightNumber || 'N/A',
        route: `${row.origin || 'N/A'} to ${row.destination || 'N/A'}`,
        status: this.normalizeStatus(row.status || row.flightStatus),
        trackingMode: String(row.trackingMode || 'SIMULATED_ROUTE').replace(/_/g, ' '),
        progress: Math.round(Number(row.progressPercent || 0))
      }));

    this.kpis = [
      { label: 'Total Routes', value: String(this.countRoutes()), hint: `${this.flights.length} flight records`, icon: 'fas fa-route', tone: 'blue' },
      { label: 'Active Flights', value: String(activeFlights), hint: 'Currently moving sectors', icon: 'fas fa-plane-departure', tone: 'emerald' },
      { label: 'Scheduled Flights', value: String(scheduledFlights), hint: 'Awaiting departure', icon: 'fas fa-calendar-check', tone: 'slate' },
      { label: 'Delayed Flights', value: String(delayedFlights), hint: 'Operational delay flags', icon: 'fas fa-clock', tone: 'amber' },
      { label: 'Landed Flights', value: String(landedFlights), hint: 'Completed arrivals', icon: 'fas fa-plane-arrival', tone: 'indigo' },
      { label: 'Avg Occupancy', value: `${occupancy}%`, hint: 'Bookings against seat capacity', icon: 'fas fa-chair', tone: 'violet' }
    ];
  }

  private renderCharts(): void {
    if (!this.viewReady || this.loading) return;
    this.destroyCharts();
    this.renderRoutePerformance();
    this.renderStatusDistribution();
  }

  private renderRoutePerformance(): void {
    const canvas = this.routePerformanceChart?.nativeElement;
    if (!canvas) return;
    const rows = this.routeSummaries.length ? this.routeSummaries.slice(0, 7) : [{ route: 'No Data', count: 0 }];

    this.charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(row => row.route),
        datasets: [{
          label: 'Bookings',
          data: rows.map(row => row.count),
          backgroundColor: '#2563eb',
          borderRadius: 6,
          barThickness: 18
        }]
      },
      options: {
        ...this.baseChartOptions(),
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.18)' }, ticks: { precision: 0, color: '#64748b', font: { weight: 'bold' } } },
          y: { grid: { display: false }, ticks: { color: '#475569', font: { weight: 'bold' } } }
        }
      }
    }));
  }

  private renderStatusDistribution(): void {
    const canvas = this.statusDistributionChart?.nativeElement;
    if (!canvas) return;
    const labels = ['SCHEDULED', 'EN_ROUTE', 'APPROACHING', 'LANDED', 'DELAYED', 'CANCELLED'];
    const values = labels.map(label => this.statusSummary.get(label) || 0);
    const hasData = values.some(value => value > 0);

    this.charts.push(new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: hasData ? labels.map(label => label.replace('_', ' ')) : ['No Data'],
        datasets: [{
          data: hasData ? values : [1],
          backgroundColor: hasData ? ['#2563eb', '#059669', '#0e7490', '#4f46e5', '#d97706', '#be123c'] : ['#e2e8f0'],
          borderColor: '#ffffff',
          borderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, color: '#475569', font: { weight: 'bold' }, boxWidth: 10 } }
        }
      }
    }));
  }

  private baseChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.dataset.label}: ${Math.round(Number(context.raw || 0)).toLocaleString('en-US')}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.18)' }, ticks: { color: '#64748b' } }
      }
    };
  }

  private buildRouteSummaries(): RouteSummary[] {
    const routeMap = new Map<string, number>();
    this.bookings.forEach(booking => {
      const route = `${booking.origin || 'N/A'} to ${booking.destination || 'N/A'}`;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);
    });
    if (!routeMap.size) {
      this.flights.forEach(flight => {
        const route = `${flight.origin || 'N/A'} to ${flight.destination || 'N/A'}`;
        routeMap.set(route, (routeMap.get(route) || 0) + 0);
      });
    }
    return Array.from(routeMap.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count);
  }

  private countRoutes(): number {
    const routes = new Set<string>();
    this.flights.forEach(flight => routes.add(`${flight.origin || 'N/A'}-${flight.destination || 'N/A'}`));
    this.bookings.forEach(booking => routes.add(`${booking.origin || 'N/A'}-${booking.destination || 'N/A'}`));
    return routes.size;
  }

  private buildStatusSummary(rows: Array<{ status: string }>): Map<string, number> {
    const statusMap = new Map<string, number>();
    rows.forEach(row => statusMap.set(row.status, (statusMap.get(row.status) || 0) + 1));
    return statusMap;
  }

  private buildTableRows(): FlightRow[] {
    return [...this.flights]
      .sort((a, b) => this.timeValue(`${b.departureDate || ''}T${b.departureTime || '00:00:00'}`) - this.timeValue(`${a.departureDate || ''}T${a.departureTime || '00:00:00'}`))
      .map(flight => {
        const live = this.liveFlights.find(item => item.flightId === flight.id || item.flightNumber === flight.flightNumber);
        return {
          flightNumber: flight.flightNumber || 'N/A',
          route: `${flight.origin || live?.origin || 'N/A'} to ${flight.destination || live?.destination || 'N/A'}`,
          departureDate: this.formatDate(flight.departureDate),
          status: this.normalizeStatus(live?.status || live?.flightStatus || flight.status),
          bookings: this.bookings.filter(booking => booking.flightId === flight.id || booking.flightNumber === flight.flightNumber).length,
          progress: Math.round(Number(live?.progressPercent || 0)),
          eta: this.formatEta(live?.estimatedLandingMinutes)
        };
      });
  }

  private combinedStatuses(): Array<{ status: string }> {
    const liveRows = this.liveFlights.map(flight => ({ status: this.normalizeStatus(flight.status || flight.flightStatus) }));
    if (liveRows.length) return liveRows;
    return this.flights.map(flight => ({ status: this.normalizeStatus(flight.status) }));
  }

  private averageOccupancy(): number {
    if (!this.flights.length) return 0;
    const totalSeats = this.flights.reduce((sum, flight) => sum + Number(flight.totalSeats || 0), 0);
    if (!totalSeats) return 0;
    const occupied = this.bookings.filter(booking => !['CANCELLED', 'REJECTED'].includes(String(booking.status || '').toUpperCase())).length;
    return Math.min(100, Math.round((occupied / totalSeats) * 100));
  }

  private normalizeStatus(status?: string): string {
    const value = String(status || 'SCHEDULED').toUpperCase().replace(/\s+/g, '_');
    return value === 'ARRIVED' ? 'LANDED' : value;
  }

  private timeValue(value?: string): number {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }
}
