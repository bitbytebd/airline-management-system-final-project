import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/core/models/expense.model';
import { Payment } from 'src/app/core/models/payment.model';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-expense-payment-voucher',
  templateUrl: './expense-payment-voucher.component.html',
  styleUrls: ['./expense-payment-voucher.component.css']
})
export class ExpensePaymentVoucherComponent implements OnInit {
  payment: Payment | null = null;
  expense: Expense | null = null;
  loading = true;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    const paymentId = Number(this.route.snapshot.paramMap.get('paymentId'));
    if (!paymentId) {
      this.router.navigate(['/expense/payment-queue']);
      return;
    }
    this.loadVoucher(paymentId);
  }

  loadVoucher(paymentId: number): void {
    this.loading = true;
    this.errorMsg = '';

    this.paymentService.getById(paymentId).subscribe({
      next: payment => {
        this.payment = payment;
        if (!payment.expenseId) {
          this.loading = false;
          return;
        }
        this.expenseService.getById(payment.expenseId).subscribe({
          next: expense => {
            this.expense = expense;
            this.loading = false;
          },
          error: () => {
            this.expense = null;
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMsg = 'Expense payment voucher not found.';
        this.loading = false;
      }
    });
  }

  value(value: any): string {
    return value === null || value === undefined || value === '' ? 'N/A' : String(value);
  }

  amount(value: number | null | undefined): string {
    return '$' + Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  expenseReference(): string {
    return this.payment?.expenseReference || this.expense?.referenceNo || (this.expense?.id ? `EXP-${this.expense.id}` : 'N/A');
  }

  paidAmount(): number {
    return this.payment?.amount ?? this.payment?.totalAmount ?? this.expense?.amount ?? 0;
  }

  paidAt(): string {
    const raw = this.payment?.paidAt || this.payment?.completedAt || this.payment?.createdAt;
    if (!raw) return 'N/A';
    return new Date(raw).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  status(): string {
    return this.payment?.paymentStatus || this.payment?.status || 'N/A';
  }

  preparedBy(): string {
    return this.payment?.createdBy || 'N/A';
  }

  printVoucher(): void {
    const voucher = document.getElementById('expense-payment-voucher-print');
    if (!voucher) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${this.value(this.payment?.paymentReference)} - Expense Payment Voucher</title>
          <style>
            @page { size: A4; margin: 14mm; }
            body { margin: 0; background: #fff; color: #0b1b35; font-family: Arial, sans-serif; }
            .voucher-paper { width: 190mm; min-height: 267mm; margin: 0 auto; border: 1px solid #c9d7e8; padding: 18mm; box-sizing: border-box; }
            .voucher-top { display: flex; justify-content: space-between; border-bottom: 3px solid #075b86; padding-bottom: 14px; margin-bottom: 22px; }
            .brand h2, .title h1 { margin: 0; }
            .brand span, .title span, .field span { color: #667891; font-size: 12px; text-transform: uppercase; font-weight: 700; }
            .title { text-align: right; }
            .title h1 { color: #075b86; font-size: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .field { border: 1px solid #d8e4f1; padding: 12px; }
            .field strong { display: block; margin-top: 6px; font-size: 15px; }
            .amount-box { margin-top: 20px; padding: 18px; background: #e7fbff; border-left: 5px solid #0ea5e9; display: flex; justify-content: space-between; align-items: center; }
            .amount-box strong { font-size: 28px; color: #007f5f; }
            .notes { margin-top: 18px; border: 1px solid #d8e4f1; padding: 14px; min-height: 70px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 46px; }
            .signature { border-top: 1px solid #53657d; padding-top: 8px; text-align: center; color: #53657d; }
          </style>
        </head>
        <body>${voucher.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }
}
