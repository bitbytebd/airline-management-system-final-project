import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { Payment } from 'src/app/core/models/payment.model';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';

interface CategoryRow {
  name: string;
  amount: number;
  share: number;
}

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.css']
})
export class ProfitLossComponent implements OnInit {
  payments: Payment[] = [];
  expenses: Expense[] = [];
  revenue = 0;
  expense = 0;
  pnl = 0;
  margin = 0;
  loading = true;
  categoryRows: CategoryRow[] = [];
  methodRows: CategoryRow[] = [];

  constructor(private paymentService: PaymentService, private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    forkJoin({
      payments: this.paymentService.getAll(),
      expenses: this.expenseService.getAll()
    }).subscribe({
      next: ({ payments, expenses }) => {
        this.payments = payments || [];
        this.expenses = expenses || [];
        this.calculate();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  calculate(): void {
    const completed = this.payments.filter(p => p.status === 'COMPLETED');
    const paidExpenses = this.expenses.filter(e => e.status === 'PAID');
    this.revenue = completed.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    this.expense = paidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    this.pnl = this.revenue - this.expense;
    this.margin = this.revenue ? Math.round((this.pnl / this.revenue) * 1000) / 10 : 0;
    this.categoryRows = this.groupExpenses(paidExpenses);
    this.methodRows = this.groupPayments(completed);
  }

  groupExpenses(items: Expense[]): CategoryRow[] {
    const map = new Map<string, number>();
    items.forEach(e => map.set(e.category || 'OTHER', (map.get(e.category || 'OTHER') || 0) + (e.amount || 0)));
    return this.toRows(map, this.expense);
  }

  groupPayments(items: Payment[]): CategoryRow[] {
    const map = new Map<string, number>();
    items.forEach(p => map.set(p.paymentMethod || 'OTHER', (map.get(p.paymentMethod || 'OTHER') || 0) + (p.totalAmount || 0)));
    return this.toRows(map, this.revenue);
  }

  toRows(map: Map<string, number>, total: number): CategoryRow[] {
    return Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount, share: total ? Math.round((amount / total) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }

  formatMoney(n: number | undefined): string {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
