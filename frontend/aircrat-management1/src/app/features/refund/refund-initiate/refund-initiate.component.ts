import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router }from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

import { RefundService }  from 'src/app/core/services/refund.service';
import {
  BookingForRefund,
  PenaltyPreview,
  RefundReason,
  REASON_LABELS
} from 'src/app/core/models/refund.model';

@Component({
  selector:    'app-refund-initiate',
  templateUrl: './refund-initiate.component.html',
  styleUrls:   ['./refund-initiate.component.css']
})
export class RefundInitiateComponent implements OnInit {

  // Step control
  currentStep = 1;

  // Step 1: Search Variables
  bookingRef         = '';
  searching          = false;
  searchError        = '';
  foundBooking: BookingForRefund | null = null;
  
  // ── AUTOCOMPLETE VARIABLES (REAL TIME) ─────────────────────
  suggestions: BookingForRefund[] = [];
  searchInput$ = new Subject<string>();
  showDropdown = false;

  // Step 2: Form & Preview
  refundForm!: FormGroup;
  loadingPreview     = false;
  preview: PenaltyPreview | null = null;

  // Step 3: Submit
  submitting = false;
  submitError = '';

  // Data Lists
  readonly reasons: RefundReason[] = [
    'PASSENGER_CANCEL', 'FLIGHT_CANCEL', 'FLIGHT_DELAY',
    'OVERBOOKING', 'MEDICAL', 'WEATHER', 'DUPLICATE_BOOKING', 'OTHER'
  ];
  readonly reasonLabels = REASON_LABELS;

  constructor(
    private fb:     FormBuilder,
    private svc:    RefundService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refundForm = this.fb.group({
      reason: ['PASSENGER_CANCEL', Validators.required],
      notes:  ['']
    });

    // Auto-load preview when reason changes
    this.refundForm.get('reason')?.valueChanges.subscribe(reason => {
      if (this.foundBooking && reason) {
        this.loadPreview(reason);
      }
    });

    // ── REAL-TIME AUTOCOMPLETE LOGIC ───────────────────────
    this.searchInput$.pipe(
      debounceTime(300),               // Wait 300ms (Wait user to stop typing)
      distinctUntilChanged(),           // Ignore same inputs
      switchMap(query => {
        // ── IMPORTANT SERVICE CALL ──────────────────────────────
        // আপনার RefundService এ এই নামে একটি মেথড থাকা বাধ্যতামূলক
        // যা Server থেকে বুকিং লিস্ট রিটার্ন করবে।
        
        if (!query) return of([]); 
        
        // API Call এখানে হচ্ছে
        return this.svc.searchBookings(query).pipe(
          catchError(err => {
            console.error('Search failed', err);
            return of([]); // এরর আসলে খালি লিস্ট রিটার্ন করুন
          })
        );
      })
    ).subscribe(
      (results) => {
        const query = this.bookingRef.trim().toUpperCase();
        this.suggestions = (results || []).filter(item =>
          (item.bookingReference || '').toUpperCase().startsWith(query) ||
          (item.passengerName || '').toUpperCase().startsWith(query) ||
          (item.flightNumber || '').toUpperCase().startsWith(query)
        ).slice(0, 8);
        // সাজেশন দেখাবে যদি ডেটা থাকে এবং ইনপুট খালি না থাকে
        this.showDropdown = (this.suggestions.length > 0 && this.bookingRef.length > 0);
      },
      (err) => {
        this.suggestions = [];
        this.showDropdown = false;
      }
    );
  }

  // ── HANDLE INPUT FOR AUTOCOMPLETE ──────────────────────────
  onInputSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.bookingRef = value;
    this.searchError = ''; // Clear errors when typing

    if (value.trim().length > 0) {
      // Stream এ ভ্যালু পাঠানো হচ্ছে, যা `ngOnInit` এ API Call ট্রিগার করবে
      this.searchInput$.next(value.trim().toUpperCase()); 
    } else {
      this.suggestions = [];
      this.showDropdown = false;
    }
  }

  // ── SELECT A BOOKING FROM DROPDOWN ────────────────────────────
  selectSuggestion(booking: BookingForRefund): void {
    this.bookingRef = booking.bookingReference;
    this.showDropdown = false;
    
    // লিস্ট থেকে সিলেক্ট করার সাথে সাথে Found Booking সেট করা
    this.foundBooking = booking;
    this.searchError = '';
    
    // স্টেপ ২ এর জন্য প্রিভিউ লোড করা
    if (this.foundBooking) {
      this.loadPreview(this.refundForm.get('reason')?.value);
    }
  }

  // ── CLOSE DROPDOWN ON CLICK OUTSIDE ─────────────────────────
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.ri-autocomplete-wrapper')) {
      this.showDropdown = false;
    }
  }

  // ── GETTER ────────────────────────────────────────────────────
  get selectedReasonLabel(): string {
    const reason = this.refundForm.get('reason')?.value as RefundReason;
    return this.reasonLabels[reason] || 'Unknown';
  }

  // Step 1: Search via Button (Exact Match)
  searchBooking(): void {
    const ref = this.bookingRef.trim().toUpperCase();
    if (!ref) return;
    this.searching = true;
    this.searchError = '';
    this.foundBooking = null;
    this.showDropdown = false;

    // Exact Match API Call
    this.svc.getBookingByRef(ref).subscribe({
      next: (b) => {
        if (!b) {
          this.searchError = 'No booking found with reference: ' + ref;
        } else if (b.status === 'CANCELLED') {
          this.searchError = 'Booking ' + ref + ' is already cancelled.';
        } else {
          this.foundBooking = b;
          this.loadPreview(this.refundForm.get('reason')?.value);
        }
        this.searching = false;
      },
      error: () => {
        this.searchError = 'Booking not found. Please check reference and try again.';
        this.searching = false;
      }
    });
  }

  proceedToStep2(): void {
    if (this.foundBooking) this.currentStep = 2;
  }

  // Step 2: Load penalty preview
  loadPreview(reason: string): void {
    if (!this.foundBooking || !reason) return;
    this.loadingPreview = true;
    this.preview = null;

    this.svc.getPreview(this.foundBooking.id, reason).subscribe({
      next:  p  => { this.preview = p; this.loadingPreview = false; },
      error: () => { this.loadingPreview = false; }
    });
  }

  proceedToStep3(): void {
    if (this.refundForm.valid && this.preview) this.currentStep = 3;
  }

  goBack(step: number): void { this.currentStep = step; }

  // Step 3: Final submit
  confirmSubmit(): void {
    if (!this.foundBooking || this.refundForm.invalid) return;
    this.submitting   = true;
    this.submitError  = '';

    this.svc.initiate({
      bookingId: this.foundBooking.id,
      reason:    this.refundForm.get('reason')?.value,
      notes:     this.refundForm.get('notes')?.value || ''
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/refund'], {
          queryParams: { submitted: 'true' }
        });
      },
      error: (err) => {
        this.submitError = err?.error?.error || err.message || 'Submission failed. Please try again.';
        this.submitting = false;
      }
    });
  }

  // Helpers
  getPenaltyColorClass(): string {
    if (!this.preview) return '';
    const pct = this.preview.penaltyPercentage;
    if (pct === 0)   return 'penalty-none';
    if (pct <= 10)   return 'penalty-low';
    if (pct <= 25)   return 'penalty-mid';
    return 'penalty-high';
  }

  isAirlineFault(): boolean {
    const r = this.refundForm.get('reason')?.value as RefundReason;
    return ['FLIGHT_CANCEL','FLIGHT_DELAY','OVERBOOKING','WEATHER'].includes(r);
  }

  formatDate(d: string): string {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatAmount(n: number | undefined): string {
    return n != null ? 'USD ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--';
  }
}
