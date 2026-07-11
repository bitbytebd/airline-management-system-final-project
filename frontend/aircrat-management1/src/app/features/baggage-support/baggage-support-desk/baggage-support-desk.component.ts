import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from 'src/app/core/models/booking.model';
import { BaggageSupportCase } from 'src/app/core/models/airport-operations.model';
import { AirportOperationsService } from 'src/app/core/services/airport-operations.service';
import { BookingService } from 'src/app/core/services/booking.service';

@Component({
  selector: 'app-baggage-support-desk',
  template: `
    <div class="ops-page">
      <section class="hero">
        <div>
          <span class="eyebrow">Baggage Operations</span>
          <h1>Baggage & Open Support</h1>
          <p>Manage extra baggage pricing, baggage incidents and passenger support cases with booking context.</p>
          <button type="button" (click)="createCase()" [disabled]="!selectedBooking || loading">
            <i class="fas fa-suitcase-rolling"></i> Open Case
          </button>
        </div>
        <div class="hero-meter">
          <span>USD {{ estimatedFee | number:'1.0-0' }}</span>
          <small>Estimated excess fee</small>
        </div>
      </section>

      <section class="search-panel">
        <div class="field-wrap">
          <label>Find booking</label>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" [(ngModel)]="searchText" (focus)="showSuggestions = true" (input)="showSuggestions = true" placeholder="Search reference, passenger, flight or route">
          </div>
          <div class="suggestions" *ngIf="showSuggestions && suggestions.length">
            <button type="button" *ngFor="let booking of suggestions" (click)="selectBooking(booking)">
              <span>{{ booking.passengerName }}</span>
              <small>{{ booking.bookingReference }} | {{ booking.flightNumber }} | {{ booking.origin }} to {{ booking.destination }}</small>
            </button>
          </div>
        </div>
        <div class="booking-summary" *ngIf="selectedBooking">
          <span>{{ selectedBooking.flightNumber }}</span>
          <strong>{{ selectedBooking.origin }} to {{ selectedBooking.destination }}</strong>
          <small>{{ selectedBooking.passengerName }} | {{ selectedBooking.classType }}</small>
        </div>
      </section>

      <main class="workspace" *ngIf="!caseOnlyMode">
        <section class="calculator">
          <h2>Allowance Calculator</h2>
          <div class="form-grid">
            <label>Issue Type<select [(ngModel)]="issueType"><option *ngFor="let type of issueTypes">{{ type }}</option></select></label>
            <label>Checked Bags<input type="number" min="0" [(ngModel)]="checkedBags"></label>
            <label>Checked Weight (kg)<input type="number" min="0" [(ngModel)]="checkedWeightKg"></label>
            <label>Cabin Weight (kg)<input type="number" min="0" [(ngModel)]="cabinWeightKg"></label>
          </div>
          <textarea rows="4" [(ngModel)]="notes" placeholder="Support notes"></textarea>
          <button type="button" class="primary" (click)="createCase()" [disabled]="!selectedBooking || loading">Save Support Case</button>
        </section>

        <aside class="insights">
          <div><span>Allowance</span><strong>{{ allowanceKg }} kg</strong></div>
          <div><span>Excess</span><strong>{{ excessKg }} kg</strong></div>
          <div><span>Fee</span><strong>USD {{ estimatedFee | number:'1.0-2' }}</strong></div>
          <p>Economy 30kg, premium 35kg, business 40kg and first class 50kg allowance rules are applied automatically.</p>
        </aside>
      </main>

      <section class="queue">
        <div class="section-title">
          <span class="eyebrow">Open Cases</span>
          <h2>{{ caseOnlyMode ? 'Open Support Cases' : 'Baggage Support Queue' }}</h2>
          <p class="section-help">Use Resolve only once when the case is complete. Delete removes a duplicate or test case.</p>
          <button type="button" class="switch-mode" (click)="toggleMode()">
            {{ caseOnlyMode ? 'Open Baggage Desk' : 'View Cases Only' }}
          </button>
        </div>
        <div class="case-grid">
          <article class="case-card" *ngFor="let item of cases">
            <div>
              <span class="chip" [class.done]="item.status === 'RESOLVED'">{{ item.status }}</span>
              <strong>{{ item.caseReference || 'Pending' }}</strong>
            </div>
            <h3>{{ item.issueType }}</h3>
            <p>{{ item.passengerName }} | {{ item.bookingReference }}</p>
            <small>{{ item.flightNumber }} | {{ item.route }}</small>
            <div class="case-metrics">
              <span>{{ item.checkedWeightKg }} kg</span>
              <span>Excess {{ item.excessKg }} kg</span>
              <span>USD {{ item.estimatedFee }}</span>
            </div>
            <div class="case-actions">
              <button type="button" (click)="resolveCase(item)" [disabled]="item.status === 'RESOLVED' || actionLoadingId === item.id">Resolve</button>
              <button type="button" class="delete-case" (click)="deleteCase(item)" [disabled]="actionLoadingId === item.id">Delete</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./baggage-support-desk.component.css']
})
export class BaggageSupportDeskComponent implements OnInit {
  bookings: Booking[] = [];
  cases: BaggageSupportCase[] = [];
  selectedBooking: Booking | null = null;
  searchText = '';
  showSuggestions = false;
  issueType = 'Extra baggage';
  checkedBags = 2;
  checkedWeightKg = 32;
  cabinWeightKg = 7;
  notes = 'Verify baggage tag and attach passenger documents.';
  loading = false;
  actionLoadingId: number | null = null;
  caseOnlyMode = false;

  issueTypes = ['Extra baggage', 'Delayed baggage', 'Damaged baggage', 'Lost baggage', 'Oversized sports item', 'Open support'];

  constructor(
    private bookingService: BookingService,
    private operationsService: AirportOperationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.caseOnlyMode = this.router.url.includes('open-cases');
    this.bookingService.getAll().subscribe(data => this.bookings = data || []);
    this.loadCases();
  }

  get suggestions(): Booking[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) return [];
    return this.bookings.filter(b =>
      (b.bookingReference || '').toLowerCase().includes(q) ||
      (b.passengerName || '').toLowerCase().includes(q) ||
      (b.flightNumber || '').toLowerCase().includes(q) ||
      (b.origin || '').toLowerCase().includes(q) ||
      (b.destination || '').toLowerCase().includes(q)
    ).slice(0, 7);
  }

  get allowanceKg(): number {
    const cabin = (this.selectedBooking?.classType || '').toUpperCase();
    if (cabin.includes('FIRST')) return 50;
    if (cabin.includes('BUSINESS')) return 40;
    if (cabin.includes('PREMIUM')) return 35;
    return 30;
  }

  get excessKg(): number {
    return Math.max(0, Number(this.checkedWeightKg || 0) - this.allowanceKg);
  }

  get estimatedFee(): number {
    return this.excessKg * 18;
  }

  loadCases(): void {
    this.operationsService.getBaggageCases().subscribe(data => this.cases = data || []);
  }

  selectBooking(booking: Booking): void {
    this.selectedBooking = booking;
    this.searchText = `${booking.bookingReference} - ${booking.passengerName}`;
    this.showSuggestions = false;
  }

  createCase(): void {
    if (!this.selectedBooking) return;
    this.loading = true;
    const b = this.selectedBooking;
    const payload: BaggageSupportCase = {
      bookingId: b.id,
      bookingReference: b.bookingReference,
      passengerName: b.passengerName,
      passengerEmail: b.email,
      flightNumber: b.flightNumber,
      route: `${b.origin} to ${b.destination}`,
      departureDate: b.departureDate,
      issueType: this.issueType,
      checkedBags: Number(this.checkedBags || 0),
      checkedWeightKg: Number(this.checkedWeightKg || 0),
      cabinWeightKg: Number(this.cabinWeightKg || 0),
      allowanceKg: this.allowanceKg,
      excessKg: this.excessKg,
      estimatedFee: this.estimatedFee,
      status: 'OPEN',
      notes: this.notes
    };
    this.operationsService.createBaggageCase(payload).subscribe({
      next: created => {
        this.cases = [created, ...this.cases];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  resolveCase(item: BaggageSupportCase): void {
    if (!item.id) return;
    this.actionLoadingId = item.id;
    this.operationsService.resolveBaggageCase(item.id).subscribe(updated => {
      this.cases = this.cases.map(row => row.id === updated.id ? updated : row);
      this.actionLoadingId = null;
    }, () => {
      this.actionLoadingId = null;
    });
  }

  deleteCase(item: BaggageSupportCase): void {
    if (!item.id || !confirm(`Delete baggage case ${item.caseReference || item.id}?`)) return;
    this.actionLoadingId = item.id;
    this.operationsService.deleteBaggageCase(item.id).subscribe(() => {
      this.cases = this.cases.filter(row => row.id !== item.id);
      this.actionLoadingId = null;
    }, () => {
      this.actionLoadingId = null;
    });
  }

  toggleMode(): void {
    this.router.navigate([this.caseOnlyMode ? '/baggage-support' : '/baggage-support/open-cases']);
  }
}
