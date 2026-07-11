import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../../core/models/booking.model';
import { BookingService } from '../../../core/services/booking.service';

@Component({
  selector: 'app-public-booking-status',
  templateUrl: './public-booking-status.component.html',
  styleUrls: ['./public-booking-status.component.css']
})
export class PublicBookingStatusComponent implements OnInit {
  booking: Booking | null = null;
  bookingReference = '';
  loading = false;
  errorMessage = '';
  viewMode = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.bookingReference = String(params.get('ref') || '').trim();
      this.viewMode = String(params.get('view') || '').trim().toLowerCase();
      if (this.bookingReference) {
        this.loadBooking();
      }
    });
  }

  loadBooking(): void {
    if (!this.bookingReference) {
      this.errorMessage = 'Please enter a booking reference / PNR.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.booking = null;

    this.bookingService.getByReference(this.bookingReference).subscribe({
      next: booking => {
        this.loading = false;
        this.booking = booking;
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'No booking was found for this reference.';
      }
    });
  }

  canPay(): boolean {
    if (!this.booking) return false;
    if (this.isPaid()) return false;
    const status = this.normalizedStatus(this.booking.status);
    const paymentStatus = this.normalizedStatus(this.booking.paymentStatus);
    return (status === 'APPROVED_FOR_PAYMENT' || status === 'CONFIRMED') && paymentStatus === 'PENDING';
  }

  isPaid(): boolean {
    if (!this.booking) return false;
    const status = this.normalizedStatus(this.booking.status);
    const paymentStatus = this.normalizedStatus(this.booking.paymentStatus);
    return status === 'CONFIRMED' ||
      paymentStatus === 'PAID' ||
      paymentStatus === 'COMPLETED' ||
      paymentStatus === 'SUCCESS';
  }

  isPendingReview(): boolean {
    return this.normalizedStatus(this.booking?.status) === 'PENDING_REVIEW';
  }

  goToPayment(): void {
    if (!this.booking?.id) return;
    this.router.navigate(['/public-payment'], {
      queryParams: {
        bookingId: this.booking.id,
        ref: this.booking.bookingReference
      }
    });
  }

  openPortal(): void {
    this.router.navigate(['/user-portal'], { queryParams: { mode: 'manage' } });
  }

  showInvoice(): void {
    this.router.navigate(['/booking-status'], { queryParams: { ref: this.booking?.bookingReference, view: 'invoice' } });
  }

  showTicket(): void {
    this.router.navigate(['/booking-status'], { queryParams: { ref: this.booking?.bookingReference, view: 'ticket' } });
  }

  showStatus(): void {
    this.router.navigate(['/booking-status'], { queryParams: { ref: this.booking?.bookingReference } });
  }

  printPage(): void {
    window.print();
  }

  isInvoiceView(): boolean {
    return this.viewMode === 'invoice' && this.isPaid();
  }

  isTicketView(): boolean {
    return this.viewMode === 'ticket' && this.isPaid();
  }

  isStatusView(): boolean {
    return !this.isInvoiceView() && !this.isTicketView();
  }

  taxAmount(): number {
    return Number(this.booking?.tax || 0);
  }

  passengerFareTotal(): number {
    return Number(this.booking?.passengerFareTotal || this.booking?.baseFare || 0);
  }

  baggageFee(): number {
    return Number(this.booking?.baggageFee || 0);
  }

  specialServiceFee(): number {
    return Number(this.booking?.specialServiceFee || 0);
  }

  discountAmount(): number {
    return Number(this.booking?.discount || 0) +
      Number(this.booking?.couponDiscount || 0) +
      Number(this.booking?.loyaltyDiscount || 0);
  }

  passengerCountText(): string {
    const adults = Number(this.booking?.adultCount || 1);
    const children = Number(this.booking?.childCount || 0);
    const infants = Number(this.booking?.infantCount || 0);
    return `${adults} Adult, ${children} Child, ${infants} Infant`;
  }

  baggageText(): string {
    const bags = Number(this.booking?.checkedBags || 0);
    const checked = Number(this.booking?.checkedWeightKg || 0);
    const cabin = Number(this.booking?.cabinWeightKg || 0);
    return `${bags} bag, ${checked} kg checked, ${cabin} kg cabin`;
  }

  specialServicesText(): string {
    return this.booking?.specialServices || this.booking?.specialServiceNotes || 'N/A';
  }

  formatAmount(value?: number | null): string {
    return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  finalPayableAmount(): number {
    return Number(this.booking?.grandTotal || this.booking?.totalPrice || 0);
  }

  statusClass(status?: string): string {
    return this.normalizedStatus(status).toLowerCase();
  }

  private normalizedStatus(status?: string): string {
    return String(status || '').trim().toUpperCase();
  }
}
