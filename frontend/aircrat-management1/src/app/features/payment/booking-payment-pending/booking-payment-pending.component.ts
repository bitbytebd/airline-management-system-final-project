import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from 'src/app/core/models/booking.model';
import { BookingService } from 'src/app/core/services/booking.service';

@Component({
  selector: 'app-booking-payment-pending',
  templateUrl: './booking-payment-pending.component.html',
  styleUrls: ['./booking-payment-pending.component.css']
})
export class BookingPaymentPendingComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  errorMessage = '';

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit(): void {
    this.loadPendingPayments();
  }

  loadPendingPayments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.bookingService.getByStatus('APPROVED_FOR_PAYMENT').subscribe({
      next: bookings => {
        this.bookings = (bookings || []).filter(b => b.paymentStatus === 'PENDING');
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Could not load pending booking payments.';
        this.loading = false;
      }
    });
  }

  receivePayment(booking: Booking): void {
    if (!booking.id) return;
    this.router.navigate(['/payment/process'], { queryParams: { bookingId: booking.id } });
  }

  formatAmount(value: number | undefined): string {
    return '$' + (value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  get totalPayable(): number {
    return this.bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  }

  trackByBookingId(index: number, booking: Booking): number | undefined {
    return booking.id || index;
  }
}
