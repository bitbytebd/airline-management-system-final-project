// ═══════════════════════════════════════════════════════════════════
// FILE: src/app/features/payment/payment-list/payment-list.component.ts
// ═══════════════════════════════════════════════════════════════════
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { PaymentService }    from 'src/app/core/services/payment.service';
import {
  Payment,
  PaymentStats,
  PaymentStatus,
  PaymentMethod,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_META
} from 'src/app/core/models/payment.model';

@Component({
  selector:    'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls:   ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────────
  allPayments:  Payment[]     = [];
  filtered:     Payment[]     = [];
  stats:        PaymentStats  = {
    totalRevenue:0, monthlyRevenue:0, dailyRevenue:0,
    completedCount:0, pendingCount:0, failedCount:0, refundedCount:0, totalCount:0
  };
  methodBreakdown: any[] = [];

  // ── State ─────────────────────────────────────────────────────
  loading      = true;
  search       = '';
  searchSuggestions: Payment[] = [];
  showSearchSuggestions = false;
  statusFilter = '';
  methodFilter = '';
  sortField    = 'createdAt';
  sortAsc      = false;

  // ── Alert ─────────────────────────────────────────────────────
  alertMsg  = '';
  alertType = '';
  actionLoadingId: number | null = null;

  readonly statusMeta = PAYMENT_STATUS_META;
  readonly methodMeta = PAYMENT_METHOD_META;

  readonly allStatuses: PaymentStatus[] = [
    'PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED','CANCELLED','PARTIAL'
  ];
  readonly allMethods: PaymentMethod[] = [
    'CREDIT_CARD','DEBIT_CARD','BANK_TRANSFER','BKASH','NAGAD','ROCKET','CASH','LOYALTY_POINTS','ONLINE_PAYMENT'
  ];

  constructor(private svc: PaymentService, private router: Router) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: d  => { this.allPayments = d; this.applyFilter(); this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.svc.getStats().subscribe({ next: s => this.stats = s, error: () => {} });
    this.svc.getMethodBreakdown().subscribe({ next: d => this.methodBreakdown = d, error: () => {} });
  }

  applyFilter(): void {
    const q = this.search.toLowerCase();
    this.filtered = this.allPayments.filter(p =>
      (!q || p.paymentReference?.toLowerCase().includes(q)
           || p.passengerName?.toLowerCase().includes(q)
           || p.bookingReference?.toLowerCase().includes(q)
           || p.flightNumber?.toLowerCase().includes(q)
           || p.transactionReference?.toLowerCase().includes(q)) &&
      (!this.statusFilter || p.status === this.statusFilter) &&
      (!this.methodFilter || p.paymentMethod === this.methodFilter)
    );
    this.sortList();
    this.searchSuggestions = q ? this.filtered.slice(0, 8) : [];
    this.showSearchSuggestions = !!q && this.searchSuggestions.length > 0;
  }

  selectSuggestion(payment: Payment): void {
    this.search = payment.paymentReference || payment.bookingReference || payment.passengerName || '';
    this.showSearchSuggestions = false;
    this.filtered = [payment];
  }

  hideSuggestions(): void {
    setTimeout(() => this.showSearchSuggestions = false, 180);
  }

  sortBy(field: string): void {
    this.sortAsc  = this.sortField === field ? !this.sortAsc : false;
    this.sortField = field;
    this.sortList();
  }

  sortList(): void {
    this.filtered.sort((a: any, b: any) => {
      const av = a[this.sortField] ?? '', bv = b[this.sortField] ?? '';
      return this.sortAsc ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });
  }

  getSortIcon(f: string): string {
    return this.sortField !== f ? 'fa-sort' : this.sortAsc ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ── Actions ───────────────────────────────────────────────────
  cancel(p: Payment): void {
    if (!confirm(`Cancel payment ${p.paymentReference}?`)) return;
    this.actionLoadingId = p.id;
    this.svc.cancel(p.id).subscribe({
      next: () => { this.showAlert('Payment cancelled.', 'warn'); this.loadAll(); this.actionLoadingId = null; },
      error: e => { this.showAlert(e?.error?.error || 'Failed.', 'error'); this.actionLoadingId = null; }
    });
  }

  markRefunded(p: Payment): void {
    if (!confirm(`Mark ${p.paymentReference} as REFUNDED?`)) return;
    this.actionLoadingId = p.id;
    this.svc.markRefunded(p.id).subscribe({
      next: () => { this.showAlert('Marked as refunded.', 'success'); this.loadAll(); this.actionLoadingId = null; },
      error: e => { this.showAlert(e?.error?.error || 'Failed.', 'error'); this.actionLoadingId = null; }
    });
  }

  viewDetail(p: Payment): void { this.router.navigate(['/payment/detail', p.id]); }

  // ── Helpers ───────────────────────────────────────────────────
  countStatus(s: string):  number { return this.allPayments.filter(p => p.status === s).length; }
  countMethod(m: string):  number { return this.allPayments.filter(p => p.paymentMethod === m).length; }
  getStatusMeta(s: PaymentStatus) { return this.statusMeta[s] ?? this.statusMeta.PENDING; }
  getMethodMeta(m: PaymentMethod) { return this.methodMeta[m] ?? this.methodMeta.CASH; }

  getTotalFiltered(): number {
    return this.filtered.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + (p.totalAmount ?? 0), 0);
  }

  formatAmount(n: number | undefined): string {
    return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatMoney(n: number | undefined, currency?: string): string {
    const code = currency || 'USD';
    const prefix = code === 'USD' ? '$' : code + ' ';
    return prefix + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDT(d: string | null): string {
    if (!d) return '--';
    return new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  private showAlert(msg: string, type: string): void {
    this.alertMsg = msg; this.alertType = type;
    setTimeout(() => { this.alertMsg = ''; }, 4000);
  }
}
