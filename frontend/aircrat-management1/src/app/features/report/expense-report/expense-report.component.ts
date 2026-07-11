import { Component, OnInit } from '@angular/core';
import { Expense } from 'src/app/core/models/expense.model';
import { Payment } from 'src/app/core/models/payment.model';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChartType } from 'chart.js';
@Component({
  selector: 'app-expense-report',
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.css']
})
export class ExpenseReportComponent implements OnInit {
  totalExpense: number = 0;
  selectedPeriod: string = 'monthly';
  chartData: any;
  chartType: ChartType = 'bar';
  chartOptions: any = { responsive: true };
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  expensePayments: Payment[] = [];
  filteredExpensePayments: Payment[] = [];
  categoryRows: { name: string; amount: number; share: number }[] = [];
  noDataMessage = '';

  constructor(private expenseService: ExpenseService, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadData() {
    if (!this.expenses.length && !this.expensePayments.length) {
      this.loadExpenses();
      return;
    }
    this.applyPeriodFilter();
  }

  loadExpenses() {
    forkJoin({
      expenses: this.expenseService.getAll().pipe(catchError(() => of([] as Expense[]))),
      payments: this.paymentService.getAll().pipe(catchError(() => of([] as Payment[])))
    }).subscribe(data => {
      this.expenses = data.expenses || [];
      this.expensePayments = (data.payments || []).filter(payment => this.isSuccessfulExpensePayment(payment));
      this.applyPeriodFilter();
    });
  }

  formatMoney(n: number | undefined): string {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private applyPeriodFilter(): void {
    this.filteredExpensePayments = this.expensePayments.filter(payment => this.isInSelectedPeriod(this.paymentDate(payment)));
    this.filteredExpenses = this.expenses
      .filter(expense => this.isPaidStatus(expense.status))
      .filter(expense => this.isInSelectedPeriod(this.parseExpenseDate(expense.expenseDate)));
    this.totalExpense = this.hasExpensePaymentData()
      ? this.filteredExpensePayments.reduce((sum, payment) => sum + this.paymentAmount(payment), 0)
      : this.filteredExpenses.reduce((sum, expense) => sum + this.amount(expense), 0);
    this.updateCategoryRows();
    this.updateChart();
    this.noDataMessage = (this.hasExpensePaymentData() ? this.filteredExpensePayments.length : this.filteredExpenses.length)
      ? ''
      : 'No paid expense records found for selected period';
  }

  private updateCategoryRows(): void {
    const map = new Map<string, number>();
    if (this.hasExpensePaymentData()) {
      this.filteredExpensePayments.forEach(payment => {
        const category = this.expenseCategoryForPayment(payment);
        map.set(category, (map.get(category) || 0) + this.paymentAmount(payment));
      });
    } else {
      this.filteredExpenses.forEach(expense => {
        const category = expense.category || 'OTHER';
        map.set(category, (map.get(category) || 0) + this.amount(expense));
      });
    }
    this.categoryRows = Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount, share: this.totalExpense ? Math.round((amount / this.totalExpense) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }

  private updateChart(): void {
    const grouped = this.buildPeriodBuckets();
    this.chartData = {
      labels: grouped.labels,
      datasets: [{
        data: grouped.values,
        label: 'Expenses ($)',
        backgroundColor: '#f59e0b'
      }]
    };
  }

  private buildPeriodBuckets(): { labels: string[]; values: number[] } {
    const today = this.startOfDay(new Date());
    if (this.selectedPeriod === 'daily') {
      return { labels: ['Today'], values: [this.totalExpense] };
    }

    if (this.selectedPeriod === 'weekly') {
      const start = this.startOfWeek(today);
      return this.rangeBuckets(7, start, date => this.formatWeekday(date));
    }

    if (this.selectedPeriod === '6months') {
      const labels: string[] = [];
      const values: number[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleString('en-US', { month: 'short' }));
        values.push(this.sumForMonth(date));
      }
      return { labels, values };
    }

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return this.rangeBuckets(daysInMonth, monthStart, date => String(date.getDate()));
  }

  private rangeBuckets(count: number, start: Date, labelFactory: (date: Date) => string): { labels: string[]; values: number[] } {
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = 0; i < count; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      labels.push(labelFactory(date));
      values.push(this.sumForDay(date));
    }
    return { labels, values };
  }

  private isInSelectedPeriod(date: Date | null): boolean {
    if (!date) return false;
    const value = this.startOfDay(date).getTime();
    const today = this.startOfDay(new Date());

    if (this.selectedPeriod === 'daily') {
      return value === today.getTime();
    }
    if (this.selectedPeriod === 'weekly') {
      const start = this.startOfWeek(today).getTime();
      const end = start + 6 * 24 * 60 * 60 * 1000;
      return value >= start && value <= end;
    }
    if (this.selectedPeriod === '6months') {
      const start = new Date(today.getFullYear(), today.getMonth() - 5, 1).getTime();
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).getTime();
      return value >= start && value <= end;
    }
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  }

  private parseExpenseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const text = String(value).trim();
    const localDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
    if (localDateMatch) {
      const [, year, month, day] = localDateMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    const parsed = new Date(text);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private sumForDay(date: Date): number {
    if (this.hasExpensePaymentData()) {
      return this.filteredExpensePayments
        .filter(payment => {
          const paidDate = this.paymentDate(payment);
          return !!paidDate && this.startOfDay(paidDate).getTime() === this.startOfDay(date).getTime();
        })
        .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
    }
    return this.filteredExpenses
      .filter(expense => {
        const expenseDate = this.parseExpenseDate(expense.expenseDate);
        return !!expenseDate && this.startOfDay(expenseDate).getTime() === this.startOfDay(date).getTime();
      })
      .reduce((sum, expense) => sum + this.amount(expense), 0);
  }

  private sumForMonth(date: Date): number {
    if (this.hasExpensePaymentData()) {
      return this.filteredExpensePayments
        .filter(payment => {
          const paidDate = this.paymentDate(payment);
          return !!paidDate && paidDate.getFullYear() === date.getFullYear() && paidDate.getMonth() === date.getMonth();
        })
        .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
    }
    return this.filteredExpenses
      .filter(expense => {
        const expenseDate = this.parseExpenseDate(expense.expenseDate);
        return !!expenseDate && expenseDate.getFullYear() === date.getFullYear() && expenseDate.getMonth() === date.getMonth();
      })
      .reduce((sum, expense) => sum + this.amount(expense), 0);
  }

  private amount(expense: Expense): number {
    return Number(expense.amount || 0);
  }

  private hasExpensePaymentData(): boolean {
    return this.expensePayments.length > 0;
  }

  private isSuccessfulExpensePayment(payment: Payment): boolean {
    return this.isSuccessfulPayment(payment) && this.paymentPurpose(payment) === 'EXPENSE_PAYMENT';
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

  private paymentDate(payment: Payment): Date | null {
    const value = payment.paidAt || payment.completedAt || payment.createdAt;
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private expenseCategoryForPayment(payment: Payment): string {
    const linkedExpense = this.expenses.find(expense => expense.id === payment.expenseId);
    return linkedExpense?.category || payment.expenseReference || 'EXPENSE_PAYMENT';
  }

  private isPaidStatus(status?: string): boolean {
    return ['PAID', 'COMPLETED', 'SUCCESS'].includes(String(status || '').toUpperCase());
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private startOfWeek(date: Date): Date {
    const start = this.startOfDay(date);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    return start;
  }

  private formatWeekday(date: Date): string {
    return date.toLocaleString('en-US', { weekday: 'short', day: '2-digit' });
  }
}
