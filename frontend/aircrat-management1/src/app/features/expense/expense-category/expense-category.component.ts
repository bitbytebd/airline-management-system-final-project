import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense-category',
  templateUrl: './expense-category.component.html',
  styleUrls: ['./expense-category.component.css']
})
export class ExpenseCategoryComponent {

  totalBudget: number = 125000; // Example total budget

  categories: any[] = [
    {
      name: 'Airline Fare',
      desc: 'Ticket costs & related travel expenses',
      icon: 'fas fa-plane',
      color: '#3b82f6',
      count: 12,
      budget: 20000, spent: 14500,
      queryParam: 'AIRLINE_FARE'
    },
    {
      name: 'Airport Tax',
      desc: 'Airport taxes and government fees',
      icon: 'fas fa-landmark',
      color: '#8b5cf6',
      count: 8,
      budget: 5000, spent: 3200,
      queryParam: 'AIRPORT_TAX'
    },
    {
      name: 'Salary & Wages',
      desc: 'Employee payroll and benefits',
      icon: 'fas fa-users',
      color: '#22c55e',
      count: 24,
      budget: 80000, spent: 78000,
      queryParam: 'SALARY'
    },
    {
      name: 'Maintenance',
      desc: 'Equipment and office repairs',
      icon: 'fas fa-tools',
      color: '#f59e0b',
      count: 5,
      budget: 10000, spent: 4000,
      queryParam: 'MAINTENANCE'
    },
    {
      name: 'Utility Bills',
      desc: 'Electricity, water, internet',
      icon: 'fas fa-bolt',
      color: '#06b6d4',
      count: 15,
      budget: 5000, spent: 4500,
      queryParam: 'UTILITY'
    },
    {
      name: 'Marketing',
      desc: 'Ads, promotions and branding',
      icon: 'fas fa-bullhorn',
      color: '#ec4899',
      count: 9,
      budget: 5000, spent: 1200,
      queryParam: 'MARKETING'
    }
  ];

  constructor(private router: Router) {}

  // Calculate Progress Percentage for Bar
  getProgress(cat: any): number {
    if (cat.budget === 0) return 0;
    return (cat.spent / cat.budget) * 100;
  }

  // Deep Research Feature: Click to Filter Expenses
  viewExpenses(category: string) {
    //  Expense List Page with Query Parameter for Category
    this.router.navigate(['/expense'], { queryParams: { category: category } });
  }
}