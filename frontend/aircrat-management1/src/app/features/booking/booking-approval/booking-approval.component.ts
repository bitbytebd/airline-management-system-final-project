import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from 'src/app/core/models/booking.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { BookingService } from 'src/app/core/services/booking.service';

@Component({
  selector: 'app-booking-approval',
  templateUrl: './booking-approval.component.html',
  styleUrls: ['./booking-approval.component.css']
})
export class BookingApprovalComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  actionLoadingId: number | null = null;
  errorMessage = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue(): void {
    this.loading = true;
    this.errorMessage = '';
    this.bookingService.getByStatus('PENDING_REVIEW').subscribe({
      next: bookings => {
        this.bookings = bookings || [];
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Could not load pending booking approvals.';
        this.loading = false;
      }
    });
  }

  approve(booking: Booking): void {
    if (!booking.id || !this.canApprove) return;
    this.actionLoadingId = booking.id;
    this.bookingService.approve(booking.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.router.navigate(['/payment/process'], { queryParams: { bookingId: booking.id } });
      },
      error: err => {
        this.actionLoadingId = null;
        alert(err?.error?.error || 'Could not approve this booking.');
      }
    });
  }

  reject(booking: Booking): void {
    if (!booking.id || !this.canReject) return;
    if (!confirm('Reject this pending booking review?')) return;

    this.actionLoadingId = booking.id;
    this.bookingService.reject(booking.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadQueue();
      },
      error: err => {
        this.actionLoadingId = null;
        alert(err?.error?.error || 'Could not reject this booking.');
      }
    });
  }

  get canApprove(): boolean {
    return this.authService.hasPermission('BOOKING_APPROVE') ||
      this.authService.hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER');
  }

  get canReject(): boolean {
    return this.authService.hasPermission('BOOKING_REJECT') ||
      this.authService.hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER');
  }

  statusClass(status: string | undefined): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }

  trackByBookingId(index: number, booking: Booking): number | undefined {
    return booking.id || index;
  }
}
