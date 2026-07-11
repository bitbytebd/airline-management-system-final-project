import { Component, OnInit } from '@angular/core';
import { Booking } from 'src/app/core/models/booking.model';
import { SpecialAssistanceRequest } from 'src/app/core/models/airport-operations.model';
import { AirportOperationsService } from 'src/app/core/services/airport-operations.service';
import { BookingService } from 'src/app/core/services/booking.service';

interface AssistanceOption {
  key: string;
  title: string;
  detail: string;
  icon: string;
}

@Component({
  selector: 'app-special-assistance-desk',
  template: `
    <div class="ops-page">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Passenger Care Desk</span>
          <h1>Special Assistance</h1>
          <p>Coordinate mobility, medical, family and priority boarding services from one booking-connected workspace.</p>
          <div class="hero-actions">
            <button type="button" (click)="createRequest()" [disabled]="!selectedBooking || loading">
              <i class="fas fa-paper-plane"></i> Submit Request
            </button>
            <span>{{ requests.length }} service requests tracked</span>
          </div>
        </div>
        <div class="hero-card">
          <i class="fas fa-hands-helping"></i>
          <strong>Airport handoff</strong>
          <small>Check-in, gate and cabin crew receive a single care summary.</small>
        </div>
      </section>

      <section class="search-panel">
        <div class="field-wrap">
          <label>Find passenger booking</label>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" [(ngModel)]="searchText" (focus)="showSuggestions = true" (input)="showSuggestions = true" placeholder="Search reference, name, email, phone or flight">
          </div>
          <div class="suggestions" *ngIf="showSuggestions && suggestions.length">
            <button type="button" *ngFor="let booking of suggestions" (click)="selectBooking(booking)">
              <span>{{ booking.passengerName }}</span>
              <small>{{ booking.bookingReference }} | {{ booking.flightNumber }} | {{ booking.origin }} to {{ booking.destination }}</small>
            </button>
          </div>
        </div>
        <div class="booking-summary" *ngIf="selectedBooking">
          <span>Selected Booking</span>
          <strong>{{ selectedBooking.bookingReference }}</strong>
          <small>{{ selectedBooking.passengerName }} | {{ selectedBooking.departureDate }} | {{ selectedBooking.classType }}</small>
        </div>
      </section>

      <main class="workspace">
        <section class="service-grid">
          <button type="button" *ngFor="let option of options" class="service-card" [class.active]="selectedServices.includes(option.key)" (click)="toggleService(option.key)">
            <i [class]="option.icon"></i>
            <strong>{{ option.title }}</strong>
            <small>{{ option.detail }}</small>
          </button>
        </section>

        <aside class="request-panel">
          <h2>Request Details</h2>
          <label>Priority</label>
          <select [(ngModel)]="priority">
            <option>Standard</option>
            <option>High</option>
            <option>Critical</option>
          </select>
          <label>Contact Preference</label>
          <select [(ngModel)]="contactPreference">
            <option>Phone</option>
            <option>Email</option>
            <option>Check-in Counter</option>
          </select>
          <label>Operational Notes</label>
          <textarea rows="5" [(ngModel)]="notes"></textarea>
          <button type="button" class="primary" (click)="createRequest()" [disabled]="!selectedBooking || loading">
            <i class="fas fa-check-circle"></i> Save Assistance
          </button>
        </aside>
      </main>

      <section class="queue">
        <div class="section-title">
          <div>
            <span class="eyebrow">Live Queue</span>
            <h2>Service Requests</h2>
          </div>
        </div>
        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Passenger</th>
                <th>Flight</th>
                <th>Services</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of requests">
                <td>{{ item.requestReference || 'Pending' }}</td>
                <td>{{ item.passengerName }}<small>{{ item.bookingReference }}</small></td>
                <td>{{ item.flightNumber }}<small>{{ item.route }}</small></td>
                <td>{{ item.services }}</td>
                <td>{{ item.priority }}</td>
                <td><span class="status" [class.done]="item.status === 'COMPLETED'">{{ item.status }}</span></td>
                <td class="actions-cell">
                  <button type="button" class="mini" (click)="useRequest(item)">Edit</button>
                  <button type="button" class="mini" (click)="completeRequest(item)" [disabled]="item.status === 'COMPLETED'">Complete</button>
                  <button type="button" class="mini warn" (click)="reopenRequest(item)" [disabled]="item.status !== 'COMPLETED'">Reopen</button>
                  <button type="button" class="mini danger" (click)="deleteRequest(item)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./special-assistance-desk.component.css']
})
export class SpecialAssistanceDeskComponent implements OnInit {
  bookings: Booking[] = [];
  requests: SpecialAssistanceRequest[] = [];
  selectedBooking: Booking | null = null;
  searchText = '';
  showSuggestions = false;
  selectedServices: string[] = ['Wheelchair escort'];
  priority = 'Standard';
  contactPreference = 'Phone';
  notes = 'Meet passenger at check-in and coordinate priority boarding.';
  loading = false;
  actionLoadingId: number | null = null;

  options: AssistanceOption[] = [
    { key: 'Wheelchair escort', title: 'Wheelchair Escort', detail: 'Curb-to-gate mobility support.', icon: 'fas fa-wheelchair' },
    { key: 'Medical support', title: 'Medical Support', detail: 'Fit-to-fly note and care desk alert.', icon: 'fas fa-notes-medical' },
    { key: 'Elderly care', title: 'Elderly Care', detail: 'Dedicated check-in and boarding guidance.', icon: 'fas fa-hands-helping' },
    { key: 'Infant assistance', title: 'Infant Assistance', detail: 'Bassinet, stroller and family support.', icon: 'fas fa-baby' },
    { key: 'Special meal', title: 'Special Meal', detail: 'Meal preference passed to cabin team.', icon: 'fas fa-utensils' },
    { key: 'Priority boarding', title: 'Priority Boarding', detail: 'Early boarding and gate coordination.', icon: 'fas fa-person-walking-arrow-right' }
  ];

  constructor(
    private bookingService: BookingService,
    private operationsService: AirportOperationsService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadRequests();
  }

  get suggestions(): Booking[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) return [];
    return this.bookings.filter(b =>
      (b.bookingReference || '').toLowerCase().includes(q) ||
      (b.passengerName || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.phone || '').toLowerCase().includes(q) ||
      (b.flightNumber || '').toLowerCase().includes(q)
    ).slice(0, 7);
  }

  loadBookings(): void {
    this.bookingService.getAll().subscribe(data => this.bookings = data || []);
  }

  loadRequests(): void {
    this.operationsService.getAssistanceRequests().subscribe(data => this.requests = data || []);
  }

  selectBooking(booking: Booking): void {
    this.selectedBooking = booking;
    this.searchText = `${booking.bookingReference} - ${booking.passengerName}`;
    this.showSuggestions = false;
  }

  toggleService(key: string): void {
    this.selectedServices = this.selectedServices.includes(key)
      ? this.selectedServices.filter(item => item !== key)
      : [...this.selectedServices, key];
  }

  createRequest(): void {
    if (!this.selectedBooking || this.selectedServices.length === 0) return;
    this.loading = true;
    const b = this.selectedBooking;
    const payload: SpecialAssistanceRequest = {
      bookingId: b.id,
      bookingReference: b.bookingReference,
      passengerName: b.passengerName,
      passengerEmail: b.email,
      passengerPhone: b.phone,
      flightNumber: b.flightNumber,
      route: `${b.origin} to ${b.destination}`,
      departureDate: b.departureDate,
      services: this.selectedServices.join(', '),
      priority: this.priority,
      contactPreference: this.contactPreference,
      notes: this.notes,
      status: 'OPEN'
    };
    this.operationsService.createAssistanceRequest(payload).subscribe({
      next: created => {
        this.requests = [created, ...this.requests];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  completeRequest(request: SpecialAssistanceRequest): void {
    if (!request.id) return;
    this.actionLoadingId = request.id;
    this.operationsService.completeAssistanceRequest(request.id).subscribe(updated => {
      this.requests = this.requests.map(item => item.id === updated.id ? updated : item);
      this.actionLoadingId = null;
    });
  }

  reopenRequest(request: SpecialAssistanceRequest): void {
    if (!request.id) return;
    this.actionLoadingId = request.id;
    this.operationsService.reopenAssistanceRequest(request.id).subscribe(updated => {
      this.requests = this.requests.map(item => item.id === updated.id ? updated : item);
      this.actionLoadingId = null;
    });
  }

  deleteRequest(request: SpecialAssistanceRequest): void {
    if (!request.id || !confirm('Delete this assistance request?')) return;
    this.actionLoadingId = request.id;
    this.operationsService.deleteAssistanceRequest(request.id).subscribe(() => {
      this.requests = this.requests.filter(item => item.id !== request.id);
      this.actionLoadingId = null;
    });
  }

  useRequest(request: SpecialAssistanceRequest): void {
    this.searchText = `${request.bookingReference || ''} - ${request.passengerName || ''}`.trim();
    this.selectedServices = (request.services || '').split(',').map(item => item.trim()).filter(Boolean);
    this.priority = request.priority || 'Standard';
    this.contactPreference = request.contactPreference || 'Phone';
    this.notes = request.notes || '';
    const linkedBooking = this.bookings.find(booking => booking.id === request.bookingId || booking.bookingReference === request.bookingReference);
    if (linkedBooking) this.selectedBooking = linkedBooking;
  }
}
