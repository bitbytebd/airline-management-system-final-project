import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../../core/models/booking.model';
import { Payment, PaymentMethod, ProcessPaymentRequest } from '../../../core/models/payment.model';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-public-payment',
  templateUrl: './public-payment.component.html',
  styleUrls: ['./public-payment.component.css']
})
export class PublicPaymentComponent implements OnInit {
  booking: Booking | null = null;
  payment: Payment | null = null;
  loading = true;
  processing = false;
  success = false;
  blockedMessage = '';
  errorMessage = '';

  paymentMethods: PaymentMethod[] = [
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'BKASH',
    'NAGAD',
    'ROCKET',
    'ONLINE_PAYMENT'
  ];

  paymentForm = this.fb.group({
    paymentMethod: ['CREDIT_CARD' as PaymentMethod, Validators.required],
    gatewayName: ['Skyward Public Gateway', Validators.required],
    cardLastFour: ['', [Validators.pattern(/^[0-9]{4}$/)]],
    notes: ['']
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const bookingId = Number(this.route.snapshot.queryParamMap.get('bookingId'));
    const bookingReference = String(this.route.snapshot.queryParamMap.get('ref') || '').trim();

    if (bookingId) {
      this.loadBookingById(bookingId);
      return;
    }

    if (bookingReference) {
      this.loadBookingByReference(bookingReference);
      return;
    }

    this.block('A valid booking was not selected for payment.');
  }

  private loadBookingById(bookingId: number): void {
    this.bookingService.getById(bookingId).subscribe({
      next: booking => {
        this.loading = false;
        this.booking = booking;
        this.validateBookingAccess(booking);
      },
      error: err => {
        this.loading = false;
        this.block(err?.error?.message || 'Unable to load this booking for payment.');
      }
    });
  }

  private loadBookingByReference(bookingReference: string): void {
    this.bookingService.getByReference(bookingReference).subscribe({
      next: booking => {
        this.loading = false;
        this.booking = booking;
        this.validateBookingAccess(booking);
      },
      error: err => {
        this.loading = false;
        this.block(err?.error?.message || 'Unable to load this booking for payment.');
      }
    });
  }

  processPayment(): void {
    if (!this.booking || this.blockedMessage || this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.processing = true;
    this.errorMessage = '';

    const raw = this.paymentForm.getRawValue();
    const payload = {
      bookingId: this.booking.id,
      amount: this.finalPayableAmount(),
      totalAmount: this.finalPayableAmount(),
      paymentPurpose: 'BOOKING_PAYMENT',
      paymentMethod: raw.paymentMethod,
      gatewayName: raw.gatewayName || 'Skyward Public Gateway',
      cardLastFour: raw.cardLastFour || undefined,
      notes: raw.notes || 'Public passenger payment'
    } as ProcessPaymentRequest & { paymentPurpose: 'BOOKING_PAYMENT'; amount: number; totalAmount: number };

    this.paymentService.process(payload).subscribe({
      next: payment => {
        this.processing = false;
        this.payment = payment;
        this.success = true;
        if (this.booking) {
          this.booking.paymentStatus = 'PAID';
        }
      },
      error: err => {
        this.processing = false;
        this.errorMessage = err?.error?.message || 'Payment could not be completed. Please try again or contact Skyward support.';
      }
    });
  }

  finalPayableAmount(): number {
    return Number(this.booking?.grandTotal || this.booking?.totalPrice || 0);
  }

  formatAmount(value?: number | null): string {
    return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  statusClass(status?: string): string {
    return (status || 'PENDING').toLowerCase();
  }

  backToPortal(): void {
    this.router.navigate(['/user-portal'], { queryParams: { mode: 'manage' } });
  }

  backHome(): void {
    this.router.navigate(['/']);
  }

  viewInvoice(): void {
    this.router.navigate(['/booking-status'], { queryParams: { ref: this.booking?.bookingReference, view: 'invoice' } });
  }

  viewTicket(): void {
    this.router.navigate(['/booking-status'], { queryParams: { ref: this.booking?.bookingReference, view: 'ticket' } });
  }

  private validateBookingAccess(booking: Booking): void {
    const bookingStatus = String(booking.status || '').toUpperCase();
    const paymentStatus = String(booking.paymentStatus || '').toUpperCase();
    if (paymentStatus === 'PAID' || paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS') {
      this.blockedMessage = 'This booking has already been paid.';
      return;
    }

    if (bookingStatus !== 'APPROVED_FOR_PAYMENT' && bookingStatus !== 'CONFIRMED') {
      this.blockedMessage = 'This booking is not approved for payment yet.';
    }
  }

  private block(message: string): void {
    this.loading = false;
    this.blockedMessage = message;
  }
}
