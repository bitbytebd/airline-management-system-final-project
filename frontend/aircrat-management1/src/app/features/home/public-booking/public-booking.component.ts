import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from 'src/app/core/models/booking.model';
import { Flight } from 'src/app/core/models/flight.model';
import { Coupon, CouponValidationResult } from 'src/app/core/models/coupon.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { CouponService } from 'src/app/core/services/coupon.service';
import { FlightService } from 'src/app/core/services/flight.service';

interface PublicSeat {
  seatNumber: string;
  row: number;
  column: string;
  status: 'AVAILABLE' | 'BOOKED' | 'PENDING' | 'SELECTED';
}

interface CabinSection {
  code: string;
  label: string;
  rows: number[];
}

@Component({
  selector: 'app-public-booking',
  templateUrl: './public-booking.component.html',
  styleUrls: ['./public-booking.component.css']
})
export class PublicBookingComponent implements OnInit {
  flight: Flight | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';
  seatMessage = '';
  couponMessage = '';
  savedBooking: Booking | null = null;
  seats: PublicSeat[] = [];
  selectedSeats: string[] = [];
  coupons: Coupon[] = [];
  filteredCoupons: Coupon[] = [];
  showCouponSuggestions = false;
  selectedCoupon: Coupon | null = null;
  couponValidation: CouponValidationResult | null = null;
  validatingCoupon = false;

  bookingForm = this.fb.group({
    passengerName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    passportNumber: [''],
    classType: ['ECONOMY', Validators.required],
    adultCount: [1, [Validators.required, Validators.min(1)]],
    childCount: [0, [Validators.min(0)]],
    infantCount: [0, [Validators.min(0)]],
    seatNumber: [''],
    couponCode: [''],
    loyaltyMemberNumber: [''],
    loyaltyPointsUsed: [0, [Validators.min(0)]]
  });

  readonly classOptions = [
    { value: 'ECONOMY', label: 'Economy' },
    { value: 'PREMIUM', label: 'Premium' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'FIRST_CLASS', label: 'First Class' }
  ];

  readonly cabinSections: CabinSection[] = [
    { code: 'FIRST_CLASS', label: 'FIRST CLASS', rows: [1, 2] },
    { code: 'BUSINESS', label: 'BUSINESS CLASS', rows: [3, 4, 5] },
    { code: 'PREMIUM', label: 'PREMIUM ECONOMY', rows: [6, 7, 8, 9, 10] },
    { code: 'ECONOMY', label: 'ECONOMY CLASS', rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private bookingService: BookingService,
    private couponService: CouponService
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
    const flightId = Number(this.route.snapshot.queryParamMap.get('flightId'));
    if (!flightId) {
      this.loading = false;
      this.errorMessage = 'Please select a flight before starting a booking request.';
      return;
    }

    this.flightService.getById(flightId).subscribe({
      next: flight => {
        this.flight = flight;
        this.loading = false;
        if (!this.isBookable(flight)) {
          this.errorMessage = 'This flight is no longer available for booking.';
        } else if (flight.id) {
          this.loadSeatMap(flight.id);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Selected flight could not be loaded.';
      }
    });
  }

  submitBooking(): void {
    this.errorMessage = '';
    if (!this.flight || !this.isBookable(this.flight)) {
      this.errorMessage = 'This flight is no longer available for booking.';
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage = 'Please complete the required passenger and booking fields.';
      return;
    }

    if (this.selectedSeats.length !== this.requiredSeatCount()) {
      this.seatMessage = `Please select ${this.requiredSeatCount()} seat${this.requiredSeatCount() === 1 ? '' : 's'} for this booking.`;
      return;
    }

    const value = this.bookingForm.value;
    const payload = {
      passengerId: null,
      passengerName: value.passengerName || '',
      email: value.email || '',
      phone: value.phone || '',
      passportNumber: value.passportNumber || '',
      flightId: this.flight.id,
      flightNumber: this.flight.flightNumber,
      origin: this.flight.origin,
      destination: this.flight.destination,
      departureDate: this.flight.departureDate,
      departureTime: this.flight.departureTime,
      arrivalTime: this.flight.arrivalTime,
      totalDistance: this.flight.distance || 0,
      classType: value.classType || 'ECONOMY',
      seatNumber: this.selectedSeats.join(','),
      adultCount: Number(value.adultCount || 1),
      childCount: Number(value.childCount || 0),
      infantCount: Number(value.infantCount || 0),
      couponCode: value.couponCode || '',
      loyaltyMemberNumber: value.loyaltyMemberNumber || '',
      loyaltyPointsUsed: Number(value.loyaltyPointsUsed || 0),
      paymentMethod: 'PENDING',
      paymentStatus: 'PENDING',
      status: 'PENDING_REVIEW'
    } as unknown as Booking;

    this.submitting = true;
    this.bookingService.create(payload).subscribe({
      next: booking => {
        this.savedBooking = booking;
        this.submitting = false;
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || err?.error?.error || 'Booking request could not be submitted.';
      }
    });
  }

  selectAnotherFlight(): void {
    this.router.navigate(['/flights/search']);
  }

  classPrice(type: string): number {
    if (!this.flight) return 0;
    const economy = this.flight.economyPrice || this.flight.basePrice || 0;
    if (type === 'PREMIUM') return this.flight.premiumPrice || economy * 1.5;
    if (type === 'BUSINESS') return this.flight.businessPrice || economy * 2.5;
    if (type === 'FIRST_CLASS') return this.flight.firstClassPrice || economy * 4;
    return economy;
  }

  requiredSeatCount(): number {
    return Number(this.bookingForm.value.adultCount || 1) + Number(this.bookingForm.value.childCount || 0);
  }

  seatRows(): number[] {
    return Array.from({ length: 20 }, (_, index) => index + 1);
  }

  seatColumns(): string[] {
    return ['A', 'B', 'C', 'D', 'E', 'F'];
  }

  selectedCabin(): string {
    return String(this.bookingForm.value.classType || 'ECONOMY');
  }

  isSelectedCabin(section: CabinSection): boolean {
    return section.code === this.selectedCabin();
  }

  cabinForSeat(seatNumber: string): string {
    const row = Number(String(seatNumber).match(/\d+/)?.[0] || 0);
    return this.cabinSections.find(section => section.rows.includes(row))?.code || 'ECONOMY';
  }

  onClassTypeChange(): void {
    this.selectedSeats = [];
    this.bookingForm.patchValue({ seatNumber: '' }, { emitEvent: false });
    this.seatMessage = 'Please select seats from your chosen cabin class.';
  }

  seatStatus(seatNumber: string): PublicSeat['status'] {
    if (this.selectedSeats.includes(seatNumber)) return 'SELECTED';
    return this.seats.find(seat => seat.seatNumber === seatNumber)?.status || 'AVAILABLE';
  }

  canSelectSeat(seatNumber: string): boolean {
    const status = this.seatStatus(seatNumber);
    const matchesCabin = this.cabinForSeat(seatNumber) === this.selectedCabin();
    return matchesCabin && (status === 'AVAILABLE' || status === 'SELECTED');
  }

  toggleSeat(seatNumber: string): void {
    if (this.cabinForSeat(seatNumber) !== this.selectedCabin()) {
      this.seatMessage = 'Please select seats from your chosen cabin class.';
      return;
    }
    if (!this.canSelectSeat(seatNumber)) return;
    this.seatMessage = '';
    if (this.selectedSeats.includes(seatNumber)) {
      this.selectedSeats = this.selectedSeats.filter(seat => seat !== seatNumber);
    } else {
      const maxSeats = this.requiredSeatCount();
      if (this.selectedSeats.length >= maxSeats) {
        this.seatMessage = `You can select only ${maxSeats} seat${maxSeats === 1 ? '' : 's'}.`;
        return;
      }
      this.selectedSeats = [...this.selectedSeats, seatNumber];
    }
    this.bookingForm.patchValue({ seatNumber: this.selectedSeats.join(',') }, { emitEvent: false });
  }

  syncSeatCount(): void {
    const maxSeats = this.requiredSeatCount();
    if (this.selectedSeats.length > maxSeats) {
      this.selectedSeats = this.selectedSeats.slice(0, maxSeats);
      this.bookingForm.patchValue({ seatNumber: this.selectedSeats.join(',') }, { emitEvent: false });
    }
    this.seatMessage = '';
  }

  onCouponInput(): void {
    const query = String(this.bookingForm.value.couponCode || '').trim().toLowerCase();
    this.selectedCoupon = null;
    this.couponValidation = null;
    this.couponMessage = '';
    this.filteredCoupons = query
      ? this.coupons
          .filter(coupon => String(coupon.code || '').toLowerCase().includes(query))
          .slice(0, 6)
      : [];
    this.showCouponSuggestions = this.filteredCoupons.length > 0;
  }

  selectCoupon(coupon: Coupon): void {
    this.selectedCoupon = coupon;
    this.couponValidation = null;
    this.bookingForm.patchValue({ couponCode: coupon.code }, { emitEvent: false });
    this.filteredCoupons = [];
    this.showCouponSuggestions = false;
    this.couponMessage = 'Coupon selected. Final eligibility will be verified before saving.';
  }

  applyCoupon(): void {
    const code = String(this.bookingForm.value.couponCode || '').trim();
    if (!code || !this.flight) {
      this.couponMessage = 'Enter or select a coupon code first.';
      return;
    }
    this.validatingCoupon = true;
    this.couponMessage = '';
    this.couponService.validate(code, this.previewSubtotal(), `${this.flight.origin}-${this.flight.destination}`, this.bookingForm.value.classType || 'ECONOMY').subscribe({
      next: result => {
        this.couponValidation = result;
        this.validatingCoupon = false;
        this.couponMessage = result.valid ? 'Coupon applied to estimated fare.' : (result.message || 'Coupon is not eligible for this booking.');
      },
      error: () => {
        this.couponValidation = null;
        this.validatingCoupon = false;
        this.couponMessage = 'Coupon selected. Final eligibility will be verified before saving.';
      }
    });
  }

  couponSummary(coupon: Coupon): string {
    const value = coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountValue}%`
      : this.formatMoney(coupon.discountValue);
    return `${value} off | ${coupon.status || 'ACTIVE'}`;
  }

  previewSubtotal(): number {
    const adult = Number(this.bookingForm.value.adultCount || 1);
    const child = Number(this.bookingForm.value.childCount || 0);
    const infant = Number(this.bookingForm.value.infantCount || 0);
    const classType = this.bookingForm.value.classType || 'ECONOMY';
    const fare = this.classPrice(classType);
    return fare * adult + fare * 0.75 * child + fare * 0.10 * infant;
  }

  previewTotal(): number {
    const classType = this.bookingForm.value.classType || 'ECONOMY';
    const passengerFare = this.previewSubtotal();
    const taxRate = classType === 'BUSINESS' || classType === 'FIRST_CLASS' ? 0.15 : 0.10;
    const grossTotal = passengerFare + passengerFare * taxRate;
    if (this.couponValidation?.valid) {
      return Math.max(this.couponValidation.finalAmount, 0);
    }
    return Math.max(grossTotal, 0);
  }

  formatMoney(value?: number | null): string {
    return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private isBookable(flight: Flight): boolean {
    const blocked = ['CANCELLED', 'CANCELED', 'LANDED', 'DEPARTED', 'COMPLETED'];
    const status = (flight.status || '').trim().toUpperCase();
    if (blocked.includes(status)) return false;

    if (!flight.departureDate || !flight.departureTime) return false;
    const time = flight.departureTime.length === 5 ? `${flight.departureTime}:00` : flight.departureTime;
    const departure = new Date(`${flight.departureDate}T${time}`);
    return !isNaN(departure.getTime()) && departure.getTime() > Date.now() + 30 * 60 * 1000;
  }

  private loadSeatMap(flightId: number): void {
    this.buildDefaultSeatMap();
    this.bookingService.getSeatMap(flightId).subscribe({
      next: seats => this.applySeatStatuses(seats || []),
      error: () => {
        this.bookingService.getBookingsByFlight(flightId).subscribe({
          next: bookings => this.applyBookingSeatFallback(bookings || []),
          error: () => this.seatMessage = 'Seat availability could not be loaded. You may still select from the standard cabin map.'
        });
      }
    });
  }

  private buildDefaultSeatMap(): void {
    this.seats = [];
    this.seatRows().forEach(row => {
      this.seatColumns().forEach(column => {
        this.seats.push({ row, column, seatNumber: `${row}${column}`, status: 'AVAILABLE' });
      });
    });
  }

  private applySeatStatuses(seatMap: any[]): void {
    const statusBySeat = new Map<string, PublicSeat['status']>();
    seatMap.forEach(item => {
      const seatNumber = String(item.seatNumber || '').trim().toUpperCase();
      const status = String(item.status || '').trim().toUpperCase();
      if (!seatNumber) return;
      if (['BOOKED', 'CONFIRMED', 'PAID', 'COMPLETED', 'TICKETED'].includes(status)) {
        statusBySeat.set(seatNumber, 'BOOKED');
      } else if (['PENDING', 'PENDING_REVIEW', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(status)) {
        statusBySeat.set(seatNumber, 'PENDING');
      }
    });
    this.seats = this.seats.map(seat => ({
      ...seat,
      status: statusBySeat.get(seat.seatNumber.toUpperCase()) || 'AVAILABLE'
    }));
  }

  private applyBookingSeatFallback(bookings: any[]): void {
    const seatMap = bookings.flatMap(booking => {
      const status = booking.status || booking.paymentStatus || 'PENDING';
      return String(booking.seatNumber || '')
        .split(',')
        .map(seatNumber => ({ seatNumber: seatNumber.trim(), status }))
        .filter(item => item.seatNumber);
    });
    this.applySeatStatuses(seatMap);
  }

  private loadCoupons(): void {
    this.couponService.getAll('ACTIVE').subscribe({
      next: coupons => this.coupons = coupons || [],
      error: () => this.coupons = []
    });
  }
}
