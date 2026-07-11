import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChartType } from 'chart.js';

interface MonthlyFinancialSummary {
  period?: string;
  month?: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  bookingPaymentCount: number;
  expensePaymentCount: number;
  paymentMethod: string;
  period?: string;
  groupedSummary?: MonthlyFinancialSummary[];
  monthlySummary: MonthlyFinancialSummary[];
}

@Component({
  selector: 'app-financial-overview',
  templateUrl: './financial-overview.component.html',
  styleUrls: ['./financial-overview.component.css']
})
export class FinancialOverviewComponent implements OnInit {
  sales = 0;
  expenses = 0;
  profit = 0;
  bookingPaymentCount = 0;
  expensePaymentCount = 0;
  startDate = '';
  endDate = '';
  paymentMethod = 'ALL';
  period = 'MONTHLY';
  loading = false;
  errorMsg = '';
  salesDetails = 'Successful Booking Payments';
  expenseDetails = 'Successful Expense Payments';
  monthlySummary: MonthlyFinancialSummary[] = [];
  readonly paymentMethods = ['ALL', 'CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'BKASH', 'NAGAD', 'ROCKET', 'ONLINE_PAYMENT'];
  readonly periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

  barData: any = {
    labels: [],
    datasets: [
      { data: [], label: 'Revenue', backgroundColor: '#22c55e' },
      { data: [], label: 'Expense', backgroundColor: '#f59e0b' }
    ]
  };
  barLabels: string[] = [];
  barType: ChartType = 'bar';
  chartOptions: any = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { stacked: false },
      y: { stacked: false, beginAtZero: true }
    }
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMsg = '';

    let params = new HttpParams();
    params = params.set('period', this.period);
    if (this.startDate) params = params.set('startDate', this.startDate);
    if (this.endDate) params = params.set('endDate', this.endDate);
    if (this.paymentMethod && this.paymentMethod !== 'ALL') params = params.set('paymentMethod', this.paymentMethod);

    this.http.get<FinancialReport>('http://localhost:8080/api/reports/financial-overview', { params }).subscribe({
      next: report => {
        this.sales = report?.totalRevenue || 0;
        this.expenses = report?.totalExpenses || 0;
        this.profit = report?.netProfit || 0;
        this.bookingPaymentCount = report?.bookingPaymentCount || 0;
        this.expensePaymentCount = report?.expensePaymentCount || 0;
        const groupedSummary = report?.groupedSummary || [];
        this.monthlySummary = groupedSummary;
        this.barLabels = groupedSummary.map(row => this.periodLabel(row));
        this.barData = {
          labels: this.barLabels,
          datasets: [
            { data: groupedSummary.map(row => row.revenue || 0), label: 'Revenue', backgroundColor: '#22c55e' },
            { data: groupedSummary.map(row => row.expense || 0), label: 'Expense', backgroundColor: '#f59e0b' }
          ]
        };
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Unable to load real financial report.';
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.paymentMethod = 'ALL';
    this.period = 'MONTHLY';
    this.loadData();
  }

  periodLabel(row: MonthlyFinancialSummary): string {
    return row.period || row.month || 'N/A';
  }

  amountValue(value: number | null | undefined): number {
    return Number(value ?? 0);
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  onSave(): void {
    alert('Financial Report Saved Successfully!');
    this.router.navigate(['/dashboard']);
  }
}
