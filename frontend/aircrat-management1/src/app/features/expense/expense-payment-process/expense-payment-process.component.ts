import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/core/models/expense.model';
import { Payment, PaymentMethod } from 'src/app/core/models/payment.model';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-expense-payment-process',
  templateUrl: './expense-payment-process.component.html',
  styleUrls: ['./expense-payment-process.component.css']
})
export class ExpensePaymentProcessComponent implements OnInit {
  expense: Expense | null = null;
  form!: FormGroup;
  loading = true;
  submitting = false;
  errorMsg = '';
  successMsg = '';

  readonly methods: PaymentMethod[] = [
    'BANK_TRANSFER',
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BKASH',
    'NAGAD',
    'ONLINE_PAYMENT'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      paymentMethod: ['BANK_TRANSFER', Validators.required],
      transactionReference: [''],
      notes: ['']
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/expense/payment-queue']);
      return;
    }

    this.loadExpense(id);
  }

  loadExpense(id: number): void {
    this.loading = true;
    this.errorMsg = '';

    this.expenseService.getById(id).subscribe({
      next: expense => {
        this.expense = expense;
        this.form.patchValue({
          notes: `Expense payment for ${this.expenseReference()}`
        });
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Unable to load expense payment details.';
        this.loading = false;
      }
    });
  }

  payNow(): void {
    if (!this.expense?.id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.paymentService.processExpense(this.expense.id, {
      paymentMethod: this.form.value.paymentMethod,
      paidAmount: Number(this.expense.amount || 0),
      transactionReference: this.form.value.transactionReference,
      notes: this.form.value.notes
    }).subscribe({
      next: payment => this.handleSuccess(payment),
      error: err => {
        this.errorMsg = err?.error?.error || err?.error?.message || 'Expense payment failed.';
        this.submitting = false;
      }
    });
  }

  handleSuccess(payment: Payment): void {
    this.successMsg = `Expense payment ${payment.paymentReference || ''} completed successfully.`;
    this.submitting = false;
    setTimeout(() => {
      this.router.navigate(['/expense/payment-voucher', payment.id]);
    }, 700);
  }

  expenseReference(): string {
    return this.expense?.referenceNo || `EXP-${this.expense?.id || 'N/A'}`;
  }

  formatAmount(value: number | null | undefined): string {
    return Number(value || 0).toFixed(2);
  }

  canPay(): boolean {
    return !!this.expense && this.expense.status !== 'PAID' && !this.submitting;
  }
}
