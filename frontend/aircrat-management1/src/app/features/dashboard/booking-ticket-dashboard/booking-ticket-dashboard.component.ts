import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking } from 'src/app/core/models/booking.model';
import { Payment } from 'src/app/core/models/payment.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { PaymentService } from 'src/app/core/services/payment.service';

Chart.register(...registerables);

interface BookingKpi {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: string;
}

interface SeatBlock {
  label: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'neutral';
  classType: string;
}

interface CabinGroup {
  label: string;
  key: string;
  seats: SeatBlock[];
  leftSeats: SeatBlock[];
  rightSeats: SeatBlock[];
}

interface RouteCount {
  route: string;
  count: number;
}

@Component({
  selector: 'app-booking-ticket-dashboard',
  templateUrl: './booking-ticket-dashboard.component.html',
  styleUrls: ['./booking-ticket-dashboard.component.css']
})
export class BookingTicketDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bookingTrendChart') bookingTrendChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('classDistributionChart') classDistributionChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('routeBookingChart') routeBookingChart?: ElementRef<HTMLCanvasElement>;

  loading = true;
  kpis: BookingKpi[] = [];
  seatBlocks: SeatBlock[] = [];
  cabinGroups: CabinGroup[] = [];
  latestTicket?: Booking;
  recentBookings: Booking[] = [];
  topRoutes: RouteCount[] = [];

  private bookings: Booking[] = [];
  private payments: Payment[] = [];
  private charts: Chart[] = [];
  private viewReady = false;

  constructor(
    private bookingService: BookingService,
    private paymentService: PaymentService
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
    forkJoin({
      bookings: this.bookingService.getAll().pipe(catchError(() => of([] as Booking[]))),
      payments: this.paymentService.getAll().pipe(catchError(() => of([] as Payment[])))
    }).subscribe(data => {
      this.bookings = data.bookings || [];
      this.payments = data.payments || [];
      this.prepareDashboard();
      this.loading = false;
      setTimeout(() => this.renderCharts());
    });
  }

  formatCurrency(value?: number): string {
    return `$${Math.round(Number(value || 0)).toLocaleString('en-US')}`;
  }

  formatNumber(value?: number): string {
    return Math.round(Number(value || 0)).toLocaleString('en-US');
  }

  ticketRoute(booking?: Booking): string {
    if (!booking) return 'N/A';
    return `${booking.origin || 'N/A'} to ${booking.destination || 'N/A'}`;
  }

  ticketLink(booking?: Booking): string[] {
    return booking?.bookingReference ? ['/booking/ticket', booking.bookingReference] : ['/booking'];
  }

  statusClass(status?: string): string {
    const value = String(status || '').toLowerCase().replace(/_/g, '-');
    return `status-${value || 'na'}`;
  }

  private prepareDashboard(): void {
    const confirmedTickets = this.bookings.filter(booking => this.isConfirmedTicket(booking)).length;
    const pendingApprovals = this.bookings.filter(booking => String(booking.status || '').toUpperCase() === 'PENDING_REVIEW').length;
    const cancelledBookings = this.bookings.filter(booking => ['CANCELLED', 'REJECTED'].includes(String(booking.status || '').toUpperCase())).length;
    const ticketRevenue = this.payments
      .filter(payment => this.isBookingPayment(payment) && this.isSuccessfulPayment(payment))
      .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);

    this.kpis = [
      { label: 'Total Bookings', value: this.formatNumber(this.bookings.length), hint: 'All reservation records', icon: 'fas fa-list-check', tone: 'blue' },
      { label: 'Confirmed Tickets', value: this.formatNumber(confirmedTickets), hint: 'Paid or confirmed bookings', icon: 'fas fa-ticket-alt', tone: 'emerald' },
      { label: 'Pending Approvals', value: this.formatNumber(pendingApprovals), hint: 'Waiting for review', icon: 'fas fa-user-check', tone: 'amber' },
      { label: 'Cancelled Bookings', value: this.formatNumber(cancelledBookings), hint: 'Rejected or cancelled', icon: 'fas fa-ban', tone: 'rose' },
      { label: 'Ticket Revenue', value: this.formatCurrency(ticketRevenue), hint: 'Successful booking payments', icon: 'fas fa-dollar-sign', tone: 'slate' }
    ];

    this.latestTicket = [...this.bookings]
      .filter(booking => this.isConfirmedTicket(booking))
      .sort((a, b) => this.timeValue(b.bookingDate) - this.timeValue(a.bookingDate))[0];

    this.recentBookings = [...this.bookings]
      .sort((a, b) => this.timeValue(b.bookingDate) - this.timeValue(a.bookingDate))
      .slice(0, 8);

    this.topRoutes = this.buildRouteCounts();
    this.seatBlocks = this.buildSeatBlocks();
    this.cabinGroups = this.buildCabinGroups(this.seatBlocks);
  }

  private buildSeatBlocks(): SeatBlock[] {
    const bookedSeats = this.bookings
      .filter(booking => !!booking.seatNumber)
      .flatMap(booking => String(booking.seatNumber || '')
        .split(',')
        .map(seat => seat.trim())
        .filter(Boolean)
        .map(seat => ({
          label: seat,
          status: this.seatStatus(booking),
          classType: String(booking.classType || 'ECONOMY').replace('_', ' ')
        } as SeatBlock)));

    return bookedSeats.slice(0, 72);
  }

  private buildCabinGroups(seats: SeatBlock[]): CabinGroup[] {
    const cabinOrder = [
      { key: 'FIRST_CLASS', label: 'First Class' },
      { key: 'BUSINESS', label: 'Business' },
      { key: 'PREMIUM', label: 'Premium' },
      { key: 'ECONOMY', label: 'Economy' }
    ];

    return cabinOrder
      .map(cabin => ({
        ...cabin,
        seats: seats.filter(seat => this.normalizeClass(seat.classType) === cabin.key)
      }))
      .map(group => ({
        ...group,
        leftSeats: group.seats.filter((_, index) => index % 2 === 0),
        rightSeats: group.seats.filter((_, index) => index % 2 !== 0)
      }))
      .filter(group => group.seats.length > 0);
  }

  private normalizeClass(value?: string): string {
    return String(value || 'ECONOMY').toUpperCase().replace(/\s+/g, '_');
  }

  private seatStatus(booking: Booking): SeatBlock['status'] {
    const status = String(booking.status || '').toUpperCase();
    const paymentStatus = String(booking.paymentStatus || '').toUpperCase();
    if (['CANCELLED', 'REJECTED'].includes(status)) return 'cancelled';
    if (status === 'PENDING_REVIEW' || status === 'APPROVED_FOR_PAYMENT' || paymentStatus === 'PENDING') return 'pending';
    if (status === 'CONFIRMED' || paymentStatus === 'PAID') return 'confirmed';
    return 'neutral';
  }

  private renderCharts(): void {
    if (!this.viewReady || this.loading) return;
    this.destroyCharts();
    this.renderBookingTrend();
    this.renderClassDistribution();
    this.renderRouteBookingChart();
  }

  private renderBookingTrend(): void {
    const canvas = this.bookingTrendChart?.nativeElement;
    if (!canvas) return;
    const rows = this.lastSevenDayLabels().map(day => ({
      label: day.label,
      count: this.bookings.filter(booking => this.dayKey(booking.bookingDate) === day.key).length
    }));

    this.charts.push(new Chart(canvas, {
      type: 'line',
      data: {
        labels: rows.map(row => row.label),
        datasets: [{
          label: 'Bookings',
          data: rows.map(row => row.count),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.32,
          pointRadius: 3
        }]
      },
      options: this.baseChartOptions()
    }));
  }

  private renderClassDistribution(): void {
    const canvas = this.classDistributionChart?.nativeElement;
    if (!canvas) return;
    const labels = ['ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST_CLASS'];
    const values = labels.map(label => this.bookings.filter(booking => String(booking.classType || '').toUpperCase() === label).length);
    const hasData = values.some(value => value > 0);

    this.charts.push(new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: hasData ? labels.map(label => label.replace('_', ' ')) : ['No Data'],
        datasets: [{
          data: hasData ? values : [1],
          backgroundColor: hasData ? ['#2563eb', '#64748b', '#059669', '#d97706'] : ['#e2e8f0'],
          borderColor: '#ffffff',
          borderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, color: '#475569', font: { weight: 'bold' } } }
        }
      }
    }));
  }

  private renderRouteBookingChart(): void {
    const canvas = this.routeBookingChart?.nativeElement;
    if (!canvas) return;
    const rows = this.topRoutes.length ? this.topRoutes : [{ route: 'No Data', count: 0 }];

    this.charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(row => row.route),
        datasets: [{
          label: 'Bookings',
          data: rows.map(row => row.count),
          backgroundColor: '#0f766e',
          borderRadius: 6,
          barThickness: 18
        }]
      },
      options: {
        ...this.baseChartOptions(),
        indexAxis: 'y'
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
            label: (context: any) => `${context.dataset.label}: ${this.formatNumber(Number(context.raw || 0))}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.18)' }, ticks: { color: '#64748b' } }
      }
    };
  }

  private buildRouteCounts(): RouteCount[] {
    const routeMap = new Map<string, number>();
    this.bookings.forEach(booking => {
      const route = `${booking.origin || 'N/A'} to ${booking.destination || 'N/A'}`;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);
    });
    return Array.from(routeMap.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  private isConfirmedTicket(booking: Booking): boolean {
    return String(booking.status || '').toUpperCase() === 'CONFIRMED'
      || String(booking.paymentStatus || '').toUpperCase() === 'PAID';
  }

  private isBookingPayment(payment: Payment): boolean {
    return String(payment.paymentPurpose || (payment.bookingId ? 'BOOKING_PAYMENT' : '')).toUpperCase() === 'BOOKING_PAYMENT';
  }

  private isSuccessfulPayment(payment: Payment): boolean {
    const status = String(payment.status || payment.paymentStatus || '').toUpperCase();
    return ['COMPLETED', 'PAID', 'SUCCESS'].includes(status);
  }

  private paymentAmount(payment: Payment): number {
    return Number(payment.amount ?? payment.totalAmount ?? 0);
  }

  private timeValue(value?: string): number {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }

  private dayKey(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  private lastSevenDayLabels(): Array<{ key: string; label: string }> {
    const rows: Array<{ key: string; label: string }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      rows.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleString('en-US', { month: 'short', day: '2-digit' })
      });
    }
    return rows;
  }
}
