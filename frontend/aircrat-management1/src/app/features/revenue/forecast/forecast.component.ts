import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css']
})
export class ForecastComponent implements OnInit {
  revenue = 0;
  expenses = 0;
  growth = 12;
  expenseGrowth = 6;
  months = 6;
  rows: any[] = [];

  constructor(private paymentService: PaymentService, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    forkJoin({ payments: this.paymentService.getAll(), expenses: this.expenseService.getAll() }).subscribe(({ payments, expenses }) => {
      this.revenue = (payments || []).filter(p => p.status === 'COMPLETED').reduce((s, p) => s + (p.totalAmount || 0), 0);
      this.expenses = (expenses || []).filter(e => e.status === 'PAID').reduce((s, e) => s + (e.amount || 0), 0);
      this.calculate();
    });
  }

  calculate(): void {
    const monthlyRevenue = this.revenue / 12 || 0;
    const monthlyExpense = this.expenses / 12 || 0;
    this.rows = Array.from({ length: Number(this.months) || 6 }, (_, i) => {
      const rev = monthlyRevenue * Math.pow(1 + Number(this.growth) / 100, i + 1);
      const exp = monthlyExpense * Math.pow(1 + Number(this.expenseGrowth) / 100, i + 1);
      return { month: `M+${i + 1}`, revenue: rev, expense: exp, pnl: rev - exp };
    });
  }

  money(n: number): string {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

}
