import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { Payment } from 'src/app/core/models/payment.model';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';

Chart.register(...registerables);

interface ExpenseKpi {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: string;
}

interface ExpenseSummary {
  label: string;
  value: string;
  detail: string;
}

interface CategorySummary {
  category: string;
  total: number;
}

interface MonthlyExpenseSummary {
  key: string;
  label: string;
  total: number;
}

@Component({
  selector: 'app-expense-dashboard',
  templateUrl: './expense-dashboard.component.html',
  styleUrls: ['./expense-dashboard.component.css']
})
export class ExpenseDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('expenseBreakdownChart') expenseBreakdownChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyExpenseChart') monthlyExpenseChart?: ElementRef<HTMLCanvasElement>;

  loading = true;
  kpis: ExpenseKpi[] = [];
  summaries: ExpenseSummary[] = [];
  filteredExpenses: Expense[] = [];
  tableRows: Expense[] = [];
  categoryBreakdownData: CategorySummary[] = [];
  monthlyExpenseData: MonthlyExpenseSummary[] = [];
  categories: string[] = [];
  statuses: string[] = [];
  categoryFilter = 'ALL';
  statusFilter = 'ALL';
  startDateFilter = '';
  endDateFilter = '';

  private expenses: Expense[] = [];
  private payments: Payment[] = [];
  private charts: Chart[] = [];
  private viewReady = false;
  private readonly tableLimit = 15;

  constructor(
    private expenseService: ExpenseService,
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
    if (this.loading && (this.expenses.length || this.payments.length)) return;
    this.loading = true;
    this.destroyCharts();
    forkJoin({
      expenses: this.expenseService.getAll().pipe(catchError(() => of([] as Expense[]))),
      payments: this.paymentService.getAll().pipe(catchError(() => of([] as Payment[])))
    }).subscribe(data => {
      this.expenses = data.expenses || [];
      this.payments = data.payments || [];
      this.categories = this.uniqueValues(this.expenses.map(expense => expense.category));
      this.statuses = this.uniqueValues(this.expenses.map(expense => expense.status));
      this.applyFilters(false);
      this.loading = false;
      setTimeout(() => this.renderCharts());
    });
  }

  applyFilters(render = true): void {
    const start = this.startDateFilter ? new Date(this.startDateFilter).getTime() : 0;
    const end = this.endDateFilter ? new Date(this.endDateFilter).getTime() : Number.MAX_SAFE_INTEGER;

    this.filteredExpenses = this.expenses.filter(expense => {
      const categoryMatches = this.categoryFilter === 'ALL' || String(expense.category || '') === this.categoryFilter;
      const statusMatches = this.statusFilter === 'ALL' || String(expense.status || '') === this.statusFilter;
      const expenseTime = this.timeValue(expense.expenseDate);
      const dateMatches = (!expense.expenseDate || (expenseTime >= start && expenseTime <= end));
      return categoryMatches && statusMatches && dateMatches;
    });

    this.prepareDashboard();
    if (render && !this.loading) setTimeout(() => this.renderCharts());
  }

  clearFilters(): void {
    this.categoryFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.applyFilters();
  }

  setCategory(value: string): void {
    this.categoryFilter = value;
    this.applyFilters();
  }

  setStatus(value: string): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  setStartDate(value: string): void {
    this.startDateFilter = value;
  }

  setEndDate(value: string): void {
    this.endDateFilter = value;
  }

  formatCurrency(value?: number): string {
    return `$${Math.round(Number(value || 0)).toLocaleString('en-US')}`;
  }

  formatDate(value?: string): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  statusClass(status?: string): string {
    return `status-${String(status || 'na').toLowerCase().replace(/_/g, '-')}`;
  }

  private prepareDashboard(): void {
    const totalExpenses = this.filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const paidExpenses = this.filteredExpenses.filter(expense => this.isPaidStatus(expense.status));
    const pendingExpenses = this.filteredExpenses.filter(expense => this.isPendingStatus(expense.status));
    const expensePayments = this.expensePayments();
    this.categoryBreakdownData = this.buildCategorySummaries();
    this.monthlyExpenseData = this.buildMonthlyExpenseData();
    this.tableRows = [...this.filteredExpenses]
      .sort((a, b) => this.timeValue(b.expenseDate) - this.timeValue(a.expenseDate))
      .slice(0, this.tableLimit);

    const highestCategory = this.categoryBreakdownData[0];
    const thisMonthExpense = this.filteredExpenses
      .filter(expense => this.monthKey(expense.expenseDate) === this.monthKey(new Date().toISOString()))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const largestExpense = [...this.filteredExpenses].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];
    const lastPaidExpense = [...paidExpenses].sort((a, b) => this.timeValue(b.expenseDate) - this.timeValue(a.expenseDate))[0];

    this.kpis = [
      { label: 'Total Expenses', value: this.formatCurrency(totalExpenses), hint: `${this.filteredExpenses.length} records visible`, icon: 'fas fa-receipt', tone: 'blue' },
      { label: 'Paid Expenses', value: this.formatCurrency(paidExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)), hint: `${paidExpenses.length} paid records`, icon: 'fas fa-check-circle', tone: 'emerald' },
      { label: 'Pending Expenses', value: this.formatCurrency(pendingExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)), hint: `${pendingExpenses.length} awaiting payment`, icon: 'fas fa-clock', tone: 'amber' },
      { label: 'Expense Payments', value: this.formatCurrency(expensePayments.reduce((sum, payment) => sum + this.paymentAmount(payment), 0)), hint: `${expensePayments.length} payment records`, icon: 'fas fa-money-check-alt', tone: 'slate' },
      { label: 'Top Category', value: highestCategory?.category || 'N/A', hint: highestCategory ? this.formatCurrency(highestCategory.total) : 'No category data', icon: 'fas fa-layer-group', tone: 'indigo' }
    ];

    this.summaries = [
      { label: 'This Month Expense', value: this.formatCurrency(thisMonthExpense), detail: 'Filtered current month total' },
      { label: 'Largest Expense', value: largestExpense ? this.formatCurrency(largestExpense.amount) : '$0', detail: largestExpense?.category || 'No expense data' },
      { label: 'Last Paid Expense', value: lastPaidExpense ? this.formatCurrency(lastPaidExpense.amount) : '$0', detail: lastPaidExpense ? `${lastPaidExpense.vendorName || 'N/A'} | ${this.formatDate(lastPaidExpense.expenseDate)}` : 'No paid expense' },
      { label: 'Expense Payment Count', value: String(expensePayments.length), detail: 'Successful expense payment entries' }
    ];
  }

  private renderCharts(): void {
    if (!this.viewReady || this.loading || (!this.categoryBreakdownData.length && !this.monthlyExpenseData.length)) return;
    this.destroyCharts();
    this.renderBreakdownChart();
    this.renderMonthlyChart();
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  private renderBreakdownChart(): void {
    const canvas = this.expenseBreakdownChart?.nativeElement;
    if (!canvas) return;
    const rows = this.categoryBreakdownData;
    const hasData = rows.length > 0;

    this.charts.push(new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: hasData ? rows.map(row => row.category) : ['No Data'],
        datasets: [{
          data: hasData ? rows.map(row => row.total) : [1],
          backgroundColor: hasData ? ['#2563eb', '#059669', '#d97706', '#be123c', '#475569', '#7c3aed'] : ['#e2e8f0'],
          borderColor: '#ffffff',
          borderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, color: '#475569', font: { weight: 'bold' }, boxWidth: 10 } },
          tooltip: {
            callbacks: {
              label: (context: any) => `${context.label}: ${this.formatCurrency(Number(context.raw || 0))}`
            }
          }
        }
      }
    }));
  }

  private renderMonthlyChart(): void {
    const canvas = this.monthlyExpenseChart?.nativeElement;
    if (!canvas) return;
    const rows = this.monthlyExpenseData;

    this.charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(row => row.label),
        datasets: [{
          label: 'Expenses',
          data: rows.map(row => row.total),
          backgroundColor: 'rgba(37, 99, 235, 0.72)',
          borderColor: '#1d4ed8',
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: this.baseChartOptions()
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
            label: (context: any) => `${context.dataset.label}: ${this.formatCurrency(Number(context.raw || 0))}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.18)' }, ticks: { color: '#64748b' } }
      }
    };
  }

  private buildCategorySummaries(): CategorySummary[] {
    const categoryMap = new Map<string, number>();
    this.filteredExpenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + Number(expense.amount || 0));
    });
    return Array.from(categoryMap.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }

  private buildMonthlyExpenseData(): MonthlyExpenseSummary[] {
    return this.lastSixMonthLabels().map(month => ({
      ...month,
      total: this.filteredExpenses
        .filter(expense => this.monthKey(expense.expenseDate) === month.key)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    }));
  }

  private expensePayments(): Payment[] {
    return this.payments.filter(payment =>
      String(payment.paymentPurpose || (payment.expenseId ? 'EXPENSE_PAYMENT' : '')).toUpperCase() === 'EXPENSE_PAYMENT'
      && this.isSuccessfulPayment(payment)
    );
  }

  private paymentAmount(payment: Payment): number {
    return Number(payment.amount ?? payment.totalAmount ?? 0);
  }

  private isSuccessfulPayment(payment: Payment): boolean {
    return ['COMPLETED', 'PAID', 'SUCCESS'].includes(String(payment.status || payment.paymentStatus || '').toUpperCase());
  }

  private isPaidStatus(status?: string): boolean {
    return ['PAID', 'COMPLETED', 'SUCCESS'].includes(String(status || '').toUpperCase());
  }

  private isPendingStatus(status?: string): boolean {
    return ['PENDING', 'PENDING_PAYMENT', 'APPROVED', 'PROCESSING'].includes(String(status || '').toUpperCase());
  }

  private uniqueValues(values: Array<string | undefined | null>): string[] {
    return Array.from(new Set(values.map(value => String(value || '').trim()).filter(Boolean))).sort();
  }

  private timeValue(value?: string): number {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }

  private monthKey(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private lastSixMonthLabels(): Array<{ key: string; label: string }> {
    const rows: Array<{ key: string; label: string }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      rows.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleString('en-US', { month: 'short' })
      });
    }
    return rows;
  }
}
