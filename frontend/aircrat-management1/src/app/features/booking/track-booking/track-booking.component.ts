import { Component, OnInit } from '@angular/core';
import { BookingService } from 'src/app/core/services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-track-booking',
  templateUrl: './track-booking.component.html',
  styleUrls: ['./track-booking.component.css']
})
export class TrackBookingComponent implements OnInit {
 searchTerm: string = '';
  results: any[] = [];
  suggestions: any[] = []; 
  isLoading = false;
  showDropdown = false;

  constructor(
    private bookingService: BookingService,
    public router: Router
  ) {}

  // Real-time Search & Suggestion
  onSearchInput() {
    if (this.searchTerm.trim().length < 1) {
      this.suggestions = [];
      this.showDropdown = false;
      return;
    }

    this.bookingService.searchBookings(this.searchTerm).subscribe({
      next: (data) => {
        this.suggestions = data; 
        this.showDropdown = true;
      }
    });
  }

  // When user selects a name from suggestion
  selectSuggestion(reference: string) {
    this.searchTerm = reference;
    this.showDropdown = false;
    this.onSearch(); 
  }

  // Full Search
  onSearch() {
    if (!this.searchTerm.trim()) return;
    this.isLoading = true;
    this.showDropdown = false;
    
    this.bookingService.searchBookings(this.searchTerm).subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.results = [];
      }
    });
  }

  // Fix for Blur Event
  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  // Navigate to Ticket View
  viewTicket(ref: string) {
    this.router.navigate(['/booking/ticket', ref]);
  }
  ngOnInit(): void {
  }

}
