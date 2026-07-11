import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Booking } from 'src/app/core/models/booking.model';
import { WaitlistEntry, WaitlistStats, WaitlistStatus } from 'src/app/core/models/waitlist.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { WaitlistService } from 'src/app/core/services/waitlist.service';

@Component({
  selector: 'app-waitlist-list',
  templateUrl: './waitlist-list.component.html',
  styleUrls: ['./waitlist-list.component.css']
})
export class WaitlistListComponent implements OnInit {
  entries: WaitlistEntry[] = [];
  suggestions: WaitlistEntry[] = [];
  bookingSuggestions: Booking[] = [];
  stats: WaitlistStats = { totalEntries: 0, activeQueue: 0, priorityEntries: 0, confirmedEntries: 0, requestedSeats: 0 };
  form!: FormGroup;
  query = '';
  status: '' | WaitlistStatus = '';
  loading = true;
  showForm = false;
  showGuide = true;
  editingId: number | null = null;

  readonly instructions = [
    'Use the queue when a passenger wants a sold-out or high-demand flight.',
    'Priority score is calculated from loyalty tier, cabin, fare offer, and priority status.',
    'Notify marks the passenger contacted, Confirm closes the waitlist request, Cancel removes it from active operations.',
    'Search supports passenger name, email, flight number, booking reference, and waitlist reference with instant suggestions.'
  ];

  constructor(
    private fb: FormBuilder,
    private waitlistService: WaitlistService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      bookingId: [null],
      bookingReference: [''],
      passengerId: [null],
      passengerName: ['', Validators.required],
      passengerEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      flightId: [null],
      flightNumber: ['', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departureDate: ['', Validators.required],
      classType: ['ECONOMY', Validators.required],
      requestedSeats: [1, [Validators.required, Validators.min(1)]],
      loyaltyTier: ['BRONZE'],
      fareOffer: [350, [Validators.min(0)]],
      currency: ['USD'],
      status: ['WAITING', Validators.required],
      notificationChannel: ['EMAIL'],
      expiresAt: [''],
      notes: ['Passenger accepts earliest available seat.']
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.waitlistService.getAll(this.status, this.query).subscribe({
      next: data => {
        this.entries = data || [];
        this.suggestions = this.entries.slice(0, 8);
        this.loading = false;
      },
      error: () => { this.entries = []; this.loading = false; }
    });
    this.waitlistService.getStats().subscribe({ next: s => this.stats = s });
  }

  onSearch(): void {
    this.load();
  }

  pickSuggestion(entry: WaitlistEntry): void {
    this.query = entry.waitlistReference || entry.passengerName;
    this.load();
  }

  searchBooking(text: string): void {
    if (!text || text.length < 1) {
      this.bookingSuggestions = [];
      return;
    }
    this.bookingService.searchBookings(text).subscribe({
      next: data => this.bookingSuggestions = (data || []).slice(0, 6),
      error: () => this.bookingSuggestions = []
    });
  }

  useBooking(booking: Booking): void {
    this.form.patchValue({
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      passengerId: booking.passengerId,
      passengerName: booking.passengerName,
      passengerEmail: booking.email,
      phoneNumber: booking.phone,
      flightId: booking.flightId,
      flightNumber: booking.flightNumber,
      origin: booking.origin,
      destination: booking.destination,
      departureDate: booking.departureDate,
      classType: booking.classType,
      fareOffer: booking.totalPrice
    });
    this.bookingSuggestions = [];
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({
      requestedSeats: 1,
      loyaltyTier: 'BRONZE',
      fareOffer: 350,
      currency: 'USD',
      status: 'WAITING',
      notificationChannel: 'EMAIL',
      notes: 'Passenger accepts earliest available seat.'
    });
    this.showForm = true;
  }

  edit(entry: WaitlistEntry): void {
    this.editingId = entry.id || null;
    this.form.patchValue(entry);
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.value as WaitlistEntry;
    const request = this.editingId ? this.waitlistService.update(this.editingId, payload) : this.waitlistService.create(payload);
    request.subscribe(() => {
      this.showForm = false;
      this.load();
    });
  }

  notify(entry: WaitlistEntry): void {
    if (!entry.id) return;
    this.waitlistService.notify(entry.id).subscribe(() => this.load());
  }

  confirm(entry: WaitlistEntry): void {
    if (!entry.id) return;
    this.waitlistService.confirm(entry.id).subscribe(() => this.load());
  }

  cancel(entry: WaitlistEntry): void {
    if (!entry.id || !confirm(`Cancel ${entry.waitlistReference}?`)) return;
    this.waitlistService.cancel(entry.id).subscribe(() => this.load());
  }

  remove(entry: WaitlistEntry): void {
    if (!entry.id || !confirm(`Delete ${entry.waitlistReference}?`)) return;
    this.waitlistService.delete(entry.id).subscribe(() => this.load());
  }

  formatMoney(n: number | undefined, currency = 'USD'): string {
    const prefix = currency === 'USD' ? '$' : currency + ' ';
    return prefix + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
