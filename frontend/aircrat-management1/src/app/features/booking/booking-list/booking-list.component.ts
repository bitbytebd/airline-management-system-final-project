import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from 'src/app/core/services/booking.service';
import { Booking } from 'src/app/core/models/booking.model';
import { FlightService } from 'src/app/core/services/flight.service';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit {

  bookings: Booking[] = [];
  airports: any[] = [];
  
  // === New Variables for Search Feature ===
  allFlights: any[] = [];         // All flights for dropdown
  filteredFlights: any[] = [];    // Filtered suggestions
  searchQuery: string = '';       // Input text
  showDropdown: boolean = false;  // Toggle dropdown
  
  // Modal Variables
  isFlightModalOpen: boolean = false;
  flightBookings: Booking[] = []; // Bookings for selected flight
  selectedFlightInfo: any = null;
  isLoadingSearch: boolean = false;
  actionLoadingId: number | null = null;

  constructor(
    private service: BookingService,
    private flightService: FlightService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAirports();
    this.loadBookings();
    this.loadAllFlights(); // Load flights for search
  }

  loadAirports() {
    this.flightService.getAirports().subscribe((data: any[]) => {
      this.airports = data;
    });
  }

  loadBookings() {
    this.service.getAll().subscribe({
      next: (data) => {
        this.bookings = data;
        console.log('Bookings Loaded:', this.bookings);
      },
      error: (err) => console.error('Error loading bookings', err)
    });
  }

  // === 1. Load Flights for Search Suggestion ===
  loadAllFlights() {
    this.flightService.getAll().subscribe(data => {
      this.allFlights = data;
    });
  }

  // === 2. Autocomplete Filter Logic ===
  onSearchInput() {
    if (this.searchQuery.length < 1) {
      this.filteredFlights = [];
      this.showDropdown = false;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    // Filter by Flight Number or Origin/Destination
    this.filteredFlights = this.allFlights.filter(f => 
      f.flightNumber.toLowerCase().includes(query) ||
      f.origin.toLowerCase().includes(query) ||
      f.destination.toLowerCase().includes(query)
    ).slice(0, 5); // Show top 5 suggestions

    this.showDropdown = true;
  }

  // === 3. Select Flight from Suggestion ===
  selectFlight(flight: any) {
    this.searchQuery = `${flight.flightNumber} (${flight.origin} → ${flight.destination})`;
    this.showDropdown = false;
    this.openFlightBookingModal(flight);
  }

  // === 4. Open Modal with Specific Flight Bookings ===
  openFlightBookingModal(flight: any) {
    this.selectedFlightInfo = flight;
    this.isFlightModalOpen = true;
    this.isLoadingSearch = true;
    this.flightBookings = [];

    // Fetch bookings by Flight ID
    this.service.getBookingsByFlight(flight.id).subscribe({
      next: (data) => {
        this.flightBookings = data;
        this.isLoadingSearch = false;
      },
      error: () => {
        this.isLoadingSearch = false;
        alert('Could not load bookings for this flight.');
      }
    });
  }

  closeModal() {
    this.isFlightModalOpen = false;
    this.searchQuery = '';
  }

  // Existing Helpers
  getCityName(code: string): string {
    if (!code) return '-';
    const apt = this.airports.find(a => a.code === code);
    return apt ? apt.city : code;
  }

  onEdit(id: number | undefined) {
    if (id) {
      this.router.navigate(['/booking/edit', id]);
    } else {
      alert('ID not found!');
    }
  }

  approveBooking(booking: Booking) {
    if (!booking.id) return;
    this.actionLoadingId = booking.id;
    this.service.approve(booking.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadBookings();
      },
      error: (err) => {
        this.actionLoadingId = null;
        alert(err?.error?.error || 'Could not approve this booking.');
      }
    });
  }

  rejectBooking(booking: Booking) {
    if (!booking.id || !confirm('Reject this booking review request?')) return;
    this.actionLoadingId = booking.id;
    this.service.reject(booking.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadBookings();
      },
      error: (err) => {
        this.actionLoadingId = null;
        alert(err?.error?.error || 'Could not reject this booking.');
      }
    });
  }

  reopenBooking(booking: Booking) {
    if (!booking.id) return;
    this.actionLoadingId = booking.id;
    this.service.reopenReview(booking.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadBookings();
      },
      error: (err) => {
        this.actionLoadingId = null;
        alert(err?.error?.error || 'Could not move this booking back to review.');
      }
    });
  }

  goToPayment(booking: Booking) {
    this.router.navigate(['/payment/process'], { queryParams: { bookingId: booking.id } });
  }

  statusClass(status: string | undefined): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }

  get pendingReviewCount(): number {
    return this.bookings.filter(b => b.status === 'PENDING_REVIEW').length;
  }

  get approvedForPaymentCount(): number {
    return this.bookings.filter(b => b.status === 'APPROVED_FOR_PAYMENT').length;
  }

  get paidCount(): number {
    return this.bookings.filter(b => b.paymentStatus === 'PAID').length;
  }

  onDelete(id: number | undefined) {
    if (id && confirm('Are you sure to cancel this booking?')) {
      this.service.delete(id).subscribe({
        next: () => {
          console.log('Booking deleted');
          this.loadBookings();
        },
        error: (err) => console.error('Delete error', err)
      });
    }
  }
}
