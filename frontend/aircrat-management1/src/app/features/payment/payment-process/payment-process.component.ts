import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Booking } from 'src/app/core/models/booking.model';
import { Payment, PaymentMethod, PAYMENT_METHOD_META } from 'src/app/core/models/payment.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-payment-process',
  templateUrl: './payment-process.component.html',
  styleUrls: ['./payment-process.component.css']
})
export class PaymentProcessComponent implements OnInit {
  form!: FormGroup;
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  createdPayment: Payment | null = null;

  bookingSearch = '';
  loadingBookings = true;
  submitting = false;
  errorMsg = '';
  successMsg = '';

  readonly methodMeta = PAYMENT_METHOD_META;
  readonly methods: PaymentMethod[] = ['CREDIT_CARD', 'DEBIT_CARD', 'ONLINE_PAYMENT', 'BANK_TRANSFER', 'BKASH', 'NAGAD', 'CASH', 'LOYALTY_POINTS'];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      bookingId: [null, Validators.required],
      paymentMethod: ['CREDIT_CARD', Validators.required],
      gatewayName: ['Skyward SecurePay'],
      cardLastFour: ['4242', [Validators.pattern(/^[0-9]{4}$/)]],
      cardBrand: ['VISA'],
      mobileNumber: [''],
      bankName: [''],
      loyaltyPointsToUse: [0, [Validators.min(0)]],
      notes: ['Processed from Skyward payment console']
    });

    this.bookingService.getAll().subscribe({
      next: bookings => {
        this.bookings = bookings || [];
        this.filteredBookings = this.paymentReadyBookings().slice(0, 8);
        this.loadingBookings = false;
        const bookingId = Number(this.route.snapshot.queryParamMap.get('bookingId'));
        const directBooking = this.bookings.find(b => b.id === bookingId);
        if (directBooking) this.selectBooking(directBooking);
      },
      error: () => {
        this.loadingBookings = false;
        this.errorMsg = 'Unable to load bookings for payment processing.';
      }
    });
  }

  filterBookings(): void {
    const q = this.bookingSearch.toLowerCase().trim();
    this.filteredBookings = this.paymentReadyBookings().filter(b =>
      !q ||
      b.bookingReference?.toLowerCase().includes(q) ||
      b.passengerName?.toLowerCase().includes(q) ||
      b.flightNumber?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q)
    ).slice(0, 10);

    if (q && !this.selectedBooking) {
      const exact = this.filteredBookings.find(b => this.bookingLabel(b).toLowerCase() === q);
      if (exact) this.selectBooking(exact);
    }
  }

  paymentReadyBookings(): Booking[] {
    return this.bookings.filter(b =>
      (b.status === 'APPROVED_FOR_PAYMENT' || b.status === 'CONFIRMED') &&
      b.paymentStatus !== 'PAID'
    );
  }

  selectBooking(booking: Booking): void {
    this.selectedBooking = booking;
    this.bookingSearch = this.bookingLabel(booking);
    this.form.patchValue({ bookingId: booking.id });
    this.filteredBookings = [];
    this.errorMsg = '';
  }

  bookingLabel(booking: Booking): string {
    return `${booking.bookingReference || booking.id} - ${booking.passengerName || 'Passenger'}`;
  }

  chooseMethod(method: PaymentMethod): void {
    this.form.patchValue({ paymentMethod: method });
    if (method === 'BKASH' || method === 'NAGAD' || method === 'ROCKET') {
      this.form.patchValue({ gatewayName: this.methodMeta[method].label, cardLastFour: '', cardBrand: '' });
    } else if (method === 'BANK_TRANSFER') {
      this.form.patchValue({ gatewayName: 'Bank Settlement', cardLastFour: '', cardBrand: '' });
    } else if (method === 'CASH') {
      this.form.patchValue({ gatewayName: 'Airport Counter', cardLastFour: '', cardBrand: '' });
    } else {
      this.form.patchValue({ gatewayName: 'Skyward SecurePay', cardLastFour: '4242', cardBrand: method === 'DEBIT_CARD' ? 'Mastercard' : 'VISA' });
    }
  }

  processPayment(): void {
    this.errorMsg = '';
    this.successMsg = '';
    this.createdPayment = null;
    if (this.form.invalid || !this.selectedBooking) {
      this.errorMsg = 'Select a booking and complete required payment details.';
      return;
    }
    if (this.selectedBooking.status !== 'APPROVED_FOR_PAYMENT' && this.selectedBooking.status !== 'CONFIRMED') {
      this.errorMsg = 'This booking must be approved from Booking List before payment.';
      return;
    }
    this.submitting = true;
    this.paymentService.process(this.form.value).subscribe({
      next: payment => {
        this.createdPayment = payment;
        this.successMsg = `Payment ${payment.paymentReference} processed successfully.`;
        this.submitting = false;
        this.router.navigate(['/payment/detail', payment.id]);
      },
      error: e => {
        this.errorMsg = e?.error?.error || 'Payment processing failed.';
        this.submitting = false;
      }
    });
  }

  viewCreatedPayment(): void {
    if (this.createdPayment) this.router.navigate(['/payment/detail', this.createdPayment.id]);
  }

  formatAmount(n: number | undefined): string {
    return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  selectedMethod(): PaymentMethod {
    return this.form.get('paymentMethod')?.value;
  }
}
