import { Component, OnInit } from '@angular/core';
import { Payment } from 'src/app/core/models/payment.model';
import { PaymentService } from 'src/app/core/services/payment.service';

import { ChartType } from 'chart.js';
@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {
  totalSales: number = 0;
  selectedPeriod: string = 'monthly';
  
  // Chart Data for Version 3
  chartData: any;
  chartLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  chartType: ChartType = 'bar';
  chartOptions: any = { responsive: true };

  completedPayments: Payment[] = [];
  showAllSales = false;


  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadCompletedPayments();
  }

  loadData() {
    this.updateChart();
   }
  loadCompletedPayments() {
    this.paymentService.getAll().subscribe((data: Payment[]) => {
      this.completedPayments = (data || []).filter(p => this.isSuccessfulBookingPayment(p));
      this.totalSales = this.completedPayments.reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
      this.updateChart();
    });
  }

  formatMoney(n: number | undefined, currency = 'USD'): string {
    const prefix = currency === 'USD' ? '$' : currency + ' ';
    return prefix + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  get visiblePayments(): Payment[] {
    return this.showAllSales ? this.completedPayments : this.completedPayments.slice(0, 5);
  }

  private updateChart(): void {
    const grouped = this.buildPeriodBuckets();
    this.chartData = {
      labels: grouped.labels,
      datasets: [{
        data: grouped.values,
        label: 'Ticket Revenue ($)',
        borderColor: '#22c55e',
        backgroundColor: '#22c55e'
      }]
    };
  }

  private buildPeriodBuckets(): { labels: string[]; values: number[] } {
    const today = this.startOfDay(new Date());
    if (this.selectedPeriod === 'daily') {
      return { labels: ['Today'], values: [this.sumForDay(today)] };
    }

    if (this.selectedPeriod === 'weekly') {
      const start = this.startOfWeek(today);
      return this.rangeBuckets(7, start, date => date.toLocaleString('en-US', { weekday: 'short', day: '2-digit' }));
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

  private isSuccessfulBookingPayment(payment: Payment): boolean {
    return this.isSuccessfulPayment(payment) && this.paymentPurpose(payment) === 'BOOKING_PAYMENT';
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
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  private sumForDay(date: Date): number {
    return this.completedPayments
      .filter(payment => {
        const paidDate = this.paymentDate(payment);
        return !!paidDate && this.startOfDay(paidDate).getTime() === this.startOfDay(date).getTime();
      })
      .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
  }

  private sumForMonth(date: Date): number {
    return this.completedPayments
      .filter(payment => {
        const paidDate = this.paymentDate(payment);
        return !!paidDate && paidDate.getFullYear() === date.getFullYear() && paidDate.getMonth() === date.getMonth();
      })
      .reduce((sum, payment) => sum + this.paymentAmount(payment), 0);
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
}
