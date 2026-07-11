import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-kpi-summary',
  templateUrl: './kpi-summary.component.html',
  styleUrls: ['./kpi-summary.component.css']
})
export class KpiSummaryComponent implements OnInit {
  loading = true;
  revenue = 0;
  expenses = 0;
  pnl = 0;
  margin = 0;
  completedPayments = 0;
  paidExpenses = 0;

  constructor(private paymentService: PaymentService, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    forkJoin({ payments: this.paymentService.getAll(), expenses: this.expenseService.getAll() }).subscribe({
      next: ({ payments, expenses }) => {
        const completed = (payments || []).filter(p => p.status === 'COMPLETED');
        const paid = (expenses || []).filter(e => e.status === 'PAID');
        this.completedPayments = completed.length;
        this.paidExpenses = paid.length;
        this.revenue = completed.reduce((s, p) => s + (p.totalAmount || 0), 0);
        this.expenses = paid.reduce((s, e) => s + (e.amount || 0), 0);
        this.pnl = this.revenue - this.expenses;
        this.margin = this.revenue ? Math.round((this.pnl / this.revenue) * 1000) / 10 : 0;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  money(n: number): string {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

}
