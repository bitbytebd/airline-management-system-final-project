import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../../core/models/booking.model';
import { UserPortalDashboard } from '../../../core/models/user-portal.model';
import { UserPortalService } from '../../../core/services/user-portal.service';

@Component({
  selector: 'app-user-portal',
  templateUrl: './user-portal.component.html',
  styleUrls: ['./user-portal.component.css']
})
export class UserPortalComponent implements OnInit {
  step: 'phone' | 'otp' | 'dashboard' = 'phone';
  loading = false;
  errorMessage = '';
  successMessage = '';
  maskedPhone = '';
  demoOtp = '';
  generatedOtp = '';
  pendingIdentifier = '';
  otpModalOpen = false;
  dashboard: UserPortalDashboard | null = null;
  portalMode: 'book' | 'manage' | 'track' = 'manage';
  portalModeTitle = 'Passenger verification';
  portalModeMessage = 'Please verify your phone number or email to continue.';

  phoneForm = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.minLength(6)]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  constructor(
    private fb: FormBuilder,
    private userPortalService: UserPortalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const requestedMode = (params.get('mode') || 'manage').toLowerCase();
      this.portalMode = requestedMode === 'book' || requestedMode === 'track' ? requestedMode : 'manage';
      this.applyPortalModeMessage(params.get('from'), params.get('to'), params.get('date'), params.get('flightId'));
    });
  }

  sendOtp(): void {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.loading = false;
    this.pendingIdentifier = this.phoneForm.value.phoneNumber || '';
    this.generatedOtp = this.createOtp();
    this.maskedPhone = this.maskIdentifier(this.pendingIdentifier);
    this.step = 'otp';
    this.otpModalOpen = true;
    this.successMessage = 'A secure access OTP has been generated for this portal session.';
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if ((this.otpForm.value.otp || '').trim() !== this.generatedOtp) {
      this.loading = false;
      this.errorMessage = 'OTP did not match. Please enter the floating OTP shown in the popup.';
      this.otpModalOpen = true;
      return;
    }

    this.userPortalService.accessDashboard({ identifier: this.pendingIdentifier }).subscribe({
      next: dashboard => {
        this.loading = false;
        this.dashboard = dashboard;
        sessionStorage.setItem('skyward_public_verified_identifier', this.pendingIdentifier);
        this.step = 'dashboard';
        this.otpModalOpen = false;
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'No passenger profile was found for this phone number or email.';
      }
    });
  }

  reset(): void {
    this.step = 'phone';
    this.dashboard = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.demoOtp = '';
    this.generatedOtp = '';
    this.pendingIdentifier = '';
    this.otpModalOpen = false;
    this.otpForm.reset();
    sessionStorage.removeItem('skyward_public_verified_identifier');
  }

  closeOtpModal(): void {
    this.otpModalOpen = false;
  }

  showOtpModal(): void {
    this.otpModalOpen = true;
  }

  formatAmount(value?: number | null): string {
    return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  statusClass(status?: string): string {
    return (status || 'PENDING').toLowerCase();
  }

  canPayBooking(booking: Booking): boolean {
    const status = String(booking.status || '').toUpperCase();
    const paymentStatus = String(booking.paymentStatus || '').toUpperCase();
    const allowedStatus = status === 'APPROVED_FOR_PAYMENT' || status === 'CONFIRMED';
    return allowedStatus && paymentStatus === 'PENDING' && this.bookingBelongsToVerifiedPassenger(booking);
  }

  openPublicPayment(booking: Booking): void {
    if (!booking.id || !this.canPayBooking(booking)) return;
    this.router.navigate(['/public-payment'], {
      queryParams: {
        bookingId: booking.id,
        ref: booking.bookingReference
      }
    });
  }

  private createOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private maskIdentifier(value: string): string {
    if (!value) return '';
    if (value.includes('@')) {
      const [name, domain] = value.split('@');
      return `${name.slice(0, 2)}***@${domain}`;
    }
    const digits = value.replace(/\D/g, '');
    return digits.length > 4 ? `****${digits.slice(-4)}` : value;
  }

  private bookingBelongsToVerifiedPassenger(booking: Booking): boolean {
    const identifier = (this.pendingIdentifier || '').trim().toLowerCase();
    if (!identifier) return false;
    return String(booking.email || '').toLowerCase() === identifier ||
      String(booking.phone || '').toLowerCase() === identifier;
  }

  private applyPortalModeMessage(from?: string | null, to?: string | null, date?: string | null, flightId?: string | null): void {
    if (this.portalMode === 'book') {
      const routeText = [from, to].filter(Boolean).join(' to ');
      const details = [
        routeText ? `Route: ${routeText}` : '',
        date ? `Date: ${date}` : '',
        flightId ? `Selected flight: ${flightId}` : ''
      ].filter(Boolean).join(' | ');

      this.portalModeTitle = 'Start public booking';
      this.portalModeMessage = details
        ? `Please verify your phone/email to continue. ${details}.`
        : 'Please verify your phone/email to continue with public booking.';
      return;
    }

    if (this.portalMode === 'track') {
      this.portalModeTitle = 'Track booking or flight status';
      this.portalModeMessage = 'Please verify your phone/email to continue to your booking and travel status.';
      return;
    }

    this.portalModeTitle = 'Manage booking';
    this.portalModeMessage = 'Please verify your phone/email to continue to your booking, payment, and travel records.';
  }
}
