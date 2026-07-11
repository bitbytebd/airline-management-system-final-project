// FILE: src/app/features/payment/payment-detail/payment-detail.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/core/services/payment.service';
import { BookingService } from 'src/app/core/services/booking.service';
import {
  Payment, PAYMENT_STATUS_META, PAYMENT_METHOD_META
} from 'src/app/core/models/payment.model';
import { Booking } from 'src/app/core/models/booking.model';

@Component({
  selector:    'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls:   ['./payment-detail.component.css']
})
export class PaymentDetailComponent implements OnInit {
  @ViewChild('voucherRef') voucherRef?: ElementRef<HTMLElement>;

  payment:  Payment | null = null;
  booking: Booking | null = null;
  loading   = true;
  errorMsg  = '';
  alertMsg  = '';
  alertType = '';
  actionLoading = false;
  voucherViewed = false;

  readonly statusMeta = PAYMENT_STATUS_META;
  readonly methodMeta = PAYMENT_METHOD_META;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private svc:    PaymentService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/payment']); return; }
    this.svc.getById(id).subscribe({
      next: p  => {
        this.payment = p;
        if (!p.bookingId) {
          this.loading = false;
          return;
        }
        this.bookingService.getById(p.bookingId).subscribe({
          next: booking => { this.booking = booking; this.loading = false; },
          error: () => { this.booking = null; this.loading = false; }
        });
      },
      error: () => { this.errorMsg = 'Payment not found.'; this.loading = false; }
    });
  }

  cancel(): void {
    if (!this.payment || !confirm(`Cancel payment ${this.payment.paymentReference}?`)) return;
    this.actionLoading = true;
    this.svc.cancel(this.payment.id).subscribe({
      next: p  => { this.payment = p; this.showAlert('Payment cancelled.', 'warn'); this.actionLoading = false; },
      error: e => { this.showAlert(e?.error?.error || 'Failed.', 'error'); this.actionLoading = false; }
    });
  }

  markRefunded(): void {
    if (!this.payment || !confirm(`Mark ${this.payment.paymentReference} as REFUNDED?`)) return;
    this.actionLoading = true;
    this.svc.markRefunded(this.payment.id).subscribe({
      next: p  => { this.payment = p; this.showAlert('Marked as refunded.', 'success'); this.actionLoading = false; },
      error: e => { this.showAlert(e?.error?.error || 'Failed.', 'error'); this.actionLoading = false; }
    });
  }

  printReceipt(): void { window.print(); }

  viewVoucher(): void {
    this.voucherViewed = true;
    setTimeout(() => this.voucherRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  backToPaymentList(): void {
    this.router.navigate(['/payment']);
  }

  downloadVoucher(): void {
    if (!this.payment || !this.voucherRef) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${this.payment.paymentReference}</title></head><body>${this.voucherRef.nativeElement.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.payment.paymentReference || 'payment-voucher'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  getStatusMeta(s: any) { return this.statusMeta[s as keyof typeof this.statusMeta] ?? this.statusMeta.PENDING; }
  getMethodMeta(m: any) { return this.methodMeta[m as keyof typeof this.methodMeta] ?? this.methodMeta.CASH; }

  formatAmount(n: number | undefined): string {
    const code = this.payment?.currency || 'USD';
    const prefix = code === 'USD' ? '$' : code + ' ';
    return prefix + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  value(v: any): string {
    return v === null || v === undefined || v === '' ? 'N/A' : String(v);
  }

  amount(v: number | undefined | null): string {
    return this.formatAmount(v ?? 0);
  }

  passengerPhone(): string {
    return this.value(this.booking?.phone);
  }

  flightRoute(): string {
    return this.payment?.flightRoute || `${this.booking?.origin || 'N/A'} to ${this.booking?.destination || 'N/A'}`;
  }

  departureText(): string {
    if (!this.booking?.departureDate && !this.booking?.departureTime) return 'N/A';
    return `${this.booking?.departureDate || 'N/A'} ${this.booking?.departureTime || ''}`.trim();
  }

  arrivalText(): string {
    return this.value(this.booking?.arrivalTime);
  }

  bookingStatus(): string {
    return this.value(this.booking?.status);
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
