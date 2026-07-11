import { Component, OnInit } from '@angular/core';
import { FlightService } from 'src/app/core/services/flight.service';
import { BookingService } from 'src/app/core/services/booking.service';

@Component({
  selector: 'app-flight-seat-report',
  templateUrl: './flight-seat-report.component.html',
  styleUrls: ['./flight-seat-report.component.css']
})
export class FlightSeatReportComponent implements OnInit {
  flights: any[] = [];
  selectedFlight: any = null;
  
  // Main Report Modal
  isReportModalOpen: boolean = false; 
  
  // Two New Popups
  isStatusModalOpen: boolean = false;
  isTicketModalOpen: boolean = false;

  reportData: any = null;
  isLoading: boolean = false;

  bookingList: any[] = []; 
  isLoadingTable: boolean = false;

  constructor(
    private flightService: FlightService, 
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    this.flightService.getAll().subscribe(d => this.flights = d);
  }

  // Open Main Report Modal
  openReportModal(flight: any) {
    this.selectedFlight = flight;
    this.isReportModalOpen = true;
    this.isStatusModalOpen = false;
    this.isTicketModalOpen = false;
    
    this.isLoading = true;
    this.reportData = null;
    this.bookingList = [];

    // Load Summary Report
    this.bookingService.getFlightSeatReport(flight.id).subscribe({
      next: (res) => {
        this.reportData = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert("Could not load report data.");
      }
    });

    // Load Booking List in background
    this.isLoadingTable = true;
    this.bookingService.getBookingsByFlight(flight.id).subscribe({
      next: (data) => {
        this.bookingList = data;
        this.isLoadingTable = false;
      },
      error: () => {
        this.isLoadingTable = false;
      }
    });
  }

  // Open Status Popup
  openStatusPopup() {
    this.isStatusModalOpen = true;
  }

  // Open Ticket Popup
  openTicketPopup() {
    this.isTicketModalOpen = true;
  }

  // Close Main Modal
  closeReportModal() { 
    this.isReportModalOpen = false; 
    this.isStatusModalOpen = false;
    this.isTicketModalOpen = false;
  }
  
  // Close Inner Popups (Keep main modal open)
  closeInnerPopups() {
    this.isStatusModalOpen = false;
    this.isTicketModalOpen = false;
  }

  getPercentage(value: number): number {
    if (!this.reportData || this.reportData.totalSeats === 0) return 0;
    return Math.round((value / this.reportData.totalSeats) * 100);
  }
  
  get soldTickets() {
    return this.bookingList.filter(b => b.status === 'CONFIRMED');
  }
}