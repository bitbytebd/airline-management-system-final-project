import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Expense } from 'src/app/core/models/expense.model';
import { Payment, PaymentMethod } from 'src/app/core/models/payment.model';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-expense-payment-queue',
  templateUrl: './expense-payment-queue.component.html',
  styleUrls: ['./expense-payment-queue.component.css']
})
export class ExpensePaymentQueueComponent implements OnInit {
  expenses: Expense[] = [];
  loading = true;
  submitting = false;
  errorMsg = '';
  successMsg = '';
  selectedExpense: Expense | null = null;
  createdPayment: Payment | null = null;
  form!: FormGroup;

  readonly methods: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'BKASH', 'NAGAD', 'ONLINE_PAYMENT'];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      paymentMethod: ['BANK_TRANSFER', Validators.required],
      paidAmount: [0, [Validators.required, Validators.min(0.01)]],
      transactionReference: [''],
      notes: ['Expense payment processed from finance queue']
    });
    this.loadQueue();
  }

  loadQueue(): void {
    this.loading = true;
    this.errorMsg = '';
    this.expenseService.getAll().subscribe({
      next: data => {
        this.expenses = (data || []).filter(e => this.isPayable(e));
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Unable to load pending expense payments.';
        this.loading = false;
      }
    });
  }

  openPayment(expense: Expense): void {
    this.selectedExpense = expense;
    this.createdPayment = null;
    this.errorMsg = '';
    this.successMsg = '';
    this.form.patchValue({
      paidAmount: expense.amount || 0,
      transactionReference: expense.referenceNo || '',
      notes: `Expense payment for ${this.expenseReference(expense)}`
    });
  }

  closePayment(): void {
    this.selectedExpense = null;
    this.submitting = false;
  }

  payNow(): void {
    if (!this.selectedExpense?.id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (Number(this.form.value.paidAmount) !== Number(this.selectedExpense.amount || 0)) {
      this.errorMsg = 'Paid amount must match the expense amount.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.paymentService.processExpense(this.selectedExpense.id, this.form.value).subscribe({
      next: payment => {
        this.createdPayment = payment;
        this.successMsg = `Expense payment ${payment.paymentReference} completed.`;
        this.submitting = false;
        this.closePayment();
        this.loadQueue();
      },
      error: err => {
        this.errorMsg = err?.error?.error || 'Expense payment failed.';
        this.submitting = false;
      }
    });
  }

  isPayable(expense: Expense): boolean {
    return expense.status === 'PENDING_PAYMENT' || expense.status === 'APPROVED';
  }

  expenseReference(expense: Expense): string {
    return expense.referenceNo || `EXP-${expense.id || 'NEW'}`;
  }

  queueTotal(): number {
    return this.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }
}
