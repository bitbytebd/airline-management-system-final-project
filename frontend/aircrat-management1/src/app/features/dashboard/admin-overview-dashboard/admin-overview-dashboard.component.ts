import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking } from 'src/app/core/models/booking.model';
import { Expense } from 'src/app/core/models/expense.model';
import { LiveMapFlight } from 'src/app/core/models/flight-status.model';
import { Passenger } from 'src/app/core/models/passenger.model';
import { Payment } from 'src/app/core/models/payment.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { FlightService } from 'src/app/core/services/flight.service';
import { PassengerService } from 'src/app/core/services/passenger.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

Chart.register(...registerables);

interface KpiItem {
  label: string;
  value: string;
  icon: string;
  tone: string;
}

interface RouteSummary {
  route: string;
  count: number;
}

@Component({
  selector: 'app-admin-overview-dashboard',
  templateUrl: './admin-overview-dashboard.component.html',
  styleUrls: ['./admin-overview-dashboard.component.css']
})
export class AdminOverviewDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('monthlyTicketChart') monthlyTicketChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueExpenseChart') revenueExpenseChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('ticketClassChart') ticketClassChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('topRoutesChart') topRoutesChart?: ElementRef<HTMLCanvasElement>;

  loading = true;
  kpis: KpiItem[] = [];
  recentBookings: Booking[] = [];
  upcomingDepartures: any[] = [];
  topRoutes: RouteSummary[] = [];

  private bookings: Booking[] = [];
  private payments: Payment[] = [];
  private expenses: Expense[] = [];
  private passengers: Passenger[] = [];
  private flights: any[] = [];
  private liveFlights: LiveMapFlight[] = [];
  private charts: Chart[] = [];
  private viewReady = false;

  constructor(
    private flightService: FlightService,
    private passengerService: PassengerService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private expenseService: ExpenseService,
    private trackingService: TrackingService
  ) { }

  ngOnInit(): void {
    this.loadOverview();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    setTimeout(() => this.renderCharts());
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadOverview(): void {
    this.loading = true;
    forkJoin({
      flights: this.flightService.getAll().pipe(catchError(() => of([] as any[]))),
      passengers: this.passengerService.getPassengers().pipe(catchError(() => of([] as Passenger[]))),
      bookings: this.bookingService.getAll().pipe(catchError(() => of([] as Booking[]))),
      payments: this.paymentService.getAll().pipe(catchError(() => of([] as Payment[]))),
      expenses: this.expenseService.getAll().pipe(catchError(() => of([] as Expense[]))),
      liveFlights: this.trackingService.getPremiumLive().pipe(catchError(() => of([] as LiveMapFlight[])))
    }).subscribe(data => {
      this.flights = data.flights || [];
      this.passengers = data.passengers || [];
      this.bookings = data.bookings || [];
      this.payments = data.payments || [];
      this.expenses = data.expenses || [];
      this.liveFlights = data.liveFlights || [];
      this.prepareOverview();
      this.loading = false;
      setTimeout(() => this.renderCharts());
    });
  }

  formatCurrency(value: number): string {
    return `$${Math.round(value || 0).toLocaleString('en-US')}`;
  }

  formatNumber(value: number): string {
    return Math.round(value || 0).toLocaleString('en-US');
  }

  private prepareOverview(): void {
    const ticketsSold = this.bookings.filter(booking => this.isTicketSold(booking)).length;
    const totalRevenue = this.payments
      .filter(payment => this.isSuccessfulPayment(payment) && this.paymentPurpose(payment) === 'BOOKING_PAYMENT')
      .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
    const expenseFromPayments = this.payments
      .filter(payment => this.isSuccessfulPayment(payment) && this.paymentPurpose(payment) === 'EXPENSE_PAYMENT')
      .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
    const totalExpenses = expenseFromPayments || this.expenses
      .filter(expense => this.isPaidStatus(expense.status))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const activeFlights = this.liveFlights
      .filter(flight => ['EN_ROUTE', 'APPROACHING', 'DEPARTED'].includes(String(flight.status || flight.flightStatus || '').toUpperCase())).length;
    const pendingPayments = this.bookings
      .filter(booking => String(booking.status || '').toUpperCase() === 'APPROVED_FOR_PAYMENT'
        || String(booking.paymentStatus || '').toUpperCase() === 'PENDING').length;

    this.kpis = [
      { label: 'Total Flights', value: this.formatNumber(this.flights.length), icon: 'fas fa-plane', tone: 'blue' },
      { label: 'Total Passengers', value: this.formatNumber(this.passengers.length), icon: 'fas fa-users', tone: 'cyan' },
      { label: 'Tickets Sold', value: this.formatNumber(ticketsSold), icon: 'fas fa-ticket-alt', tone: 'rose' },
      { label: 'Total Revenue', value: this.formatCurrency(totalRevenue), icon: 'fas fa-dollar-sign', tone: 'green' },
      { label: 'Total Expenses', value: this.formatCurrency(totalExpenses), icon: 'fas fa-receipt', tone: 'amber' },
      { label: 'Net Profit', value: this.formatCurrency(netProfit), icon: 'fas fa-chart-line', tone: netProfit >= 0 ? 'emerald' : 'red' },
      { label: 'Active Flights', value: this.formatNumber(activeFlights), icon: 'fas fa-location-arrow', tone: 'indigo' },
      { label: 'Pending Payments', value: this.formatNumber(pendingPayments), icon: 'fas fa-hourglass-half', tone: 'violet' }
    ];

    this.recentBookings = [...this.bookings]
      .sort((a, b) => this.timeValue(b.bookingDate) - this.timeValue(a.bookingDate))
      .slice(0, 6);

    this.upcomingDepartures = [...this.flights]
      .filter(flight => this.timeValue(`${flight.departureDate || ''}T${flight.departureTime || '00:00:00'}`) >= Date.now())
      .sort((a, b) => this.timeValue(`${a.departureDate || ''}T${a.departureTime || '00:00:00'}`) - this.timeValue(`${b.departureDate || ''}T${b.departureTime || '00:00:00'}`))
      .slice(0, 6);

    this.topRoutes = this.buildTopRoutes();
  }

  private renderCharts(): void {
    if (!this.viewReady || this.loading) return;
    this.destroyCharts();
    this.renderMonthlyTicketSales();
    this.renderRevenueExpense();
    this.renderTicketClassDistribution();
    this.renderTopRoutes();
  }

  private renderMonthlyTicketSales(): void {
    const canvas = this.monthlyTicketChart?.nativeElement;
    if (!canvas) return;
    const rows = this.lastSixMonthLabels().map(label => ({
      label,
      count: this.bookings.filter(booking => this.monthLabel(booking.bookingDate) === label && this.isTicketSold(booking)).length
    }));
    this.charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(row => row.label),
        datasets: [{
          label: 'Tickets Sold',
          data: rows.map(row => row.count),
          backgroundColor: 'rgba(37, 99, 235, 0.72)',
          borderColor: '#1d4ed8',
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 22
        }]
      },
      options: this.baseChartOptions()
    }));
  }

  private renderRevenueExpense(): void {
    const canvas = this.revenueExpenseChart?.nativeElement;
    if (!canvas) return;
    const rows = this.lastSixMonthLabels().map(label => {
      const revenue = this.payments
        .filter(payment => this.isSuccessfulPayment(payment) && this.paymentPurpose(payment) === 'BOOKING_PAYMENT' && this.monthLabel(payment.paidAt || payment.completedAt || payment.createdAt) === label)
        .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
      const expensePayment = this.payments
        .filter(payment => this.isSuccessfulPayment(payment) && this.paymentPurpose(payment) === 'EXPENSE_PAYMENT' && this.monthLabel(payment.paidAt || payment.completedAt || payment.createdAt) === label)
        .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
      const expenseFallback = expensePayment || this.expenses
        .filter(expense => this.isPaidStatus(expense.status) && this.monthLabel(expense.expenseDate) === label)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      return { label, revenue, expense: expenseFallback };
    });
    this.charts.push(new Chart(canvas, {
      type: 'line',
      data: {
        labels: rows.map(row => row.label),
        datasets: [
          {
            label: 'Revenue',
            data: rows.map(row => row.revenue),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.32,
            pointRadius: 3
          },
          {
            label: 'Expense',
            data: rows.map(row => row.expense),
            borderColor: '#d97706',
            backgroundColor: 'rgba(217, 119, 6, 0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.32,
            pointRadius: 3
          }
        ]
      },
      options: this.baseChartOptions(true)
    }));
  }

  private renderTicketClassDistribution(): void {
    const canvas = this.ticketClassChart?.nativeElement;
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

  private renderTopRoutes(): void {
    const canvas = this.topRoutesChart?.nativeElement;
    if (!canvas) return;
    const rows = this.topRoutes.length ? this.topRoutes : [{ route: 'No Data', count: 0 }];
    this.charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(row => row.route),
        datasets: [{
          label: 'Bookings',
          data: rows.map(row => row.count),
          backgroundColor: ['#2563eb', '#0f766e', '#475569', '#059669', '#d97706'],
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

  private baseChartOptions(currency = false): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, color: '#475569', font: { weight: 'bold' } } },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.dataset.label}: ${currency ? this.formatCurrency(Number(context.raw || 0)) : this.formatNumber(Number(context.raw || 0))}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.18)' }, ticks: { color: '#64748b' } }
      }
    };
  }

  private buildTopRoutes(): RouteSummary[] {
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

  private isTicketSold(booking: Booking): boolean {
    return String(booking.status || '').toUpperCase() === 'CONFIRMED'
      || String(booking.paymentStatus || '').toUpperCase() === 'PAID';
  }

  private isSuccessfulPayment(payment: Payment): boolean {
    const status = String(payment.status || payment.paymentStatus || '').toUpperCase();
    return ['COMPLETED', 'PAID', 'SUCCESS'].includes(status);
  }

  private paymentPurpose(payment: Payment): string {
    return String(payment.paymentPurpose || (payment.expenseId ? 'EXPENSE_PAYMENT' : 'BOOKING_PAYMENT')).toUpperCase();
  }

  private paymentAmount(payment: Payment): number {
    return Number(payment.amount ?? payment.totalAmount ?? 0);
  }

  private isPaidStatus(status?: string): boolean {
    return ['PAID', 'COMPLETED', 'SUCCESS'].includes(String(status || '').toUpperCase());
  }

  private timeValue(value?: string): number {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }

  private monthLabel(value?: string | null): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('en-US', { month: 'short' });
  }

  private lastSixMonthLabels(): string[] {
    const labels: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleString('en-US', { month: 'short' }));
    }
    return labels;
  }
}
