import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { Expense } from 'src/app/core/models/expense.model';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  
  // Summary Data
  totalExpense: number = 0;
  paidAmount: number = 0;
  pendingAmount: number = 0;
  cancelledAmount: number = 0;
  
  // Current Category State
  currentCategory: string | null = null;

  constructor(
    private service: ExpenseService, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.currentCategory = params['category'] || null; // 'null' মানে সব দেখাবে
      this.loadExpenses(this.currentCategory);
    });
  }


  loadExpenses(category?: string | null) {
    this.service.getAll(category).subscribe(data => {
      this.expenses = data;
      this.calculateSummary();
    });
  }

  calculateSummary() {
    this.totalExpense = 0; this.paidAmount = 0; this.pendingAmount = 0; this.cancelledAmount = 0;
    this.expenses.forEach(e => {
      if (e.status === 'PAID') this.paidAmount += e.amount;
      else if (e.status === 'PENDING' || e.status === 'PENDING_PAYMENT' || e.status === 'APPROVED') this.pendingAmount += e.amount;
      else if (e.status === 'CANCELLED') this.cancelledAmount += e.amount;
    });
    this.totalExpense = this.paidAmount + this.pendingAmount;
  }

  onEdit(id: number | undefined) {
    if (id) this.router.navigate(['/expense/edit', id]);
  }

  onDelete(id: number | undefined) {
    if (id && confirm('Delete this expense record?')) {
      this.service.delete(id).subscribe(() => {
        this.loadExpenses(this.currentCategory); 
      });
    }
  }

  clearCategory(): void {
    this.router.navigate(['/expense']);
  }

  backToCategories(): void {
    this.router.navigate(['/expense/category']);
  }
}
